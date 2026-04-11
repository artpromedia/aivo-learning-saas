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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={140} height={42} priority />
        <div className="flex gap-3">
          <Link href="/login" className="px-5 py-2 rounded-lg text-primary font-medium hover:bg-purple-50 transition">
            Log In
          </Link>
          <Link href="/signup" className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition">
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-heading font-bold text-slate-900 leading-tight">
            AI-Powered Adaptive Learning
            <br />
            <span className="text-primary">for Every Child</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            AIVO meets each learner where they are — from standard curriculum to pre-symbolic communication — with 14 specialized AI tutors and a brain-clone architecture that truly adapts.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary-dark transition shadow-lg shadow-purple-200">
              Start Free Trial
            </Link>
            <Link href="/about" className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-lg hover:border-primary hover:text-primary transition">
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {[
            { title: "5 Functioning Levels", desc: "From standard academics to pre-symbolic cause-and-effect — every child has a path.", color: "bg-purple-50 text-primary" },
            { title: "14 AI Tutors", desc: "Seven core tutors plus seven expansion specialists covering every learning domain.", color: "bg-cyan-50 text-secondary" },
            { title: "Brain Clone", desc: "An adaptive brain state that evolves with each learner, with versioned snapshots and rollback.", color: "bg-amber-50 text-accent" },
          ].map((f) => (
            <div key={f.title} className={`p-8 rounded-2xl ${f.color} space-y-3`}>
              <h3 className="text-xl font-heading font-bold">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
