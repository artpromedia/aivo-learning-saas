"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Users, Loader2, Mail, Trash2, UserPlus, Shield, Heart, AlertCircle, Copy, CheckCircle, Home,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: "parent" | "caregiver";
  status: "active" | "pending";
  joinedAt: string;
}

interface FamilyResponse {
  subscriptionType: "district" | "parent";
  members: FamilyMember[];
}

export default function TeacherFamilyPage() {
  const t = useTranslations("teacher");
  const params = useParams();
  const learnerId = params.id as string;

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [subscriptionType, setSubscriptionType] = useState<"district" | "parent">("district");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isDistrictPaid = subscriptionType === "district";
  const parentCount = members.filter((m) => m.role === "parent").length;

  useEffect(() => {
    async function fetchFamily() {
      try {
        const result = await apiFetch<FamilyResponse>(API_ROUTES.TEACHER.LEARNER_FAMILY(learnerId));
        setSubscriptionType(result.subscriptionType ?? "district");
        setMembers(result.members ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadFamily"));
      } finally {
        setLoading(false);
      }
    }
    fetchFamily();
  }, [learnerId]);

  const handleInviteParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setError(null);
    setInviteSuccess(false);
    try {
      const newMember = await apiFetch<FamilyMember>(API_ROUTES.TEACHER.LEARNER_FAMILY_INVITE(learnerId), {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: "parent" }),
      });
      setMembers((prev) => [...prev, newMember]);
      setInviteEmail("");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSendInvite"));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await apiFetch(API_ROUTES.TEACHER.LEARNER_FAMILY_REMOVE(learnerId, memberId), { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToRemoveMember"));
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/accept-invite?child=${learnerId}&from=teacher`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  const roleIcons: Record<string, React.ReactNode> = {
    parent: <Home size={20} style={{ color: "#7C3AED" }} />,
    caregiver: <Heart size={20} style={{ color: "#F472B6" }} />,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <Skeleton height={200} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={72} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/teacher/learners/${learnerId}`}>{t("backToLearnerHub")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("familyTitle")}</h1>
            <p className="text-white/80 text-sm">{t("familySubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<Users size={18} />} label={t("familyMembersLabel")} value={members.length} color="#7C3AED" delay={100} />
        <StatCard icon={<Home size={18} />} label={t("parentsLabel")} value={parentCount} color="#3B82F6" delay={200} />
        <StatCard icon={<Heart size={18} />} label={t("caregiversLabel")} value={members.filter((m) => m.role === "caregiver").length} color="#F472B6" delay={300} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-3xl bg-[#FFE0E0] border border-[#FECACA] text-[#991B1B] text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {isDistrictPaid ? (
        <ExpandableCard
          icon={<UserPlus size={16} />}
          title={t("inviteParentTitle")}
          subtitle={t("inviteParentSubtitle")}
          gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
          delay={300}
          infoText={t("inviteParentInfo")}
        >
          <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
            <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
              <strong>{t("districtManagedLabel")}</strong> — {t("districtManagedDesc")}
            </p>
          </div>
          <form onSubmit={handleInviteParent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>{t("parentEmailLabel")}</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                placeholder={t("parentEmailPlaceholder")}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={inviting} leftIcon={<Mail size={16} />}>{t("sendInvitation")}</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCopyInviteLink} leftIcon={copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}>
                {copiedLink ? t("copiedLink") : t("copyLink")}
              </Button>
            </div>
            {inviteSuccess && (
              <div className="p-3 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {t("invitationSentSuccess")}
              </div>
            )}
          </form>
        </ExpandableCard>
      ) : (
        <ExpandableCard
          icon={<Shield size={16} />}
          title={t("parentManagedTitle")}
          subtitle={t("parentManagedSubtitle")}
          gradient="linear-gradient(135deg, #10B981, #059669)"
          delay={300}
          infoText={t("parentManagedInfo")}
        >
          <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
              <strong>{t("parentManagedLabel")}</strong> — {t("parentManagedDesc")}
            </p>
          </div>
        </ExpandableCard>
      )}

      <div className="mt-6">
        <ExpandableCard
          icon={<Users size={16} />}
          title={t("familyMembersTitle", { count: members.length })}
          subtitle={t("familyMembersSubtitle")}
          gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
          delay={400}
          infoText={t("familyMembersInfo")}
        >
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member, idx) => (
                <AnimatedCard key={member.id} delay={500 + idx * 80}>
                  <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: member.role === "parent" ? "rgba(124,58,237,0.1)" : "rgba(244,114,182,0.1)" }}>
                      {roleIcons[member.role] ?? <Shield size={20} style={{ color: "#7C3AED" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate" style={{ color: "var(--aivo-text)" }}>{member.name || member.email}</h3>
                        <Badge variant={member.role === "parent" ? "default" : "warning"}>{member.role === "parent" ? t("parentRole") : t("caregiverRole")}</Badge>
                        {member.status === "pending" && <Badge variant="secondary">{t("pendingStatus")}</Badge>}
                      </div>
                      <p className="text-sm truncate" style={{ color: "var(--aivo-text-secondary)" }}>{member.email}</p>
                    </div>
                    {isDistrictPaid && (
                      <button onClick={() => handleRemove(member.id)} disabled={removingId === member.id} className="p-2 rounded-3xl transition-colors hover:text-red-500 hover:bg-red-50 disabled:opacity-50" style={{ color: "var(--aivo-text-muted)" }} title={t("removeMember")}>
                        {removingId === member.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    )}
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto mb-3" size={40} style={{ color: "var(--aivo-text-muted)" }} />
              <p className="font-bold mb-1" style={{ color: "var(--aivo-text)" }}>{t("noFamilyMembers")}</p>
              <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>
                {isDistrictPaid ? t("noFamilyDistrictDesc") : t("noFamilyParentDesc")}
              </p>
            </div>
          )}
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}
