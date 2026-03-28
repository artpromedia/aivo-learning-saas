"""Parse extracted text into individual homework problems.

Splits multi-problem worksheets into individual problems by detecting
boundaries: numbered lists, lettered items, visual separators.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass
class ParsedProblem:
    """A single parsed problem from extracted text."""
    number: int
    text: str
    problem_type: str  # MCQ, SHORT_ANSWER, EQUATION, WORD_PROBLEM
    choices: list[str] = field(default_factory=list)
    equations_latex: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "number": self.number,
            "text": self.text,
            "problem_type": self.problem_type,
            "choices": self.choices,
            "equations_latex": self.equations_latex,
        }


# Problem boundary patterns
_NUMBERED_PATTERN = re.compile(
    r"^(?:\s*)(\d{1,3})\s*[.):\]]\s+(.+)",
    re.MULTILINE,
)
_LETTERED_PATTERN = re.compile(
    r"^(?:\s*)([a-zA-Z])\s*[.):\]]\s+(.+)",
    re.MULTILINE,
)
_SEPARATOR_PATTERN = re.compile(
    r"^[-_=]{3,}$|^\*{3,}$|^#{3,}$",
    re.MULTILINE,
)

# Choice detection patterns
_CHOICE_PATTERN = re.compile(
    r"^\s*(?:[A-Da-d])\s*[.):\]]\s*(.+)",
    re.MULTILINE,
)
_CHOICE_INLINE_PATTERN = re.compile(
    r"(?:[A-Da-d])\s*[.)]\s*[^,\n]+",
)

# Math equation patterns
_LATEX_PATTERN = re.compile(r"\$(.+?)\$|\\[(\[](.+?)\\[)\]]")
_MATH_EXPRESSION_PATTERN = re.compile(
    r"(?:\d+\s*[+\-*/×÷=<>≤≥]\s*)+\d+|"
    r"\d+\s*[+\-*/×÷]\s*\d+\s*=\s*[_?]+|"
    r"[a-z]\s*[+\-*/=]\s*\d+|"
    r"\d+\s*[/]\s*\d+|"
    r"√\d+|"
    r"\d+\^\d+",
)


class ProblemParser:
    """Parses raw text into individual homework problems."""

    def parse(self, text: str) -> list[ParsedProblem]:
        """Parse extracted text into individual problems.

        Detects problem boundaries via numbered lists, lettered items,
        or visual separators, then classifies each problem.

        Args:
            text: Raw extracted text from OCR.

        Returns:
            List of ParsedProblem objects.
        """
        if not text or not text.strip():
            return []

        # Try numbered splitting first
        segments = self._split_numbered(text)
        if not segments:
            segments = self._split_by_separators(text)
        if not segments:
            # Treat whole text as one problem
            segments = [(1, text.strip())]

        problems: list[ParsedProblem] = []
        for num, segment in segments:
            choices = self._extract_choices(segment)
            equations = self._extract_equations(segment)
            problem_type = self._classify_type(segment, choices, equations)
            # Strip choices from the main text for MCQs
            problem_text = self._strip_choices(segment) if choices else segment

            problems.append(ParsedProblem(
                number=num,
                text=problem_text.strip(),
                problem_type=problem_type,
                choices=choices,
                equations_latex=equations,
            ))

        return problems

    def _split_numbered(self, text: str) -> list[tuple[int, str]]:
        """Split text by numbered problem boundaries."""
        matches = list(_NUMBERED_PATTERN.finditer(text))
        if len(matches) < 2:
            return []

        segments: list[tuple[int, str]] = []
        for i, match in enumerate(matches):
            num = int(match.group(1))
            start = match.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            segment_text = text[start:end].strip()
            # Remove the leading number prefix
            segment_text = re.sub(r"^\d{1,3}\s*[.):\]]\s*", "", segment_text)
            segments.append((num, segment_text))

        return segments

    def _split_by_separators(self, text: str) -> list[tuple[int, str]]:
        """Split text by visual separator patterns."""
        parts = _SEPARATOR_PATTERN.split(text)
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) < 2:
            return []
        return [(i + 1, part) for i, part in enumerate(parts)]

    def _extract_choices(self, text: str) -> list[str]:
        """Extract MCQ answer choices from problem text."""
        choices: list[str] = []
        for match in _CHOICE_PATTERN.finditer(text):
            full = match.group(0).strip()
            choices.append(full)

        # Deduplicate while preserving order
        if len(choices) >= 2:
            seen: set[str] = set()
            unique: list[str] = []
            for c in choices:
                normalized = c.strip().lower()
                if normalized not in seen:
                    seen.add(normalized)
                    unique.append(c.strip())
            return unique

        return []

    def _extract_equations(self, text: str) -> list[str]:
        """Extract math equations and convert to LaTeX format."""
        equations: list[str] = []

        # LaTeX delimited equations
        for match in _LATEX_PATTERN.finditer(text):
            eq = match.group(1) or match.group(2)
            if eq:
                equations.append(eq.strip())

        # Plain math expressions
        for match in _MATH_EXPRESSION_PATTERN.finditer(text):
            expr = match.group(0).strip()
            latex = self._to_latex(expr)
            if latex and latex not in equations:
                equations.append(latex)

        return equations

    def _to_latex(self, expr: str) -> str:
        """Convert a plain math expression to LaTeX."""
        result = expr
        result = result.replace("×", r"\times ")
        result = result.replace("÷", r"\div ")
        result = result.replace("≤", r"\leq ")
        result = result.replace("≥", r"\geq ")
        result = result.replace("√", r"\sqrt{") + ("}" if "√" in expr else "")
        # Handle fractions like 3/4
        result = re.sub(r"(\d+)\s*/\s*(\d+)", r"\\frac{\1}{\2}", result)
        return result

    def _classify_type(
        self,
        text: str,
        choices: list[str],
        equations: list[str],
    ) -> str:
        """Classify problem type."""
        if choices and len(choices) >= 2:
            return "MCQ"
        if equations:
            return "EQUATION"
        # Word problems tend to be longer with question keywords
        word_count = len(text.split())
        question_keywords = ["how many", "how much", "what is", "find", "solve", "if"]
        has_question = any(kw in text.lower() for kw in question_keywords)
        if word_count > 30 and has_question:
            return "WORD_PROBLEM"
        return "SHORT_ANSWER"

    def _strip_choices(self, text: str) -> str:
        """Strip MCQ choice lines from problem text to get just the question."""
        lines = text.split("\n")
        result_lines: list[str] = []
        for line in lines:
            stripped = line.strip()
            if re.match(r"^[A-Da-d]\s*[.):\]]\s*", stripped):
                continue
            result_lines.append(line)
        return "\n".join(result_lines)
