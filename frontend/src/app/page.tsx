"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CycloneOverview } from "@/components/CycloneOverview";
import {
  RiskSummary,
  DEFAULT_DEMO_RISK_METRICS,
  DemoRiskMetricItem,
} from "@/components/RiskSummaryMetrics";
import { InteractiveMap } from "@/components/InteractiveMap";
import {
  InfrastructurePriorityPanel,
  DEFAULT_DEMO_INFRASTRUCTURE,
  InfrastructureItem,
} from "@/components/InfrastructurePriorityPanel";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { EmergencyAdvisorySection } from "@/components/EmergencyAdvisorySection";
import { apiService } from "@/services/api";
import { TransparentRiskModal } from "@/components/TransparentRiskModal";
import { CycloneControlPanel } from "@/components/CycloneControlPanel";
import { DEFAULT_VARUN_CYCLONE } from "@/components/CycloneOverview";
import {
  RiskOverviewSummary,
  InfrastructureRiskAssessment,
  Cyclone,
} from "@/types";

function mapSummaryToMetrics(summary: RiskOverviewSummary): DemoRiskMetricItem[] {
  const overall = summary.overall_risk_score ?? summary.average_risk_score ?? 0;
  const flood = summary.flood_risk_score ?? 0;
  const infra = summary.infrastructure_risk_score ?? 0;
  const evac = summary.evacuation_risk_score ?? 0;
  const critical = summary.critical_count ?? 0;
  const total = summary.total_assets ?? 0;

  const getLevel = (score: number) => {
    if (score <= 30) return "LOW" as const;
    if (score <= 60) return "MODERATE" as const;
    if (score <= 80) return "HIGH" as const;
    return "CRITICAL" as const;
  };

  return [
    {
      id: "overall-risk",
      title: "Overall Risk",
      value: Number(overall.toFixed(1)),
      unit: "/ 100",
      level: getLevel(overall),
      description: "Composite multi-variable vulnerability index",
      detail: summary.model_version || "Transparent 40/30/20/10 weight model",
      progress: Math.min(100, Math.max(0, overall)),
    },
    {
      id: "flood-risk",
      title: "Flood Risk",
      value: Number(flood.toFixed(1)),
      unit: "%",
      level: getLevel(flood),
      description: "Coastal tidal surge and inundation",
      detail: "Peak surge height and elevation model",
      progress: Math.min(100, Math.max(0, flood)),
    },
    {
      id: "infra-risk",
      title: "Infrastructure Risk",
      value: Number(infra.toFixed(1)),
      unit: "%",
      level: getLevel(infra),
      description: "Grid substations and structural load",
      detail: `${total} regional lifeline assets evaluated`,
      progress: Math.min(100, Math.max(0, infra)),
    },
    {
      id: "evac-risk",
      title: "Evacuation Risk",
      value: Number(evac.toFixed(1)),
      unit: "%",
      level: getLevel(evac),
      description: "Transit route cuts and corridor chokepoints",
      detail: "Roadways and coastal bridges under watch",
      progress: Math.min(100, Math.max(0, evac)),
    },
    {
      id: "critical-assets",
      title: "Critical Assets",
      value: critical,
      unit: `of ${total}`,
      level: critical > 0 ? "CRITICAL" : "LOW",
      description: "Facilities requiring immediate reinforcement",
      detail: `${critical} high-vulnerability facilities in red zone`,
      progress: total > 0 ? Math.round((critical / total) * 100) : 0,
    },
  ];
}

function mapAssessmentToItem(a: InfrastructureRiskAssessment): InfrastructureItem {
  const rawType = a.infrastructure.type || "";
  let normalizedType: InfrastructureItem["type"] = "Hospital";
  const lower = rawType.toLowerCase();
  if (lower.includes("hospital")) normalizedType = "Hospital";
  else if (lower.includes("bridge")) normalizedType = "Bridge";
  else if (lower.includes("power")) normalizedType = "Power station";
  else if (lower.includes("road")) normalizedType = "Road";
  else if (lower.includes("shelter")) normalizedType = "Emergency shelter";

  return {
    id: a.infrastructure.id,
    name: a.infrastructure.name,
    type: normalizedType,
    riskScore: Math.round(a.risk_score),
    priority: a.risk_category as InfrastructureItem["priority"],
    recommendedAction:
      a.recommended_mitigation || a.primary_failure_mode || "Continuous structural monitoring.",
    location: `${a.distance_to_eye_km.toFixed(1)} km to eye, Elev: ${a.infrastructure.elevation}m`,
    populationServed: a.infrastructure.population_served
      ? `${a.infrastructure.population_served.toLocaleString()} served`
      : undefined,
  };
}

