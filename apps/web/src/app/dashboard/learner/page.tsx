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

  const allTutors = Object.entries(TUTORS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={100} height={30} />
        <div className="flex items-center gap-4">
          <span className="text-lg font-heading font-bold text-primary">Hi, {user.name}!</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500 font-semibold">Exit</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12 space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-heading font-bold text-slate-900">Choose Your Tutor</h1>
          <p className="text-slate-500 font-semibold text-lg">Pick a tutor to start your learning adventure!</p>
          <button onClick={() => router.push("/dashboard/learner/assessment")}
            className="inline-flex items-center gap-2 mt-2 px-6 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-sm hover:bg-amber-200 transition">
            <span>📝</span> Take Baseline Assessment
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allTutors.map(([key, tutor]) => (
            <button key={key}
              onClick={() => router.push(`/dashboard/learner/lesson/${key}`)}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:shadow-xl transition text-center space-y-3 group"
              style={{ borderColor: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = tutor.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-3 group-hover:scale-110 transition-transform shadow-lg" style={{ borderColor: tutor.color, borderWidth: "3px" }}>
                <Image
                  src={tutor.avatar}
                  alt={`${tutor.name} - ${tutor.domain}`}
                  fill
                  className="object-cover object-top"
                  sizes="80px"
                />
              </div>
              <div className="font-heading font-bold text-lg" style={{ color: tutor.color }}>{tutor.name}</div>
              <div className="text-sm text-slate-500 font-semibold">{tutor.domain}</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
