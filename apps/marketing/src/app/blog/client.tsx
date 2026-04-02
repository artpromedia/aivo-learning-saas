"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  blogPosts,
  blogCategories,
  type BlogPost,
} from "@/content/blog/posts";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";

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
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold",
        colorMap[category] ?? "bg-aivo-navy-50 text-aivo-navy-600",
      )}
    >
      {category}
    </span>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-aivo-navy-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Gradient banner */}
      <div className="h-48 rounded-t-2xl bg-gradient-to-br from-aivo-purple-500 to-aivo-teal-500" />
      <div className="p-8">
        <div className="flex items-center gap-3 text-sm text-aivo-navy-400">
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
        <h2 className="mt-4 text-2xl font-bold text-aivo-navy-800 group-hover:text-aivo-purple-600 transition-colors sm:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 text-aivo-navy-500 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aivo-purple-50 text-sm font-bold text-aivo-purple-600">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-aivo-navy-800">
              {post.author}
            </p>
            <p className="text-xs text-aivo-navy-400">{post.authorRole}</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-aivo-purple-600 group-hover:gap-2 transition-all">
            Read more <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-aivo-navy-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Color bar */}
      <div className="h-2 rounded-t-2xl bg-gradient-to-r from-aivo-purple-400 to-aivo-teal-400" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-sm text-aivo-navy-400">
          <CategoryBadge category={post.category} />
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold text-aivo-navy-800 group-hover:text-aivo-purple-600 transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-aivo-navy-500 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-aivo-navy-50 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-aivo-purple-50 text-xs font-bold text-aivo-purple-600">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-aivo-navy-700">
                {post.author}
              </p>
              <p className="text-xs text-aivo-navy-400">
                {formatDate(post.date)}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-aivo-purple-600 group-hover:gap-2 transition-all">
            Read <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BlogIndexClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-aivo-purple-600">
            Blog
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Insights &amp; Updates
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Thoughts on AI-powered education, adaptive learning research, and
            building technology that serves every learner.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-aivo-navy-100 bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-aivo-purple-600 text-white"
                    : "bg-aivo-navy-50 text-aivo-navy-600 hover:bg-aivo-navy-100",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aivo-navy-300" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-aivo-navy-200 bg-white py-2 pl-10 pr-4 text-sm text-aivo-navy-700 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-100 sm:w-64"
            />
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-aivo-navy-400">
                No posts found. Try a different category or search term.
              </p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <div className="mb-12">
                  <FeaturedCard post={featured} />
                </div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Stay in the Loop
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            Get the latest insights on AI-powered education delivered to your
            inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              placeholder="you@example.com"
              className="rounded-lg border-0 px-5 py-3 text-sm text-aivo-navy-800 shadow-sm placeholder:text-aivo-navy-300 focus:outline-none focus:ring-2 focus:ring-white sm:w-80"
            />
            <button
              type="submit"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-xs text-aivo-purple-200">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </>
  );
}
