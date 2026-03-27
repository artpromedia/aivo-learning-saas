"use client";

import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface MasteryDataPoint {
  subject: string;
  mastery: number;
  fullMark?: number;
}

export interface MasteryChartProps {
  data: MasteryDataPoint[];
  className?: string;
  height?: number;
}

function MasteryChart({ data, className = "", height = 320 }: MasteryChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    fullMark: d.fullMark ?? 100,
  }));

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid
            stroke="#e5e7eb"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Mastery"
            dataKey="mastery"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            }}
            formatter={(value: number) => [`${value}%`, "Mastery"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { MasteryChart };
