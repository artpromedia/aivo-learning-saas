"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TutorChatSceneProps {
  sceneElapsedMs: number;
  className?: string;
}

const messages = [
  {
    sender: "newton",
    text: "I noticed you struggled with fractions yesterday. Let's try a different approach! 🎯",
    delayMs: 1200,
  },
  {
    sender: "student",
    text: "Okay! I like visual examples.",
    delayMs: 3500,
  },
  {
    sender: "newton",
    text: "Perfect! Here's a pizza problem...",
    delayMs: 5500,
    hasPieChart: true,
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-purple-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function PieChartAnimation({ progress }: { progress: number }) {
  const fraction = Math.min(progress, 1);
  return (
    <div className="mt-2 flex justify-center">
      <div
        className="w-16 h-16 rounded-full border-2 border-gray-200"
        style={{
          background: `conic-gradient(
            #8b5cf6 0deg ${fraction * 270}deg,
            #e9d5ff ${fraction * 270}deg ${fraction * 270 + 0.1}deg,
            #f3e8ff ${fraction * 270}deg 360deg
          )`,
        }}
      />
    </div>
  );
}

export function TutorChatScene({ sceneElapsedMs, className }: TutorChatSceneProps) {
  return (
    <motion.div
      className={cn("h-full bg-white flex flex-col", className)}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
          N
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Newton</p>
          <p className="text-[11px] text-gray-400">Your STEM Tutor</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-hidden p-4 space-y-3">
        {messages.map((msg, i) => {
          const isVisible = sceneElapsedMs >= msg.delayMs;
          const showTyping =
            !isVisible &&
            msg.sender === "newton" &&
            sceneElapsedMs >= msg.delayMs - 800;
          const isNewton = msg.sender === "newton";

          if (showTyping) {
            return (
              <div key={`typing-${i}`} className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  N
                </div>
                <div className="bg-purple-50 rounded-2xl rounded-bl-none">
                  <TypingIndicator />
                </div>
              </div>
            );
          }

          if (!isVisible) return null;

          return (
            <motion.div
              key={i}
              className={cn("flex items-end gap-2", !isNewton && "flex-row-reverse")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isNewton && (
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  N
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  isNewton
                    ? "bg-purple-50 text-gray-800 rounded-bl-none"
                    : "bg-purple-600 text-white rounded-br-none"
                )}
              >
                <p>{msg.text}</p>
                {msg.hasPieChart && sceneElapsedMs > msg.delayMs + 500 && (
                  <PieChartAnimation
                    progress={Math.min((sceneElapsedMs - msg.delayMs - 500) / 2000, 1)}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
