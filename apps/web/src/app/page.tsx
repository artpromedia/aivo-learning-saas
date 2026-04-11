"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const ROLE_DASHBOARDS: Record<string, string> = {
  PARENT: "/dashboard/parent",
  LEARNER: "/dashboard/learner",
  TEACHER: "/dashboard/teacher",
  CAREGIVER: "/dashboard/caregiver",
  THERAPIST: "/dashboard/therapist",
  PLATFORM_ADMIN: "/dashboard/admin",
  DISTRICT_ADMIN: "/dashboard/admin",
};

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(ROLE_DASHBOARDS[user.role] || "/dashboard/parent");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-cyan-50">
        <div className="animate-pulse">
          <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={200} height={60} priority />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={140} height={42} priority />
        <nav className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2 rounded-lg text-slate-600 font-semibold hover:text-primary transition">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary-dark transition shadow-lg shadow-purple-200">
            Get Started
          </Link>
        </nav>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-8 pt-20 pb-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">The adaptive learning platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-bold text-slate-900 leading-tight tracking-tight">
              Learning adventures
              <br />
              <span className="text-primary">for every mind</span>
            </h1>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              AIVO meets each learner where they are — from standard curriculum to
              pre-symbolic communication — with 14 AI tutors and brain-clone
              technology that truly adapts.
            </p>

            <div className="flex gap-4 justify-center pt-2">
              <Link href="/signup" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-dark transition shadow-xl shadow-purple-200">
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link href="/login" className="px-8 py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-lg hover:border-primary hover:text-primary transition">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎮",
                title: "5 Functioning Levels",
                desc: "From standard academics to pre-symbolic cause-and-effect — every child has a path.",
                bg: "bg-purple-50",
                border: "border-purple-100",
                iconBg: "bg-purple-100",
              },
              {
                icon: "🤖",
                title: "14 AI Tutors",
                desc: "Seven core tutors plus seven specialists covering every learning domain.",
                bg: "bg-cyan-50",
                border: "border-cyan-100",
                iconBg: "bg-cyan-100",
              },
              {
                icon: "🧠",
                title: "Brain Clone",
                desc: "An adaptive brain state that evolves with each learner, with snapshots and rollback.",
                bg: "bg-amber-50",
                border: "border-amber-100",
                iconBg: "bg-amber-100",
              },
            ].map((f) => (
              <div key={f.title} className={`${f.bg} border ${f.border} rounded-2xl p-8 space-y-4 hover:shadow-lg transition`}>
                <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 border-t border-slate-100 py-16">
          <div className="max-w-5xl mx-auto px-8">
            <h2 className="text-3xl font-heading font-bold text-slate-900 text-center mb-10">Meet the Tutors</h2>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
              {[
                { name: "Nova", domain: "Math", icon: "🔢", color: "#7C3AED" },
                { name: "Sage", domain: "ELA", icon: "📚", color: "#10B981" },
                { name: "Spark", domain: "Science", icon: "🔬", color: "#F59E0B" },
                { name: "Chrono", domain: "History", icon: "🏛️", color: "#6366F1" },
                { name: "Pixel", domain: "Coding", icon: "💻", color: "#06B6D4" },
                { name: "Echo", domain: "Speech", icon: "🗣️", color: "#EC4899" },
                { name: "Harmony", domain: "SEL", icon: "💜", color: "#8B5CF6" },
              ].map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition border border-slate-100 cursor-pointer group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{t.icon}</div>
                  <div className="font-heading font-bold text-sm" style={{ color: t.color }}>{t.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.domain}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <p className="font-body">AIVO Learning Platform &mdash; AI-Powered Adaptive Learning for Every Child</p>
      </footer>
    </div>
  );
}
