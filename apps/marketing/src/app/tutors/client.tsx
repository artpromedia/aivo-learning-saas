"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SampleMessage {
  role: "student" | "tutor";
  text: string;
}

interface Tutor {
  name: string;
  emoji: string;
  subject: string;
  accent: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentLight: string;
  persona: string;
  expectations: string[];
  sampleChat: SampleMessage[];
}

const tutors: Tutor[] = [
  {
    name: "Nova",
    emoji: "\u{1FA90}",
    subject: "Math",
    accent: "aivo-purple",
    accentBg: "bg-aivo-purple-50",
    accentText: "text-aivo-purple-600",
    accentBorder: "border-aivo-purple-200",
    accentLight: "bg-aivo-purple-100",
    persona:
      "Nova is a cosmic explorer who sees math as the language of the universe. With a calm, encouraging demeanor and a gift for visual explanations, Nova transforms abstract concepts into tangible adventures. Whether your child is struggling with basic fractions or tackling pre-algebra, Nova meets them exactly where they are and guides them forward at their own pace.",
    expectations: [
      "Visual problem breakdowns with diagrams and animations",
      "Step-by-step equation walkthroughs at your pace",
      "Real-world math applications that make concepts click",
      "Personalized difficulty scaling based on mastery",
    ],
    sampleChat: [
      { role: "student", text: "I don't get fractions" },
      {
        role: "tutor",
        text: "Let's explore fractions like slicing a pizza! \u{1F355} If you have 8 slices and eat 3, you've eaten 3/8 of the pizza. Want to try one together?",
      },
    ],
  },
  {
    name: "Sage",
    emoji: "\u{1F4DA}",
    subject: "ELA",
    accent: "aivo-teal",
    accentBg: "bg-aivo-teal-50",
    accentText: "text-aivo-teal-700",
    accentBorder: "border-aivo-teal-200",
    accentLight: "bg-aivo-teal-100",
    persona:
      "Sage is a wise storyteller who believes every child has a story worth telling. With warmth, patience, and a love for words, Sage helps students discover the joy of reading and the power of writing. From phonics to literary analysis, Sage adapts to each student's reading level and interests, building confidence one page at a time.",
    expectations: [
      "Interactive story discussions that spark curiosity",
      "Vocabulary building embedded naturally in context",
      "Writing workshops with constructive, encouraging feedback",
      "Reading comprehension strategies tailored to your level",
    ],
    sampleChat: [
      { role: "student", text: "I have to write a paragraph but I don't know what to say" },
      {
        role: "tutor",
        text: "Let's brainstorm together! Tell me one thing you did this weekend that was fun. We'll turn that into an awesome paragraph, step by step. \u{270D}\u{FE0F}",
      },
    ],
  },
  {
    name: "Spark",
    emoji: "\u{1F52C}",
    subject: "Science",
    accent: "amber",
    accentBg: "bg-amber-50",
    accentText: "text-amber-600",
    accentBorder: "border-amber-200",
    accentLight: "bg-amber-100",
    persona:
      "Spark is an enthusiastic inventor and experimenter who makes science come alive. With boundless energy and a knack for asking the right questions, Spark turns every lesson into a hands-on discovery. From the water cycle to chemical reactions, Spark encourages students to hypothesize, test, and learn from every result.",
    expectations: [
      "Virtual experiment simulations you can run yourself",
      "Hypothesis-driven learning that builds scientific thinking",
      "Step-by-step scientific method guidance",
      "Real-world science connections to everyday life",
    ],
    sampleChat: [
      { role: "student", text: "Why is the sky blue?" },
      {
        role: "tutor",
        text: "Great question! Let's do a quick experiment in our minds. \u{1F30D} Imagine sunlight as a bundle of rainbow colors. When it hits our atmosphere, blue light scatters the most because of its short wavelength. Want to explore what happens at sunset?",
      },
    ],
  },
  {
    name: "Chrono",
    emoji: "\u{231B}",
    subject: "History",
    accent: "rose",
    accentBg: "bg-rose-50",
    accentText: "text-rose-600",
    accentBorder: "border-rose-200",
    accentLight: "bg-rose-100",
    persona:
      "Chrono is a time-traveling storyteller who brings history to life through immersive narratives. Rather than memorizing dates, students journey alongside historical figures, exploring the causes and consequences of pivotal moments. Chrono helps students see history as a living story that connects to their own world.",
    expectations: [
      "Time-travel narrative adventures through key eras",
      "Primary source analysis with guided interpretation",
      "Interactive timeline building exercises",
      "Historical perspective discussions from multiple viewpoints",
    ],
    sampleChat: [
      { role: "student", text: "History is just memorizing dates, it's boring" },
      {
        role: "tutor",
        text: "I hear you! But what if I told you that history is really about people making wild choices? \u{1F3F0} Imagine you're an advisor to a young queen. A neighboring kingdom just insulted her. What would YOU do? Let's find out what actually happened...",
      },
    ],
  },
  {
    name: "Pixel",
    emoji: "\u{1F4BB}",
    subject: "Coding",
    accent: "emerald",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-600",
    accentBorder: "border-emerald-200",
    accentLight: "bg-emerald-100",
    persona:
      "Pixel is a creative builder who believes coding is a superpower anyone can learn. Starting with visual, block-based concepts and gradually introducing text-based programming, Pixel makes coding feel like building with digital LEGO. Every bug is a puzzle to solve, and every project is a chance to create something amazing.",
    expectations: [
      "Block-based to text coding smooth progression",
      "Pair-programming sessions where you lead",
      "Debug challenges framed as fun puzzles",
      "Project-based learning with real, shareable creations",
    ],
    sampleChat: [
      { role: "student", text: "I want to make a game but I don't know how to code" },
      {
        role: "tutor",
        text: "Perfect starting point! \u{1F3AE} Let's build a simple \"Catch the Star\" game together. First, we'll drag some blocks to make a character move. No typing needed yet! Ready to see your character come alive?",
      },
    ],
  },
  {
    name: "Harmony",
    emoji: "\u{1F33F}",
    subject: "SEL",
    accent: "violet",
    accentBg: "bg-violet-50",
    accentText: "text-violet-600",
    accentBorder: "border-violet-200",
    accentLight: "bg-violet-100",
    persona:
      "Harmony is a warm, calming presence who helps learners navigate their inner world. Using nature metaphors and CASEL-aligned techniques, Harmony guides children through understanding emotions, building empathy, and developing healthy relationships. Whether your child is dealing with frustration, friendship challenges, or self-confidence, Harmony meets them with patience and genuine care.",
    expectations: [
      "Emotion identification and vocabulary building",
      "Mindfulness breathing and grounding exercises",
      "Social scenario role-play for conflict resolution",
      "Self-regulation strategies using Zones of Regulation",
    ],
    sampleChat: [
      { role: "student", text: "I got really mad at my friend today" },
      {
        role: "tutor",
        text: "Thank you for sharing that with me \u{1F33F} It sounds like you felt really angry, and that's completely okay. Anger is like a storm \u2014 it passes. Can you tell me what happened? Together we can figure out what might help.",
      },
    ],
  },
  {
    name: "Echo",
    emoji: "\u{1F3B5}",
    subject: "Speech",
    accent: "orange",
    accentBg: "bg-orange-50",
    accentText: "text-orange-600",
    accentBorder: "border-orange-200",
    accentLight: "bg-orange-100",
    persona:
      "Echo is a playful, musical companion who makes speech and language practice feel like a fun adventure. With endless patience and a knack for turning tricky sounds into games, Echo helps learners build articulation skills, expand vocabulary, and grow their confidence in communication. Every attempt is celebrated, every sound is progress.",
    expectations: [
      "Articulation drills disguised as fun sound games",
      "Phonological awareness through rhyming and rhythm",
      "Language expansion and sentence-building practice",
      "Pragmatic conversation skills through role-play",
    ],
    sampleChat: [
      { role: "student", text: "I can't say my R sounds" },
      {
        role: "tutor",
        text: "You know what? The /r/ sound is one of the trickiest ones \u2014 even for grown-ups! \u{1F3B5} Let's start with a fun warm-up. Say 'rrrrr' like a race car engine. Ready? Rrrrrr! \u{1F3CE}\u{FE0F} How did that feel?",
      },
    ],
  },
];

