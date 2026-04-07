/**
 * Role-aware redirect destinations after onboarding completion.
 * Matches mobile app behavior (brain_reveal_screen.dart lines 177-194).
 */

export function getPostOnboardingRedirect(role: string): string {
  switch (role) {
    case "learner":
      return "/learner";
    case "parent":
      return "/complete";
    case "teacher":
    case "educator":
      return "/teacher";
    default:
      return "/complete";
  }
}

export function getDashboardPath(role: string, learnerId?: string | null): string {
  switch (role) {
    case "learner":
      return "/learner";
    case "parent":
      return learnerId ? `/parent/${learnerId}` : "/parent";
    case "teacher":
    case "educator":
      return "/teacher";
    case "admin":
      return "/admin";
    default:
      return "/parent";
  }
}

export function isLearnerRole(role: string | undefined | null): boolean {
  return role === "learner";
}
