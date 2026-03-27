import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export interface Recommendation {
  id: string;
  learnerId: string;
  title: string;
  description: string;
  type: "curriculum" | "tutor" | "accommodation" | "activity";
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "declined" | "adjusted";
  reasoning: string;
  createdAt: string;
}

export function useRecommendations(learnerId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["recommendations", learnerId];

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      apiFetch<Recommendation[]>(API_ROUTES.RECOMMENDATION.LIST(learnerId!)),
    enabled: !!learnerId,
  });

  const approveMutation = useMutation({
    mutationFn: (recId: string) =>
      apiFetch(API_ROUTES.RECOMMENDATION.APPROVE(learnerId!, recId), {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (recId: string) =>
      apiFetch(API_ROUTES.RECOMMENDATION.DECLINE(learnerId!, recId), {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const adjustMutation = useMutation({
    mutationFn: ({ recId, adjustments }: { recId: string; adjustments: Record<string, unknown> }) =>
      apiFetch(API_ROUTES.RECOMMENDATION.ADJUST(learnerId!, recId), {
        method: "POST",
        body: JSON.stringify(adjustments),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    recommendations: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    approve: approveMutation.mutateAsync,
    decline: declineMutation.mutateAsync,
    adjust: adjustMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isDeclining: declineMutation.isPending,
    isAdjusting: adjustMutation.isPending,
  };
}
