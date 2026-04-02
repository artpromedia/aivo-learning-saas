"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, StopCircle, User, Mic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { TutorAvatar, type TutorPersona } from "@/components/tutors/tutor-avatar";
import { EmotionCheckIn, type EmotionZone } from "@/components/tutors/emotion-check-in";
import { SpeechPracticeRecorder } from "@/components/tutors/speech-practice-recorder";
import { apiFetch } from "@/lib/api";
import { useTutorChat, type ChatMessage } from "@/hooks/useTutorChat";
import { useLearnerStore } from "@/stores/learner.store";
import { cn } from "@/lib/utils";

interface TutorInfo {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  specialty: string;
  greeting: string;
  sessionId: string;
}

const KNOWN_PERSONAS = new Set<string>([
  "nova", "sage", "spark", "chrono", "pixel", "harmony", "echo",
]);

function isKnownPersona(slug: string): slug is TutorPersona {
  return KNOWN_PERSONAS.has(slug);
}

/** Heuristic: extract practice target from Echo's message. */
function parseTargetSound(content: string): string | null {
  const tryMatch = content.match(/try saying[:\s]*["']?([^"'\n.!]+)/i);
  if (tryMatch) return tryMatch[1].trim();
  const soundMatch = content.match(/the (\/.+?\/)\s*sound/i);
  if (soundMatch) return soundMatch[1];
  return null;
}

/** Check if Echo's message contains a practice prompt. */
function isPracticePrompt(content: string): boolean {
  return /try saying|your turn|let's practice/i.test(content);
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

  // Harmony: emotion check-in state
  const [emotionZone, setEmotionZone] = useState<EmotionZone | null>(null);
  const isHarmony = tutor?.slug === "harmony" || tutor?.specialty === "SEL";

  // Echo: recorder state
  const [showRecorder, setShowRecorder] = useState(false);
  const isEcho = tutor?.slug === "echo" || tutor?.specialty === "Speech";

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

  // Inject emotion zone into first message for Harmony
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue("");

    const isFirstMessage = messages.length === 0;
    const extraContext =
      isFirstMessage && isHarmony && emotionZone
        ? { emotion_check_in: emotionZone }
        : undefined;

    try {
      await sendMessage(text, extraContext);
    } catch {
      // Error handled in hook
    }
    inputRef.current?.focus();
  }, [inputValue, isStreaming, messages.length, isHarmony, emotionZone, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRecordingComplete = useCallback(
    (audioBlob: Blob, durationMs: number) => {
      const lastTarget = getLastTargetSound();
      const label = lastTarget ?? "target sound";
      const durSec = (durationMs / 1000).toFixed(1);
      sendMessage(
        `[Practiced: ${label} \u2014 ${durSec}s recording]`,
        { audio_practice: { targetSound: label, durationMs } },
      );
      setShowRecorder(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendMessage],
  );

  function getLastTargetSound(): string | null {
    for (let i = allMessages.length - 1; i >= 0; i--) {
      const msg = allMessages[i];
      if (msg.role === "tutor") {
        const target = parseTargetSound(msg.content);
        if (target) return target;
      }
    }
    return null;
  }

  // Determine if Echo's last message is a practice prompt
  const lastTutorMsg = [...(messages.length ? messages : [])].reverse().find(
    (m) => m.role === "tutor",
  );
  const showMicPulse = isEcho && lastTutorMsg && isPracticePrompt(lastTutorMsg.content);

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
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/learner/tutors")}
        >
          Back to Tutors
        </Button>
      </div>
    );
  }

  // Harmony: show emotion check-in before chat
  if (isHarmony && emotionZone === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmotionCheckIn
          learnerName={activeLearner?.firstName}
          onComplete={setEmotionZone}
        />
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
        {isKnownPersona(tutor!.slug) ? (
          <TutorAvatar
            persona={tutor!.slug}
            size="sm"
            showOnlineIndicator
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center shrink-0" />
        )}
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {tutor?.name}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {tutor?.specialty}
          </Badge>
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
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "flex items-start gap-2 max-w-[80%]",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              {/* Avatar */}
              <div className="shrink-0">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center">
                    <User className="text-white" size={14} />
                  </div>
                ) : isKnownPersona(tutor!.slug) ? (
                  <TutorAvatar persona={tutor!.slug} size="sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF]" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-[#7C3AED] text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm",
                )}
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

      {/* Echo Recorder Panel */}
      {isEcho && showRecorder && (
        <div className="mb-3">
          <SpeechPracticeRecorder
            targetSound={getLastTargetSound() ?? "the target sound"}
            onRecordingComplete={handleRecordingComplete}
          />
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

          {/* Echo: mic button */}
          {isEcho && (
            <button
              onClick={() => setShowRecorder((v) => !v)}
              aria-label="Open speech practice recorder"
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2",
                showMicPulse
                  ? "bg-pink-200 text-pink-600 animate-pulse"
                  : "bg-pink-100 text-pink-600 hover:bg-pink-200",
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

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
