"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, BookOpen, Brain, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: Brain,
    title: "Adaptive AI Learning",
    description: "Lessons that adjust in real-time to your child's pace and style.",
  },
  {
    icon: BookOpen,
    title: "Full Curriculum Coverage",
    description: "Aligned to national standards across all core subjects.",
  },
  {
    icon: Sparkles,
    title: "Engaging Quest-Based Learning",
    description: "Adventure-driven lessons that keep learners motivated.",
  },
  {
    icon: Shield,
    title: "COPPA & FERPA Compliant",
    description: "Built with student privacy and safety as a top priority.",
  },
];

type AccountType = "parent" | "teacher" | "district";

export function GetStartedClient() {
  const [accountType, setAccountType] = useState<AccountType>("parent");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // In production this would call the identity-svc API
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-aivo-purple-50 to-white">
      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-aivo-navy-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Start Your Child&apos;s{" "}
            <span className="text-aivo-purple-600">Learning Journey</span>
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Create your free account in seconds. No credit card required.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-aivo-navy-800">
              Why families love AIVO
            </h2>
            <div className="space-y-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-aivo-purple-100 flex items-center justify-center">
                    <b.icon className="w-5 h-5 text-aivo-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-aivo-navy-800">
                      {b.title}
                    </h3>
                    <p className="text-sm text-aivo-navy-500 mt-0.5">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-aivo-purple-50 border border-aivo-purple-100 p-6">
              <p className="text-aivo-navy-700 italic">
                &ldquo;AIVO transformed homework from a battle into something my
                daughter actually looks forward to. The AI knows exactly where
                she needs help.&rdquo;
              </p>
              <p className="mt-3 text-sm font-medium text-aivo-navy-500">
                — Sarah M., Parent of a 3rd grader
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-aivo-navy-100 p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-aivo-navy-800">
                  Welcome to AIVO!
                </h3>
                <p className="mt-2 text-aivo-navy-500">
                  Check your email to verify your account and get started.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-block text-aivo-purple-600 font-medium hover:underline"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-aivo-navy-800 mb-6">
                  Create your free account
                </h2>

                {/* Account type selector */}
                <div className="flex gap-2 mb-6">
                  {(
                    [
                      { key: "parent", label: "Parent" },
                      { key: "teacher", label: "Teacher" },
                      { key: "district", label: "District" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAccountType(key)}
                      className={cn(
                        "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                        accountType === key
                          ? "bg-aivo-purple-600 text-white"
                          : "bg-aivo-navy-50 text-aivo-navy-500 hover:bg-aivo-navy-100",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-aivo-navy-700"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-aivo-navy-700"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-aivo-navy-700"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors mt-2"
                  >
                    Create Free Account
                  </button>

                  <p className="text-xs text-center text-aivo-navy-400 mt-4">
                    By creating an account, you agree to our{" "}
                    <Link
                      href="/legal/terms"
                      className="underline hover:text-aivo-purple-600"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/legal/privacy"
                      className="underline hover:text-aivo-purple-600"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>

                <div className="mt-6 text-center text-sm text-aivo-navy-500">
                  Already have an account?{" "}
                  <Link
                    href="/"
                    className="font-medium text-aivo-purple-600 hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
