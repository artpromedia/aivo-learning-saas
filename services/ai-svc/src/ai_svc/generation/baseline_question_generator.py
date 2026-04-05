"""Generate adaptive baseline assessment questions using LLM.

Uses parent assessment data (functioning level, communication style,
interests, sensory preferences) AND IEP profile (goals, accommodations,
strengths, concerns, grade level) to generate personalised questions
that match the learner's current IRT-estimated ability level.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.prompts.functioning_level_rules import (
    get_content_rules_prompt,
    get_max_choices,
)

logger = logging.getLogger(__name__)

DOMAINS = ["MATH", "ELA", "SCIENCE"]

# Maps theta ranges to approximate grade-level descriptors for the LLM
THETA_TO_GRADE: list[tuple[float, str]] = [
    (-3.0, "pre-K / early kindergarten"),
    (-2.0, "kindergarten"),
    (-1.0, "1st grade"),
    (-0.5, "1st–2nd grade"),
    (0.0, "2nd–3rd grade"),
    (0.5, "3rd–4th grade"),
    (1.0, "4th–5th grade"),
    (1.5, "5th–6th grade"),
    (2.0, "6th–7th grade"),
    (2.5, "7th–8th grade"),
    (3.0, "8th–9th grade"),
]


def _theta_to_grade_description(theta: float) -> str:
    """Convert an IRT theta to a human-readable grade descriptor."""
    for boundary, desc in reversed(THETA_TO_GRADE):
        if theta >= boundary:
            return desc
    return "pre-K / early kindergarten"


def _build_iep_context(iep_profile: dict[str, Any] | None) -> str:
    """Build a structured IEP context block for the prompt."""
    if not iep_profile:
        return "No IEP data available."

    parts: list[str] = []

    # Goals
    goals = iep_profile.get("goals", [])
    if goals:
        goal_lines = []
        for g in goals[:8]:  # limit to 8 goals
            area = g.get("area", "General")
            desc = g.get("description", "")
            goal_lines.append(f"  - [{area}] {desc}")
        parts.append("IEP Goals:\n" + "\n".join(goal_lines))

    # Accommodations
    accommodations = iep_profile.get("accommodations", [])
    if accommodations:
        parts.append("Accommodations: " + "; ".join(accommodations[:10]))

    # Strengths
    strengths = iep_profile.get("strengths", [])
    if strengths:
        parts.append("Strengths: " + "; ".join(strengths[:6]))

    # Concerns
    concerns = iep_profile.get("concerns", [])
    if concerns:
        parts.append("Concerns: " + "; ".join(concerns[:6]))

    # Services
    services = iep_profile.get("services", [])
    if services:
        parts.append("Services: " + "; ".join(services[:6]))

    # Communication system
    comm = iep_profile.get("communicationSystem")
    if comm:
        parts.append(f"Communication System: {comm}")

    # Assistive technology
    at = iep_profile.get("assistiveTechnology", [])
    if at:
        parts.append("Assistive Technology: " + "; ".join(at[:5]))

    # Grade level
    grade = iep_profile.get("gradeLevel")
    if grade:
        parts.append(f"IEP Grade Level: {grade}")

    # Recommended functioning level
    rec_level = iep_profile.get("recommendedFunctioningLevel")
    if rec_level:
        parts.append(f"Recommended Functioning Level: {rec_level}")

    return "\n".join(parts) if parts else "No IEP details extracted."


def _build_parent_context(parent_assessment: dict[str, Any]) -> str:
    """Build a structured parent assessment context block."""
    parts: list[str] = []

    # Communication
    comm_verbal = parent_assessment.get("comm_verbal")
    if comm_verbal:
        parts.append(f"Communication Method: {comm_verbal}")

    comm_complexity = parent_assessment.get("comm_complexity")
    if comm_complexity:
        parts.append(f"Language Complexity: {comm_complexity}")

    # Sensory
    sensory_visual = parent_assessment.get("sensory_visual")
    if sensory_visual is not None:
        parts.append(f"Visual Comfort (1-5): {sensory_visual}")

    sensory_audio = parent_assessment.get("sensory_audio")
    if sensory_audio is not None:
        parts.append(f"Auditory Comfort (1-5): {sensory_audio}")

    sensory_prefs = parent_assessment.get("sensory_preferences", [])
    if sensory_prefs:
        items = sensory_prefs if isinstance(sensory_prefs, list) else [sensory_prefs]
        parts.append("Sensory Accommodations Needed: " + ", ".join(items))

    # Learning
    learn_style = parent_assessment.get("learn_style")
    if learn_style:
        parts.append(f"Learning Style: {learn_style}")

    learn_attention = parent_assessment.get("learn_attention")
    if learn_attention:
        parts.append(f"Attention Span: {learn_attention}")

    # Interests & motivators
    interests = parent_assessment.get("interests", [])
    if interests:
        items = interests if isinstance(interests, list) else [interests]
        parts.append("Interests: " + ", ".join(items))

    motivators = parent_assessment.get("motivators")
    if motivators:
        parts.append(f"Motivation Style: {motivators}")

    return "\n".join(parts) if parts else "No parent assessment details available."


class BaselineQuestionGenerator:
    """Generates a single baseline assessment question via LLM."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway

    async def generate(
        self,
        *,
        parent_assessment: dict[str, Any],
        functioning_level: str,
        assessment_mode: str,
        theta: float,
        target_domain: str,
        iep_profile: dict[str, Any] | None = None,
        administered_items: list[dict[str, Any]] | None = None,
        question_number: int = 1,
    ) -> dict[str, Any]:
        """Generate one assessment question.

        Returns dict with keys: id, domain, skill, difficulty, discrimination,
        prompt, type, options, correctAnswer, imageUrl (optional).
        """
        grade_desc = _theta_to_grade_description(theta)
        max_choices = get_max_choices(functioning_level)
        if max_choices < 2:
            max_choices = 2  # minimum 2 choices for a question

        # Build list of previously asked topics to avoid repetition
        prev_skills: list[str] = []
        if administered_items:
            prev_skills = [
                f"{it.get('domain', '')}/{it.get('skill', '')}"
                for it in administered_items[-10:]  # last 10 only
            ]

        content_rules = get_content_rules_prompt(functioning_level)
        parent_context = _build_parent_context(parent_assessment)
        iep_context = _build_iep_context(iep_profile)

        system_prompt = (
            "You are an expert educational assessment designer for children with "
            "diverse learning needs including those with IEPs (Individualized Education "
            "Programs). You create adaptive baseline assessment questions that are:\n"
            "- Developmentally appropriate for the child's actual ability level\n"
            "- Aligned with their communication mode and sensory needs\n"
            "- Themed around the child's personal interests to maximise engagement\n"
            "- Respectful of IEP accommodations and goals\n"
            "- Aligned to common core standards\n\n"
            f"{content_rules}\n\n"
            "CRITICAL: Use the Parent Assessment and IEP profile below to TAILOR every "
            "aspect of the question:\n"
            "- If the child communicates via AAC/signs, use simple clear language\n"
            "- If they have visual sensory needs, avoid cluttered prompts\n"
            "- If they love dinosaurs, frame math as counting dinosaurs\n"
            "- If their IEP shows goals in reading comprehension, probe that skill area\n"
            "- If they have accommodations like 'extended time', keep questions focused\n"
            "- Match the difficulty to the IEP grade level when available\n\n"
            "You MUST respond with ONLY a valid JSON object — no markdown, no explanation, "
            "no code fences. The JSON must have exactly these keys:\n"
            "{\n"
            '  "domain": string,         // the assessment domain\n'
            '  "skill": string,          // specific skill being assessed (e.g. "addition", "reading-comprehension")\n'
            '  "difficulty": number,     // IRT difficulty parameter (b), range -3.0 to +3.0\n'
            '  "discrimination": number, // IRT discrimination parameter (a), range 0.8 to 2.0\n'
            '  "prompt": string,         // the question text\n'
            '  "type": "multiple_choice",\n'
            f'  "options": string[],      // exactly {max_choices} answer options\n'
            '  "correctAnswer": string,  // must exactly match one of the options\n'
            '  "imageUrl": null           // always null for now\n'
            "}\n\n"
            "CRITICAL RULES:\n"
            "- The difficulty parameter MUST match the target difficulty described below\n"
            "- The correctAnswer MUST be one of the options (exact string match)\n"
            "- Questions MUST incorporate the learner's interests from parent assessment\n"
            "- Questions MUST respect IEP accommodations and communication needs\n"
            "- If IEP goals mention specific skill areas, prioritise assessing those\n"
            "- For picture-based modes, include emoji or [PICTURE: description] in the prompt\n"
            f"- Provide exactly {max_choices} distinct answer options\n"
            "- Do NOT repeat skills already assessed"
        )

        user_prompt = (
            f"Generate 1 baseline assessment question with these parameters:\n\n"
            f"**Target Domain:** {target_domain}\n"
            f"**Target Difficulty Level:** {grade_desc} (theta ≈ {theta:.1f})\n"
            f"**Assessment Mode:** {assessment_mode}\n"
            f"**Functioning Level:** {functioning_level}\n"
            f"**Question Number:** {question_number} of ~20\n\n"
            f"---\n\n"
            f"**PARENT ASSESSMENT DATA:**\n{parent_context}\n\n"
            f"---\n\n"
            f"**IEP PROFILE:**\n{iep_context}\n\n"
        )

        if prev_skills:
            user_prompt += (
                f"---\n\n"
                f"**Already assessed (avoid repeating these skills):**\n"
                f"{', '.join(prev_skills)}\n\n"
            )

        user_prompt += "Respond with ONLY the JSON object."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        response = await self._gateway.generate(
            messages=messages,
            task_type="baseline_assessment",
            temperature=0.7,
            max_tokens=1024,
        )

        # Parse the LLM response
        content = response.content.strip()
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

        try:
            question = json.loads(content)
        except json.JSONDecodeError:
            logger.error("LLM returned invalid JSON for baseline question: %s", content[:500])
            raise ValueError("Failed to parse LLM response as JSON")

        # Validate required fields
        required = {"domain", "skill", "difficulty", "discrimination", "prompt", "type", "options", "correctAnswer"}
        missing = required - set(question.keys())
        if missing:
            raise ValueError(f"LLM response missing fields: {missing}")

        # Ensure correctAnswer is in options
        if question["correctAnswer"] not in question["options"]:
            logger.warning("correctAnswer not in options, adding it")
            question["options"][-1] = question["correctAnswer"]

        # Generate a stable ID
        question["id"] = f"llm-{target_domain.lower()}-q{question_number}-{hash(question['prompt']) % 100000:05d}"
        question["imageUrl"] = question.get("imageUrl")

        # Clamp IRT parameters
        question["difficulty"] = max(-3.0, min(3.0, float(question["difficulty"])))
        question["discrimination"] = max(0.5, min(2.5, float(question["discrimination"])))

        return question
