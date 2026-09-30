"use client";

import React, { useState } from "react";

export interface InfrastructureItem {
  id: string;
  name: string;
  type: "Hospital" | "Bridge" | "Power station" | "Road" | "Emergency shelter";
  riskScore: number;
  priority: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  recommendedAction: string;
  location?: string;
  populationServed?: string;
}

const getPriorityStyle = (priority: InfrastructureItem["priority"]) => {
  switch (priority) {
    case "CRITICAL": return { border: "border-red-800", badge: "bg-red-900/80 text-red-300 border-red-700", text: "text-red-400" };
    case "HIGH": return { border: "border-orange-800", badge: "bg-orange-900/80 text-orange-300 border-orange-700", text: "text-orange-400" };
    case "MODERATE": return { border: "border-amber-800", badge: "bg-amber-900/80 text-amber-300 border-amber-700", text: "text-amber-400" };
    case "LOW": return { border: "border-green-800", badge: "bg-green-900/80 text-green-300 border-green-700", text: "text-green-400" };
  }
};

const getTypeLabel = (type: InfrastructureItem["type"]) => {
  switch (type) {
    case "Hospital": return "HOSP";
    case "Bridge": return "BRDG";
    case "Power station": return "PWR";
    case "Road": return "ROAD";
    case "Emergency shelter": return "SHLT";
  }
};

export const DEFAULT_DEMO_INFRASTRUCTURE: InfrastructureItem[] = [
  {
    id: "infra-1",
    name: "Coastal Bridge A",
    type: "Bridge",
    riskScore: 92,
    priority: "CRITICAL",
    recommendedAction: "Restrict access and inspect alternate routes",
    location: "Coastal zone",
    populationServed: "320,000 served",
  },
  {
    id: "infra-2",
    name: "Coastal General Hospital",
    type: "Hospital",
    riskScore: 87,
    priority: "CRITICAL",
    recommendedAction: "Prepare emergency power and evacuation backup",
    location: "Coastal zone",
    populationServed: "95,000 served",
  },
  {
    id: "infra-3",
    name: "East Coastal Power Station",
    type: "Power station",
    riskScore: 81,
    priority: "CRITICAL",
    recommendedAction: "Deploy flood protection and emergency inspection team",
    location: "East sector",
    populationServed: "210,000 served",
  },
  {
    id: "infra-4",
    name: "Coastal Highway Section A",
    type: "Road",
    riskScore: 78,
    priority: "HIGH",
    recommendedAction: "Monitor flooding and prepare alternate route",
    location: "Coastal corridor",
    populationServed: "165,000 served",
  },
  {
    id: "infra-5",
    name: "Relief Shelter A",
    type: "Emergency shelter",
    riskScore: 43,
    priority: "MODERATE",
    recommendedAction: "Verify capacity, supplies, and accessibility",
    location: "Inland zone",
    populationServed: "4,500 capacity",
  },
  {
    id: "infra-6",
    name: "Coastal Bridge B",
    type: "Bridge",
    riskScore: 74,
    priority: "HIGH",
    recommendedAction: "Increase monitoring",
    location: "South coastal zone",
    populationServed: "180,000 served",
  },
  {
    id: "infra-7",
    name: "District Hospital B",
    type: "Hospital",
    riskScore: 69,
    priority: "MODERATE",
    recommendedAction: "Prepare contingency evacuation capacity",
    location: "District inland",
    populationServed: "120,000 served",
  },
];

export interface InfrastructurePriorityPanelProps {
  items?: InfrastructureItem[];
  isLive?: boolean;
  isLoading?: boolean;
  selectedId?: string;
  onSelectItem?: (item: InfrastructureItem) => void;
  className?: string;
}

export const InfrastructurePriorityPanel: React.FC<InfrastructurePriorityPanelProps> = ({
  items = DEFAULT_DEMO_INFRASTRUCTURE,
  isLive = false,
  isLoading = false,
  selectedId,
  onSelectItem,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <section
      className={`bg-[#111827] border border-[#1e293b] rounded p-4 sm:p-5 flex flex-col ${className}`}
      aria-label="Infrastructure Priority Panel"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Infrastructure Priority
          </h3>
          <p className="text-[11px] text-slate-500">
            Ranked by vulnerability and impact
          </p>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
          isLive
            ? "bg-green-900/40 text-green-400 border-green-700"
            : "bg-slate-800 text-slate-400 border-slate-700"
        }`}>
          {isLive ? "LIVE" : "DEMO"}
        </span>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Filter assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0e17] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600"
        />
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-500 py-6 text-center">Loading infrastructure data...</div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[420px]">
          {sorted.map((item, index) => {
            const styles = getPriorityStyle(item.priority);
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem?.(item)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  isSelected
                    ? `bg-[#0a0e17] ${styles.border} border-l-2`
                    : "bg-[#0a0e17] border-[#1e293b]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-[#1e293b]">
                      {getTypeLabel(item.type)}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${styles.badge}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Risk: <span className={`font-bold ${styles.text}`}>{item.riskScore}/100</span>
                  </span>
                  {item.populationServed && (
                    <span className="text-[10px] text-slate-500">{item.populationServed}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 truncate">
                  {item.recommendedAction}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
