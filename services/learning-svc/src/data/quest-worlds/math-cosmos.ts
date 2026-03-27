import type { QuestWorldDefinition } from "./types.js";

export const MATH_COSMOS: QuestWorldDefinition = {
  slug: "math-cosmos",
  title: "Nova's Cosmos",
  description:
    "Join Nova the Star Navigator on an interstellar journey through the mathematical universe. From counting asteroids to calculating orbital trajectories, every chapter unlocks a new constellation of knowledge.",
  subject: "math",
  tutorPersona: "Nova",
  gradeBands: {
    "K-2": {
      skills: [
        "counting", "number_recognition", "addition_basic", "subtraction_basic",
        "shapes_2d", "measurement_comparison", "patterns", "place_value_tens",
        "addition_within_20", "skip_counting",
      ],
    },
    "3-5": {
      skills: [
        "multiplication_facts", "division_facts", "fractions_intro", "decimals_intro",
        "area_perimeter", "multiplication_2digit", "long_division", "fractions_operations",
        "decimals_operations", "geometry_angles",
      ],
    },
    "6-8": {
      skills: [
        "ratios_proportions", "integers", "expressions_equations", "geometry_volume",
        "statistics_intro", "linear_equations", "pythagorean_theorem", "transformations",
        "functions_intro", "probability",
      ],
    },
    "9-12": {
      skills: [
        "quadratic_equations", "exponential_functions", "trigonometry_intro", "sequences_series",
        "polynomial_operations", "rational_expressions", "logarithms", "conic_sections",
        "limits_intro", "derivatives_intro",
      ],
    },
  },
  chapters: [
    { number: 1, title: "The Counting Nebula", hasBoss: false, xpReward: 50 },
    { number: 2, title: "Addition Asteroid Belt", hasBoss: false, xpReward: 50 },
    { number: 3, title: "The Subtraction Supernova", hasBoss: true, xpReward: 100 },
    { number: 4, title: "Multiplication Moons", hasBoss: false, xpReward: 50 },
    { number: 5, title: "Division Galaxy", hasBoss: false, xpReward: 50 },
    { number: 6, title: "Fraction Frontier", hasBoss: true, xpReward: 150 },
    { number: 7, title: "Decimal Dimensions", hasBoss: false, xpReward: 75 },
    { number: 8, title: "Geometry Gravity Wells", hasBoss: false, xpReward: 75 },
    { number: 9, title: "The Algebra Anomaly", hasBoss: true, xpReward: 225 },
    { number: 10, title: "The Cosmic Equation — Final Boss", hasBoss: true, xpReward: 225 },
  ],
  totalXp: 1050,
};
