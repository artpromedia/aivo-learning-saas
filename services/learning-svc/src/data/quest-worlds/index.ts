import { MATH_COSMOS } from "./math-cosmos.js";
import { STORY_KINGDOM } from "./story-kingdom.js";
import { LAB_FRONTIER } from "./lab-frontier.js";
import { TIME_CHRONICLES } from "./time-chronicles.js";
import { CODE_REALM } from "./code-realm.js";
import type { QuestWorldDefinition } from "./types.js";

export { MATH_COSMOS } from "./math-cosmos.js";
export { STORY_KINGDOM } from "./story-kingdom.js";
export { LAB_FRONTIER } from "./lab-frontier.js";
export { TIME_CHRONICLES } from "./time-chronicles.js";
export { CODE_REALM } from "./code-realm.js";
export type { QuestWorldDefinition, QuestChapterDefinition, GradeBandSkills } from "./types.js";
export { getGradeBand, getChapterSkills } from "./types.js";

export const ALL_QUEST_WORLDS: QuestWorldDefinition[] = [
  MATH_COSMOS,
  STORY_KINGDOM,
  LAB_FRONTIER,
  TIME_CHRONICLES,
  CODE_REALM,
];

export function getQuestWorldBySlug(slug: string): QuestWorldDefinition | undefined {
  return ALL_QUEST_WORLDS.find((w) => w.slug === slug);
}
