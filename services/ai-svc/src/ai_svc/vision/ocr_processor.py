"""Vision AI homework OCR processor.

Orchestrates image/PDF → text/equation extraction with Gemini Vision primary
and GPT-4o fallback.
"""

from __future__ import annotations

import base64
import io
import json
import logging
from dataclasses import dataclass, field
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.vision.problem_parser import ProblemParser, ParsedProblem
from ai_svc.vision.subject_detector import SubjectDetector, DetectedSubject

logger = logging.getLogger(__name__)

_OCR_SYSTEM_PROMPT = """You are a homework OCR and analysis expert. Extract ALL content from the homework image.

Return a JSON object with:
{
  "printed_text": "all printed text found",
  "handwritten_text": "all handwritten text found",
  "math_equations": ["LaTeX format equations found"],
  "tables": [{"headers": [...], "rows": [[...]]}],
  "diagrams": ["description of each diagram"],
  "problems": [
    {
      "number": 1,
      "text": "full problem text",
      "type": "MCQ|SHORT_ANSWER|EQUATION|WORD_PROBLEM",
      "choices": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "equations_latex": ["any LaTeX equations in this problem"],
      "student_answer": "what the student wrote (if visible, else null)"
    }
  ]
}

Rules:
- For math: convert ALL expressions to LaTeX in the equations_latex array
- For MCQ: extract all answer choices into the choices array
- For word problems: include the complete text with no truncation
- Identify problem boundaries carefully (numbered, lettered, visual separators)
- If text is partially illegible, include what you can read and mark unclear parts with [illegible]

Return ONLY the JSON object, no markdown fences."""


@dataclass
class ExtractedProblem:
    """A single extracted problem from the homework."""
    number: int
    problem_text: str
    problem_type: str  # MCQ, SHORT_ANSWER, EQUATION, WORD_PROBLEM
    extracted_choices: list[str] = field(default_factory=list)
    detected_equations_latex: list[str] = field(default_factory=list)
    student_answer: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "number": self.number,
            "problem_text": self.problem_text,
            "problem_type": self.problem_type,
            "extracted_choices": self.extracted_choices,
            "detected_equations_latex": self.detected_equations_latex,
            "student_answer": self.student_answer,
        }


@dataclass
class ExtractedDocument:
    """Full structured extraction from a homework document."""
    raw_text: str = ""
    handwritten_text: str = ""
    math_equations: list[str] = field(default_factory=list)
    tables: list[dict[str, Any]] = field(default_factory=list)
    diagrams: list[str] = field(default_factory=list)
    detected_subject: DetectedSubject | None = None
    problems: list[ExtractedProblem] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "raw_text": self.raw_text,
            "handwritten_text": self.handwritten_text,
            "math_equations": self.math_equations,
            "tables": self.tables,
            "diagrams": self.diagrams,
            "detected_subject": self.detected_subject.to_dict() if self.detected_subject else None,
            "problems": [p.to_dict() for p in self.problems],
        }


