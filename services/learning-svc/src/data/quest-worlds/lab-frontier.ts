import type { QuestWorldDefinition } from "./types.js";

export const LAB_FRONTIER: QuestWorldDefinition = {
  slug: "lab-frontier",
  title: "Spark's Lab Frontier",
  description:
    "Blast off with Spark the Inventor to the outer reaches of scientific discovery. Build experiments, test hypotheses, and unlock the secrets of the universe — one lab at a time.",
  subject: "science",
  tutorPersona: "Spark",
  gradeBands: {
    "K-2": {
      skills: [
        "observation", "living_nonliving", "weather_patterns", "animal_habitats",
        "plant_life_cycle", "matter_states", "pushes_pulls", "earth_materials",
        "senses", "day_night_cycle",
      ],
    },
    "3-5": {
      skills: [
        "scientific_method", "ecosystems", "food_chains", "water_cycle",
        "rocks_minerals", "force_motion", "energy_forms", "solar_system",
        "human_body_systems", "adaptations",
      ],
    },
    "6-8": {
      skills: [
        "cell_structure", "genetics_intro", "chemical_reactions", "periodic_table",
        "plate_tectonics", "weather_climate", "energy_transfer", "newtons_laws",
        "waves_sound_light", "ecology_populations",
      ],
    },
    "9-12": {
      skills: [
        "molecular_biology", "evolution", "organic_chemistry", "thermodynamics",
        "electromagnetism", "quantum_basics", "astrophysics_intro", "biochemistry",
        "environmental_science", "research_design",
      ],
    },
  },
  chapters: [
    { number: 1, title: "The Observation Outpost", hasBoss: false, xpReward: 50 },
    { number: 2, title: "Living Lab Alpha", hasBoss: false, xpReward: 50 },
    { number: 3, title: "The Hypothesis Hub", hasBoss: true, xpReward: 100 },
    { number: 4, title: "Ecosystem Engine Room", hasBoss: false, xpReward: 50 },
    { number: 5, title: "Matter & Energy Station", hasBoss: false, xpReward: 50 },
    { number: 6, title: "The Chemical Core", hasBoss: true, xpReward: 150 },
    { number: 7, title: "Force Field Lab", hasBoss: false, xpReward: 75 },
    { number: 8, title: "Cell Division Chamber", hasBoss: false, xpReward: 75 },
    { number: 9, title: "The Genetics Gateway", hasBoss: true, xpReward: 225 },
    { number: 10, title: "The Grand Experiment — Final Boss", hasBoss: true, xpReward: 225 },
  ],
  totalXp: 1050,
};
