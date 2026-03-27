import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export interface BrainProfile {
  id: string;
  learnerId: string;
  functioningLevel: "level1" | "level2" | "level3";
  strengths: string[];
  challenges: string[];
  learningStyle: string;
  sensoryPreferences: string[];
  communicationStyle: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  updatedAt: string;
}

export function useBrain(learnerId: string | undefined) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["brain-profile", learnerId],
    queryFn: () => apiFetch<BrainProfile>(API_ROUTES.BRAIN.PROFILE(learnerId!)),
    enabled: !!learnerId,
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      apiFetch(API_ROUTES.BRAIN.APPROVE(learnerId!), { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brain-profile", learnerId] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: () =>
      apiFetch(API_ROUTES.BRAIN.DECLINE(learnerId!), { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brain-profile", learnerId] });
    },
  });

  const addInsightsMutation = useMutation({
    mutationFn: (insights: { text: string }) =>
      apiFetch(API_ROUTES.BRAIN.ADD_INSIGHTS(learnerId!), {
        method: "POST",
        body: JSON.stringify(insights),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brain-profile", learnerId] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    approve: approveMutation.mutateAsync,
    decline: declineMutation.mutateAsync,
    addInsights: addInsightsMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}
