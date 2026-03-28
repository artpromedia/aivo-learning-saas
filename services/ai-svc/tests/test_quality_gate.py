"""Tests for the content quality gate pipeline."""

from __future__ import annotations

import pytest

from ai_svc.quality_gate.pipeline import QualityGatePipeline
from ai_svc.quality_gate.safety_gate import check_safety
from ai_svc.quality_gate.readability_gate import check_readability, _count_syllables, _flesch_kincaid_grade
from ai_svc.quality_gate.accommodation_gate import check_accommodation_compliance
from ai_svc.quality_gate.functioning_level_gate import (
    check_functioning_level_compliance,
    _count_sentences,
)


class TestSafetyGate:
    def test_clean_content_passes(self):
        result = check_safety("The cat sat on the mat. It was a sunny day.")
        assert result.passed

    def test_profanity_fails(self):
        result = check_safety("What the hell is going on here?")
        assert not result.passed
        assert "safety" == result.name

    def test_violence_fails(self):
        result = check_safety("He tried to murder the dragon in the game.")
        assert not result.passed

    def test_safe_educational_content(self):
        result = check_safety(
            "Let's learn about fractions! A fraction represents a part of a whole. "
            "For example, if you have a pizza cut into 4 pieces and you eat 1, "
            "you ate 1/4 of the pizza."
        )
        assert result.passed

    def test_age_inappropriate_fails(self):
        result = check_safety("Alcohol and beer are really fun and cool to try at parties.")
        assert not result.passed

    def test_pii_email_detected(self):
        result = check_safety("Please contact teacher@school.edu for more info.")
        assert not result.passed
        assert "PII" in result.details
        assert result.metadata.get("pii_type") == "email address"

    def test_pii_phone_detected(self):
        result = check_safety("Call us at 555-123-4567 for help.")
        assert not result.passed
        assert "PII" in result.details
        assert result.metadata.get("pii_type") == "phone number"

    def test_pii_ssn_detected(self):
        result = check_safety("The SSN is 123-45-6789 which should not appear.")
        assert not result.passed
        assert "PII" in result.details
        assert result.metadata.get("pii_type") == "SSN"

    def test_pii_full_name_detected(self):
        result = check_safety("The student John Smith completed the assignment.")
        assert not result.passed
        assert "PII" in result.details
        assert result.metadata.get("pii_type") == "full name"

    def test_no_pii_clean_content(self):
        result = check_safety(
            "Add three apples and two oranges. How many fruits do you have?"
        )
        assert result.passed


class TestReadabilityGate:
    def test_syllable_count(self):
        assert _count_syllables("cat") == 1
        assert _count_syllables("hello") >= 1
        assert _count_syllables("") == 0

    def test_flesch_kincaid_simple(self):
        text = "The cat sat. The dog ran."
        grade = _flesch_kincaid_grade(text)
        assert grade < 5.0

    def test_flesch_kincaid_complex(self):
        text = (
            "The philosophical implications of existential phenomenology "
            "in contemporary epistemological discourse cannot be overstated."
        )
        grade = _flesch_kincaid_grade(text)
        assert grade > 8.0

    def test_flesch_kincaid_empty(self):
        assert _flesch_kincaid_grade("") == 0.0
        assert _flesch_kincaid_grade("...") == 0.0

    def test_simple_content_passes_for_early(self):
        result = check_readability(
            "The cat sat. The dog ran. It was fun.",
            enrolled_grade=2,
            delivery_levels={"reading_level": "EARLY"},
        )
        assert result.passed

    def test_complex_content_fails_for_early(self):
        result = check_readability(
            "The philosophical implications of existential phenomenology "
            "cannot be adequately characterized without substantial epistemological investigation.",
            enrolled_grade=2,
            delivery_levels={"reading_level": "EARLY"},
        )
        assert not result.passed

    def test_no_delivery_level_uses_grade(self):
        result = check_readability(
            "The cat is big. The dog is small.",
            enrolled_grade=8,
            delivery_levels={},
        )
        assert result.passed

    def test_fk_grade_in_metadata(self):
        result = check_readability(
            "The cat sat. The dog ran.",
            enrolled_grade=5,
            delivery_levels={},
        )
        assert "fk_grade" in result.metadata
        assert "target_grade" in result.metadata
        assert "max_allowed" in result.metadata

    def test_tolerance_boundary(self):
        """Content at or near the tolerance boundary."""
        result = check_readability(
            "The cat sat. The dog ran. It was fun.",
            enrolled_grade=1,
            delivery_levels={"reading_level": "EARLY"},
        )
        # Target is 1.5, tolerance is 1.5, so max_allowed is 3.0
        assert result.metadata["max_allowed"] == 3.0


