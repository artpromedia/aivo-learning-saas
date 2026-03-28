"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, School, Users, ChevronRight, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";

interface Classroom {
  id: string;
  name: string;
  teacherName: string;
  learnerCount: number;
  gradeBand: string;
}

const GRADE_BANDS = ["Pre-K", "K-2", "3-5", "6-8", "9-12"];

export default function ClassroomManagementPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState("");
  const [formGradeBand, setFormGradeBand] = useState(GRADE_BANDS[0]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchClassrooms = useCallback(async () => {
    try {
      const data = await apiFetch<Classroom[]>("/api/admin/classrooms");
      setClassrooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
      await apiFetch("/api/admin/classrooms", {
        method: "POST",
        body: JSON.stringify({ name: formName.trim(), gradeBand: formGradeBand }),
      });
      setFormName("");
      setFormGradeBand(GRADE_BANDS[0]);
      setShowCreate(false);
      await fetchClassrooms();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create classroom");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">Classroom Management</h1>
        <p className="mt-1 text-white/80">Create and manage classrooms in your district.</p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Classrooms ({classrooms.length})
        </h2>
        <Button
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setShowCreate(!showCreate);
            setCreateError(null);
          }}
        >
          Create Classroom
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Create a Classroom</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Room 204 - Morning Group"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grade Band
                </label>
                <select
                  value={formGradeBand}
                  onChange={(e) => setFormGradeBand(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                >
                  {GRADE_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={creating}>
                  Create
                </Button>
              </div>
              {createError && (
                <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
              )}
            </form>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="flex items-center gap-4">
                <Skeleton width={40} height={40} rounded="lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={16} className="w-48" />
                  <Skeleton height={14} className="w-32" />
                </div>
                <Skeleton height={20} className="w-16" rounded="full" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
              <School className="text-[#7C3AED]" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No classrooms yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first classroom to organize learners and teachers.
            </p>
            <Button leftIcon={<Plus size={18} />} onClick={() => setShowCreate(true)}>
              Create First Classroom
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {classrooms.map((classroom) => (
            <Card
              key={classroom.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(`/admin/district/classrooms/${classroom.id}`)}
            >
              <CardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] shrink-0">
                  <School size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {classroom.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {classroom.teacherName}
                  </p>
                </div>
                <Badge variant="secondary">{classroom.gradeBand}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Users size={14} />
                  <span>{classroom.learnerCount}</span>
                </div>
                <ChevronRight
                  className="text-gray-400 group-hover:text-[#7C3AED] transition-colors shrink-0"
                  size={20}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
