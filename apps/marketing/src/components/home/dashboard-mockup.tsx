"use client";

import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Animated learner-dashboard mockup shown on hero slide 3            */
/* ------------------------------------------------------------------ */

const subjects = [
  { name: "Mathematics", progress: 78, color: "#7c3aed", grade: "A-" },
  { name: "Science", progress: 92, color: "#14b8c8", grade: "A+" },
  { name: "English", progress: 65, color: "#f59e0b", grade: "B+" },
  { name: "History", progress: 84, color: "#10b981", grade: "A" },
];

const recentActivity = [
  { label: "Algebra Quiz", score: "95%", time: "2m ago" },
  { label: "Physics Lab", score: "88%", time: "1h ago" },
  { label: "Essay Draft", score: "Reviewed", time: "3h ago" },
];

const weeklyData = [32, 45, 28, 55, 48, 62, 40];
const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const barGrow = (height: number, delay: number) => ({
  hidden: { height: 0 },
  show: {
    height,
    transition: { duration: 0.6, ease: "easeOut", delay },
  },
});

const progressGrow = (width: number, delay: number) => ({
  hidden: { width: 0 },
  show: {
    width: `${width}%`,
    transition: { duration: 0.8, ease: "easeOut", delay },
  },
});

export function DashboardMockup() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-[520px] mx-auto select-none pointer-events-none"
    >
      {/* Dashboard window chrome */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] shadow-2xl overflow-hidden"
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-red-400/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <span className="w-3 h-3 rounded-full bg-green-400/80" />
          <span className="ml-3 text-[11px] text-white/40 font-medium tracking-wide">
            AIVO — Learner Dashboard
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Top stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
            <StatCard label="XP This Week" value="1,240" delta="+12%" color="#7c3aed" />
            <StatCard label="Streak" value="14 days" icon="🔥" color="#f59e0b" />
            <StatCard label="Mastery" value="82%" delta="+3%" color="#14b8c8" />
          </motion.div>

          {/* Middle row: chart + activity feed */}
          <div className="grid grid-cols-5 gap-3">
            {/* Mini bar chart */}
            <motion.div
              variants={fadeUp}
              className="col-span-3 rounded-xl bg-white/[0.06] border border-white/10 p-3"
            >
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                Study Minutes
              </p>
              <div className="flex items-end justify-between gap-1 h-[72px]">
                {weeklyData.map((val, i) => {
                  const h = (val / 65) * 64;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 gap-1">
                      <motion.div
                        variants={barGrow(h, i * 0.07)}
                        className="w-full rounded-sm"
                        style={{
                          background:
                            i === 5
                              ? "linear-gradient(180deg, #7c3aed, #14b8c8)"
                              : "rgba(255,255,255,0.15)",
                          maxWidth: 18,
                        }}
                      />
                      <span className="text-[9px] text-white/30">{weekDays[i]}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent activity */}
            <motion.div
              variants={fadeUp}
              className="col-span-2 rounded-xl bg-white/[0.06] border border-white/10 p-3"
            >
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                Recent
              </p>
              <ul className="space-y-2">
                {recentActivity.map((a, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[10px] text-white/70 truncate mr-2">
                      {a.label}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 whitespace-nowrap">
                      {a.score}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Subject progress bars */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white/[0.06] border border-white/10 p-3"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-3">
              Subject Progress
            </p>
            <div className="space-y-2.5">
              {subjects.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/60 w-16 truncate">{s.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      variants={progressGrow(s.progress, 0.3 + i * 0.1)}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white/80 w-6 text-right">
                    {s.grade}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI tutor nudge */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-teal-500/20 border border-purple-400/20 p-3"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/30">
              <BrainIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white/90">
                AI Tutor Suggestion
              </p>
              <p className="text-[10px] text-white/50 truncate">
                Practice quadratic equations — you&apos;re close to mastery!
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-purple-400"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- small sub-components ---------- */

function StatCard({
  label,
  value,
  delta,
  icon,
  color,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: string;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl bg-white/[0.06] border border-white/10 p-2.5"
    >
      <p className="text-[9px] text-white/40 uppercase tracking-wider font-medium">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-base font-bold text-white">{value}</span>
        {delta && (
          <span
            className="text-[9px] font-semibold"
            style={{ color }}
          >
            {delta}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function BrainIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-purple-300"
    >
      <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
      <path d="M9 21h6" />
      <path d="M10 17v4" />
      <path d="M14 17v4" />
      <path d="M12 2v5" />
      <path d="M8 9h8" />
      <path d="M9 5.5l3 3.5 3-3.5" />
    </svg>
  );
}
