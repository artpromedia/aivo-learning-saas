"""Tests for prompt assembly, context injection, and functioning level rules."""

from __future__ import annotations

import pytest

from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.prompts.context_injector import build_learner_context_block
from ai_svc.prompts.functioning_level_rules import (
    get_content_rules_prompt,
    get_max_choices,
    get_max_sentences_per_block,
)
from ai_svc.prompts.system_prompts.main_brain import get_main_brain_prompt
from ai_svc.prompts.system_prompts.tutor_personas import get_persona_prompt
from ai_svc.prompts.system_prompts.homework_agent import HOMEWORK_AGENT_PROMPT
from ai_svc.prompts.system_prompts.writing_coach import WRITING_COACH_PROMPT


class TestMainBrainPrompt:
    def test_prompt_exists(self):
        prompt = get_main_brain_prompt()
        assert len(prompt) > 100
        assert "AIVO" in prompt

    def test_prompt_has_safety_rules(self):
        prompt = get_main_brain_prompt()
        assert "Safety" in prompt or "NEVER" in prompt

    def test_prompt_has_accommodation_rules(self):
        prompt = get_main_brain_prompt()
        assert "accommodation" in prompt.lower()


class TestTutorPersonas:
    @pytest.mark.parametrize("persona", ["nova", "sage", "spark", "chrono", "pixel"])
    def test_persona_exists(self, persona):
        prompt = get_persona_prompt(persona)
        assert prompt is not None
        assert len(prompt) > 100

    @pytest.mark.parametrize("subject", ["math", "ela", "science", "history", "coding"])
    def test_subject_alias(self, subject):
        prompt = get_persona_prompt(subject)
        assert prompt is not None

    def test_unknown_persona(self):
        assert get_persona_prompt("unknown") is None

    def test_nova_has_math_content(self):
        prompt = get_persona_prompt("nova")
        assert "Math" in prompt or "math" in prompt

    def test_sage_has_ela_content(self):
        prompt = get_persona_prompt("sage")
        assert "ELA" in prompt or "Language" in prompt or "Reading" in prompt

    def test_spark_has_science_content(self):
        prompt = get_persona_prompt("spark")
        assert "Science" in prompt or "experiment" in prompt.lower()

    def test_chrono_has_history_content(self):
        prompt = get_persona_prompt("chrono")
        assert "History" in prompt or "history" in prompt

    def test_pixel_has_coding_content(self):
        prompt = get_persona_prompt("pixel")
        assert "Coding" in prompt or "code" in prompt.lower()

    def test_each_persona_has_functioning_levels(self):
        for persona in ["nova", "sage", "spark", "chrono", "pixel"]:
            prompt = get_persona_prompt(persona)
            assert "STANDARD" in prompt
            assert "LOW_VERBAL" in prompt or "LOW VERBAL" in prompt


class TestSystemPrompts:
    def test_homework_agent_prompt(self):
        assert len(HOMEWORK_AGENT_PROMPT) > 50
        assert "Homework" in HOMEWORK_AGENT_PROMPT

    def test_writing_coach_prompt(self):
        assert len(WRITING_COACH_PROMPT) > 50
        assert "Writing" in WRITING_COACH_PROMPT


class TestFunctioningLevelRules:
    def test_standard_no_rules(self):
        assert get_content_rules_prompt("STANDARD") == ""

    def test_low_verbal_has_strict_rules(self):
        rules = get_content_rules_prompt("LOW_VERBAL")
        assert "1 sentence" in rules
        assert "2 choices" in rules

    def test_non_verbal_dual_output(self):
        rules = get_content_rules_prompt("NON_VERBAL")
        assert "LEARNER-FACING" in rules
        assert "FACILITATOR" in rules

    def test_pre_symbolic_adult_directed(self):
        rules = get_content_rules_prompt("PRE_SYMBOLIC")
        assert "ADULT-DIRECTED" in rules
        assert "OBSERVATIONAL CHECKLIST" in rules

    def test_max_sentences(self):
        assert get_max_sentences_per_block("STANDARD") == 10
        assert get_max_sentences_per_block("LOW_VERBAL") == 1
        assert get_max_sentences_per_block("PRE_SYMBOLIC") == 0

    def test_max_choices(self):
        assert get_max_choices("STANDARD") == 4
        assert get_max_choices("LOW_VERBAL") == 2
        assert get_max_choices("NON_VERBAL") == 1


