"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { TUTORS } from "@aivo/brand";

export default function LearnerDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const coreTutors = Object.entries(TUTORS).filter(([, t]) => t.tier === "core");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={100} height={30} />
        <div className="flex items-center gap-4">
          <span className="text-lg font-heading font-bold text-primary">Hi, {user.name}!</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500">Exit</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12 space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-bold text-slate-900">Choose Your Tutor</h1>
          <p className="text-slate-500">Pick a tutor to start learning!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {coreTutors.map(([key, tutor]) => (
            <button key={key}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-primary hover:shadow-lg transition text-center space-y-3 group">
              <div className="text-5xl group-hover:scale-110 transition">{tutor.icon}</div>
              <div className="font-heading font-bold text-lg" style={{ color: tutor.color }}>{tutor.name}</div>
              <div className="text-sm text-slate-500">{tutor.domain}</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