export function TutorsPageClient() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-aivo-purple-100 px-4 py-1.5 text-sm font-semibold text-aivo-purple-700"
          >
            <Sparkles className="h-4 w-4" />
            7 Specialized AI Tutors
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl lg:text-6xl"
          >
            Meet Your AI Learning Team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-aivo-navy-500 max-w-3xl mx-auto leading-relaxed"
          >
            Each tutor has a unique personality, teaching style, and subject
            expertise. They adapt to every learner, making education personal,
            engaging, and fun.
          </motion.p>
        </div>
      </section>

      {/* Tutor Sections */}
      <div className="mx-auto max-w-7xl px-6 py-20 space-y-32">
        {tutors.map((tutor, idx) => (
          <motion.section
            key={tutor.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="scroll-mt-24"
            id={tutor.name.toLowerCase()}
          >
            {/* Tutor header */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <span className="text-5xl">{tutor.emoji}</span>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-aivo-navy-800 sm:text-4xl">
                    {tutor.name}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-semibold",
                      tutor.accentBg,
                      tutor.accentText
                    )}
                  >
                    {tutor.subject}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              {/* Left column: persona + expectations */}
              <div>
                <p className="text-aivo-navy-600 leading-relaxed">
                  {tutor.persona}
                </p>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-aivo-navy-800">
                    What to Expect
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {tutor.expectations.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            "mt-0.5 h-5 w-5 shrink-0",
                            tutor.accentText
                          )}
                        />
                        <span className="text-sm text-aivo-navy-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/get-started"
                  className={cn(
                    "mt-8 inline-block rounded-lg px-6 py-3 font-semibold text-white shadow-sm transition-colors",
                    tutor.accent === "aivo-purple"
                      ? "bg-aivo-purple-600 hover:bg-aivo-purple-700"
                      : tutor.accent === "aivo-teal"
                        ? "bg-aivo-teal-600 hover:bg-aivo-teal-700"
                        : tutor.accent === "amber"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : tutor.accent === "rose"
                            ? "bg-rose-500 hover:bg-rose-600"
                            : tutor.accent === "violet"
                              ? "bg-violet-500 hover:bg-violet-600"
                              : tutor.accent === "orange"
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-emerald-500 hover:bg-emerald-600"
                  )}
                >
                  Learn with {tutor.name}
                </Link>
              </div>

              {/* Right column: sample chat */}
              <div
                className={cn(
                  "rounded-2xl border p-6",
                  tutor.accentBorder,
                  tutor.accentBg
                )}
              >
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle
                    className={cn("h-5 w-5", tutor.accentText)}
                  />
                  <h3
                    className={cn(
                      "text-sm font-semibold",
                      tutor.accentText
                    )}
                  >
                    Sample Interaction
                  </h3>
                </div>

                <div className="space-y-4">
                  {tutor.sampleChat.map((msg, msgIdx) => (
                    <motion.div
                      key={msgIdx}
                      initial={{ opacity: 0, x: msg.role === "student" ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 * msgIdx }}
                      className={cn(
                        "flex",
                        msg.role === "student"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                          msg.role === "student"
                            ? "rounded-br-md bg-aivo-navy-100 text-aivo-navy-800"
                            : cn(
                                "rounded-bl-md text-aivo-navy-800",
                                tutor.accentLight
                              )
                        )}
                      >
                        {msg.role === "tutor" && (
                          <span className="mb-1 block text-xs font-semibold">
                            {tutor.emoji} {tutor.name}
                          </span>
                        )}
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider between tutors (except last) */}
            {idx < tutors.length - 1 && (
              <div className="mt-20 border-b border-aivo-navy-100" />
            )}
          </motion.section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-aivo-purple-600 to-aivo-purple-800 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to meet your learning team?
            </h2>
            <p className="mt-4 text-lg text-aivo-purple-100">
              Start free and let our AI tutors adapt to your unique learning
              style.
            </p>
            <Link
              href="/get-started"
              className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
