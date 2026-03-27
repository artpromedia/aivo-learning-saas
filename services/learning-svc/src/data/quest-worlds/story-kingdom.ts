import type { QuestWorldDefinition } from "./types.js";

export const STORY_KINGDOM: QuestWorldDefinition = {
  slug: "story-kingdom",
  title: "Sage's Story Kingdom",
  description:
    "Enter the enchanted kingdom with Sage the Story Weaver. Explore magical libraries, decode ancient scrolls, and craft stories that bring characters to life. Every word you master opens a new door in the kingdom.",
  subject: "reading",
  tutorPersona: "Sage",
  gradeBands: {
    "K-2": {
      skills: [
        "letter_recognition", "phonemic_awareness", "sight_words", "cvc_words",
        "reading_fluency_basic", "story_sequence", "character_identification",
        "simple_comprehension", "vocabulary_basic", "rhyming",
      ],
    },
    "3-5": {
      skills: [
        "main_idea", "supporting_details", "inference", "vocabulary_context_clues",
        "text_structure", "compare_contrast", "author_purpose", "summarization",
        "figurative_language", "point_of_view",
      ],
    },
    "6-8": {
      skills: [
        "theme_analysis", "character_development", "literary_devices", "argument_analysis",
        "evidence_based_writing", "text_comparison", "tone_mood", "central_idea_complex",
        "word_relationships", "informational_text",
      ],
    },
    "9-12": {
      skills: [
        "rhetorical_analysis", "satire_irony", "literary_criticism", "synthesis_multiple_sources",
        "complex_argument", "diction_syntax", "historical_context", "unreliable_narrator",
        "allegory_symbolism", "research_integration",
      ],
    },
  },
  chapters: [
    { number: 1, title: "The Letter Garden", hasBoss: false, xpReward: 50 },
    { number: 2, title: "Word Wizard's Workshop", hasBoss: false, xpReward: 50 },
    { number: 3, title: "The Comprehension Castle", hasBoss: true, xpReward: 100 },
    { number: 4, title: "Inference Inn", hasBoss: false, xpReward: 50 },
    { number: 5, title: "The Vocabulary Vault", hasBoss: false, xpReward: 50 },
    { number: 6, title: "Story Structure Stronghold", hasBoss: true, xpReward: 150 },
    { number: 7, title: "The Author's Attic", hasBoss: false, xpReward: 75 },
    { number: 8, title: "Theme Theater", hasBoss: false, xpReward: 75 },
    { number: 9, title: "The Literary Labyrinth", hasBoss: true, xpReward: 225 },
    { number: 10, title: "The Grand Story — Final Boss", hasBoss: true, xpReward: 225 },
  ],
  totalXp: 1050,
};
