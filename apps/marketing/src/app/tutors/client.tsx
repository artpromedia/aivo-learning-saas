"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TutorAvatar } from "@/components/tutors/tutor-avatar";
import type { TutorPersona } from "@/components/tutors/tutor-avatar-data";

interface SampleMessage {
  role: "student" | "tutor";
  text: string;
}

interface Tutor {
  name: string;
  avatarPersona: TutorPersona;
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

const CTA_COLORS: Record<string, string> = {
  "aivo-purple": "bg-aivo-purple-600 hover:bg-aivo-purple-700",
  "aivo-teal": "bg-aivo-teal-600 hover:bg-aivo-teal-700",
  amber: "bg-amber-500 hover:bg-amber-600",
  rose: "bg-rose-500 hover:bg-rose-600",
  emerald: "bg-emerald-500 hover:bg-emerald-600",
  violet: "bg-violet-500 hover:bg-violet-600",
  pink: "bg-pink-500 hover:bg-pink-600",
};

const tutors: Tutor[] = [
  {
    name: "Nova",
    avatarPersona: "nova",
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
    avatarPersona: "sage",
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
      {
        role: "student",
        text: "I have to write a paragraph but I don't know what to say",
      },
      {
        role: "tutor",
        text: "Let's brainstorm together! Tell me one thing you did this weekend that was fun. We'll turn that into an awesome paragraph, step by step. \u{270D}\u{FE0F}",
      },
    ],
  },
  {
    name: "Spark",
    avatarPersona: "spark",
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
    avatarPersona: "chrono",
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
      {
        role: "student",
        text: "History is just memorizing dates, it's boring",
      },
      {
        role: "tutor",
        text: "I hear you! But what if I told you that history is really about people making wild choices? \u{1F3F0} Imagine you're an advisor to a young queen. A neighboring kingdom just insulted her. What would YOU do? Let's find out what actually happened...",
      },
    ],
  },
  {
    name: "Pixel",
    avatarPersona: "pixel",
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
      {
        role: "student",
        text: "I want to make a game but I don't know how to code",
      },
      {
        role: "tutor",
        text: 'Perfect starting point! \u{1F3AE} Let\'s build a simple "Catch the Star" game together. First, we\'ll drag some blocks to make a character move. No typing needed yet! Ready to see your character come alive?',
      },
    ],
  },
  {
    name: "Harmony",
    avatarPersona: "harmony",
    subject: "SEL",
    accent: "violet",
    accentBg: "bg-violet-50",
    accentText: "text-violet-600",
    accentBorder: "border-violet-200",
    accentLight: "bg-violet-100",
    persona:
      "Harmony is a calm, grounding presence who believes every emotion is a seed worth tending. With warmth, patience, and a gift for making children feel safe, Harmony guides learners through social-emotional skill building using the CASEL framework. From mindfulness breathing exercises to conflict resolution role-plays, Harmony helps children develop the emotional foundation that powers success in every subject \u2014 and in life. Harmony is a coach, not a therapist, and knows exactly when to connect families with professional support.",
    expectations: [
      "CASEL-aligned social-emotional skill building across all 5 competencies",
      "Mindfulness micro-exercises and emotion regulation techniques",
      "Strengths-based reframing that builds lasting self-confidence",
      "Safe, boundaried support with crisis resource awareness",
    ],
    sampleChat: [
      {
        role: "student",
        text: "I got really mad at my friend today and I don't know why",
      },
      {
        role: "tutor",
        text: "Thank you for sharing that with me. Anger is like a signal flare \u2014 it\u2019s telling us something important underneath. Let\u2019s explore: what happened right before the angry feeling showed up? Sometimes there\u2019s a hidden feeling underneath, like hurt or frustration. There\u2019s no wrong answer here.",
      },
    ],
  },
  {
    name: "Echo",
    avatarPersona: "echo",
    subject: "Speech",
    accent: "pink",
    accentBg: "bg-pink-50",
    accentText: "text-pink-600",
    accentBorder: "border-pink-200",
    accentLight: "bg-pink-100",
    persona:
      "Echo is a musical, joyful practice companion who makes speech and language exercises feel like an adventure. Through Sound Safari games, tongue twisters, and rhythm-based activities, Echo reinforces the skills your child\u2019s Speech-Language Pathologist is building \u2014 with endless patience and genuine celebration for every single attempt. Echo is not a therapist or diagnostic tool, but the most enthusiastic, tireless practice buddy your child will ever have.",
    expectations: [
      "Gamified articulation practice through Sound Safari adventures",
      "Fluency-friendly pacing with stuttering-supportive techniques",
      "Sentence building and story retelling for expressive language growth",
      "Reinforcement of SLP-assigned exercises with fun, motivating repetition",
    ],
    sampleChat: [
      { role: "student", text: "I can't say the R sound" },
      {
        role: "tutor",
        text: "You know what? The R sound is one of the trickiest sounds out there \u2014 even some adults find it hard! Let\u2019s go on a Sound Safari for R. First, listen to me: rrrrred... rrrrrain... rrrrrobot. Did you hear how my tongue curled back a little? Now your turn \u2014 just try! Every single attempt is making your mouth stronger.",
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
            Each tutor is a unique personality with real teaching methods and
            subject expertise. They adapt to every learner &mdash; including
            those with IEPs and varying needs &mdash; making education personal,
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
            id={tutor.avatarPersona}
          >
            {/* Tutor header */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <TutorAvatar
                persona={tutor.avatarPersona}
                size="md"
                enableEffects={false}
                className="shrink-0"
              />
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-aivo-navy-800 sm:text-4xl">
                    {tutor.name}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-semibold",
                      tutor.accentBg,
                      tutor.accentText,
                    )}
                  >
                    {tutor.subject}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile hero image */}
            <div className="mt-6 flex justify-center lg:hidden">
              <TutorAvatar
                persona={tutor.avatarPersona}
                size="xl"
                enableEffects
                priority={idx === 0}
              />
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
                            tutor.accentText,
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
                    CTA_COLORS[tutor.accent],
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
                  tutor.accentBg,
                )}
              >
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle
                    className={cn("h-5 w-5", tutor.accentText)}
                  />
                  <h3
                    className={cn("text-sm font-semibold", tutor.accentText)}
                  >
                    Sample Interaction
                  </h3>
                </div>

                <div className="space-y-4">
                  {tutor.sampleChat.map((msg, msgIdx) => (
                    <motion.div
                      key={msgIdx}
                      initial={{
                        opacity: 0,
                        x: msg.role === "student" ? 20 : -20,
                      }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 * msgIdx }}
                      className={cn(
                        "flex",
                        msg.role === "student"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                          msg.role === "student"
                            ? "rounded-br-md bg-aivo-navy-100 text-aivo-navy-800"
                            : cn(
                                "rounded-bl-md text-aivo-navy-800",
                                tutor.accentLight,
                              ),
                        )}
                      >
                        {msg.role === "tutor" && (
                          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold">
                            <Image
                              src={`/assets/tutors/optimized/${tutor.avatarPersona}-avatar.webp`}
                              alt={tutor.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            {tutor.name}
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
              Start free and let our seven AI tutors adapt to your child&apos;s
              unique learning style.
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
