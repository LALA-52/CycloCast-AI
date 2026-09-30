"use client";

import React from "react";
import {
  AlertTriangle,
  Waves,
  Building2,
  Route,
  Users,
  ShieldAlert,
  Database,
} from "lucide-react";
import { RiskCard, RiskLevel } from "./RiskCard";

export interface DemoRiskMetricItem {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  level: RiskLevel;
  icon: typeof AlertTriangle;
  description: string;
  detail: string;
  progress: number;
}

// Static DEMO risk summary dataset representing calibrated tactical scenario
export const DEFAULT_DEMO_RISK_METRICS: DemoRiskMetricItem[] = [
  {
    id: "overall-risk",
    title: "Overall Risk",
    value: 78.4,
    unit: "/ 100",
    level: "HIGH",
    icon: AlertTriangle,
    description: "Composite multi-variable vulnerability index",
    detail: "Transparent 40/30/20/10 weight model",
    progress: 78.4,
  },
  {
    id: "flood-risk",
    title: "Flood Risk",
    value: 84.2,
    unit: "%",
    level: "CRITICAL",
    icon: Waves,
    description: "Coastal tidal surge & estuary inundation",
    detail: "Peak surge height 2.4 m expected",
    progress: 84.2,
  },
  {
    id: "infra-risk",
    title: "Infrastructure Risk",
    value: 66.8,
    unit: "%",
    level: "HIGH",
    icon: Building2,
    description: "Grid substations & bridge structural load",
    detail: "12 regional lifeline assets evaluated",
    progress: 66.8,
  },
  {
    id: "evac-risk",
    title: "Evacuation Risk",
    value: 52.5,
    unit: "%",
    level: "MODERATE",
    icon: Route,
    description: "Transit route cuts & corridor chokepoints",
    detail: "SH-9A & coastal bridges under watch",
    progress: 52.5,
  },
  {
    id: "critical-assets",
    title: "Critical Assets",
    value: 3,
    unit: "of 12",
    level: "CRITICAL",
    icon: Users,
    description: "Facilities requiring immediate reinforcement",
    detail: "Hospitals & power substations in red zone",
    progress: 25,
  },
];

export interface RiskSummaryProps {
  metrics?: DemoRiskMetricItem[];
  className?: string;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({
  metrics = DEFAULT_DEMO_RISK_METRICS,
  className = "",
}) => {
  return (
    <section className={`space-y-3 ${className}`} aria-label="Risk Summary Metrics">
      {/* Header bar indicating DEMO dataset and methodology */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1 gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Risk Summary & Impact Metrics
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            <Database className="w-2.5 h-2.5" />
            DEMO SCENARIO
          </span>
          <span className="text-[11px] text-slate-400">
            Pre-computed benchmark values
          </span>
        </div>
      </div>

      {/* 5 Risk Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metrics.map((item) => (
          <RiskCard
            key={item.id}
            title={item.title}
            value={item.value}
            unit={item.unit}
            level={item.level}
            icon={item.icon}
            description={item.description}
            detail={item.detail}
            progress={item.progress}
            isDemo={true}
          />
        ))}
      </div>
    </section>
  );
};

// Re-export alias for compatibility
export const RiskSummaryMetrics = RiskSummary;
export { RiskCard };
