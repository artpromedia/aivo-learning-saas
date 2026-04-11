"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function CaregiverDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={120} height={36} />
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.name}</span>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Caregiver</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500">Logout</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-heading font-bold text-slate-900 mb-6">Caregiver Dashboard</h1>
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
          <p className="text-lg">Daily activity tracking and session logs coming in Phase 2.</p>
        </div>
      </main>
    </div>
  );
}
