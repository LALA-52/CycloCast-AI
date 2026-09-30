"use client";

import React from "react";

export interface RiskCardProps {
  title: string;
  value: number;
  unit: string;
  level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  description: string;
  detail: string;
  progress: number;
  className?: string;
}

const getLevelColors = (level: RiskCardProps["level"]) => {
  switch (level) {
    case "CRITICAL": return { text: "text-red-400", bg: "bg-red-500", border: "border-red-800", badge: "bg-red-900/80 text-red-300 border-red-700" };
    case "HIGH": return { text: "text-orange-400", bg: "bg-orange-500", border: "border-orange-800", badge: "bg-orange-900/80 text-orange-300 border-orange-700" };
    case "MODERATE": return { text: "text-amber-400", bg: "bg-amber-500", border: "border-amber-800", badge: "bg-amber-900/80 text-amber-300 border-amber-700" };
    case "LOW": return { text: "text-green-400", bg: "bg-green-500", border: "border-green-800", badge: "bg-green-900/80 text-green-300 border-green-700" };
  }
};

export const RiskCard: React.FC<RiskCardProps> = ({
  title,
  value,
  unit,
  level,
  description,
  detail,
  progress,
  className = "",
}) => {
  const styles = getLevelColors(level);

  return (
    <div
      className={`bg-[#111827] border ${styles.border} rounded p-4 relative flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{title}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${styles.badge}`}>
          {level}
        </span>
      </div>

      <div className="mb-2">
        <span className={`text-2xl font-bold ${styles.text}`}>{value}</span>
        <span className="text-xs text-slate-500 ml-1">{unit}</span>
      </div>

      <div className="w-full bg-slate-800 rounded-sm h-1 mb-2">
        <div
          className={`${styles.bg} h-1 rounded-sm`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      <p className="text-[10px] text-slate-500 mb-0.5">{description}</p>
      <p className="text-[10px] text-slate-600">{detail}</p>
    </div>
  );
};
