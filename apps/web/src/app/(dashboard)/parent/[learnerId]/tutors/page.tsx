"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Loader2,
  RefreshCw,
  Plus,
  Star,
  MessageSquare,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface ActiveTutor {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  specialty: string;
  sessionsCompleted: number;
  lastSessionAt: string;
}

interface StoreTutor {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  specialty: string;
  description: string;
  rating: number;
  subscriberCount: number;
  tags: string[];
}

export default function TutorsPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;

  const [activeTutors, setActiveTutors] = useState<ActiveTutor[]>([]);
  const [storeTutors, setStoreTutors] = useState<StoreTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const [active, store] = await Promise.all([
          apiFetch<ActiveTutor[]>(API_ROUTES.TUTOR.LIST),
          apiFetch<StoreTutor[]>(API_ROUTES.TUTOR.STORE),
        ]);
        setActiveTutors(active);
        setStoreTutors(store);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tutors");
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, [learnerId]);

  const handleSubscribe = async (tutorId: string) => {
    setSubscribingId(tutorId);
    try {
      await apiFetch(`/api/learners/${learnerId}/tutors/${tutorId}/subscribe`, {
        method: "POST",
      });
      const subscribed = storeTutors.find((t) => t.id === tutorId);
      if (subscribed) {
        setActiveTutors((prev) => [
          ...prev,
          {
            id: subscribed.id,
            name: subscribed.name,
            slug: subscribed.slug,
            avatarUrl: subscribed.avatarUrl,
            specialty: subscribed.specialty,
            sessionsCompleted: 0,
            lastSessionAt: new Date().toISOString(),
          },
        ]);
        setStoreTutors((prev) => prev.filter((t) => t.id !== tutorId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={160} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && activeTutors.length === 0 && storeTutors.length === 0) {
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
      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Bot size={32} />
          <div>
            <h1 className="text-2xl font-bold">AI Tutors</h1>
            <p className="text-white/80 text-sm">
              Manage active tutors and discover new ones.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Active Tutors ({activeTutors.length})
      </h2>

      {activeTutors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {activeTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-md transition-shadow">
              <CardBody className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center shrink-0 overflow-hidden">
                  {tutor.avatarUrl ? (
                    <img
                      src={tutor.avatarUrl}
                      alt={tutor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Bot className="text-white" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {tutor.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tutor.specialty}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {tutor.sessionsCompleted} sessions
                    </span>
                  </div>
                </div>
                <Link href={`/learner/tutors/${tutor.slug}`}>
                  <Button size="sm" variant="outline">
                    Chat
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-10">
          <CardBody className="text-center py-8">
            <Bot className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="text-gray-500 dark:text-gray-400">
              No active tutors yet. Subscribe to a tutor below to get started.
            </p>
          </CardBody>
        </Card>
      )}

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tutor Store
      </h2>

      {storeTutors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {storeTutors.map((tutor) => (
            <Card key={tutor.id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#38B2AC] to-[#7C3AED] flex items-center justify-center shrink-0 overflow-hidden">
                    {tutor.avatarUrl ? (
                      <img
                        src={tutor.avatarUrl}
                        alt={tutor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="text-white" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {tutor.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {tutor.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500" />
                        {tutor.rating.toFixed(1)}
                      </span>
                      <span>{tutor.subscriberCount} subscribers</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tutor.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  leftIcon={<Plus size={16} />}
                  loading={subscribingId === tutor.id}
                  onClick={() => handleSubscribe(tutor.id)}
                >
                  Subscribe
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No additional tutors available at this time.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
