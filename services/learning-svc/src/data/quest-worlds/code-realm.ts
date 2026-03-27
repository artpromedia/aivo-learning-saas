import type { QuestWorldDefinition } from "./types.js";

export const CODE_REALM: QuestWorldDefinition = {
  slug: "code-realm",
  title: "Pixel's Code Realm",
  description:
    "Enter the digital world with Pixel the Code Crafter. Program robots, debug glitches, and build creations that come alive in code. Every line you write powers a new part of the realm.",
  subject: "coding",
  tutorPersona: "Pixel",
  gradeBands: {
    "K-2": {
      skills: [
        "sequencing", "patterns_repeat", "directions_movement", "loops_basic",
        "events_triggers", "conditionals_basic", "debugging_simple", "algorithms_intro",
        "decomposition", "abstraction_basic",
      ],
    },
    "3-5": {
      skills: [
        "variables", "loops_for_while", "conditionals_nested", "functions_basic",
        "data_types", "string_operations", "lists_arrays", "input_output",
        "debugging_strategies", "project_planning",
      ],
    },
    "6-8": {
      skills: [
        "oop_concepts", "data_structures", "algorithms_sorting", "web_html_css",
        "javascript_basics", "api_concepts", "version_control", "testing_basics",
        "problem_decomposition", "collaborative_coding",
      ],
    },
    "9-12": {
      skills: [
        "advanced_algorithms", "database_design", "software_architecture", "api_design",
        "security_basics", "performance_optimization", "machine_learning_intro", "mobile_development",
        "devops_basics", "open_source_contribution",
      ],
    },
  },
  chapters: [
    { number: 1, title: "The Sequence Starter", hasBoss: false, xpReward: 50 },
    { number: 2, title: "Loop Land", hasBoss: false, xpReward: 50 },
    { number: 3, title: "The Conditional Crossroads", hasBoss: true, xpReward: 100 },
    { number: 4, title: "Function Factory", hasBoss: false, xpReward: 50 },
    { number: 5, title: "Variable Village", hasBoss: false, xpReward: 50 },
    { number: 6, title: "The Data Den", hasBoss: true, xpReward: 150 },
    { number: 7, title: "Algorithm Arcade", hasBoss: false, xpReward: 75 },
    { number: 8, title: "The Web Workshop", hasBoss: false, xpReward: 75 },
    { number: 9, title: "System Design Studio", hasBoss: true, xpReward: 225 },
    { number: 10, title: "The Grand Deploy — Final Boss", hasBoss: true, xpReward: 225 },
  ],
  totalXp: 1050,
};