export default function DashboardShellPage() {
  const [activeNav, setActiveNav] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [cycloneData, setCycloneData] = useState<Cyclone>(DEFAULT_VARUN_CYCLONE);

  // API State Management
  const [loading, setLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<DemoRiskMetricItem[]>(DEFAULT_DEMO_RISK_METRICS);
  const [infraItems, setInfraItems] = useState<InfrastructureItem[]>(DEFAULT_DEMO_INFRASTRUCTURE);
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>("infra-1");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiService.getRiskOverviewWithStatus();
      if (result.isLive && result.data) {
        setRiskMetrics(mapSummaryToMetrics(result.data));
        if (result.data.highest_risk_infrastructure && result.data.highest_risk_infrastructure.length > 0) {
          setInfraItems(result.data.highest_risk_infrastructure.map(mapAssessmentToItem));
        }
        setIsLive(true);
        setError(null);
      } else {
        setIsLive(false);
        setRiskMetrics(DEFAULT_DEMO_RISK_METRICS);
        setInfraItems(DEFAULT_DEMO_INFRASTRUCTURE);
        setError(
          result.error || "FastAPI backend unreachable. Operating in DEMO offline fallback mode."
        );
      }
    } catch (err: any) {
      setIsLive(false);
      setRiskMetrics(DEFAULT_DEMO_RISK_METRICS);
      setInfraItems(DEFAULT_DEMO_INFRASTRUCTURE);
      setError(err?.message || "Failed to communicate with FastAPI backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "map", label: "Tactical Map" },
    { id: "risk", label: "Risk Analytics" },
    { id: "infrastructure", label: "Infrastructure" },
    { id: "ai-advisory", label: "AI Intelligence" },
    { id: "emergency", label: "Emergency Protocols" },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleUpdateCycloneParams = (updates: Partial<Cyclone>) => {
    setCycloneData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-200 flex flex-col font-sans">
      {/* Transparent Risk Model Modal */}
      <TransparentRiskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Top Navigation and Status Bar */}
      <header className="bg-[#111827] border-b border-[#1e293b] sticky top-0 z-50 px-4 sm:px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-red-900/40 border border-red-700 p-2 rounded flex items-center justify-center">
              <span className="text-red-400 font-bold text-sm font-mono">CC</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base font-bold tracking-wider text-white uppercase">
                  CycloCast AI
                </h1>
                <span className="text-[10px] font-bold tracking-wider bg-red-950/60 text-red-300 border border-red-800 px-2 py-0.5 rounded uppercase font-mono">
                  Disaster Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cyclone Impact and Infrastructure Vulnerability Assessment
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-3">
            {/* System Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono rounded border bg-slate-800 border-slate-700">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-amber-400"}`}></span>
              <span className="text-slate-400">
                {loading ? "Connecting..." : isLive ? "API Connected" : "DEMO MODE"}
              </span>
            </div>

            {/* Data Source */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono rounded border bg-slate-800 border-slate-700">
              <span className="text-slate-400">
                {isLive ? "FastAPI Live" : "Offline Fallback"}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              title="Refresh API Data"
              className={`px-2.5 py-1 rounded text-[10px] font-mono border ${
                loading
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-wait"
                  : "bg-[#0a0e17] text-slate-400 border-slate-700 cursor-pointer hover:border-slate-500"
              }`}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Page Navigation Tabs */}
        <div className="max-w-screen-2xl mx-auto mt-3 pt-2 border-t border-[#1e293b] flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap border cursor-pointer transition-colors ${
                  isActive
                    ? "bg-slate-800 text-slate-200 border-slate-600"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Error / Fallback Alert Banner */}
        {error && !isLive && (
          <div className="bg-amber-950/30 border border-amber-800 rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="text-amber-300">
              <span className="font-bold">Offline Fallback Active:</span>{" "}
              <span className="text-amber-200/80">{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-3 py-1 bg-amber-900/30 text-amber-300 border border-amber-700 rounded text-xs font-semibold self-start sm:self-auto cursor-pointer"
            >
              {loading ? "Retrying..." : "Retry API Connection"}
            </button>
          </div>
        )}

        {/* Section 1: Cyclone Threat Overview & Tuning */}
        <div id="overview" className="space-y-3 scroll-mt-24">
          <CycloneOverview
            cyclone={cycloneData}
            showControls={showControls}
            onToggleControls={() => setShowControls(!showControls)}
          />

          {showControls && (
            <CycloneControlPanel
              cyclone={cycloneData}
              onUpdateParams={handleUpdateCycloneParams}
              onReset={() => setCycloneData(DEFAULT_VARUN_CYCLONE)}
            />
          )}
        </div>

        {/* Section 2: Risk Summary Metrics */}
        <div id="risk" className="scroll-mt-24">
          <RiskSummary
            metrics={riskMetrics}
            isLive={isLive}
            isLoading={loading}
            onOpenModelModal={() => setIsModalOpen(true)}
          />
        </div>

        {/* Section 3 and 4: Map and Infrastructure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Tactical Geospatial Threat Map */}
          <div id="map" className="lg:col-span-7 xl:col-span-8 scroll-mt-24">
            <InteractiveMap
              selectedAssetId={selectedAssetId}
              onSelectAsset={(id) => setSelectedAssetId(id)}
            />
          </div>

          {/* Infrastructure Priority Panel */}
          <div id="infrastructure" className="lg:col-span-5 xl:col-span-4 scroll-mt-24">
            <InfrastructurePriorityPanel
              items={infraItems}
              isLive={isLive}
              isLoading={loading}
              selectedId={selectedAssetId}
              onSelectItem={(item) => setSelectedAssetId(item.id)}
            />
          </div>
        </div>

        {/* Section 5: AI Impact Analysis */}
        <div id="ai-advisory" className="scroll-mt-24">
          <AIAnalysisPanel />
        </div>

        {/* Section 6: Emergency Advisory */}
        <div id="emergency" className="scroll-mt-24">
          <EmergencyAdvisorySection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#111827] text-slate-500 text-xs py-3 px-6 mt-auto">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-400">CYCLOCAST AI</span> - Disaster Intelligence System
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {isLive ? (
              <span className="text-green-400 flex items-center gap-1.5 sm:inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                FastAPI Backend Connected
              </span>
            ) : (
              <span>Calibrated DEMO Scenario</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
