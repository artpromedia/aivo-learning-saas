"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bot, Send, Loader2, StopCircle, User } from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { useTutorChat, type ChatMessage } from "@/hooks/useTutorChat";
import { useLearnerStore } from "@/stores/learner.store";

interface TutorInfo {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  specialty: string;
  greeting: string;
  sessionId: string;
}

export default function TutorChatPage() {
  const params = useParams();
  const router = useRouter();
  const tutorSlug = params.tutorSlug as string;
  const activeLearner = useLearnerStore((s) => s.activeLearner);

  const [tutor, setTutor] = useState<TutorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isStreaming, error: chatError, sendMessage, stopStreaming } =
    useTutorChat(tutor?.sessionId);

  useEffect(() => {
    async function fetchTutor() {
      try {
        const data = await apiFetch<TutorInfo>(
          `/api/tutors/${tutorSlug}/session`,
          { method: "POST" },
        );
        setTutor(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load tutor",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTutor();
  }, [tutorSlug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue("");
    try {
      await sendMessage(text);
    } catch {
      // Error handled in hook
    }
    inputRef.current?.focus();
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
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Skeleton width={40} height={40} rounded="full" />
          <div>
            <Skeleton height={18} width={120} className="mb-1" />
            <Skeleton height={14} width={80} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="text-[#7C3AED] animate-spin" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Bot className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/learner/tutors")}>
          Back to Tutors
        </Button>
      </div>
    );
  }

  const allMessages: ChatMessage[] = tutor?.greeting
    ? [
        {
          id: "greeting",
          role: "tutor" as const,
          content: tutor.greeting,
          timestamp: new Date().toISOString(),
        },
        ...messages,
      ]
    : messages;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <Link
          href="/learner/tutors"
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center shrink-0 overflow-hidden">
          {tutor?.avatarUrl ? (
            <img
              src={tutor.avatarUrl}
              alt={tutor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Bot className="text-white" size={20} />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {tutor?.name}
          </h2>
          <p className="text-xs text-gray-500">{tutor?.specialty}</p>
        </div>
        {isStreaming && (
          <span className="ml-auto text-xs text-[#7C3AED] animate-pulse font-medium">
            Typing...
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {allMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start gap-2 max-w-[80%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-[#7C3AED]"
                    : "bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF]"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="text-white" size={14} />
                ) : (
                  <Bot className="text-white" size={14} />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#7C3AED] text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm"
                }`}
              >
                {msg.content || (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Error */}
      {chatError && (
        <div className="mb-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
          {chatError}
        </div>
      )}

      {/* Input */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none disabled:opacity-50"
          />
          {isStreaming ? (
            <Button
              variant="outline"
              onClick={stopStreaming}
              className="shrink-0"
            >
              <StopCircle size={20} />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="shrink-0"
            >
              <Send size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
