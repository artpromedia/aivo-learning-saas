"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, StopCircle, User, Mic, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { TutorAvatar, type TutorPersona } from "@/components/tutors/tutor-avatar";
import { EmotionCheckIn, type EmotionZone } from "@/components/tutors/emotion-check-in";
import { SpeechPracticeRecorder } from "@/components/tutors/speech-practice-recorder";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useTutorChat, type ChatMessage } from "@/hooks/useTutorChat";
import { getMockTutorResponse } from "@/lib/mock-data";
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

interface TutorSessionResponse {
  session: {
    id: string;
    tutor: {
      name: string;
      slug: string;
      avatarUrl: string;
      specialty: string;
      greeting: string;
    };
  };
}

interface ChatAttachment {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "file";
}

const ACCEPTED_FILE_TYPES = "image/png,image/jpeg,image/gif,image/webp,application/pdf,.doc,.docx,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

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

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (!content) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.15s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.3s" }} />
      </span>
    );
  }

  const lines = content.split("\n");
  const textLines: string[] = [];
  const inlineAttachments: { label: string; type: "image" | "file"; name: string }[] = [];

  for (const line of lines) {
    const imgMatch = line.match(/^\[Image:\s*(.+?)\]$/);
    const fileMatch = line.match(/^\[File:\s*(.+?)\]$/);
    if (imgMatch) {
      inlineAttachments.push({ label: imgMatch[0], type: "image", name: imgMatch[1] });
    } else if (fileMatch) {
      inlineAttachments.push({ label: fileMatch[0], type: "file", name: fileMatch[1] });
    } else {
      textLines.push(line);
    }
  }

  const textContent = textLines.join("\n").trim();

  return (
    <div className="space-y-2">
      {textContent && <p className="whitespace-pre-wrap">{textContent}</p>}
      {inlineAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {inlineAttachments.map((att, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium",
                isUser
                  ? "bg-white/20 text-white/90"
                  : "bg-[var(--aivo-purple-50,#F0E6FF)] text-[var(--aivo-purple-600,#7C3AED)]",
              )}
            >
              {att.type === "image" ? <ImageIcon size={14} /> : <FileText size={14} />}
              <span className="max-w-[120px] truncate">{att.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TutorChatPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("tutor");
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

  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isMockSession = tutor?.sessionId?.startsWith("mock-session") ?? false;
  const realChat = useTutorChat(isMockSession ? undefined : tutor?.sessionId);
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>([]);
  const [mockStreaming, setMockStreaming] = useState(false);

  const messages = isMockSession ? mockMessages : realChat.messages;
  const isStreaming = isMockSession ? mockStreaming : realChat.isStreaming;
  const chatError = isMockSession ? null : realChat.error;

  useEffect(() => {
    return () => {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, []);

  const sendMessage = useCallback(async (content: string, _extraContext?: Record<string, unknown>) => {
    if (isMockSession) {
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }

      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content, timestamp: new Date().toISOString() };
      setMockMessages((prev) => [...prev, userMsg]);
      setMockStreaming(true);

      const response = getMockTutorResponse(tutorSlug);
      const tutorMsgId = `tutor-${Date.now()}`;
      setMockMessages((prev) => [...prev, { id: tutorMsgId, role: "tutor", content: "", timestamp: new Date().toISOString() }]);

      let idx = 0;
      mockIntervalRef.current = setInterval(() => {
        idx++;
        const chunk = response.slice(0, idx * 3);
        setMockMessages((prev) => prev.map((m) => m.id === tutorMsgId ? { ...m, content: chunk } : m));
        if (idx * 3 >= response.length) {
          if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
          mockIntervalRef.current = null;
          setMockStreaming(false);
        }
      }, 30);
    } else {
      await realChat.sendMessage(content, _extraContext);
    }
  }, [isMockSession, tutorSlug, realChat]);

  const stopStreaming = useCallback(() => {
    if (isMockSession) {
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
    } else {
      realChat.stopStreaming();
    }
    setMockStreaming(false);
  }, [isMockSession, realChat]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: ChatAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      if (attachments.length + newAttachments.length >= MAX_ATTACHMENTS) break;
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) continue;
      const isImage = file.type.startsWith("image/");
      newAttachments.push({
        id: `att-${Date.now()}-${i}`,
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : "",
        type: isImage ? "image" : "file",
      });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [attachments.length]);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const attachmentsRef = useRef<ChatAttachment[]>([]);
  attachmentsRef.current = attachments;

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    };
  }, []);

  useEffect(() => {
    async function fetchTutor() {
      if (!activeLearner?.id) {
        setError(t("noLearnerSelected"));
        setLoading(false);
        return;
      }
      try {
        // Start a tutor session via the correct endpoint
        const data = await apiFetch<TutorSessionResponse>(
          API_ROUTES.TUTOR.SESSION_START,
          {
            method: "POST",
            body: JSON.stringify({
              learnerId: activeLearner.id,
              subject: tutorSlug,
              sessionType: "LESSON",
              locale: activeLearner.languagePreference ?? "en",
            }),
          },
        );
        const sess = data.session;
        setTutor({
          id: sess.id,
          name: sess.tutor?.name ?? tutorSlug,
          slug: sess.tutor?.slug ?? tutorSlug,
          avatarUrl: sess.tutor?.avatarUrl ?? "",
          specialty: sess.tutor?.specialty ?? "",
          greeting: sess.tutor?.greeting ?? "",
          sessionId: sess.id,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("failedToLoadTutor"),
        );
      } finally {
        setLoading(false);
      }
    }
    fetchTutor();
  }, [tutorSlug, activeLearner, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    const hasAttachments = attachments.length > 0;
    if ((!text && !hasAttachments) || isStreaming) return;

    const currentAttachments = [...attachments];
    setInputValue("");
    setAttachments([]);
    currentAttachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });

    const attachmentLabels = currentAttachments.map((a) =>
      a.type === "image" ? `[Image: ${a.file.name}]` : `[File: ${a.file.name}]`
    );
    const fullContent = [text, ...attachmentLabels].filter(Boolean).join("\n");

    const isFirstMessage = messages.length === 0;
    const extraContext: Record<string, unknown> = {};
    if (isFirstMessage && isHarmony && emotionZone) {
      extraContext.emotion_check_in = emotionZone;
    }
    if (currentAttachments.length > 0) {
      extraContext.attachments = currentAttachments.map((a) => ({
        name: a.file.name,
        type: a.type,
        size: a.file.size,
        mimeType: a.file.type,
        previewUrl: a.previewUrl,
      }));
    }

    try {
      await sendMessage(fullContent, Object.keys(extraContext).length > 0 ? extraContext : undefined);
    } catch {
      // Error handled in hook
    }
    inputRef.current?.focus();
  }, [inputValue, isStreaming, messages.length, isHarmony, emotionZone, sendMessage, attachments]);

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
    const msgs = messagesRef.current;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];
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
        <div className="flex items-center gap-3 pb-4 border-b border-[#E8DDF0] dark:border-[#3D2D5C]">
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
          {t("backToTutors")}
        </Button>
      </div>
    );
  }

  // Harmony: show emotion check-in before chat
  if (isHarmony && emotionZone === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmotionCheckIn
          learnerName={activeLearner?.name}
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

  // Keep messagesRef in sync so callbacks always see latest messages
  messagesRef.current = allMessages;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E8DDF0] dark:border-[#3D2D5C] mb-4">
        <Link
          href="/learner/tutors"
          className="p-1 rounded-2xl text-[var(--aivo-text-muted)] hover:text-[var(--aivo-text-secondary)] hover:bg-[#FFF5EB] dark:hover:bg-[#2A1E45] transition-colors"
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shrink-0" />
        )}
        <div>
          <h2 className="font-semibold text-[var(--aivo-text)]">
            {tutor?.name}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {tutor?.specialty}
          </Badge>
        </div>
        {isStreaming && (
          <span className="ml-auto text-xs text-[#7C3AED] animate-pulse font-medium">
            {t("typing")}
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7]" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-[#7C3AED] text-white rounded-br-sm"
                    : "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text)] rounded-bl-sm",
                )}
              >
                <MessageContent content={msg.content} isUser={msg.role === "user"} />
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Error */}
      {chatError && (
        <div className="mb-2 p-2 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 text-red-600 dark:text-red-400 text-sm text-center">
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
      <div className="pt-4 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group rounded-xl overflow-hidden border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45]"
              >
                {att.type === "image" ? (
                  <div className="w-20 h-20 relative">
                    <Image
                      src={att.previewUrl}
                      alt={att.file.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex flex-col items-center justify-center gap-1 px-1">
                    <FileText size={24} className="text-[#7C3AED]" />
                    <span className="text-[10px] text-[var(--aivo-text-muted)] truncate max-w-full text-center leading-tight">
                      {att.file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  aria-label="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || attachments.length >= MAX_ATTACHMENTS}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors text-[var(--aivo-text-muted)] hover:text-[#7C3AED] hover:bg-[var(--aivo-purple-50,#F0E6FF)] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--aivo-text-muted)]"
            aria-label="Attach file or image"
          >
            <Paperclip size={20} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("typeMessage")}
            disabled={isStreaming}
            className="flex-1 px-4 py-3 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none disabled:opacity-50"
          />

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
              disabled={!inputValue.trim() && attachments.length === 0}
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
