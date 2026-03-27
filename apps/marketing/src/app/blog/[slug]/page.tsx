import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { blogPosts, getBlogPost } from "@/content/blog/posts";
import { renderMarkdown } from "@/lib/markdown";

/* ---------- Static params for export ---------- */

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

/* ---------- Dynamic metadata ---------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | AIVO Blog`,
      description: post.excerpt,
      url: `https://aivolearning.com/blog/${post.slug}`,
      siteName: "AIVO Learning",
      locale: "en_US",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
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

function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    Product: "bg-aivo-purple-50 text-aivo-purple-700",
    Engineering: "bg-aivo-teal-50 text-aivo-teal-700",
    Education: "bg-aivo-coral-50 text-aivo-coral-700",
    Research: "bg-blue-50 text-blue-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colorMap[category] ?? "bg-aivo-navy-50 text-aivo-navy-600"}`}
    >
      {category}
    </span>
  );
}

/* ---------- Page ---------- */

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return notFound();

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  const contentHtml = renderMarkdown(post.content);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-aivo-navy-400">
            <CategoryBadge category={post.category} />
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="mt-4 text-lg text-aivo-navy-500 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author */}
          <div className="mt-8 flex items-center gap-4 border-t border-aivo-navy-100 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aivo-purple-100 text-lg font-bold text-aivo-purple-600">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-aivo-navy-800">{post.author}</p>
              <p className="text-sm text-aivo-navy-400">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main content */}
            <article
              className="max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Author card */}
                <div className="rounded-2xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-aivo-navy-300">
                    Written by
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aivo-purple-50 text-sm font-bold text-aivo-purple-600">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-aivo-navy-800">
                        {post.author}
                      </p>
                      <p className="text-xs text-aivo-navy-400">
                        {post.authorRole}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div className="rounded-2xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-aivo-navy-300">
                    Share this post
                  </p>
                  <div className="mt-3 flex gap-3">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://aivolearning.com/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-aivo-navy-50 text-aivo-navy-500 transition-colors hover:bg-aivo-purple-50 hover:text-aivo-purple-600"
                      aria-label="Share on Twitter"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://aivolearning.com/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-aivo-navy-50 text-aivo-navy-500 transition-colors hover:bg-aivo-purple-50 hover:text-aivo-purple-600"
                      aria-label="Share on LinkedIn"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Related posts */}
                {relatedPosts.length > 0 && (
                  <div className="rounded-2xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-aivo-navy-300">
                      Related Posts
                    </p>
                    <div className="mt-3 space-y-4">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/blog/${related.slug}`}
                          className="block group"
                        >
                          <p className="text-sm font-semibold text-aivo-navy-800 group-hover:text-aivo-purple-600 transition-colors">
                            {related.title}
                          </p>
                          <p className="mt-1 text-xs text-aivo-navy-400">
                            {formatDate(related.date)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Learning?
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            See how AIVO&apos;s Brain Clone AI creates a personalized learning
            experience for every student.
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