class TestContextInjector:
    def test_empty_context(self):
        assert build_learner_context_block({}) == ""

    def test_basic_profile(self, sample_learner_context):
        result = build_learner_context_block(sample_learner_context)
        assert "Grade: 3" in result
        assert "STANDARD" in result
        assert "VERBAL" in result

    def test_mastery_levels(self, sample_learner_context):
        result = build_learner_context_block(sample_learner_context)
        assert "MATH" in result
        assert "50%" in result

    def test_delivery_levels(self, sample_learner_context):
        result = build_learner_context_block(sample_learner_context)
        assert "DEVELOPING" in result

    def test_accommodations(self, low_verbal_context):
        result = build_learner_context_block(low_verbal_context)
        assert "extended_time" in result

    def test_iep_goals(self, low_verbal_context):
        result = build_learner_context_block(low_verbal_context)
        assert "Count to 10" in result

    def test_iep_goals_string_format(self):
        ctx = {"iep_goals": ["Goal 1", "Goal 2"]}
        result = build_learner_context_block(ctx)
        assert "Goal 1" in result

    def test_active_tutors(self):
        ctx = {"active_tutors": ["nova", "sage"]}
        result = build_learner_context_block(ctx)
        assert "nova" in result


class TestPromptAssembler:
    def test_lesson_assembly(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="lesson",
            learner_context=sample_learner_context,
            request_data={"subject": "MATH", "skill": "fractions", "grade": 3},
        )
        assert len(messages) >= 2
        assert messages[0]["role"] == "system"
        assert any(m["role"] == "user" for m in messages)

    def test_tutor_chat_assembly(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="tutor_chat",
            learner_context=sample_learner_context,
            request_data={"subject": "MATH", "user_input": "What is 2+2?"},
            tutor_persona="nova",
        )
        assert len(messages) >= 2
        system = messages[0]["content"]
        assert "Nova" in system

    def test_quiz_assembly(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="quiz",
            learner_context=sample_learner_context,
            request_data={"subject": "MATH", "skills": ["fractions", "decimals"], "num_questions": 5},
        )
        user_msg = [m for m in messages if m["role"] == "user"][0]
        assert "quiz" in user_msg["content"].lower()

    def test_homework_assembly(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="homework",
            learner_context=sample_learner_context,
            request_data={"text": "Solve 3+4", "subject": "MATH"},
        )
        system = messages[0]["content"]
        assert "Homework" in system

    def test_writing_assembly(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="writing",
            learner_context=sample_learner_context,
            request_data={"submission": "My cat is nice.", "prompt": "Write about pets"},
        )
        system = messages[0]["content"]
        assert "Writing" in system

    def test_activity_assembly(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="activity",
            learner_context=sample_learner_context,
            request_data={"domain": "COMMUNICATION"},
        )
        user_msg = [m for m in messages if m["role"] == "user"][0]
        assert "COMMUNICATION" in user_msg["content"]

    def test_generic_session_type(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="custom",
            learner_context=sample_learner_context,
            request_data={"prompt": "Custom content."},
        )
        assert len(messages) >= 2

    def test_with_curriculum_standards(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="lesson",
            learner_context=sample_learner_context,
            request_data={"subject": "MATH", "skill": "fractions", "grade": 3},
            curriculum_standards=["[CC.MATH.3.1] Multiply and divide within 100"],
        )
        system = messages[0]["content"]
        assert "Curriculum Standards" in system

    def test_low_verbal_includes_rules(self, low_verbal_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="lesson",
            learner_context=low_verbal_context,
            request_data={"subject": "MATH", "skill": "counting", "grade": 2},
        )
        system = messages[0]["content"]
        assert "LOW VERBAL" in system

    def test_conversation_history(self, sample_learner_context):
        assembler = PromptAssembler()
        messages = assembler.assemble(
            session_type="tutor_chat",
            learner_context=sample_learner_context,
            request_data={
                "subject": "MATH",
                "user_input": "I still don't get it",
                "conversation_history": [
                    {"role": "user", "content": "What is a fraction?"},
                    {"role": "assistant", "content": "A fraction is a part of a whole."},
                ],
            },
            tutor_persona="nova",
        )
        assert len(messages) >= 2
