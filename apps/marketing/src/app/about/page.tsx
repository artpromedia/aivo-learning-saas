import type { Metadata } from "next";
import Link from "next/link";
import {
  Lightbulb,
  Heart,
  Shield,
  Zap,
  Users,
  Brain,
  Sparkles,
  BarChart3,
  Gamepad2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | AIVO",
  description:
    "Learn about AIVO Learning's mission to ensure no learner is left behind. AI-powered personalized education for every student.",
  openGraph: {
    title: "About | AIVO",
    description:
      "Learn about AIVO Learning's mission to ensure no learner is left behind.",
  },
};

const principles = [
  {
    icon: Brain,
    title: "Truly Personalized",
    description:
      "Every interaction adapts to the individual learner's Brain Clone, a unique AI profile that understands how each student learns best.",
  },
  {
    icon: Heart,
    title: "Inclusive by Design",
    description:
      "Built from the ground up for all functioning levels, with deep IEP integration ensuring every student gets the support they need.",
  },
  {
    icon: Sparkles,
    title: "AI-Native",
    description:
      "Not AI-bolted-on. The AI IS the product. Every feature is powered by advanced artificial intelligence, not retrofitted with it.",
  },
  {
    icon: BarChart3,
    title: "Measurably Effective",
    description:
      "Data-driven outcomes with transparent progress tracking. Parents and educators always know exactly where students stand.",
  },
  {
    icon: Gamepad2,
    title: "Joyful Learning",
    description:
      "Gamification, personality-rich tutors, and engaging content make learning something students look forward to every day.",
  },
];

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We push the boundaries of what's possible in education technology, using cutting-edge AI to solve real learning challenges.",
  },
  {
    icon: Users,
    title: "Inclusion",
    description:
      "Every decision we make is guided by our commitment to serving all learners, regardless of ability, background, or learning style.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We protect student data fiercely, communicate honestly with families and educators, and hold ourselves to the highest ethical standards.",
  },
  {
    icon: Zap,
    title: "Impact",
    description:
      "We measure success by student outcomes. If it doesn't measurably help learners grow, we don't ship it.",
  },
];

const team = [
  { name: "Coming Soon", role: "CEO & Co-Founder" },
  { name: "Coming Soon", role: "CTO & Co-Founder" },
  { name: "Coming Soon", role: "VP of Education" },
  { name: "Coming Soon", role: "Head of AI Research" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-aivo-purple-600">
            Our Mission
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl lg:text-6xl">
            No Learner Left Behind
          </h1>
          <p className="mt-6 text-lg text-aivo-navy-500 max-w-3xl mx-auto leading-relaxed">
            AIVO Learning was founded on a simple belief: every student deserves
            a learning experience that adapts to them, not the other way around.
            Our AI-powered platform creates a unique learning profile, a Brain
            Clone, for every student, ensuring that no learner is left behind
            regardless of their learning differences, disabilities, or
            functioning level.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Core Principles
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              The foundations that guide everything we build.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-purple-50">
                    <Icon className="h-6 w-6 text-aivo-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-aivo-navy-800">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-aivo-navy-500 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              What we stand for as a company and as educators.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-2xl bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-teal-50">
                    <Icon className="h-6 w-6 text-aivo-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-aivo-navy-800">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-aivo-navy-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Meet the Team
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              Passionate educators, engineers, and researchers building the
              future of learning.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-aivo-navy-100 bg-white p-8 text-center shadow-sm"
              >
                {/* Avatar placeholder */}
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-aivo-purple-50">
                  <Users className="h-10 w-10 text-aivo-purple-300" />
                </div>
                <h3 className="text-lg font-bold text-aivo-navy-800">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-aivo-navy-400">
                  {member.role}
                </p>
                <Link
                  href="/careers"
                  className="mt-4 inline-block text-sm font-semibold text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  We&apos;re hiring!
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Join Our Mission
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            Help us build a world where every student gets the personalized
            education they deserve.
          </p>
          <Link
            href="/careers"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
          >
            View Open Positions
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}
