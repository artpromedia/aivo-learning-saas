"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
          `/api/learners/${learnerId}/collaboration`,
        );
        setMembers(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load team members",
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
        `/api/learners/${learnerId}/collaboration/invite`,
        {
          method: "POST",
          body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        },
      );
      setMembers((prev) => [...prev, newMember]);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await apiFetch(`/api/learners/${learnerId}/collaboration/${memberId}`, {
        method: "DELETE",
      });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
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
        <Skeleton height={80} className="w-full rounded-xl" />
        <Skeleton height={200} className="w-full rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={72} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Users size={32} />
          <div>
            <h1 className="text-2xl font-bold">Collaboration Team</h1>
            <p className="text-white/80 text-sm">
              Invite teachers, therapists, and caregivers to collaborate.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Invite Form */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus size={18} className="text-[#7C3AED]" />
            Invite a Team Member
          </h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                placeholder="colleague@school.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(
                    e.target.value as "teacher" | "therapist" | "caregiver",
                  )
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
              >
                <option value="teacher">Teacher</option>
                <option value="therapist">Therapist</option>
                <option value="caregiver">Caregiver</option>
              </select>
            </div>
            <Button
              type="submit"
              loading={inviting}
              leftIcon={<Mail size={16} />}
            >
              Send Invitation
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Current Members */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Current Members ({members.length})
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
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
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
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {member.email}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(member.id)}
                  disabled={removingId === member.id}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  title="Remove member"
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
            <Users className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="text-gray-500 dark:text-gray-400">
              No team members yet. Send an invitation above to start
              collaborating.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
