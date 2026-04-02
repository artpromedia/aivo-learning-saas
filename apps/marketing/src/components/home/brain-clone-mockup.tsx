"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const progressGrow = (width: number, delay: number) => ({
  hidden: { width: 0 },
  show: {
    width: `${width}%`,
    transition: { duration: 0.8, ease: "easeOut", delay },
  },
});

const goals = [
  { label: "Reading Fluency", status: "On Track", color: "#10b981" },
  { label: "Math Problem Solving", status: "Progressing", color: "#f59e0b" },
  { label: "Written Expression", status: "On Track", color: "#10b981" },
  { label: "Social Skills", status: "New Goal", color: "#7c3aed" },
];

const accommodations = [
  "Extended time on assessments",
  "Text-to-speech enabled",
  "Frequent breaks (10-min blocks)",
  "Visual aids & graphic organizers",
];

export function BrainCloneMockup() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-[520px] mx-auto select-none pointer-events-none"
    >
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
            AIVO — Brain Clone Profile
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Student profile header */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-teal-500/20 border border-purple-400/20 p-3"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/30 text-lg">
              🧠
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/90">
                Learning Profile Active
              </p>
              <p className="text-[10px] text-white/50">
                IEP synced • Last updated 2h ago
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-semibold text-emerald-400">
                ACTIVE
              </span>
            </div>
          </motion.div>

          {/* Learning style analysis */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white/[0.06] border border-white/10 p-3"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-3">
              Learning Style Analysis
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Visual", value: 85, color: "#7c3aed" },
                { label: "Kinesthetic", value: 72, color: "#14b8c8" },
                { label: "Auditory", value: 45, color: "#f59e0b" },
                { label: "Reading", value: 60, color: "#10b981" },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/60 w-16 truncate">
                    {s.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      variants={progressGrow(s.value, 0.3 + i * 0.1)}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white/80 w-8 text-right">
                    {s.value}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* IEP Goals */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white/[0.06] border border-white/10 p-3"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              IEP Goals
            </p>
            <ul className="space-y-2">
              {goals.map((g, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  className="flex items-center justify-between"
                >
                  <span className="text-[10px] text-white/70">{g.label}</span>
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color: g.color,
                      background: `${g.color}20`,
                    }}
                  >
                    {g.status}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Accommodations */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white/[0.06] border border-white/10 p-3"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Active Accommodations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {accommodations.map((a, i) => (
                <motion.span
                  key={i}
                  variants={fadeUp}
                  className="text-[9px] text-white/70 px-2 py-1 rounded-md bg-white/[0.08] border border-white/10"
                >
                  ✓ {a}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