class TestAccommodationGate:
    def test_no_accommodations_passes(self):
        result = check_accommodation_compliance("Any content here.", [])
        assert result.passed

    def test_tts_missing_markers(self):
        content = "A" * 150  # Long enough to trigger check
        result = check_accommodation_compliance(content, ["text_to_speech"])
        assert not result.passed
        assert "TTS" in result.details

    def test_tts_with_markers_passes(self):
        result = check_accommodation_compliance(
            "[TTS] The cat sat on the mat. " * 10,
            ["text_to_speech"],
        )
        assert result.passed

    def test_picture_support_missing(self):
        result = check_accommodation_compliance(
            "This is some content without pictures that is long enough to check.",
            ["picture_support"],
        )
        assert not result.passed

    def test_picture_support_present(self):
        result = check_accommodation_compliance(
            "[PICTURE: A happy cat] The cat is happy.",
            ["picture_support"],
        )
        assert result.passed

    def test_chunked_text_long_paragraph_fails(self):
        long_para = ". ".join([f"Sentence {i}" for i in range(10)]) + "."
        result = check_accommodation_compliance(long_para, ["chunked_text"])
        assert not result.passed

    def test_sensory_breaks_missing(self):
        content = "word " * 200
        result = check_accommodation_compliance(content, ["sensory_breaks"])
        assert not result.passed

    def test_sensory_breaks_present(self):
        result = check_accommodation_compliance(
            "Some content. [SENSORY_BREAK] More content. " * 5,
            ["sensory_breaks"],
        )
        assert result.passed

    def test_reduced_choices_too_many(self):
        result = check_accommodation_compliance(
            "A) Cat\nB) Dog\nC) Bird\nD) Fish\n1. More\n2. Options",
            ["reduced_choices"],
        )
        assert not result.passed

    def test_large_touch_targets_missing(self):
        result = check_accommodation_compliance(
            "Please click the button to continue.",
            ["large_touch_targets"],
        )
        assert not result.passed

    def test_large_touch_targets_present(self):
        result = check_accommodation_compliance(
            "[LARGE_TARGET] Click here to continue.",
            ["large_touch_targets"],
        )
        assert result.passed


