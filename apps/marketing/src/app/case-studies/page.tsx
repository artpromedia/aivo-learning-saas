import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudies } from "@/content/case-studies/studies";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Real results from real schools and families. See how AIVO's AI-powered personalized learning is transforming outcomes for students of all abilities.",
  openGraph: {
    title: "Case Studies | AIVO",
    description:
      "Real results from real schools and families using AIVO's AI-powered personalized learning platform.",
    url: "https://aivolearning.com/case-studies",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies | AIVO",
    description:
      "Real results from real schools and families using AIVO.",
  },
};

function TypeBadge({ type }: { type: string }) {
  const isB2B = type === "B2B";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        isB2B
          ? "bg-aivo-teal-50 text-aivo-teal-700"
          : "bg-aivo-purple-50 text-aivo-purple-700"
      }`}
    >
      {isB2B ? "School District" : "Family"}
    </span>
  );
}

export default function CaseStudiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-aivo-purple-600">
            Case Studies
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Real Results, Real Stories
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            See how schools and families are using AIVO to unlock every
            student&apos;s potential with AI-powered personalized learning.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            {caseStudies.map((study) => (
              <Link
                key={study.slug}
                href={`/case-studies/${study.slug}`}
                className="group flex flex-col rounded-2xl border border-aivo-navy-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Top banner with stat */}
                <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-aivo-purple-600 to-aivo-teal-500 px-8 py-6">
                  <div>
                    <p className="text-4xl font-bold text-white">
                      {study.heroStat}
                    </p>
                    <p className="text-sm text-white/80">
                      {study.heroStatLabel}
                    </p>
                  </div>
                  <TypeBadge type={study.type} />
                </div>

                <div className="flex flex-1 flex-col p-8">
                  <h2 className="text-xl font-bold text-aivo-navy-800 group-hover:text-aivo-purple-600 transition-colors">
                    {study.title}
                  </h2>
                  <p className="mt-3 flex-1 text-aivo-navy-500 leading-relaxed">
                    {study.excerpt}
                  </p>

                  {/* Metrics preview */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {study.metrics.slice(0, 4).map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-lg bg-aivo-navy-50 p-3 text-center"
                      >
                        <p className="text-lg font-bold text-aivo-purple-600">
                          {metric.value}
                        </p>
                        <p className="text-xs text-aivo-navy-400">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Testimonial preview */}
                  <blockquote className="mt-6 border-l-4 border-aivo-purple-200 pl-4">
                    <p className="text-sm italic text-aivo-navy-500 line-clamp-2">
                      &ldquo;{study.testimonial.quote}&rdquo;
                    </p>
                    <p className="mt-2 text-xs font-semibold text-aivo-navy-700">
                      {study.testimonial.name},{" "}
                      <span className="font-normal text-aivo-navy-400">
                        {study.testimonial.role}
                      </span>
                    </p>
                  </blockquote>

                  {/* Read link */}
                  <div className="mt-6 pt-4 border-t border-aivo-navy-50">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-aivo-purple-600 group-hover:gap-2.5 transition-all">
                      Read Case Study <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Write Your Own Success Story?
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            Join the schools and families already seeing breakthrough results
            with AIVO.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
            >
              Book a Demo
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
