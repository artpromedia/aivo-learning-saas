"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && !["PLATFORM_ADMIN", "DISTRICT_ADMIN"].includes(user.role)) router.push("/");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const cards = [
    { title: "Users", value: "--", desc: "Total registered users" },
    { title: "Learners", value: "--", desc: "Active learner profiles" },
    { title: "Brain States", value: "--", desc: "Active brain clones" },
    { title: "Assessments", value: "--", desc: "Completed this month" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={120} height={36} />
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.name}</span>
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">{user.role}</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <h1 className="text-2xl font-heading font-bold text-slate-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div key={c.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-500">{c.title}</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{c.value}</div>
              <div className="text-xs text-slate-400 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-heading font-bold text-lg mb-4">Service Health</h3>
            {["identity-svc", "assessment-svc", "brain-svc"].map((svc) => (
              <div key={svc} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm">{svc}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Healthy</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-heading font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-sm rounded-lg bg-purple-50 text-primary font-medium hover:bg-purple-100 transition text-left">
                View All Users
              </button>
              <button className="w-full px-4 py-2 text-sm rounded-lg bg-cyan-50 text-secondary font-medium hover:bg-cyan-100 transition text-left">
                Assessment Reports
              </button>
              <button className="w-full px-4 py-2 text-sm rounded-lg bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition text-left">
                Brain State Monitor
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
