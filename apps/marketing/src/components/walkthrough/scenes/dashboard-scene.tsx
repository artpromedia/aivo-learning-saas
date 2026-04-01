"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardSceneProps {
  sceneElapsedMs: number;
  className?: string;
}

const subjects = [
  { name: "Math", percent: 72, color: "bg-purple-500", tutorColor: "bg-purple-600", tutor: "N" },
  { name: "Science", percent: 88, color: "bg-teal-500", tutorColor: "bg-teal-600", tutor: "C" },
  { name: "English", percent: 65, color: "bg-amber-500", tutorColor: "bg-amber-600", tutor: "S" },
  { name: "Art", percent: 91, color: "bg-rose-500", tutorColor: "bg-rose-600", tutor: "D" },
];

export function DashboardScene({ sceneElapsedMs, className }: DashboardSceneProps) {
  const animProgress = Math.min(sceneElapsedMs / 3000, 1);
  const eased = 1 - Math.pow(1 - animProgress, 3);

  return (
    <motion.div
      className={cn("h-full bg-[#f8f9fc] p-4 flex flex-col", className)}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
            AJ
          </div>
          <span className="text-sm font-medium text-gray-800">
            Good morning, Alex! 🔥 12-day streak
          </span>
        </div>
        <div className="text-xs text-gray-400">Dashboard</div>
      </div>

      {/* Subject cards grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {subjects.map((subject, i) => {
          const barWidth = eased * subject.percent;
          const displayPercent = Math.round(eased * subject.percent);

          return (
            <motion.div
              key={subject.name}
              className="bg-white rounded-lg p-3 shadow-sm flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{subject.name}</span>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", subject.tutorColor)}>
                  {subject.tutor}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className="text-sm font-bold text-gray-800">{displayPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-100", subject.color)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
