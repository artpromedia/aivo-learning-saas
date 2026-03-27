import type { QuestWorldDefinition } from "./types.js";

export const TIME_CHRONICLES: QuestWorldDefinition = {
  slug: "time-chronicles",
  title: "Chrono's Time Chronicles",
  description:
    "Travel through time with Chrono the Historian. Visit ancient civilizations, witness pivotal moments in history, and piece together the stories that shaped our world.",
  subject: "history",
  tutorPersona: "Chrono",
  gradeBands: {
    "K-2": {
      skills: [
        "past_present_future", "community_helpers", "maps_basic", "holidays_traditions",
        "family_history", "needs_wants", "rules_laws_basic", "national_symbols",
        "timeline_basics", "cultures_around_world",
      ],
    },
    "3-5": {
      skills: [
        "native_peoples", "exploration_colonization", "american_revolution", "westward_expansion",
        "civil_war_basics", "geography_regions", "government_branches", "economics_basic",
        "immigration_stories", "civil_rights_intro",
      ],
    },
    "6-8": {
      skills: [
        "ancient_civilizations", "medieval_world", "renaissance_reformation", "age_of_exploration",
        "industrial_revolution", "world_war_1", "world_war_2", "cold_war",
        "civil_rights_movement", "globalization",
      ],
    },
    "9-12": {
      skills: [
        "historiography", "primary_source_analysis", "economic_systems", "political_ideologies",
        "imperialism_colonialism", "modern_conflicts", "human_rights", "constitutional_law",
        "diplomatic_history", "social_movements",
      ],
    },
  },
  chapters: [
    { number: 1, title: "The Dawn of Time", hasBoss: false, xpReward: 50 },
    { number: 2, title: "Ancient Wonders", hasBoss: false, xpReward: 50 },
    { number: 3, title: "The Empire Trials", hasBoss: true, xpReward: 100 },
    { number: 4, title: "Medieval Mysteries", hasBoss: false, xpReward: 50 },
    { number: 5, title: "Age of Discovery", hasBoss: false, xpReward: 50 },
    { number: 6, title: "Revolution Rising", hasBoss: true, xpReward: 150 },
    { number: 7, title: "Industrial Innovations", hasBoss: false, xpReward: 75 },
    { number: 8, title: "World at War", hasBoss: false, xpReward: 75 },
    { number: 9, title: "Modern Movements", hasBoss: true, xpReward: 225 },
    { number: 10, title: "The Time Nexus — Final Boss", hasBoss: true, xpReward: 225 },
  ],
  totalXp: 1050,
};
