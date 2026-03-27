"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Animated checkmark                                                  */
/* ------------------------------------------------------------------ */

function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-aivo-teal-50"
    >
      <motion.div
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Check className="h-10 w-10 text-aivo-teal-600" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Social placeholder icons                                            */
/* ------------------------------------------------------------------ */

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
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function ContactPageClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      return;
    }

    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto"
          >
            Have a question, suggestion, or just want to say hello? We&apos;d
            love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: Form / Success */}
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-aivo-navy-700"
                      >
                        Name <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-required={true}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-aivo-navy-700"
                      >
                        Email <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-required={true}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-aivo-navy-700"
                      >
                        Subject <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        aria-required={true}
                        className={cn(
                          "mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors",
                          subject === "" && "text-aivo-navy-300"
                        )}
                      >
                        <option value="" disabled>
                          Select a subject...
                        </option>
                        <option value="General">General</option>
                        <option value="Support">Support</option>
                        <option value="Sales">Sales</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Press">Press</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-aivo-navy-700"
                      >
                        Message <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-required={true}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors resize-y"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500 focus:ring-offset-2"
                    >
                      Send Message
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-aivo-navy-100 bg-white p-12 shadow-sm text-center"
                >
                  <AnimatedCheckmark />
                  <h2 className="mt-6 text-2xl font-bold text-aivo-navy-800">
                    Message sent!
                  </h2>
                  <p className="mt-3 text-lg text-aivo-navy-500 max-w-md">
                    Thank you for reaching out. We&apos;ll get back to you
                    within 24 hours.
                  </p>
                  <Link
                    href="/"
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
                  >
                    Back to Home
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right: Contact info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-2xl font-bold text-aivo-navy-800">
                Contact Information
              </h2>
              <p className="mt-2 text-aivo-navy-500 leading-relaxed">
                Reach out through the form or contact us directly using the
                information below.
              </p>

              <ul className="mt-8 space-y-6">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aivo-purple-50">
                    <MapPin className="h-5 w-5 text-aivo-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-aivo-navy-700">Office</p>
                    <p className="mt-0.5 text-aivo-navy-500">
                      123 Education Lane
                      <br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aivo-purple-50">
                    <Mail className="h-5 w-5 text-aivo-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-aivo-navy-700">Email</p>
                    <a
                      href="mailto:support@aivolearning.com"
                      className="mt-0.5 text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                    >
                      support@aivolearning.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aivo-purple-50">
                    <Phone className="h-5 w-5 text-aivo-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-aivo-navy-700">Phone</p>
                    <a
                      href="tel:+15551234567"
                      className="mt-0.5 text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                    >
                      (555) 123-4567
                    </a>
                  </div>
                </li>
              </ul>

              {/* Social links */}
              <div className="mt-10">
                <p className="text-sm font-medium text-aivo-navy-700">
                  Follow us
                </p>
                <div className="mt-3 flex gap-4">
                  <a
                    href="#"
                    aria-label="Follow us on Twitter"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-aivo-navy-50 text-aivo-navy-500 transition-colors hover:bg-aivo-purple-50 hover:text-aivo-purple-600"
                  >
                    <TwitterIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    aria-label="Follow us on LinkedIn"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-aivo-navy-50 text-aivo-navy-500 transition-colors hover:bg-aivo-purple-50 hover:text-aivo-purple-600"
                  >
                    <LinkedInIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    aria-label="Follow us on GitHub"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-aivo-navy-50 text-aivo-navy-500 transition-colors hover:bg-aivo-purple-50 hover:text-aivo-purple-600"
                  >
                    <GitHubIcon className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
