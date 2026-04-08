"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useTutorChat } from "@/hooks/useTutorChat";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";
import { cn } from "@/lib/utils";

interface SessionStartResponse {
  id: string;
  [key: string]: unknown;
}

/**
 * Floating Aivo Chat widget for the learner dashboard.
 * Renders as a floating action button (FAB) in the bottom-right corner.
 * When clicked, opens a compact chat panel that uses the existing
 * `useTutorChat` SSE hook to communicate with the AI tutor.
 */
export function AivoChatWidget() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, error, sendMessage } =
    useTutorChat(sessionId);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = useCallback(async () => {
    if (!activeLearner?.id || sessionId || isStarting) return;
    setIsStarting(true);
    setSessionError(false);
    try {
      const res = await apiFetch<SessionStartResponse>(
        API_ROUTES.TUTOR.SESSION_START,
        {
          method: "POST",
          body: JSON.stringify({
            learnerId: activeLearner.id,
            subject: "general",
            sessionType: "LESSON",
            locale: "en",
          }),
        },
      );
      setSessionId(res.id);
    } catch {
      setSessionError(true);
    } finally {
      setIsStarting(false);
    }
  }, [activeLearner?.id, sessionId, isStarting]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!sessionId && !sessionError) {
      startSession();
    }
  }, [sessionId, sessionError, startSession]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    try {
      await sendMessage(trimmed);
    } catch {
      // Error is captured in useTutorChat state
    }
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  if (!activeLearner) return null;

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-20 right-4 z-50 w-80 sm:w-96 max-h-[28rem] rounded-2xl",
            "bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700",
            "flex flex-col overflow-hidden",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold text-sm">
                {t("aivoChatTitle")}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 max-h-72">
            {messages.length === 0 && !isStarting && !sessionError && (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">
                {t("aivoChatWelcome")}
              </p>
            )}
            {isStarting && (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-[#7C3AED]" size={24} />
              </div>
            )}
            {sessionError && (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-red-500">Could not start chat session.</p>
                <Button size="sm" variant="outline" onClick={startSession}>
                  Retry
                </Button>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-[#7C3AED] text-white"
                    : "mr-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                )}
              >
                {msg.content || (
                  <Loader2 className="animate-spin" size={14} />
                )}
              </div>
            ))}
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("aivoChatPlaceholder")}
              disabled={isStreaming || !sessionId}
              className={cn(
                "flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400",
                "text-gray-900 dark:text-gray-100",
              )}
            />
            <Button
              size="sm"
              variant="primary"
              disabled={isStreaming || !input.trim() || !sessionId}
              onClick={handleSend}
              aria-label="Send"
              className="!p-1.5 !rounded-full"
            >
              {isStreaming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          "fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] text-white",
          "shadow-lg hover:shadow-xl transition-all",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:ring-offset-2",
        )}
        aria-label={isOpen ? "Close Aivo Chat" : "Chat with Aivo"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
