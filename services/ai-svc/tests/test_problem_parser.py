"""Tests for ai_svc.vision.problem_parser.ProblemParser."""

from __future__ import annotations

import pytest

from ai_svc.vision.problem_parser import ProblemParser, ParsedProblem


@pytest.fixture
def parser() -> ProblemParser:
    return ProblemParser()


# ── Empty / trivial input ────────────────────────────────────────────────

class TestEmptyInput:
    def test_empty_string_returns_empty(self, parser: ProblemParser):
        assert parser.parse("") == []

    def test_whitespace_only_returns_empty(self, parser: ProblemParser):
        assert parser.parse("   \n\n  ") == []

    def test_none_returns_empty(self, parser: ProblemParser):
        # The implementation checks `not text` first
        assert parser.parse(None) == []  # type: ignore[arg-type]


# ── Single problem (whole text as one problem) ──────────────────────────

class TestSingleProblem:
    def test_plain_sentence_treated_as_one_problem(self, parser: ProblemParser):
        text = "What is the capital of France?"
        result = parser.parse(text)
        assert len(result) == 1
        assert result[0].number == 1
        assert "capital of France" in result[0].text

    def test_single_numbered_item_treated_as_one_problem(self, parser: ProblemParser):
        """A single numbered item does NOT trigger numbered splitting (needs >=2)."""
        text = "1) What is 2 + 2?"
        result = parser.parse(text)
        assert len(result) == 1
        assert result[0].number == 1


# ── Numbered problem splitting ──────────────────────────────────────────

class TestNumberedParsing:
    def test_two_numbered_problems(self, parser: ProblemParser):
        text = "1) What is 2+2?\n2) Solve for x: 3x = 9"
        result = parser.parse(text)
        assert len(result) == 2
        assert result[0].number == 1
        assert result[1].number == 2
        assert "2+2" in result[0].text
        assert "3x" in result[1].text

    def test_three_numbered_with_periods(self, parser: ProblemParser):
        text = "1. Name the first president.\n2. What year was the Declaration signed?\n3. Define federalism."
        result = parser.parse(text)
        assert len(result) == 3
        for i, p in enumerate(result, 1):
            assert p.number == i

    def test_numbered_with_multiline_content(self, parser: ProblemParser):
        text = (
            "1) Read the following passage and answer:\n"
            "The quick brown fox jumped.\n"
            "2) What color was the fox?"
        )
        result = parser.parse(text)
        assert len(result) == 2
        # First problem should include the passage line
        assert "quick brown fox" in result[0].text

    def test_numbered_prefix_stripped(self, parser: ProblemParser):
        text = "1) Hello world\n2) Second problem"
        result = parser.parse(text)
        # The leading "1)" should be stripped from the text
        assert not result[0].text.startswith("1)")


# ── Separator-based splitting ────────────────────────────────────────────

class TestSeparatorSplitting:
    def test_dash_separator(self, parser: ProblemParser):
        text = "What is 5+3?\n---\nSpell the word 'cat'."
        result = parser.parse(text)
        assert len(result) == 2
        assert result[0].number == 1
        assert result[1].number == 2

    def test_equals_separator(self, parser: ProblemParser):
        text = "Problem A\n===\nProblem B"
        result = parser.parse(text)
        assert len(result) == 2

    def test_asterisk_separator(self, parser: ProblemParser):
        text = "First section\n***\nSecond section"
        result = parser.parse(text)
        assert len(result) == 2

    def test_hash_separator(self, parser: ProblemParser):
        text = "Part one\n###\nPart two"
        result = parser.parse(text)
        assert len(result) == 2


# ── MCQ choice extraction ───────────────────────────────────────────────

