"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/section-header";

const tutors = [
  {
    name: "Nova",
    subject: "Mathematics",
    emoji: "🌌",
    personality: "A cosmic explorer who turns math into an intergalactic adventure. Nova makes algebra feel like navigating star charts and geometry like designing spacecraft.",
    accent: "from-aivo-purple-500 to-aivo-purple-700",
    bg: "bg-aivo-purple-50",
    border: "border-aivo-purple-200",
  },
  {
    name: "Sage",
    subject: "English Language Arts",
    emoji: "📚",
    personality: "A master storyteller who brings literature to life. Sage turns reading comprehension into detective work and writing into world-building.",
    accent: "from-aivo-teal-500 to-aivo-teal-700",
    bg: "bg-aivo-teal-50",
    border: "border-aivo-teal-200",
  },
  {
    name: "Spark",
    subject: "Science",
    emoji: "⚡",
    personality: "An enthusiastic inventor who makes science experiments feel like magic. Spark turns every hypothesis into an exciting discovery mission.",
    accent: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    name: "Chrono",
    subject: "History",
    emoji: "⏳",
    personality: "A time-traveling guide who makes history feel like a personal adventure. Chrono transports students to ancient civilizations and pivotal moments.",
    accent: "from-rose-500 to-red-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    name: "Pixel",
    subject: "Coding",
    emoji: "💻",
    personality: "A friendly pair-programming buddy who makes coding feel like building with digital LEGO. Pixel turns debugging into puzzle-solving and algorithms into game design.",
    accent: "from-emerald-500 to-green-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    name: "Harmony",
    subject: "Social-Emotional Learning",
    emoji: "🌿",
    personality: "A warm and calming coach who helps learners understand their emotions, build empathy, and develop healthy relationships. Harmony turns feelings into growth opportunities.",
    accent: "from-violet-400 to-teal-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    name: "Echo",
    subject: "Speech & Language",
    emoji: "🎵",
    personality: "A playful speech companion who makes articulation practice feel like a musical adventure. Echo turns tricky sounds into fun challenges and celebrates every attempt.",
    accent: "from-orange-400 to-sky-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export function AiTutors() {
  return (
    <section id="ai-tutors" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Meet Your AI Learning Team"
          subtitle="Seven specialized AI tutors, each with a unique personality and teaching style designed to make every subject engaging and fun."
        />

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {tutors.map((tutor) => (
            <motion.div
              key={tutor.name}
              variants={item}
              className={`group relative rounded-2xl border ${tutor.border} ${tutor.bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tutor.accent}`} />

              <div className="text-4xl mb-4">{tutor.emoji}</div>
              <h3 className="text-xl font-bold text-aivo-navy-800 mb-1">
                {tutor.name}
              </h3>
              <p className="text-sm font-medium text-aivo-navy-500 mb-3">
                {tutor.subject}
              </p>
              <p className="text-sm text-aivo-navy-400 leading-relaxed">
                {tutor.personality}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
