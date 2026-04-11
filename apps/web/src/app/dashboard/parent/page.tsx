"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { TUTORS } from "@aivo/brand";

interface Learner {
  id: string;
  name: string;
  functioningLevel: string;
  gradeLevel: string;
}

export default function ParentDashboard() {
  const { user, accessToken, logout, loading } = useAuth();
  const router = useRouter();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLearner, setNewLearner] = useState({ name: "", gradeLevel: "", pin: "" });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== "PARENT" && user.role !== "PLATFORM_ADMIN") router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (accessToken) {
      fetch("/api/users/learners", { headers: { Authorization: `Bearer ${accessToken}` } })
        .then((r) => r.json())
        .then(setLearners)
        .catch(() => {});
    }
  }, [accessToken]);

  const addLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users/learners", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(newLearner),
    });
    if (res.ok) {
      const data = await res.json();
      setLearners([...learners, data.learner]);
      setShowAddForm(false);
      setNewLearner({ name: "", gradeLevel: "", pin: "" });
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <Image src="/images/aivo-logo-purple.png" alt="AIVO" width={120} height={36} />
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">Welcome, {user.name}</span>
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-primary font-medium">{user.role}</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500 transition">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-slate-900">Your Learners</h1>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition">
            + Add Learner
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={addLearner} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-heading font-bold text-lg">Add a New Learner</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={newLearner.name} onChange={(e) => setNewLearner({...newLearner, name: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                <input type="text" value={newLearner.gradeLevel} onChange={(e) => setNewLearner({...newLearner, gradeLevel: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary outline-none" placeholder="e.g. 3rd" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PIN (for learner login)</label>
                <input type="text" value={newLearner.pin} onChange={(e) => setNewLearner({...newLearner, pin: e.target.value})} maxLength={6}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary outline-none" placeholder="4-6 digits" />
              </div>
            </div>
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition">
              Create Learner
            </button>
          </form>
        )}

        {learners.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-lg">No learners yet. Add your first learner to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learners.map((l) => (
              <div key={l.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading font-bold text-slate-900">{l.name}</h3>
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-primary font-medium">
                    {l.functioningLevel || "Pending Assessment"}
                  </span>
                </div>
                {l.gradeLevel && <p className="text-sm text-slate-500">Grade: {l.gradeLevel}</p>}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => router.push(`/dashboard/parent/learner/${l.id}`)}
                    className="px-4 py-2 text-sm rounded-lg bg-purple-50 text-primary font-medium hover:bg-purple-100 transition">
                    View Profile
                  </button>
                  <button onClick={() => router.push(`/dashboard/parent/learner/${l.id}/assessment`)}
                    className="px-4 py-2 text-sm rounded-lg bg-cyan-50 text-secondary font-medium hover:bg-cyan-100 transition">
                    Start Assessment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-heading font-bold text-slate-900 mb-4">Available Tutors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(TUTORS).filter(([, t]) => t.tier === "core").map(([key, tutor]) => (
              <div key={key} className="text-center p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                <div className="text-3xl mb-2">{tutor.icon}</div>
                <div className="font-medium text-sm" style={{ color: tutor.color }}>{tutor.name}</div>
                <div className="text-xs text-slate-500 mt-1">{tutor.domain}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