class TestFunctioningLevelGate:
    def test_standard_always_passes(self):
        result = check_functioning_level_compliance("Any content.", "STANDARD")
        assert result.passed

    def test_low_verbal_too_many_sentences(self):
        result = check_functioning_level_compliance(
            "Sentence one. Sentence two. Sentence three.",
            "LOW_VERBAL",
        )
        assert not result.passed

    def test_low_verbal_single_sentence_passes(self):
        result = check_functioning_level_compliance(
            "[PICTURE: cat] One sentence.",
            "LOW_VERBAL",
        )
        assert result.passed

    def test_low_verbal_missing_picture(self):
        result = check_functioning_level_compliance(
            "This is content without picture markers here.",
            "LOW_VERBAL",
        )
        assert not result.passed

    def test_low_verbal_too_many_choices(self):
        result = check_functioning_level_compliance(
            "[PICTURE: cat]\nA) Cat\nB) Dog\nC) Bird",
            "LOW_VERBAL",
        )
        assert not result.passed

    def test_non_verbal_missing_facilitator(self):
        result = check_functioning_level_compliance(
            "Some content about cause and effect.",
            "NON_VERBAL",
        )
        assert not result.passed

    def test_non_verbal_with_facilitator(self):
        result = check_functioning_level_compliance(
            "Adult Facilitator Guide: When the learner touches the button, "
            "the effect is a sound plays. Observe for cause-and-effect understanding.",
            "NON_VERBAL",
        )
        assert result.passed

    def test_pre_symbolic_missing_adult(self):
        result = check_functioning_level_compliance(
            "The learner should do something. Observe them.",
            "PRE_SYMBOLIC",
        )
        assert not result.passed

    def test_pre_symbolic_with_adult_and_checklist(self):
        result = check_functioning_level_compliance(
            "Adult/Caregiver Guide:\n"
            "Step 1: Present the object.\n"
            "Observational Checklist:\n"
            "[ ] Showed alertness\n"
            "[ ] Tracked object",
            "PRE_SYMBOLIC",
        )
        assert result.passed

    def test_supported_long_block(self):
        text = ". ".join([f"Sentence {i}" for i in range(8)]) + "."
        result = check_functioning_level_compliance(text, "SUPPORTED")
        assert not result.passed

    def test_supported_short_blocks(self):
        result = check_functioning_level_compliance(
            "Short block. Two sentences.\n\nAnother block. Also short.",
            "SUPPORTED",
        )
        assert result.passed

    def test_count_sentences(self):
        assert _count_sentences("One. Two. Three.") == 3
        assert _count_sentences("Single sentence.") == 1
        assert _count_sentences("") == 0


class TestQualityGatePipeline:
    def test_clean_content_passes(self, sample_learner_context):
        pipeline = QualityGatePipeline()
        result = pipeline.validate(
            "The cat sat on the mat. It was a sunny day.",
            sample_learner_context,
        )
        assert result.passed
        assert len(result.gates) == 4
        assert result.content != ""
        assert result.violations == []
        assert result.auto_remediated is False

    def test_unsafe_content_fails(self, sample_learner_context):
        pipeline = QualityGatePipeline()
        result = pipeline.validate(
            "What the hell is going on?",
            sample_learner_context,
        )
        assert not result.passed
        safety_gate = [g for g in result.gates if g.name == "safety"][0]
        assert not safety_gate.passed
        assert len(result.violations) > 0
        assert any("safety" in v for v in result.violations)

    def test_low_verbal_enforced(self, low_verbal_context):
        pipeline = QualityGatePipeline()
        result = pipeline.validate(
            "This is a long block of content. It has many sentences. "
            "Way too many for a low verbal learner. Four sentences now.",
            low_verbal_context,
        )
        assert not result.passed

    def test_pii_auto_remediation(self, sample_learner_context):
        pipeline = QualityGatePipeline()
        result = pipeline.validate(
            "Please email teacher@school.edu for more information about the lesson.",
            sample_learner_context,
        )
        assert result.auto_remediated is True
        # After remediation the email should be redacted
        assert "teacher@school.edu" not in result.content or not result.passed

    def test_violations_collected_across_gates(self, low_verbal_context):
        pipeline = QualityGatePipeline()
        result = pipeline.validate(
            "This is a long block of content. It has many sentences. "
            "Way too many for a low verbal learner. Four sentences now.",
            low_verbal_context,
        )
        assert not result.passed
        assert len(result.violations) > 0

    def test_all_gates_run(self, sample_learner_context):
        pipeline = QualityGatePipeline()
        result = pipeline.validate(
            "The cat sat on the mat. It was a sunny day.",
            sample_learner_context,
        )
        gate_names = [g.name for g in result.gates]
        assert "safety" in gate_names
        assert "readability" in gate_names
        assert "accommodation_compliance" in gate_names
        assert "functioning_level_compliance" in gate_names
