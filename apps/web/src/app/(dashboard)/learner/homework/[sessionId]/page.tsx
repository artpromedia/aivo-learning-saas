"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";

interface HomeworkMessage {
  id: string;
  role: "student" | "tutor";
  content: string;
  timestamp: string;
}

interface HomeworkSessionDetail {
  id: string;
  title: string;
  subject: string;
  status: "active" | "completed";
  messages: HomeworkMessage[];
  imageUrl?: string;
}

export default function HomeworkSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const activeLearner = useLearnerStore((s) => s.activeLearner);

  const [session, setSession] = useState<HomeworkSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const data = await apiFetch<HomeworkSessionDetail>(
          `/api/homework/${sessionId}`,
        );
        setSession(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || sending || !session) return;

    const userMsg: HomeworkMessage = {
      id: `user-${Date.now()}`,
      role: "student",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setSession((prev) =>
      prev ? { ...prev, messages: [...prev.messages, userMsg] } : null,
    );
    setInputValue("");
    setSending(true);

    try {
      const response = await apiFetch<{ message: HomeworkMessage }>(
        `/api/homework/${sessionId}/message`,
        {
          method: "POST",
          body: JSON.stringify({ content: text }),
        },
      );
      setSession((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, response.message] }
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await apiFetch(`/api/homework/${sessionId}/complete`, {
        method: "POST",
      });
      setSession((prev) => (prev ? { ...prev, status: "completed" } : null));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete session",
      );
    } finally {
      setCompleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <Skeleton height={48} className="w-full rounded-lg mb-4" />
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={60} className="w-3/4 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/learner/homework")}
        >
          Back to Homework
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/learner/homework"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {session?.title}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{session?.subject}</Badge>
              <Badge
                variant={
                  session?.status === "completed" ? "success" : "warning"
                }
              >
                {session?.status === "completed" ? "Completed" : "Active"}
              </Badge>
            </div>
          </div>
        </div>
        {session?.status === "active" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleComplete}
            loading={completing}
            leftIcon={<CheckCircle size={16} />}
          >
            Mark Done
          </Button>
        )}
      </div>

      {/* Uploaded Image */}
      {session?.imageUrl && (
        <Card className="mb-4">
          <CardBody className="p-2">
            <img
              src={session.imageUrl}
              alt="Homework"
              className="w-full max-h-48 object-contain rounded-lg"
            />
          </CardBody>
        </Card>
      )}

      {error && (
        <div className="mb-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {session?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "student" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start gap-2 max-w-[80%] ${
                msg.role === "student" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "student"
                    ? "bg-[#7C3AED]"
                    : "bg-gradient-to-br from-[#7C3AED] to-[#38B2AC]"
                }`}
              >
                {msg.role === "student" ? (
                  <User className="text-white" size={14} />
                ) : (
                  <Bot className="text-white" size={14} />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "student"
                    ? "bg-[#7C3AED] text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#38B2AC] flex items-center justify-center">
                <Bot className="text-white" size={14} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-800">
                <Loader2 className="animate-spin text-[#7C3AED]" size={16} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {session?.status === "active" && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for help..."
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none disabled:opacity-50"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
              className="shrink-0"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
