"use client";

import React from "react";

export interface DemoRiskMetricItem {
  id: string;
  title: string;
  value: number;
  unit: string;
  level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  description: string;
  detail: string;
  progress: number;
}

const getLevelColor = (level: DemoRiskMetricItem["level"]) => {
  switch (level) {
    case "CRITICAL": return { text: "text-red-400", bg: "bg-red-500", border: "border-red-800", badge: "bg-red-900/80 text-red-300 border-red-700" };
    case "HIGH": return { text: "text-orange-400", bg: "bg-orange-500", border: "border-orange-800", badge: "bg-orange-900/80 text-orange-300 border-orange-700" };
    case "MODERATE": return { text: "text-amber-400", bg: "bg-amber-500", border: "border-amber-800", badge: "bg-amber-900/80 text-amber-300 border-amber-700" };
    case "LOW": return { text: "text-green-400", bg: "bg-green-500", border: "border-green-800", badge: "bg-green-900/80 text-green-300 border-green-700" };
  }
};

export const DEFAULT_DEMO_RISK_METRICS: DemoRiskMetricItem[] = [
  {
    id: "overall-risk",
    title: "Overall Risk",
    value: 82,
    unit: "/ 100",
    level: "CRITICAL",
    description: "Composite vulnerability index",
    detail: "40/30/20/10 weight model",
    progress: 82,
  },
  {
    id: "flood-risk",
    title: "Flood Risk",
    value: 88,
    unit: "/ 100",
    level: "CRITICAL",
    description: "Coastal surge and inundation",
    detail: "Surge height and elevation model",
    progress: 88,
  },
  {
    id: "infra-risk",
    title: "Infrastructure Risk",
    value: 81,
    unit: "/ 100",
    level: "CRITICAL",
    description: "Grid and structural load",
    detail: "7 regional assets evaluated",
    progress: 81,
  },
  {
    id: "evac-risk",
    title: "Evacuation Risk",
    value: 76,
    unit: "/ 100",
    level: "HIGH",
    description: "Transit route disruption",
    detail: "Roadways and bridges under watch",
    progress: 76,
  },
  {
    id: "critical-assets",
    title: "Critical Assets",
    value: 7,
    unit: "total",
    level: "CRITICAL",
    description: "Facilities requiring attention",
    detail: "7 assets in assessment zone",
    progress: 100,
  },
];

export interface RiskSummaryProps {
  metrics?: DemoRiskMetricItem[];
  isLive?: boolean;
  isLoading?: boolean;
  onOpenModelModal?: () => void;
  className?: string;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({
  metrics = DEFAULT_DEMO_RISK_METRICS,
  isLive = false,
  isLoading = false,
  onOpenModelModal,
  className = "",
}) => {
  return (
    <section
      className={`bg-[#111827] border border-[#1e293b] rounded p-4 sm:p-5 ${className}`}
      aria-label="Risk Summary Metrics"
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Risk Summary
          </h3>
          <p className="text-[11px] text-slate-500">
            Multi-variable vulnerability assessment
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenModelModal && (
            <button
              type="button"
              onClick={onOpenModelModal}
              className="text-[10px] font-mono px-2.5 py-1 rounded border bg-[#0a0e17] text-slate-300 border-slate-700 hover:border-slate-500 cursor-pointer"
              title="View transparent scoring methodology"
            >
              Scoring Model
            </button>
          )}
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            isLive
              ? "bg-green-900/40 text-green-400 border-green-700"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}>
            {isLive ? "API CONNECTED" : "DEMO DATA"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-500 py-6 text-center">Loading risk data...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {metrics.map((metric) => {
            const colors = getLevelColor(metric.level);
            return (
              <div
                key={metric.id}
                className={`bg-[#0a0e17] border ${colors.border} rounded p-3 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{metric.title}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${colors.badge}`}>
                    {metric.level}
                  </span>
                </div>
                <div className="mb-1">
                  <span className={`text-xl font-bold ${colors.text}`}>{metric.value}</span>
                  <span className="text-xs text-slate-500 ml-1">{metric.unit}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-sm h-1 mb-1.5">
                  <div
                    className={`${colors.bg} h-1 rounded-sm`}
                    style={{ width: `${Math.min(100, metric.progress)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{metric.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
