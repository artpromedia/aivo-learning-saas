"use client";

import React, { useEffect, useState, useCallback } from "react";
import { UserPlus, Mail, Users, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface Teacher {
  id: string;
  name: string;
  email: string;
  classroom?: string;
}

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await apiFetch<Teacher[]>("/api/admin/teachers");
      setTeachers(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      await apiFetch("/api/admin/teachers/invite", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      await fetchTeachers();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }

  return (
    <PageWrapper>
      <BackLink href="/admin/district">Back to District</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Teacher Management</h1>
            <p className="mt-0.5 text-white/80 text-sm">Manage teachers across your district</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--aivo-text)" }}>
          Teachers ({teachers.length})
        </h2>
        <Button
          size="sm"
          leftIcon={<UserPlus size={16} />}
          onClick={() => {
            setShowInvite(!showInvite);
            setInviteError(null);
            setInviteSuccess(null);
          }}
        >
          Invite Teacher
        </Button>
      </div>

      {showInvite && (
        <AnimatedCard delay={0}>
          <Card className="mb-6">
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: "var(--aivo-text)" }}>Invite a Teacher</h3>
                <button onClick={() => setShowInvite(false)} className="text-[#A89BB5] hover:text-[#7C3AED]">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleInvite} className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]" size={16} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] placeholder-[#A89BB5] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                  />
                </div>
                <Button type="submit" loading={inviting}>Send Invite</Button>
              </form>
              {inviteError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{inviteError}</p>}
              {inviteSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{inviteSuccess}</p>}
            </CardBody>
          </Card>
        </AnimatedCard>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody className="flex items-center gap-4">
                <Skeleton width={40} height={40} rounded="full" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={16} className="w-40" />
                  <Skeleton height={14} className="w-56" />
                </div>
                <Skeleton height={24} className="w-28" rounded="full" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No teachers yet"
          description="Invite teachers to start managing classrooms."
          delay={200}
          action={<Button leftIcon={<UserPlus size={16} />} onClick={() => setShowInvite(true)}>Invite First Teacher</Button>}
        />
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher, idx) => (
            <AnimatedCard key={teacher.id} delay={200 + idx * 60}>
              <Card className="hover:shadow-[var(--shadow-card)] transition-all hover:scale-[1.01]">
                <CardBody className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6)" }}>
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: "var(--aivo-text)" }}>{teacher.name}</p>
                    <p className="text-sm truncate" style={{ color: "var(--aivo-text-secondary)" }}>{teacher.email}</p>
                  </div>
                  {teacher.classroom ? (
                    <Badge variant="default">{teacher.classroom}</Badge>
                  ) : (
                    <Badge variant="secondary">Unassigned</Badge>
                  )}
                </CardBody>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
