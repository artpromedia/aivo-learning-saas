"use client";

import { useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type Status = "idle" | "loading" | "success" | "error";

export function useNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const subscribe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setStatus("error");
        setErrorMsg("Please enter a valid email address.");
        return;
      }

      setStatus("loading");
      setErrorMsg("");

      try {
        const res = await fetch(`${API_BASE}/comms/newsletter/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Subscription failed. Please try again.");
        }

        setStatus("success");
        setEmail("");
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        );
      }
    },
    [email],
  );

  return { email, setEmail, status, errorMsg, subscribe };
}
