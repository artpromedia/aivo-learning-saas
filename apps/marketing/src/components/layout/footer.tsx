"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { submitLead } from "@/lib/leads-api";
import { LocaleSwitcher } from "./locale-switcher";

// ─── Footer Link Data ───────────────────────────────────────────────────────────

const columns = {
  Product: [
    { label: "Brain Clone AI", href: "/product/brain-clone" },
    { label: "AI Tutors", href: "/product/ai-tutors" },
    { label: "Gamification", href: "/product/gamification" },
    { label: "IEP Integration", href: "/product/iep-integration" },
    { label: "Pricing", href: "/pricing" },
  ],
  Solutions: [
    { label: "For Teachers", href: "/solutions/teachers" },
    { label: "For Parents", href: "/solutions/parents" },
    { label: "For Districts", href: "/solutions/districts" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "FAQ", href: "/faq" },
    { label: "Help Center", href: "/help" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Press", href: "/press" },
  ],
} as const;

// ─── Social Icons ───────────────────────────────────────────────────────────────

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ─── Newsletter Form ────────────────────────────────────────────────────────────

type NewsletterStatus = "idle" | "loading" | "success" | "error";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(
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
        await submitLead({
          contactName: "",
          contactEmail: trimmed,
          source: "footer-newsletter",
        });
        setStatus("success");
        setEmail("");
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      }
    },
    [email],
  );

  return (
    <form
      className="w-full max-w-md shrink-0"
      onSubmit={handleSubmit}
      aria-label="Newsletter signup"
      noValidate
    >
      <label
        htmlFor="footer-email"
        className="text-sm font-medium text-navy-200"
      >
        Stay updated with AIVO
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="footer-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          className="min-w-0 flex-1 rounded-lg border border-navy-600 bg-navy-700 px-3 py-2 text-sm text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="whitespace-nowrap rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-green-400"
            role="status"
          >
            Thanks for subscribing!
          </motion.p>
        )}
        {status === "error" && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-red-400"
            role="alert"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

// ─── Footer Component ───────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top section: Brand + Newsletter */}
        <div className="mb-12 flex flex-col gap-8 border-b border-navy-700 pb-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <img
                src="/logos/aivo-logo-horizontal-white.svg"
                alt="AIVO Learning"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-3 text-base text-navy-300">
              AI-powered personalized learning that adapts to every student. No
              learner left behind.
            </p>
          </div>

          <NewsletterForm />
        </div>

        {/* 4-column link grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {(
            Object.entries(columns) as [keyof typeof columns, (typeof columns)[keyof typeof columns]][]
          ).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-sm font-semibold text-white">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-navy-700 pt-8 sm:flex-row">
          <p className="text-sm text-navy-400">
            &copy; {new Date().getFullYear()} AIVO Learning. All rights
            reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-navy-400 transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-navy-400 transition-colors hover:text-white"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-navy-400 transition-colors hover:text-white"
            >
              Cookies
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LocaleSwitcher variant="light" />

            <a
              href="https://twitter.com/aivolearning"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-400 transition-colors hover:text-white"
              aria-label="AIVO on Twitter"
            >
              <TwitterIcon className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/company/aivolearning"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-400 transition-colors hover:text-white"
              aria-label="AIVO on LinkedIn"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <a
              href="https://youtube.com/@aivolearning"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-400 transition-colors hover:text-white"
              aria-label="AIVO on YouTube"
            >
              <YouTubeIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
