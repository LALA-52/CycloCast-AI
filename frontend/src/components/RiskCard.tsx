"use client";

import React from "react";
import { LucideIcon, Database } from "lucide-react";

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface RiskCardProps {
  title: string;
  value: string | number;
  unit?: string;
  level: RiskLevel;
  icon: LucideIcon;
  description: string;
  detail?: string;
  progress?: number;
  isDemo?: boolean;
  className?: string;
}

const LEVEL_STYLES: Record<
  RiskLevel,
  {
    badge: string;
    valueColor: string;
    border: string;
    glow: string;
    progressBar: string;
    bottomBar: string;
    label: string;
  }
> = {
  LOW: {
    badge: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
    valueColor: "text-emerald-300",
    border: "border-emerald-500/30",
    glow: "from-emerald-500/10 to-transparent",
    progressBar: "bg-emerald-500",
    bottomBar: "bg-emerald-500",
    label: "LOW",
  },
  MODERATE: {
    badge: "bg-amber-950/80 text-amber-300 border-amber-800",
    valueColor: "text-amber-300",
    border: "border-amber-500/30",
    glow: "from-amber-500/10 to-transparent",
    progressBar: "bg-amber-500",
    bottomBar: "bg-amber-500",
    label: "MODERATE",
  },
  HIGH: {
    badge: "bg-orange-950/80 text-orange-300 border-orange-800",
    valueColor: "text-orange-300",
    border: "border-orange-500/30",
    glow: "from-orange-500/10 to-transparent",
    progressBar: "bg-orange-500",
    bottomBar: "bg-orange-500",
    label: "HIGH",
  },
  CRITICAL: {
    badge: "bg-rose-950/90 text-rose-200 border-rose-700 animate-pulse",
    valueColor: "text-rose-200",
    border: "border-rose-500/50 shadow-rose-950/20",
    glow: "from-rose-500/15 to-transparent",
    progressBar: "bg-rose-500",
    bottomBar: "bg-rose-600",
    label: "CRITICAL",
  },
};

export const RiskCard: React.FC<RiskCardProps> = ({
  title,
  value,
  unit,
  level,
  icon: Icon,
  description,
  detail,
  progress,
  isDemo = true,
  className = "",
}) => {
  const styles = LEVEL_STYLES[level];
  const progressValue = progress !== undefined ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <div
      className={`bg-slate-900/90 border ${styles.border} rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden backdrop-blur-sm flex flex-col justify-between transition-all hover:border-slate-700 ${className}`}
      aria-label={`${title}: ${value} (${level})`}
    >
      {/* Background radial glow */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${styles.glow} rounded-full blur-2xl pointer-events-none`}
      />

      {/* Header: Title, Icon & Demo Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {isDemo && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider"
              title="Demonstration value"
            >
              <Database className="w-2 h-2" />
              DEMO
            </span>
          )}
          <div className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Metric Value & Severity Badge */}
      <div className="my-2">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-3xl font-black font-mono tracking-tight ${styles.valueColor}`}>
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-slate-400">
              {unit}
            </span>
          )}
          <span
            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${styles.badge}`}
          >
            {styles.label}
          </span>
        </div>

        {/* Progress / Gauge Bar */}
        {progressValue !== undefined && (
          <div className="w-full bg-slate-800/90 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${styles.progressBar}`}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {description}
        </p>
      </div>

      {/* Detail Footer */}
      {detail && (
        <div className="text-[11px] text-slate-400 pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span>{detail}</span>
        </div>
      )}

      {/* Bottom Accent Bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${styles.bottomBar}`} />
    </div>
  );
};
