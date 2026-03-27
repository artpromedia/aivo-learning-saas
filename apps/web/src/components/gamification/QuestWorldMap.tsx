"use client";

import React from "react";
import { Map, Lock, CheckCircle2 } from "lucide-react";

export interface QuestWorld {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: React.ReactNode;
  status: "locked" | "active" | "completed";
  progress?: number;
  totalQuests?: number;
  completedQuests?: number;
}

export interface QuestWorldMapProps {
  worlds: QuestWorld[];
  onWorldClick?: (worldId: string) => void;
  className?: string;
}

const defaultWorlds: QuestWorld[] = [
  { id: "foundations", name: "Foundations", description: "Master the basics", color: "#7C3AED", status: "completed" },
  { id: "exploration", name: "Exploration", description: "Discover new topics", color: "#38B2AC", status: "active" },
  { id: "mastery", name: "Mastery", description: "Deepen your knowledge", color: "#F59E0B", status: "locked" },
  { id: "innovation", name: "Innovation", description: "Create and apply", color: "#EF4444", status: "locked" },
  { id: "transcendence", name: "Transcendence", description: "Achieve expertise", color: "#6B3FE8", status: "locked" },
];

function QuestWorldMap({
  worlds = defaultWorlds,
  onWorldClick,
  className = "",
}: QuestWorldMapProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {worlds.map((world, i) => {
          const isLocked = world.status === "locked";
          const isCompleted = world.status === "completed";
          const isActive = world.status === "active";

          return (
            <button
              key={world.id}
              onClick={() => !isLocked && onWorldClick?.(world.id)}
              disabled={isLocked}
              className={`
                relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-200
                ${isLocked
                  ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                  : isActive
                    ? "border-[#7C3AED] bg-white dark:bg-gray-900 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:-translate-y-0.5"
                    : isCompleted
                      ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10 hover:shadow-md hover:-translate-y-0.5"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-md hover:-translate-y-0.5"
                }
              `}
            >
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#7C3AED] rounded-full">
                  Current
                </span>
              )}

              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{
                  backgroundColor: isLocked ? "#d1d5db" : `${world.color}20`,
                }}
              >
                {isLocked ? (
                  <Lock size={22} className="text-gray-400" />
                ) : isCompleted ? (
                  <CheckCircle2 size={24} className="text-green-500" />
                ) : (
                  world.icon || (
                    <Map size={22} style={{ color: world.color }} />
                  )
                )}
              </div>

              <h3
                className={`text-sm font-bold mb-1 ${
                  isLocked
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {world.name}
              </h3>
              <p
                className={`text-xs ${
                  isLocked
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {world.description}
              </p>

              {!isLocked && world.totalQuests !== undefined && (
                <div className="mt-3 w-full">
                  <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((world.completedQuests || 0) / world.totalQuests) * 100}%`,
                        backgroundColor: world.color,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {world.completedQuests || 0}/{world.totalQuests} quests
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { QuestWorldMap };