class TestMCQParsing:
    def test_four_choices_detected(self, parser: ProblemParser):
        text = (
            "What is the largest planet?\n"
            "A) Mercury\n"
            "B) Venus\n"
            "C) Jupiter\n"
            "D) Mars"
        )
        result = parser.parse(text)
        assert len(result) == 1
        p = result[0]
        assert p.problem_type == "MCQ"
        assert len(p.choices) == 4

    def test_mcq_choices_stripped_from_question_text(self, parser: ProblemParser):
        text = (
            "Which color is the sky?\n"
            "A) Red\n"
            "B) Blue\n"
            "C) Green\n"
            "D) Yellow"
        )
        result = parser.parse(text)
        p = result[0]
        # The question text should not include the choice lines
        assert "A) Red" not in p.text
        assert "sky" in p.text

    def test_numbered_mcq_problems(self, parser: ProblemParser):
        text = (
            "1) What is 2+2?\n"
            "A) 3\n"
            "B) 4\n"
            "C) 5\n"
            "D) 6\n"
            "2) What is 3+3?\n"
            "A) 5\n"
            "B) 6\n"
            "C) 7\n"
            "D) 8"
        )
        result = parser.parse(text)
        assert len(result) == 2
        assert result[0].problem_type == "MCQ"
        assert result[1].problem_type == "MCQ"

    def test_single_choice_not_treated_as_mcq(self, parser: ProblemParser):
        """Fewer than 2 choices means no MCQ classification."""
        text = "Which one?\nA) Only option"
        result = parser.parse(text)
        assert result[0].problem_type != "MCQ"
        assert result[0].choices == []


# ── Equation extraction ─────────────────────────────────────────────────

class TestEquationExtraction:
    def test_plain_math_expression(self, parser: ProblemParser):
        text = "Solve: 3 + 4 = ?"
        result = parser.parse(text)
        assert len(result) == 1
        assert result[0].problem_type == "EQUATION"
        assert len(result[0].equations_latex) >= 1

    def test_latex_delimited_equation(self, parser: ProblemParser):
        text = "Simplify the expression $x^2 + 2x + 1$"
        result = parser.parse(text)
        p = result[0]
        assert any("x^2" in eq for eq in p.equations_latex)

    def test_fraction_converted_to_latex(self, parser: ProblemParser):
        text = "What is 3/4 of 12?"
        result = parser.parse(text)
        p = result[0]
        # 3/4 should be converted to \\frac{3}{4}
        assert any("frac" in eq for eq in p.equations_latex)

    def test_multiplication_symbol_converted(self, parser: ProblemParser):
        text = "Calculate 5 × 6"
        result = parser.parse(text)
        p = result[0]
        assert any("\\times" in eq for eq in p.equations_latex)


# ── Problem type classification ─────────────────────────────────────────

class TestClassification:
    def test_mcq_type(self, parser: ProblemParser):
        text = "Pick one:\nA) Yes\nB) No\nC) Maybe\nD) Never"
        result = parser.parse(text)
        assert result[0].problem_type == "MCQ"

    def test_equation_type(self, parser: ProblemParser):
        text = "5 + 3 = ?"
        result = parser.parse(text)
        assert result[0].problem_type == "EQUATION"

    def test_short_answer_type(self, parser: ProblemParser):
        text = "Name the capital of France."
        result = parser.parse(text)
        assert result[0].problem_type == "SHORT_ANSWER"

    def test_word_problem_type(self, parser: ProblemParser):
        """Long text with question keywords → WORD_PROBLEM."""
        text = (
            "Sarah went to the store and bought five apples and three oranges. "
            "Each apple costs one dollar and fifty cents and each orange costs "
            "two dollars. She gave the cashier a twenty dollar bill. She also "
            "bought a bag of chips and a bottle of water. Her friend gave her "
            "some money back later that day at school during recess. "
            "How many pieces of fruit did she buy in total and how much "
            "change did she get back from the cashier?"
        )
        result = parser.parse(text)
        assert result[0].problem_type == "WORD_PROBLEM"


# ── to_dict serialization ───────────────────────────────────────────────

class TestParsedProblemDict:
    def test_to_dict_contains_all_fields(self):
        p = ParsedProblem(
            number=1,
            text="What is 2+2?",
            problem_type="EQUATION",
            choices=[],
            equations_latex=["2+2"],
        )
        d = p.to_dict()
        assert d["number"] == 1
        assert d["text"] == "What is 2+2?"
        assert d["problem_type"] == "EQUATION"
        assert d["choices"] == []
        assert d["equations_latex"] == ["2+2"]
