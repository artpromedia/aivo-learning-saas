import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export interface SessionData {
  id: string;
  learnerId: string;
  status: "active" | "paused" | "completed";
  startedAt: string;
  completedAt?: string;
  xpEarned: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface InteractionResult {
  correct: boolean;
  feedback: string;
  xpAwarded: number;
  nextQuestion?: {
    id: string;
    type: string;
    prompt: string;
    options?: string[];
  };
}

export interface SessionSummary {
  totalXp: number;
  accuracy: number;
  duration: number;
  badgesEarned: string[];
  streakUpdated: boolean;
}

export function useLearningSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    async (payload: { learnerId: string; lessonId?: string; questId?: string }) => {
      setIsStarting(true);
      setError(null);
      try {
        const data = await apiFetch<SessionData>(API_ROUTES.SESSION.START, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSession(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start session";
        setError(message);
        throw err;
      } finally {
        setIsStarting(false);
      }
    },
    [],
  );

  const interact = useCallback(
    async (answer: { questionId: string; response: unknown }) => {
      if (!session) throw new Error("No active session");
      setIsInteracting(true);
      setError(null);
      try {
        const result = await apiFetch<InteractionResult>(
          API_ROUTES.SESSION.INTERACT(session.id),
          {
            method: "POST",
            body: JSON.stringify(answer),
          },
        );
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Interaction failed";
        setError(message);
        throw err;
      } finally {
        setIsInteracting(false);
      }
    },
    [session],
  );

  const completeSession = useCallback(async () => {
    if (!session) throw new Error("No active session");
    setIsCompleting(true);
    setError(null);
    try {
      const summary = await apiFetch<SessionSummary>(
        API_ROUTES.SESSION.COMPLETE(session.id),
        { method: "POST" },
      );
      setSession(null);
      return summary;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete session";
      setError(message);
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }, [session]);

  return {
    session,
    isStarting,
    isInteracting,
    isCompleting,
    error,
    startSession,
    interact,
    completeSession,
  };
}
