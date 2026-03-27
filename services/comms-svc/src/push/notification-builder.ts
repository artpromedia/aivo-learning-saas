export type PushNotificationType =
  | "recommendation_pending"
  | "tutor_ready"
  | "homework_ready"
  | "badge_earned"
  | "streak_broken"
  | "brain_update"
  | "iep_goal_met"
  | "weekly_digest"
  | "brain_regression"
  | "level_up";

export interface PushPayload {
  title: string;
  body: string;
  data: Record<string, string>;
}

export function buildPushPayload(type: PushNotificationType, data: Record<string, string>): PushPayload {
  const builders: Record<PushNotificationType, () => PushPayload> = {
    recommendation_pending: () => ({
      title: "New recommendation",
      body: `A new learning recommendation is ready for ${data.learnerName ?? "your child"}`,
      data: { type, ...data },
    }),
    tutor_ready: () => ({
      title: "AI Tutor activated!",
      body: `${data.subject ?? "A"} tutor is now ready for ${data.learnerName ?? "your child"}`,
      data: { type, ...data },
    }),
    homework_ready: () => ({
      title: "Homework ready!",
      body: `${data.learnerName ?? "Your child"}'s ${data.subject ?? ""} homework is ready to start`,
      data: { type, ...data },
    }),
    badge_earned: () => ({
      title: "Badge earned!",
      body: `${data.learnerName ?? "Your child"} earned the "${data.badgeName ?? "achievement"}" badge`,
      data: { type, ...data },
    }),
    streak_broken: () => ({
      title: "Streak ended",
      body: `${data.learnerName ?? "Your child"}'s ${data.previousStreak ?? ""}-day streak has ended`,
      data: { type, ...data },
    }),
    brain_update: () => ({
      title: "Brain profile updated",
      body: `${data.learnerName ?? "Your child"}'s brain profile has been updated`,
      data: { type, ...data },
    }),
    iep_goal_met: () => ({
      title: "IEP Goal achieved!",
      body: `${data.learnerName ?? "Your child"} met an IEP goal!`,
      data: { type, ...data },
    }),
    weekly_digest: () => ({
      title: "Weekly progress report",
      body: `${data.learnerName ?? "Your child"}'s weekly progress report is ready`,
      data: { type, ...data },
    }),
    brain_regression: () => ({
      title: "Attention needed",
      body: `${data.learnerName ?? "Your child"} may be experiencing regression in ${data.domain ?? "a subject"}`,
      data: { type, ...data },
    }),
    level_up: () => ({
      title: "Level up!",
      body: `${data.learnerName ?? "Your child"} reached level ${data.newLevel ?? ""}!`,
      data: { type, ...data },
    }),
  };

  return builders[type]();
}
