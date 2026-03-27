import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Quote, ArrowRight } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/content/case-studies/studies";

/* ---------- Static params for export ---------- */

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

/* ---------- Dynamic metadata ---------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Case Study Not Found" };

  return {
    title: study.title,
    description: study.excerpt,
    openGraph: {
      title: `${study.title} | AIVO Case Studies`,
      description: study.excerpt,
      url: `https://aivolearning.com/case-studies/${study.slug}`,
      siteName: "AIVO Learning",
      locale: "en_US",
      type: "article",
      publishedTime: study.date,
    },
    twitter: {
      card: "summary_large_image",
      title: study.title,
      description: study.excerpt,
    },
  };
}

/* ---------- Helpers ---------- */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ---------- Page ---------- */

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return notFound();

  const otherStudies = caseStudies.filter((s) => s.slug !== study.slug);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-aivo-purple-600 to-aivo-teal-500 pt-20 pb-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          {/* Back link */}
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Case Studies
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                {study.type === "B2B" ? "School District" : "Family"}
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {study.title}
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-2xl">
                {study.excerpt}
              </p>
              <p className="mt-4 text-sm text-white/60">
                Published {formatDate(study.date)}
              </p>
            </div>

            {/* Hero stat */}
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center lg:h-44 lg:w-44">
              <p className="text-5xl font-bold lg:text-6xl">
                {study.heroStat}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {study.heroStatLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics band */}
      <section className="border-b border-aivo-navy-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {study.metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-3xl font-bold text-aivo-purple-600">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-aivo-navy-400">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content sections */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 space-y-16">
          {/* Challenge */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <span className="text-lg">1</span>
              </div>
              <h2 className="text-2xl font-bold text-aivo-navy-800">
                The Challenge
              </h2>
            </div>
            <div className="rounded-2xl border border-aivo-navy-100 bg-aivo-navy-50 p-8">
              <p className="text-aivo-navy-600 leading-relaxed">
                {study.challenge}
              </p>
            </div>
          </div>

          {/* Solution */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aivo-purple-50">
                <span className="text-lg">2</span>
              </div>
              <h2 className="text-2xl font-bold text-aivo-navy-800">
                The AIVO Solution
              </h2>
            </div>
            <div className="rounded-2xl border border-aivo-purple-100 bg-aivo-purple-50 p-8">
              <p className="text-aivo-navy-600 leading-relaxed">
                {study.solution}
              </p>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aivo-teal-50">
                <span className="text-lg">3</span>
              </div>
              <h2 className="text-2xl font-bold text-aivo-navy-800">
                The Results
              </h2>
            </div>
            <div className="rounded-2xl border border-aivo-teal-100 bg-aivo-teal-50 p-8">
              <p className="text-aivo-navy-600 leading-relaxed">
                {study.results}
              </p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl bg-gradient-to-br from-aivo-purple-600 to-aivo-purple-700 p-10 text-white">
            <Quote className="h-10 w-10 text-white/30" />
            <blockquote className="mt-4 text-xl leading-relaxed font-medium italic">
              &ldquo;{study.testimonial.quote}&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                {study.testimonial.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{study.testimonial.name}</p>
                <p className="text-sm text-white/70">
                  {study.testimonial.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other case studies */}
      {otherStudies.length > 0 && (
        <section className="border-t border-aivo-navy-100 bg-aivo-navy-50 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-2xl font-bold text-aivo-navy-800 text-center mb-10">
              More Success Stories
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
              {otherStudies.map((other) => (
                <Link
                  key={other.slug}
                  href={`/case-studies/${other.slug}`}
                  className="group rounded-2xl border border-aivo-navy-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-3xl font-bold text-aivo-purple-600">
                      {other.heroStat}
                    </p>
                    <p className="text-sm text-aivo-navy-400">
                      {other.heroStatLabel}
                    </p>
                  </div>
                  <h3 className="text-lg font-bold text-aivo-navy-800 group-hover:text-aivo-purple-600 transition-colors">
                    {other.title}
                  </h3>
                  <p className="mt-2 text-sm text-aivo-navy-500 line-clamp-2">
                    {other.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-aivo-purple-600 group-hover:gap-2 transition-all">
                    Read Case Study <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to See Similar Results?
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            Join the schools and families already transforming learning with
            AIVO.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
            >
              Book a Demo
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
