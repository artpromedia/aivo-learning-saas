"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Users, Loader2, Mail, Trash2, UserPlus, Shield,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface CollaborationMember {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "therapist" | "caregiver";
  status: "active" | "pending";
  joinedAt: string;
}

export default function CollaborationPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const t = useTranslations("dashboard");

  const [members, setMembers] = useState<CollaborationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"teacher" | "therapist" | "caregiver">("teacher");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const result = await apiFetch<CollaborationMember[]>(API_ROUTES.COLLABORATION.LIST(learnerId));
        setMembers(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadTeam"));
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [learnerId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const newMember = await apiFetch<CollaborationMember>(API_ROUTES.COLLABORATION.INVITE(learnerId), { method: "POST", body: JSON.stringify({ email: inviteEmail, role: inviteRole }) });
      setMembers((prev) => [...prev, newMember]);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSendInvite"));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await apiFetch(API_ROUTES.COLLABORATION.REMOVE(learnerId, memberId), { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToRemoveMember"));
    } finally {
      setRemovingId(null);
    }
  };

  const roleColors: Record<string, string> = { teacher: "default", therapist: "success", caregiver: "warning" };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-2xl" />
        <Skeleton height={200} className="w-full rounded-2xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={72} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}`}>{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("collaborationTeam")}</h1>
            <p className="text-white/80 text-sm">Invite teachers, therapists, and caregivers to share your child&apos;s learning progress</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 mb-8">
        <StatCard icon={<Users size={18} />} label="Team Members" value={members.length} color="#7C3AED" delay={100} />
        <StatCard icon={<Mail size={18} />} label="Pending" value={members.filter((m) => m.status === "pending").length} color="#F59E0B" delay={200} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">{error}</div>
      )}

      <ExpandableCard
        icon={<UserPlus size={16} />}
        title={t("inviteTeamMember")}
        subtitle="Add a teacher, therapist, or caregiver to your child's team"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={300}
        infoText="Inviting team members lets them view your child's learning progress. They can see data like mastery scores and brain profile insights. You can remove them at any time."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>{t("emailAddress")}</label>
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none" placeholder="colleague@school.edu" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>{t("role")}</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "teacher" | "therapist" | "caregiver")} className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none">
              <option value="teacher">{t("teacher")}</option>
              <option value="therapist">{t("therapist")}</option>
              <option value="caregiver">{t("caregiver")}</option>
            </select>
          </div>
          <Button type="submit" loading={inviting} leftIcon={<Mail size={16} />}>{t("sendInvitation")}</Button>
        </form>
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard
          icon={<Users size={16} />}
          title={t("currentMembers", { count: members.length })}
          subtitle="People who can view your child's learning data"
          gradient="linear-gradient(135deg, #10B981, #059669)"
          delay={400}
          infoText="These people have been invited to collaborate on your child's learning journey. Active members can see learning data. Pending members haven't accepted their invitation yet."
        >
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member, idx) => (
                <AnimatedCard key={member.id} delay={500 + idx * 80}>
                  <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(124,58,237,0.1)" }}>
                      <Shield size={20} style={{ color: "#7C3AED" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate" style={{ color: "var(--aivo-text)" }}>{member.name || member.email}</h3>
                        <Badge variant={roleColors[member.role] as "default" | "success" | "warning"}>{member.role}</Badge>
                        {member.status === "pending" && <Badge variant="secondary">{t("pending")}</Badge>}
                      </div>
                      <p className="text-sm truncate" style={{ color: "var(--aivo-text-secondary)" }}>{member.email}</p>
                    </div>
                    <button onClick={() => handleRemove(member.id)} disabled={removingId === member.id} className="p-2 rounded-2xl transition-colors hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50" style={{ color: "var(--aivo-text-muted)" }} title={t("removeMember")}>
                      {removingId === member.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto mb-3" size={40} style={{ color: "var(--aivo-text-muted)" }} />
              <p style={{ color: "var(--aivo-text-secondary)" }}>{t("noTeamMembers")}</p>
            </div>
          )}
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}
