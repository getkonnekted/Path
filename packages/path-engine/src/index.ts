export type PathStepKind =
  | "read"
  | "explore"
  | "understand"
  | "remember"
  | "test"
  | "connect";

export type PathStep = {
  id: string;
  title: string;
  summary: string;
  kind: PathStepKind;
  scriptureReferences: string[];
  objectives: string[];
};

export type PathDefinition = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  estimatedMinutes: number;
  steps: PathStep[];
};

export type LearningStage =
  | "new"
  | "learning"
  | "familiar"
  | "recalling"
  | "mastered";

export type MemoryAttempt = {
  itemId: string;
  attemptedAt: string;
  correct: boolean;
  responseMode: "recognize" | "recall" | "explain" | "connect";
};

export function getNextLearningStage(
  current: LearningStage,
  correctAttemptsInARow: number,
): LearningStage {
  if (correctAttemptsInARow < 1) return current === "new" ? "learning" : current;
  if (correctAttemptsInARow >= 5) return "mastered";
  if (correctAttemptsInARow >= 3) return "recalling";
  if (correctAttemptsInARow >= 2) return "familiar";
  return "learning";
}
