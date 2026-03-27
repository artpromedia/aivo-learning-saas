import type { Metadata } from "next";
import {
  Heart,
  Palmtree,
  Home,
  BookOpen,
  TrendingUp,
  MapPin,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Careers | AIVO",
  description:
    "Join the AIVO team and help build the future of personalized learning. View open positions in engineering, ML, design, and more.",
  openGraph: {
    title: "Careers | AIVO",
    description:
      "Join the AIVO team and help build the future of personalized learning.",
  },
};

const positions = [
  {
    title: "Senior Backend Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Build the services powering Brain Clone AI. TypeScript, Node.js, PostgreSQL.",
  },
  {
    title: "ML Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Design and train the models behind adaptive learning. Python, PyTorch, NLP.",
  },
  {
    title: "Product Designer",
    location: "Remote",
    type: "Full-time",
    description:
      "Create accessible, delightful learning experiences. Figma, design systems, WCAG.",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health, Dental & Vision",
    description: "Comprehensive medical coverage for you and your family.",
  },
  {
    icon: Palmtree,
    title: "Unlimited PTO",
    description:
      "Take the time you need to recharge. We trust you to manage your schedule.",
  },
  {
    icon: Home,
    title: "Remote-first",
    description:
      "Work from anywhere. We're a distributed team spanning multiple time zones.",
  },
  {
    icon: BookOpen,
    title: "Learning Stipend",
    description:
      "$1,500/year for courses, books, conferences, and professional development.",
  },
  {
    icon: TrendingUp,
    title: "Equity",
    description:
      "Meaningful equity stake so you share in the success you help build.",
  },
];

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl lg:text-6xl">
            Join the AIVO Team
          </h1>
          <p className="mt-6 text-lg text-aivo-navy-500 max-w-3xl mx-auto leading-relaxed">
            Help us build the future of personalized learning. We&apos;re on a
            mission to ensure no learner is left behind, and we need passionate
            people to make it happen.
          </p>
        </div>
      </section>

      {/* Mission blurb */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-aivo-navy-800 sm:text-3xl">
            Why AIVO?
          </h2>
          <p className="mt-4 text-lg text-aivo-navy-500 leading-relaxed">
            At AIVO, every line of code, every pixel, and every model we train
            directly impacts students who learn differently. We&apos;re building
            AI that adapts to each student&apos;s unique needs, creating a world
            where learning differences are strengths, not barriers. If
            you&apos;re looking for work that matters, you&apos;ve found it.
          </p>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Open Positions
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400">
              Find your next role at AIVO.
            </p>
          </div>

          <div className="space-y-6">
            {positions.map((position) => (
              <div
                key={position.title}
                className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-aivo-navy-800">
                      {position.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-aivo-purple-50 px-3 py-1 text-xs font-medium text-aivo-purple-700">
                        <MapPin className="h-3.5 w-3.5" />
                        {position.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-aivo-teal-50 px-3 py-1 text-xs font-medium text-aivo-teal-700">
                        <Clock className="h-3.5 w-3.5" />
                        {position.type}
                      </span>
                    </div>
                    <p className="mt-3 text-aivo-navy-500 leading-relaxed">
                      {position.description}
                    </p>
                  </div>
                  <a
                    href="mailto:careers@aivolearning.com"
                    className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-aivo-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
                  >
                    Apply
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Benefits & Perks
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              We take care of our team so they can focus on taking care of
              students.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-teal-50">
                    <Icon className="h-6 w-6 text-aivo-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-aivo-navy-800">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm text-aivo-navy-500 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Don&apos;t see your role?
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            We&apos;re always looking for talented people who share our mission.
            Send us your resume and tell us how you&apos;d like to contribute.
          </p>
          <a
            href="mailto:careers@aivolearning.com"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
          >
            careers@aivolearning.com
          </a>
        </div>
      </section>
    </>
  );
}
