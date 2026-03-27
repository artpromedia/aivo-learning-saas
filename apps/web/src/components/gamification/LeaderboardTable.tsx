"use client";

import React from "react";
import { Trophy } from "lucide-react";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatarUrl?: string;
  xp: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  className?: string;
}

function LeaderboardTable({ entries, className = "" }: LeaderboardTableProps) {
  const rankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-400 text-yellow-900";
    if (rank === 2) return "bg-gray-300 text-gray-700";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  };

  return (
    <div
      className={`w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Trophy size={18} className="text-[#7C3AED]" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Leaderboard
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                Rank
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                XP
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.rank}
                className={`border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors ${
                  entry.isCurrentUser
                    ? "bg-[#7C3AED]/5 dark:bg-[#7C4DFF]/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankBadge(entry.rank)}`}
                  >
                    {entry.rank}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] text-sm font-bold">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        entry.isCurrentUser
                          ? "text-[#7C3AED] dark:text-[#7C4DFF]"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="ml-1.5 text-xs text-gray-400">(You)</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {entry.xp.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { LeaderboardTable };
