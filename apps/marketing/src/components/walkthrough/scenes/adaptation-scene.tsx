"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdaptationSceneProps {
  sceneElapsedMs: number;
  className?: string;
}

const answers = [
  { label: "A", text: "1½", correct: false },
  { label: "B", text: "1¼", correct: true },
  { label: "C", text: "1⅓", correct: false },
  { label: "D", text: "¾", correct: false },
];

const nodes = [
  { x: 15, y: 25 },
  { x: 45, y: 15 },
  { x: 75, y: 30 },
  { x: 25, y: 60 },
  { x: 55, y: 55 },
  { x: 80, y: 65 },
];

const connections = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5],
];

export function AdaptationScene({ sceneElapsedMs, className }: AdaptationSceneProps) {
  const showAnswer = sceneElapsedMs > 2500;
  const showBrainUpdate = sceneElapsedMs > 4000;
  const nodeActiveIndex = showBrainUpdate
    ? Math.min(Math.floor((sceneElapsedMs - 4000) / 300), nodes.length)
    : 0;

  return (
    <motion.div
      className={cn("h-full bg-[#f8f9fc] flex flex-col", className)}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Split screen */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-3">
        {/* Left: Quiz */}
        <div className="bg-white rounded-lg p-4 flex flex-col">
          <p className="text-xs font-medium text-gray-400 mb-2">Question 5 of 10</p>
          <p className="text-sm font-semibold text-gray-800 mb-4">
            What is 3/4 + 1/2?
          </p>
          <div className="space-y-2 flex-1">
            {answers.map((ans) => {
              const isSelected = showAnswer && ans.correct;
              return (
                <motion.button
                  key={ans.label}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-200 text-gray-600"
                  )}
                  animate={isSelected ? { scale: [1, 1.03, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      isSelected
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {isSelected ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                          d="M20 6L9 17l-5-5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        />
                      </svg>
                    ) : (
                      ans.label
                    )}
                  </span>
                  <span>{ans.text}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Brain Clone visualization */}
        <div className="bg-white rounded-lg p-4 flex flex-col">
          <p className="text-xs font-medium text-gray-400 mb-2">Brain Clone™</p>
          <div className="flex-1 relative">
            <svg viewBox="0 0 100 80" className="w-full h-full">
              {/* Connections */}
              {connections.map(([from, to], i) => {
                const isActive = nodeActiveIndex > Math.max(from, to);
                return (
                  <motion.line
                    key={`line-${i}`}
                    x1={nodes[from].x}
                    y1={nodes[from].y}
                    x2={nodes[to].x}
                    y2={nodes[to].y}
                    stroke={isActive ? "#8b5cf6" : "#e5e7eb"}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    animate={{ opacity: isActive ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
              {/* Nodes */}
              {nodes.map((node, i) => {
                const isActive = i < nodeActiveIndex;
                return (
                  <motion.circle
                    key={`node-${i}`}
                    cx={node.x}
                    cy={node.y}
                    r={isActive ? 5 : 4}
                    fill={isActive ? "#8b5cf6" : "#d1d5db"}
                    animate={
                      isActive
                        ? { scale: [1, 1.3, 1], fill: "#8b5cf6" }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      {showBrainUpdate && (
        <motion.div
          className="px-4 pb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-purple-50 rounded-lg px-4 py-2 text-center">
            <p className="text-xs font-medium text-purple-700">
              Brain Clone™ updated — Alex learns best with visual aids
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
