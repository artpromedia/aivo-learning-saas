"""Per-functioning-level content generation constraints."""

from __future__ import annotations


# Content rules keyed by functioning level
FUNCTIONING_LEVEL_RULES: dict[str, str] = {
    "STANDARD": "",  # No special constraints
    "SUPPORTED": (
        "## Content Rules: SUPPORTED Functioning Level\n"
        "- Use simple, clear language\n"
        "- Break complex tasks into smaller steps\n"
        "- Provide visual supports alongside text\n"
        "- Allow extended processing time\n"
        "- Maximum 3-4 sentences per instruction block\n"
        "- Use concrete examples before abstract concepts"
    ),
    "LOW_VERBAL": (
        "## Content Rules: LOW VERBAL Functioning Level\n"
        "STRICT REQUIREMENTS — all content MUST follow these rules:\n"
        "- Maximum 1 sentence per screen/block\n"
        "- Maximum 2 choices for any selection\n"
        "- Every text MUST have a picture/visual indicator\n"
        "- Session content must fit within 5 minutes\n"
        "- Use only concrete, tangible objects — no abstract concepts\n"
        "- Simple vocabulary: max 2-syllable words preferred\n"
        "- Touch/tap interaction only — no typing required\n"
        "- Include [PICTURE: description] markers for all visual needs"
    ),
    "NON_VERBAL": (
        "## Content Rules: NON VERBAL Functioning Level\n"
        "STRICT REQUIREMENTS — ALL content must be dual-output:\n"
        "1. LEARNER-FACING: visual/tactile content only\n"
        "   - Cause-and-effect format: 'When [action], then [result]'\n"
        "   - Large touch targets, picture-based responses\n"
        "   - Maximum 1 choice per screen\n"
        "   - Engagement-based metrics (looking, reaching, activating)\n"
        "2. ADULT FACILITATOR GUIDE:\n"
        "   - Step-by-step instructions for the supporting adult\n"
        "   - Prompting hierarchy: wait → gesture → model → physical assist\n"
        "   - Expected responses and what to observe\n"
        "   - Sensory break indicators"
    ),
    "PRE_SYMBOLIC": (
        "## Content Rules: PRE SYMBOLIC Functioning Level\n"
        "ALL content is ADULT-DIRECTED ONLY — the learner does NOT interact with screens.\n"
        "Generate:\n"
        "1. ADULT-DIRECTED ACTIVITY GUIDE:\n"
        "   - Sensory/cause-effect activities only\n"
        "   - Each activity: 1-3 minutes duration\n"
        "   - Include: materials needed, setup, procedure, what to observe\n"
        "   - Engagement indicators: eye gaze, body movement, vocalization\n"
        "2. OBSERVATIONAL CHECKLIST:\n"
        "   - [ ] Showed alertness to stimulus\n"
        "   - [ ] Tracked object/person\n"
        "   - [ ] Made vocalization\n"
        "   - [ ] Showed preference (reaching, turning toward)\n"
        "   - [ ] Demonstrated cause-effect understanding\n"
        "3. SENSORY BREAK PROTOCOL between activities"
    ),
}


def get_content_rules_prompt(functioning_level: str) -> str:
    """Get the content generation rules for a functioning level."""
    return FUNCTIONING_LEVEL_RULES.get(functioning_level, "")


def get_max_sentences_per_block(functioning_level: str) -> int:
    """Get max sentences allowed per content block."""
    limits = {
        "STANDARD": 10,
        "SUPPORTED": 4,
        "LOW_VERBAL": 1,
        "NON_VERBAL": 1,
        "PRE_SYMBOLIC": 0,  # No learner-facing text
    }
    return limits.get(functioning_level, 10)


def get_max_choices(functioning_level: str) -> int:
    """Get max number of choices for selection items."""
    limits = {
        "STANDARD": 4,
        "SUPPORTED": 4,
        "LOW_VERBAL": 2,
        "NON_VERBAL": 1,
        "PRE_SYMBOLIC": 0,
    }
    return limits.get(functioning_level, 4)
