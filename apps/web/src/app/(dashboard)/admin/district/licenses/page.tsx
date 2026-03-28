"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Key, Users, School, CheckCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";

interface LicensePool {
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
}

interface LearnerAllocation {
  id: string;
  name: string;
  classroomName: string;
  allocatedTutors: string[];
}

interface Classroom {
  id: string;
  name: string;
  learnerCount: number;
}

interface LicenseData {
  pool: LicensePool;
  learners: LearnerAllocation[];
  classrooms: Classroom[];
}

export default function LicenseManagementPage() {
  const [data, setData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allocating, setAllocating] = useState<string | null>(null);
  const [allocateSuccess, setAllocateSuccess] = useState<string | null>(null);

  const fetchLicenses = useCallback(async () => {
    try {
      const res = await apiFetch<LicenseData>("/api/admin/licenses");
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load license data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  async function handleBulkAllocate(classroomId: string, classroomName: string) {
    setAllocating(classroomId);
    setAllocateSuccess(null);

    try {
      await apiFetch("/api/admin/licenses/bulk-allocate", {
        method: "POST",
        body: JSON.stringify({ classroomId }),
      });
      setAllocateSuccess(`Licenses allocated to all learners in ${classroomName}`);
      await fetchLicenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to allocate licenses");
    } finally {
      setAllocating(null);
    }
  }

  const usagePercent = data
    ? data.pool.totalLicenses > 0
      ? Math.round((data.pool.usedLicenses / data.pool.totalLicenses) * 100)
      : 0
    : 0;

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">Tutor License Management</h1>
        <p className="mt-1 text-white/80">
          Manage and allocate AI tutor licenses across your district.
        </p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {allocateSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-2">
          <CheckCircle size={16} />
          {allocateSuccess}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody className="space-y-2">
                  <Skeleton height={14} className="w-24" />
                  <Skeleton height={32} className="w-16" />
                </CardBody>
              </Card>
            ))}
          </div>
          <Card>
            <CardBody className="space-y-3">
              <Skeleton height={20} className="w-40" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={48} className="w-full" rounded="lg" />
              ))}
            </CardBody>
          </Card>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody className="text-center">
                <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] mx-auto mb-2">
                  <Key size={20} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Licenses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.pool.totalLicenses}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto mb-2">
                  <Users size={20} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Used</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.pool.usedLicenses}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Usage</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {usagePercent}%
                </p>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${usagePercent}%`,
                      backgroundColor: usagePercent > 90 ? "#EF4444" : "#7C3AED",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {data.pool.availableLicenses} available
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bulk Allocate by Classroom
              </h2>
              {data.classrooms.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No classrooms available.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] shrink-0">
                        <School size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {classroom.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {classroom.learnerCount} learners
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={allocating === classroom.id}
                        onClick={() => handleBulkAllocate(classroom.id, classroom.name)}
                      >
                        Allocate Licenses
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Learner Allocations
              </h2>
              {data.learners.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No learner allocations found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          Learner
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          Classroom
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                          Allocated Tutors
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.learners.map((learner) => (
                        <tr
                          key={learner.id}
                          className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">
                            {learner.name}
                          </td>
                          <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                            {learner.classroomName}
                          </td>
                          <td className="py-3 px-3">
                            {learner.allocatedTutors.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {learner.allocatedTutors.map((tutor) => (
                                  <Badge key={tutor} variant="default">
                                    {tutor}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