class OCRProcessor:
    """Processes homework images and PDFs using Vision AI.

    Primary: Gemini Vision (gemini-2.0-flash)
    Fallback: GPT-4o Vision
    """

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._parser = ProblemParser()
        self._detector = SubjectDetector(gateway)

    async def extract(
        self,
        image_bytes: bytes | None = None,
        pdf_bytes: bytes | None = None,
        image_url: str | None = None,
        mime_type: str = "image/jpeg",
    ) -> ExtractedDocument:
        """Extract structured content from homework image or PDF.

        Args:
            image_bytes: Raw image bytes.
            pdf_bytes: Raw PDF bytes.
            image_url: URL of hosted image.
            mime_type: MIME type of the upload.

        Returns:
            ExtractedDocument with parsed problems and detected subject.
        """
        if pdf_bytes:
            return await self._process_pdf(pdf_bytes)

        if image_bytes:
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            return await self._process_vision(image_base64=b64, mime_type=mime_type)

        if image_url:
            return await self._process_vision(image_url=image_url)

        raise ValueError("One of image_bytes, pdf_bytes, or image_url is required")

    async def _process_vision(
        self,
        image_url: str | None = None,
        image_base64: str | None = None,
        mime_type: str = "image/jpeg",
    ) -> ExtractedDocument:
        """Extract content from a single image via Vision AI."""
        messages = [
            {"role": "system", "content": _OCR_SYSTEM_PROMPT},
            {"role": "user", "content": "Extract all content from this homework image."},
        ]

        response = await self._gateway.generate_with_vision(
            messages=messages,
            image_url=image_url,
            image_base64=image_base64,
        )

        extraction = self._parse_vision_response(response.content)

        # If vision didn't find problems, try the parser on raw text
        if not extraction.problems and extraction.raw_text:
            parsed = self._parser.parse(extraction.raw_text)
            extraction.problems = [
                ExtractedProblem(
                    number=p.number,
                    problem_text=p.text,
                    problem_type=p.problem_type,
                    extracted_choices=p.choices,
                    detected_equations_latex=p.equations_latex,
                )
                for p in parsed
            ]

        # Detect subject from combined content
        combined = self._build_combined_text(extraction)
        extraction.detected_subject = await self._detector.detect(combined)

        return extraction

    async def _process_pdf(self, pdf_bytes: bytes) -> ExtractedDocument:
        """Extract content from a PDF: text extraction + vision on embedded images."""
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(pdf_bytes))

        text_parts: list[str] = []
        image_extractions: list[ExtractedDocument] = []

        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

            # Extract embedded images and run vision on them
            for image_obj in page.images:
                try:
                    img_bytes = image_obj.data
                    b64 = base64.b64encode(img_bytes).decode("utf-8")
                    img_extraction = await self._process_vision(image_base64=b64)
                    image_extractions.append(img_extraction)
                except Exception:
                    logger.warning(
                        "Failed to process embedded image on page %d",
                        page_num + 1,
                        exc_info=True,
                    )

        full_text = "\n\n".join(text_parts)

        # Parse problems from text
        parsed_problems = self._parser.parse(full_text)
        problems = [
            ExtractedProblem(
                number=p.number,
                problem_text=p.text,
                problem_type=p.problem_type,
                extracted_choices=p.choices,
                detected_equations_latex=p.equations_latex,
            )
            for p in parsed_problems
        ]

        # Merge image-extracted problems
        for img_ext in image_extractions:
            for p in img_ext.problems:
                if not any(existing.problem_text == p.problem_text for existing in problems):
                    p.number = len(problems) + 1
                    problems.append(p)

        # Collect all math equations
        all_equations: list[str] = []
        for p in problems:
            all_equations.extend(p.detected_equations_latex)
        for img_ext in image_extractions:
            all_equations.extend(img_ext.math_equations)

        doc = ExtractedDocument(
            raw_text=full_text,
            math_equations=list(set(all_equations)),
            problems=problems,
        )

        combined = self._build_combined_text(doc)
        doc.detected_subject = await self._detector.detect(combined)

        return doc

    def _parse_vision_response(self, response_text: str) -> ExtractedDocument:
        """Parse LLM vision response into ExtractedDocument."""
        try:
            clean = response_text.strip()
            if clean.startswith("```"):
                lines = clean.split("\n")
                clean = "\n".join(lines[1:-1]) if len(lines) > 2 else clean
            data = json.loads(clean)
        except json.JSONDecodeError:
            logger.warning("Failed to parse OCR extraction JSON, using raw text")
            return ExtractedDocument(raw_text=response_text)

        problems: list[ExtractedProblem] = []
        for p in data.get("problems", []):
            problems.append(ExtractedProblem(
                number=p.get("number", len(problems) + 1),
                problem_text=p.get("text", ""),
                problem_type=p.get("type", "SHORT_ANSWER"),
                extracted_choices=p.get("choices", []),
                detected_equations_latex=p.get("equations_latex", []),
                student_answer=p.get("student_answer"),
            ))

        return ExtractedDocument(
            raw_text=data.get("printed_text", ""),
            handwritten_text=data.get("handwritten_text", ""),
            math_equations=data.get("math_equations", []),
            tables=data.get("tables", []),
            diagrams=data.get("diagrams", []),
            problems=problems,
        )

    def _build_combined_text(self, doc: ExtractedDocument) -> str:
        """Build combined text for subject detection."""
        parts = [doc.raw_text, doc.handwritten_text]
        for p in doc.problems:
            parts.append(p.problem_text)
        for eq in doc.math_equations:
            parts.append(eq)
        return "\n".join(p for p in parts if p)
