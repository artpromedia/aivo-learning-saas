"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReportsSceneProps {
  sceneElapsedMs: number;
  className?: string;
}

const barData = [
  { label: "Math", height: 72, color: "#8b5cf6" },
  { label: "Science", height: 88, color: "#14b8a6" },
  { label: "English", height: 65, color: "#f59e0b" },
  { label: "Art", height: 91, color: "#f43f5e" },
];

const linePoints = [
  { x: 10, y: 70 },
  { x: 35, y: 55 },
  { x: 65, y: 40 },
  { x: 90, y: 20 },
];

export function ReportsScene({ sceneElapsedMs, className }: ReportsSceneProps) {
  const barProgress = Math.min(sceneElapsedMs / 2500, 1);
  const lineProgress = Math.min(Math.max((sceneElapsedMs - 1500) / 2000, 0), 1);
  const showBadge = sceneElapsedMs > 3500;
  const showNotification = sceneElapsedMs > 5000;
  const eased = 1 - Math.pow(1 - barProgress, 3);

  const linePath = linePoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  return (
    <motion.div
      className={cn("h-full bg-white flex flex-col", className)}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">
          Weekly Progress Report — Alex Johnson
        </p>
        <p className="text-[11px] text-gray-400">Oct 21 – Oct 27, 2025</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 p-4">
        {/* Bar chart */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[11px] font-medium text-gray-500 mb-2">Subject Progress</p>
          <div className="flex items-end justify-around h-24 gap-1">
            {barData.map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-bold text-gray-600">
                  {Math.round(eased * bar.height)}%
                </span>
                <div className="w-full bg-gray-200 rounded-t-sm overflow-hidden" style={{ height: 60 }}>
                  <div
                    className="w-full rounded-t-sm transition-all duration-100"
                    style={{
                      height: `${eased * bar.height}%`,
                      backgroundColor: bar.color,
                      marginTop: `${100 - eased * bar.height}%`,
                    }}
                  />
                </div>
                <span className="text-[9px] text-gray-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line graph */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[11px] font-medium text-gray-500 mb-2">Learning Velocity</p>
          <svg viewBox="0 0 100 80" className="w-full h-20">
            {/* Grid lines */}
            {[20, 40, 60].map((y) => (
              <line key={y} x1="5" y1={y} x2="95" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
            ))}
            {/* Week labels */}
            {["W1", "W2", "W3", "W4"].map((w, i) => (
              <text key={w} x={10 + i * 27} y="78" fontSize="5" fill="#9ca3af" textAnchor="middle">
                {w}
              </text>
            ))}
            {/* Line path */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: lineProgress }}
              transition={{ duration: 0.1 }}
            />
            {/* Dots */}
            {linePoints.map((p, i) => {
              const visible = lineProgress >= (i / (linePoints.length - 1));
              return visible ? (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#8b5cf6" />
              ) : null;
            })}
          </svg>
        </div>
      </div>

      {/* Badge */}
      {showBadge && (
        <motion.div
          className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <p className="text-sm font-medium text-amber-800">
            🏆 3 Achievements Unlocked This Week
          </p>
        </motion.div>
      )}

      {/* Notification */}
      {showNotification && (
        <motion.div
          className="mx-4 mb-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-[11px] text-gray-400">
            Shared with: Mom, Mrs. Rodriguez (Teacher)
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
