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
    if (rank === 2) return "bg-[#E8DDF0] text-[var(--aivo-text)]";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text-secondary)]";
  };

  return (
    <div
      className={`w-full rounded-2xl bg-white dark:bg-[#2A1E45] border border-[#E8DDF0] dark:border-[#3D2D5C] shadow-[var(--shadow-card)] overflow-hidden ${className}`}
    >
      <div className="px-5 py-4 border-b border-[#E8DDF0] dark:border-[#3D2D5C] flex items-center gap-2">
        <Trophy size={18} className="text-[#7C3AED]" />
        <h3 className="text-base font-semibold text-[var(--aivo-text)]">
          Leaderboard
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0E6FF] dark:border-[#3D2D5C]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--aivo-text-secondary)] uppercase tracking-wider w-16">
                Rank
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--aivo-text-secondary)] uppercase tracking-wider">
                Player
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--aivo-text-secondary)] uppercase tracking-wider w-24">
                XP
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.rank}
                className={`border-b border-[#F0E6FF] dark:border-[#3D2D5C] last:border-0 transition-colors ${
                  entry.isCurrentUser
                    ? "bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10"
                    : "hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45]/50"
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
                          ? "text-[#7C3AED] dark:text-[#7C3AED]"
                          : "text-[var(--aivo-text)]"
                      }`}
                    >
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="ml-1.5 text-xs text-[#A89BB5]">(You)</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-semibold text-[var(--aivo-text)]">
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
