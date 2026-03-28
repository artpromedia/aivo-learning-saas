"use client";

import React, { useEffect, useState, useCallback } from "react";
import { UserPlus, Mail, Users, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
      setTeachers(data);
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
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
        <p className="mt-1 text-white/80">Manage teachers across your district.</p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Invite a Teacher</h3>
              <button
                onClick={() => setShowInvite(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                />
              </div>
              <Button type="submit" loading={inviting}>
                Send Invite
              </Button>
            </form>
            {inviteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">{inviteSuccess}</p>
            )}
          </CardBody>
        </Card>
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
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
              <Users className="text-[#7C3AED]" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No teachers yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Invite teachers to start managing classrooms.
            </p>
            <Button leftIcon={<UserPlus size={18} />} onClick={() => setShowInvite(true)}>
              Invite First Teacher
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-md transition-shadow">
              <CardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center text-white font-bold shrink-0">
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {teacher.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {teacher.email}
                  </p>
                </div>
                {teacher.classroom ? (
                  <Badge variant="default">{teacher.classroom}</Badge>
                ) : (
                  <Badge variant="secondary">Unassigned</Badge>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
