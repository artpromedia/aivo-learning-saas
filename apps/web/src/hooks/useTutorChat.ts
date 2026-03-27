import { useState, useCallback, useRef } from "react";
import { API_ROUTES } from "@/lib/api-routes";
import { useAuthStore } from "@/stores/auth.store";

export interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  content: string;
  timestamp: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useTutorChat(sessionId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const token = useAuthStore((s) => s.token);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) throw new Error("No session ID");

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setError(null);

      // Prepare tutor placeholder for streaming
      const tutorId = `tutor-${Date.now()}`;
      const tutorMessage: ChatMessage = {
        id: tutorId,
        role: "tutor",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tutorMessage]);

      abortRef.current = new AbortController();

      try {
        const url = `${API_BASE}${API_ROUTES.TUTOR.CHAT_SSE(sessionId)}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ message: content }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6);
              if (payload === "[DONE]") break;

              try {
                const parsed = JSON.parse(payload);
                if (parsed.token) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === tutorId
                        ? { ...m, content: m.content + parsed.token }
                        : m,
                    ),
                  );
                }
              } catch {
                // Skip non-JSON SSE lines
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const message = err instanceof Error ? err.message : "Chat failed";
          setError(message);
          // Remove the empty tutor message on error
          setMessages((prev) => prev.filter((m) => m.id !== tutorId || m.content));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionId, token],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
