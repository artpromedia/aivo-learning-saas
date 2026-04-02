"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, RefreshCw, MessageSquare, Clock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { TutorAvatar, type TutorPersona } from "@/components/tutors/tutor-avatar";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface Tutor {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  specialty: string;
  description: string;
  sessionsCompleted: number;
  lastSessionAt: string | null;
}

export default function LearnerTutorsPage() {
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const data = await apiFetch<Tutor[]>(API_ROUTES.TUTOR.LIST);
        setTutors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tutors");
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Bot size={32} />
          <div>
            <h1 className="text-2xl font-bold">My Tutors</h1>
            <p className="text-white/80 text-sm">
              Chat with your 7 AI tutors to get help and learn new things.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {tutors.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Bot className="mx-auto mb-3 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No tutors available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Ask your parent to subscribe to tutors for you.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {tutors.map((tutor) => (
            <Link key={tutor.id} href={`/learner/tutors/${tutor.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardBody className="flex items-center gap-4">
                  <TutorAvatar
                    persona={tutor.slug as TutorPersona}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {tutor.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {tutor.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {tutor.sessionsCompleted} sessions
                      </span>
                      {tutor.lastSessionAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Last: {new Date(tutor.lastSessionAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge>{tutor.specialty}</Badge>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
