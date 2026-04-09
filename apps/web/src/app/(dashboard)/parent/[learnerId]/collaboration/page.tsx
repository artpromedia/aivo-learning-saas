"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Users, Loader2, Mail, Trash2, UserPlus, Shield, Heart, AlertCircle, Copy, CheckCircle,
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

const MAX_CAREGIVERS = 2;

interface CollaborationResponse {
  subscriptionType: "parent" | "district";
  members: CollaborationMember[];
}

export default function CollaborationPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const t = useTranslations("dashboard");

  const [members, setMembers] = useState<CollaborationMember[]>([]);
  const [subscriptionType, setSubscriptionType] = useState<"parent" | "district">("parent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"teacher" | "therapist" | "caregiver">("teacher");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const caregiverCount = members.filter((m) => m.role === "caregiver").length;
  const canInviteCaregivers = caregiverCount < MAX_CAREGIVERS;
  const isParentPaid = subscriptionType === "parent";

  useEffect(() => {
    async function fetchMembers() {
      try {
        const result = await apiFetch<CollaborationResponse | CollaborationMember[]>(API_ROUTES.COLLABORATION.LIST(learnerId));
        if (Array.isArray(result)) {
          setMembers(result);
        } else {
          setSubscriptionType(result.subscriptionType ?? "parent");
          setMembers(result.members ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadTeam"));
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [learnerId]);

  const handleInvite = async (e: React.FormEvent, roleOverride?: "teacher" | "therapist" | "caregiver") => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const effectiveRole = roleOverride ?? inviteRole;

    if (effectiveRole === "caregiver" && !canInviteCaregivers) {
      setError(`You can only invite up to ${MAX_CAREGIVERS} caregivers per child. Remove an existing caregiver first.`);
      return;
    }

    setInviting(true);
    setError(null);
    setInviteSuccess(false);
    try {
      const isMock = document.cookie.includes("user_role=");
      let newMember: CollaborationMember;
      if (isMock) {
        await new Promise((r) => setTimeout(r, 1500));
        newMember = {
          id: `member-${Date.now()}`,
          name: "",
          email: inviteEmail,
          role: effectiveRole,
          status: "pending",
          joinedAt: new Date().toISOString(),
        };
      } else {
        newMember = await apiFetch<CollaborationMember>(API_ROUTES.COLLABORATION.INVITE(learnerId), {
          method: "POST",
          body: JSON.stringify({ email: inviteEmail, role: effectiveRole }),
        });
      }
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
      const isMock = document.cookie.includes("user_role=");
      if (isMock) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await apiFetch(API_ROUTES.COLLABORATION.REMOVE(learnerId, memberId), { method: "DELETE" });
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToRemoveMember"));
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/accept-invite?child=${learnerId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  const roleIcons: Record<string, React.ReactNode> = {
    teacher: <Users size={20} style={{ color: "#7C3AED" }} />,
    therapist: <Shield size={20} style={{ color: "#10B981" }} />,
    caregiver: <Heart size={20} style={{ color: "#F472B6" }} />,
  };

  const roleColors: Record<string, string> = { teacher: "default", therapist: "success", caregiver: "warning" };

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
      <BackLink href={`/parent/${learnerId}`}>{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
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

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<Users size={18} />} label="Team Members" value={members.length} color="#7C3AED" delay={100} />
        <StatCard icon={<Mail size={18} />} label="Pending" value={members.filter((m) => m.status === "pending").length} color="#F59E0B" delay={200} />
        <StatCard icon={<Heart size={18} />} label={`Caregivers (${caregiverCount}/${MAX_CAREGIVERS})`} value={caregiverCount} color="#F472B6" delay={300} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-3xl bg-[#FFE0E0] border border-[#FECACA] text-[#991B1B] text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <ExpandableCard
        icon={<UserPlus size={16} />}
        title="Invite Caregiver"
        subtitle={`Add a caregiver to your child's profile (${caregiverCount}/${MAX_CAREGIVERS} slots used)`}
        gradient="linear-gradient(135deg, #F472B6, #EC4899)"
        delay={300}
        infoText={`You can invite up to ${MAX_CAREGIVERS} caregivers (like grandparents, aunts, uncles, or family friends) to view your child's learning progress. Caregivers get view-only access — they can see progress but cannot change settings.`}
      >
        {!canInviteCaregivers ? (
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <AlertCircle size={24} className="mx-auto mb-2 text-[#D97706]" />
            <p className="text-sm font-bold text-[#92400E]">Caregiver limit reached</p>
            <p className="text-xs text-[#92400E] mt-1">You&apos;ve invited the maximum of {MAX_CAREGIVERS} caregivers. Remove an existing caregiver to invite a new one.</p>
          </div>
        ) : (
          <form onSubmit={(e) => handleInvite(e, "caregiver")} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Email Address</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none" placeholder="caregiver@email.com" required />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={inviting} leftIcon={<Mail size={16} />}>Send Invitation</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCopyInviteLink} leftIcon={copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}>
                {copiedLink ? "Copied!" : "Copy Link"}
              </Button>
            </div>
            {inviteSuccess && (
              <div className="p-3 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                Invitation sent! They&apos;ll receive an email to join as a caregiver.
              </div>
            )}
          </form>
        )}
      </ExpandableCard>

      {isParentPaid && (
        <div className="mt-6">
          <ExpandableCard
            icon={<UserPlus size={16} />}
            title="Invite Teacher"
            subtitle="Connect your child's teacher to share learning insights"
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={400}
            infoText="Since you manage this subscription, you can invite your child's teacher to view their AIVO learning data. Teachers get access to brain profile insights, accommodations, and progress reports."
          >
            <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
              <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
                <strong>Parent-managed account</strong> — You control who has access. Teachers you invite can view learning data but cannot change settings or manage the subscription.
              </p>
            </div>
            <form onSubmit={(e) => handleInvite(e, inviteRole)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Teacher&apos;s email address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none" placeholder="teacher@school.edu" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>{t("role")}</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "teacher" | "therapist" | "caregiver")} className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none">
                  <option value="teacher">{t("teacher")}</option>
                  <option value="therapist">{t("therapist")}</option>
                </select>
              </div>
              <Button type="submit" loading={inviting} leftIcon={<Mail size={16} />}>{t("sendInvitation")}</Button>
              {inviteSuccess && (
                <div className="p-3 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  Invitation sent! The teacher will receive an email to join.
                </div>
              )}
            </form>
          </ExpandableCard>
        </div>
      )}

      {!isParentPaid && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Users size={16} />}
            title="School Team"
            subtitle="Your child's teacher manages this subscription"
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={400}
            infoText="This account was set up through your child's school district. The teacher manages class access and can invite parents to view learning data."
          >
            <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
              <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
                <strong>District-managed account</strong> — Your child&apos;s teacher set up this AIVO account through the school. You have full view access to your child&apos;s learning data.
              </p>
            </div>
          </ExpandableCard>
        </div>
      )}

      <div className="mt-6">
        <ExpandableCard
          icon={<Users size={16} />}
          title={t("currentMembers", { count: members.length })}
          subtitle="People who can view your child's learning data"
          gradient="linear-gradient(135deg, #10B981, #059669)"
          delay={500}
          infoText="Active members can see learning data. Pending members haven't accepted their invitation yet. You can remove anyone at any time."
        >
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member, idx) => (
                <AnimatedCard key={member.id} delay={600 + idx * 80}>
                  <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(124,58,237,0.1)" }}>
                      {roleIcons[member.role] ?? <Shield size={20} style={{ color: "#7C3AED" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate" style={{ color: "var(--aivo-text)" }}>{member.name || member.email}</h3>
                        <Badge variant={roleColors[member.role] as "default" | "success" | "warning"}>{member.role}</Badge>
                        {member.status === "pending" && <Badge variant="secondary">{t("pending")}</Badge>}
                      </div>
                      <p className="text-sm truncate" style={{ color: "var(--aivo-text-secondary)" }}>{member.email}</p>
                    </div>
                    <button onClick={() => handleRemove(member.id)} disabled={removingId === member.id} className="p-2 rounded-3xl transition-colors hover:text-red-500 hover:bg-red-50 disabled:opacity-50" style={{ color: "var(--aivo-text-muted)" }} title={t("removeMember")}>
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
