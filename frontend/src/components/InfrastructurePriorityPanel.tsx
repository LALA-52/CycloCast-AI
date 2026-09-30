"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Zap,
  Route,
  ShieldCheck,
  CheckCircle2,
  Search,
  Database,
  Layers,
} from "lucide-react";

export type InfrastructureType =
  | "Hospital"
  | "Bridge"
  | "Power station"
  | "Road"
  | "Emergency shelter";

export type PriorityLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export interface InfrastructureItem {
  id: string;
  name: string;
  type: InfrastructureType;
  riskScore: number;
  priority: PriorityLevel;
  recommendedAction: string;
  location?: string;
  populationServed?: string;
}

// Local DEMO dataset including all 5 required examples
export const DEFAULT_DEMO_INFRASTRUCTURE: InfrastructureItem[] = [
  {
    id: "infra-1",
    name: "District General Hospital Puri",
    type: "Hospital",
    riskScore: 92,
    priority: "CRITICAL",
    recommendedAction:
      "Deploy auxiliary fuel generators, relocate ICU to level 2, pre-stage water pumps and emergency surgical oxygen.",
    location: "Puri Coastal Belt",
    populationServed: "450,000",
  },
  {
    id: "infra-2",
    name: "Mahanadi Estuary Lifeline Bridge",
    type: "Bridge",
    riskScore: 88,
    priority: "CRITICAL",
    recommendedAction:
      "Restrict heavy freight transport immediately, activate pier scour telemetry, and stage emergency response engineering teams.",
    location: "NH-16 Coastal Crossing",
    populationServed: "320,000 daily transit",
  },
  {
    id: "infra-3",
    name: "Paradip Coastal 400kV Substation",
    type: "Power station",
    riskScore: 81,
    priority: "HIGH",
    recommendedAction:
      "De-energize exposed low-elevation busbars, secure temporary anti-surge barriers, and pre-position line restoration crews.",
    location: "Paradip Industrial Zone",
    populationServed: "680,000",
  },
  {
    id: "infra-4",
    name: "State Highway 9A Coastal Corridor",
    type: "Road",
    riskScore: 74,
    priority: "HIGH",
    recommendedAction:
      "Stage heavy excavation machinery for storm-debris clearing, establish tidal breach diversions via bypass B-4.",
    location: "Astaranga Coastal Sector",
    populationServed: "180,000 commuters",
  },
  {
    id: "infra-5",
    name: "Chandipur Multi-Purpose Cyclone Shelter",
    type: "Emergency shelter",
    riskScore: 46,
    priority: "MODERATE",
    recommendedAction:
      "Verify potable drinking water reserves, test rooftop solar backup, and prepare secondary bedding for incoming evacuees.",
    location: "Chandipur Sector 3",
    populationServed: "3,500 evacuee capacity",
  },
];

export interface InfrastructurePriorityPanelProps {
  items?: InfrastructureItem[];
  className?: string;
  onSelectItem?: (item: InfrastructureItem) => void;
  selectedId?: string;
}

const PRIORITY_STYLES: Record<
  PriorityLevel,
  {
    badge: string;
    scoreColor: string;
    progressBar: string;
    borderAccent: string;
  }
> = {
  CRITICAL: {
    badge: "bg-rose-950/90 text-rose-200 border-rose-700 animate-pulse",
    scoreColor: "text-rose-400",
    progressBar: "bg-rose-500",
    borderAccent: "border-rose-500/40",
  },
  HIGH: {
    badge: "bg-orange-950/80 text-orange-300 border-orange-800",
    scoreColor: "text-orange-400",
    progressBar: "bg-orange-500",
    borderAccent: "border-orange-500/30",
  },
  MODERATE: {
    badge: "bg-amber-950/80 text-amber-300 border-amber-800",
    scoreColor: "text-amber-400",
    progressBar: "bg-amber-500",
    borderAccent: "border-amber-500/30",
  },
  LOW: {
    badge: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
    scoreColor: "text-emerald-400",
    progressBar: "bg-emerald-500",
    borderAccent: "border-emerald-500/30",
  },
};

const getTypeIcon = (type: InfrastructureType) => {
  switch (type) {
    case "Hospital":
      return <Building2 className="w-3.5 h-3.5 text-rose-400" />;
    case "Bridge":
      return <Layers className="w-3.5 h-3.5 text-sky-400" />;
    case "Power station":
      return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    case "Road":
      return <Route className="w-3.5 h-3.5 text-indigo-400" />;
    case "Emergency shelter":
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    default:
      return <Building2 className="w-3.5 h-3.5 text-slate-400" />;
  }
};

export const InfrastructurePriorityPanel: React.FC<InfrastructurePriorityPanelProps> = ({
  items = DEFAULT_DEMO_INFRASTRUCTURE,
  className = "",
  onSelectItem,
  selectedId,
}) => {
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = selectedType === "ALL" || item.type === selectedType;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recommendedAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [items, selectedType, searchQuery]);

  const typeFilterOptions = ["ALL", "Hospital", "Bridge", "Power station", "Road", "Emergency shelter"];

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col backdrop-blur-sm ${className}`}
      aria-label="Infrastructure Priority Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 p-2 rounded-xl">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Infrastructure Priority Panel
            </h3>
            <p className="text-xs text-slate-400">
              Ranked critical facilities by vulnerability & impact
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            <Database className="w-2.5 h-2.5" />
            DEMO
          </span>
          <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg">
            {filteredItems.length} Assets
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2 mb-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search asset, type, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/60 transition shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
          {typeFilterOptions.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition ${
                selectedType === type
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {type === "ALL" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Asset Cards List */}
      <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No infrastructure assets match the filter.
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const styles = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.LOW;
            const isSelected = selectedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem?.(item)}
                className={`p-3.5 rounded-xl border transition-all ${
                  onSelectItem ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "bg-slate-800/95 border-rose-400 ring-2 ring-rose-500/30 shadow-lg"
                    : `bg-slate-950/60 ${styles.borderAccent} hover:bg-slate-900/80`
                }`}
              >
                {/* Header Row: Rank, Type Badge, Priority, and Score */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      #{index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300">
                      {getTypeIcon(item.type)}
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${styles.badge}`}
                    >
                      {item.priority}
                    </span>
                    <span
                      className={`text-xs font-black font-mono px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700/80 ${styles.scoreColor}`}
                    >
                      {item.riskScore} <span className="text-[9px] text-slate-400">/ 100</span>
                    </span>
                  </div>
                </div>

                {/* Infrastructure Name */}
                <h4 className="text-xs font-bold text-white mt-2">
                  {item.name}
                </h4>

                {/* Risk Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${styles.progressBar}`}
                    style={{ width: `${Math.min(100, item.riskScore)}%` }}
                  />
                </div>

                {/* Recommended Action Box */}
                <div className="mt-2.5 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    Recommended Action
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {item.recommendedAction}
                  </p>
                </div>

                {/* Metadata Footer */}
                {(item.location || item.populationServed) && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    {item.location && <span>Zone: <b className="text-slate-300">{item.location}</b></span>}
                    {item.populationServed && (
                      <span>Coverage: <b className="text-slate-300">{item.populationServed}</b></span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const InfrastructureList = InfrastructurePriorityPanel;
