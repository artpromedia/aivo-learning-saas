import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useFunctioningLevel as useFunctioningLevelContext } from "@/providers/FunctioningLevelProvider";

export interface FunctioningLevelData {
  learnerId: string;
  level: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  label: string;
  description: string;
  adaptations: {
    reduceAnimations: boolean;
    fontScale: number;
    simplifiedUi: boolean;
    maxChoices: number;
    audioCues: boolean;
  };
  assessedAt: string;
}

export function useFunctioningLevelQuery(learnerId: string | undefined) {
  const config = useFunctioningLevelContext();

  const query = useQuery({
    queryKey: ["functioning-level", learnerId],
    queryFn: () =>
      apiFetch<FunctioningLevelData>(
        API_ROUTES.FUNCTIONING_LEVEL.CURRENT(learnerId!),
      ),
    enabled: !!learnerId,
  });

  return {
    data: query.data,
    config,
    level: config.level,
    reduceAnimations: config.reduceAnimations,
    fontScale: config.fontScale,
    simplifiedUi: config.simplifiedUi,
    maxChoices: config.maxChoices,
    audioCues: config.audioCues,
    isLoading: query.isLoading,
    error: query.error,
  };
}
