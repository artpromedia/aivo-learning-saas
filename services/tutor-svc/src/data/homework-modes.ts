export type HomeworkMode =
  | "PRACTICE"
  | "MODIFIED"
  | "PARENT_MEDIATED"
  | "PARENT_GUIDE";

const FUNCTIONING_LEVEL_TO_MODE: Record<string, HomeworkMode> = {
  STANDARD: "PRACTICE",
  SUPPORTED: "MODIFIED",
  LOW_VERBAL: "PARENT_MEDIATED",
  NON_VERBAL: "PARENT_GUIDE",
  PRE_SYMBOLIC: "PARENT_GUIDE",
};

export function getHomeworkMode(functioningLevel: string): HomeworkMode {
  return FUNCTIONING_LEVEL_TO_MODE[functioningLevel] ?? "PRACTICE";
}
