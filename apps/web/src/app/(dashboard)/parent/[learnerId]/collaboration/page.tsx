"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Loader2,
  RefreshCw,
  Mail,
  Trash2,
  UserPlus,
  Shield,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
        const result = await apiFetch<CollaborationMember[]>(
          API_ROUTES.COLLABORATION.LIST(learnerId),
        );
        setMembers(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("failedToLoadTeam"),
        );
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
      const newMember = await apiFetch<CollaborationMember>(
        API_ROUTES.COLLABORATION.INVITE(learnerId),
        {
          method: "POST",
          body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        },
      );
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
      await apiFetch(API_ROUTES.COLLABORATION.REMOVE(learnerId, memberId), {
        method: "DELETE",
      });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToRemoveMember"));
    } finally {
      setRemovingId(null);
    }
  };

  const roleColors: Record<string, string> = {
    teacher: "default",
    therapist: "success",
    caregiver: "warning",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-2xl" />
        <Skeleton height={200} className="w-full rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={72} className="w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--aivo-text-secondary)] hover:text-[var(--aivo-text)] dark:text-[var(--aivo-text-muted)] dark:hover:text-[#A89BB5] mb-4"
      >
        <ArrowLeft size={16} />
        {t("backToDashboard")}
      </Link>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <Users size={32} />
          <div>
            <h1 className="text-2xl font-extrabold">{t("collaborationTeam")}</h1>
            <p className="text-white/80 text-sm">
              {t("collaborationDesc")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
          {error}
        </div>
      )}

      {/* Invite Form */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold text-[var(--aivo-text)] flex items-center gap-2">
            <UserPlus size={18} className="text-[#7C3AED]" />
            {t("inviteTeamMember")}
          </h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                {t("emailAddress")}
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                placeholder="colleague@school.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                {t("role")}
              </label>
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(
                    e.target.value as "teacher" | "therapist" | "caregiver",
                  )
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
              >
                <option value="teacher">{t("teacher")}</option>
                <option value="therapist">{t("therapist")}</option>
                <option value="caregiver">{t("caregiver")}</option>
              </select>
            </div>
            <Button
              type="submit"
              loading={inviting}
              leftIcon={<Mail size={16} />}
            >
              {t("sendInvitation")}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Current Members */}
      <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-4">
        {t("currentMembers", { count: members.length })}
      </h2>

      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                  <Shield className="text-[#7C3AED]" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--aivo-text)] truncate">
                      {member.name || member.email}
                    </h3>
                    <Badge
                      variant={
                        roleColors[member.role] as
                          | "default"
                          | "success"
                          | "warning"
                      }
                    >
                      {member.role}
                    </Badge>
                    {member.status === "pending" && (
                      <Badge variant="secondary">{t("pending")}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[var(--aivo-text-secondary)] truncate">
                    {member.email}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(member.id)}
                  disabled={removingId === member.id}
                  className="p-2 rounded-2xl text-[var(--aivo-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  title={t("removeMember")}
                >
                  {removingId === member.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-8">
            <Users className="mx-auto mb-3 text-[#A89BB5]" size={40} />
            <p className="text-[var(--aivo-text-secondary)]">
              {t("noTeamMembers")}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
