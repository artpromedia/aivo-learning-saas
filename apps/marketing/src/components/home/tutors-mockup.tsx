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

const tutors = [
  {
    name: "Nova",
    subject: "Mathematics",
    emoji: "🔢",
    color: "#7c3aed",
    style: "Patient step-by-step guidance",
  },
  {
    name: "Sage",
    subject: "Reading & Writing",
    emoji: "📖",
    color: "#14b8c8",
    style: "Storytelling & comprehension",
  },
  {
    name: "Atlas",
    subject: "Science",
    emoji: "🔬",
    color: "#10b981",
    style: "Hands-on exploration",
  },
  {
    name: "Spark",
    subject: "Social Studies",
    emoji: "🌍",
    color: "#f59e0b",
    style: "Interactive discussions",
  },
  {
    name: "Echo",
    subject: "Study Skills",
    emoji: "🎯",
    color: "#ec4899",
    style: "Focus & organization",
  },
];

const chatMessages = [
  { role: "tutor", text: "Let's try this problem a different way! 🌟" },
  { role: "student", text: "Can you show me with a picture?" },
  { role: "tutor", text: "Great idea! Visual learners love this approach." },
];

export function TutorsMockup() {
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
            AIVO — AI Tutors
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Tutor grid */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white/[0.06] border border-white/10 p-3"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-3">
              Your AI Tutors
            </p>
            <div className="space-y-2">
              {tutors.map((t, i) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                  style={{
                    borderLeft: i === 0 ? `2px solid ${t.color}` : "2px solid transparent",
                    background: i === 0 ? `${t.color}10` : undefined,
                  }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-sm"
                    style={{ background: `${t.color}25` }}
                  >
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-white/90">
                        {t.name}
                      </span>
                      <span className="text-[9px] text-white/40">{t.subject}</span>
                    </div>
                    <p className="text-[9px] text-white/40">{t.style}</p>
                  </div>
                  {i === 0 && (
                    <span className="text-[8px] font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20">
                      ACTIVE
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Chat preview */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl bg-white/[0.06] border border-white/10 p-3"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Live Session — Nova
            </p>
            <div className="space-y-2">
              {chatMessages.map((m, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`flex ${m.role === "student" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`text-[10px] px-3 py-1.5 rounded-xl max-w-[80%] ${
                      m.role === "student"
                        ? "bg-purple-500/30 text-white/90 rounded-br-sm"
                        : "bg-white/10 text-white/80 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Typing indicator */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-1 mt-2 ml-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-400/60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: i * 0.2,
                  }}
                />
              ))}
              <span className="text-[9px] text-white/30 ml-1">
                Nova is typing...
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
