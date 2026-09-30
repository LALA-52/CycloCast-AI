"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileText,
} from "lucide-react";

export interface AIAnalysisData {
  impactSummary: {
    executive: string;
    vulnerabilityRationale: string;
  };
  keyRisks: Array<{
    id: string;
    title: string;
    level: "CRITICAL" | "HIGH" | "MODERATE";
    driver: string;
    mitigation: string;
  }>;
  recommendedActions: Array<{
    phase: string;
    timeframe: string;
    badge: string;
    actions: string[];
  }>;
}

// Local static DEMO content
export const DEFAULT_DEMO_AI_ANALYSIS: AIAnalysisData = {
  impactSummary: {
    executive:
      "Cyclone DANA is maintaining sustained winds of 125 km/h (Category 3) along the north-west Bay of Bengal. Meteorological modeling projects a dangerous coastal storm surge of 2.4 meters and 280 mm cumulative rainfall. Severe localized flooding is expected along estuary zones within the next 12 to 18 hours.",
    vulnerabilityRationale:
      "Cross-referencing storm surge inundation profiles with regional geospatial elevations reveals acute vulnerabilities in low-lying infrastructure. Lifeline facilities within 35 km of the projected eyewall face compounding risks from gale-force structural loading and tidal estuary breaches.",
  },
  keyRisks: [
    {
      id: "risk-1",
      title: "Substation Surge Inundation & Blackout",
      level: "CRITICAL",
      driver: "Paradip 400kV Substation busbars sit below the 2.4m projected peak surge line.",
      mitigation: "De-energize low-elevation busbars; deploy modular flood deflection barriers.",
    },
    {
      id: "risk-2",
      title: "Lifeline Corridor Hydrodynamic Scour",
      level: "CRITICAL",
      driver: "Mahanadi Estuary Bridge pier foundation exposed to high tidal flow velocities.",
      mitigation: "Halt heavy transport freight; deploy acoustic scour sensor arrays.",
    },
    {
      id: "risk-3",
      title: "Hospital Emergency Isolation & Power Cut",
      level: "HIGH",
      driver: "Ground-level ICU oxygen distribution and backup generators at risk of localized water logging.",
      mitigation: "Transfer critical care patients to upper wards; stage submersible dewatering pumps.",
    },
    {
      id: "risk-4",
      title: "Arterial Transit Chokepoints",
      level: "HIGH",
      driver: "State Highway 9A low-lying coastal cuts subject to wave overwash and fallen tree blockages.",
      mitigation: "Pre-position wheel loaders and clearing crews at Sector 4 bypass depot.",
    },
  ],
  recommendedActions: [
    {
      phase: "Phase 1",
      timeframe: "T - 12h (Readiness)",
      badge: "Pre-Landfall",
      actions: [
        "Issue mandatory evacuation advisory for populations within 1.5 km of coastal estuaries.",
        "Relocate mobile emergency communications units to high-elevation terrain (>15m ASL).",
        "Test emergency backup generators at District General Hospital and prime water pumps.",
      ],
    },
    {
      phase: "Phase 2",
      timeframe: "T - 6h (Lockdown)",
      badge: "Protective",
      actions: [
        "Enforce complete transit curfew on coastal highway bridges and low-elevation roads.",
        "Initiate controlled de-energization of grid circuits in active inundation zones.",
        "Seal all designated cyclone shelters and verify independent solar battery storage.",
      ],
    },
    {
      phase: "Phase 3",
      timeframe: "Landfall (Shelter)",
      badge: "Crisis",
      actions: [
        "Full operational stand-down of non-armored emergency vehicles during maximum winds.",
        "Continuous remote telemetry monitoring of river gauge levels and bridge pier sensors.",
        "Maintain direct satellite communication links between State Emergency Ops and incident commanders.",
      ],
    },
    {
      phase: "Phase 4",
      timeframe: "T + 6h (Relief)",
      badge: "Recovery",
      actions: [
        "Dispatch route-clearing task forces along SH-9A to restore emergency medical access.",
        "Perform rapid structural integrity assessments before re-energizing regional power grids.",
        "Distribute pre-staged clean drinking water and medical rations from Chandipur shelter.",
      ],
    },
  ],
};

export interface AIAnalysisPanelProps {
  data?: AIAnalysisData;
  className?: string;
  loading?: boolean;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  data = DEFAULT_DEMO_AI_ANALYSIS,
  className = "",
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "risks" | "actions">("summary");

  return (
    <section
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm space-y-5 ${className}`}
      aria-label="AI Situational Intelligence & Impact Analysis"
    >
      {/* Top decorative gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4 gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-cyan-500/15 border border-cyan-500/30 p-2.5 rounded-xl text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Situational Intelligence & Impact Analysis
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                <Database className="w-2.5 h-2.5" />
                DEMO CONTENT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic disaster assessment and multi-vector infrastructure recommendations
            </p>
          </div>
        </div>

        {/* Action Button: Disabled / Placeholder "Analyze Impact" */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            disabled
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-75 text-xs font-semibold shadow-inner transition select-none"
            title="Analyze Impact (AI engine in standby / disconnected)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400/80" />
            <span>Analyze Impact</span>
            <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              Standby
            </span>
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs: Impact Summary | Key Risks | Recommended Actions */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto text-xs font-semibold no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "summary"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>1. Impact Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("risks")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "risks"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>2. Key Risks ({data.keyRisks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("actions")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "actions"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>3. Recommended Actions</span>
        </button>
      </div>

      {/* Tab 1: Impact Summary */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          {/* Executive Meteorological Assessment */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Meteorological Impact Synthesis
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {data.impactSummary.executive}
            </p>
          </div>

          {/* Infrastructure Vulnerability Rationale */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              Infrastructure Vulnerability Rationale
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.impactSummary.vulnerabilityRationale}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Key Risks */}
      {activeTab === "risks" && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Critical Vulnerability Vectors & Threat Drivers
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.keyRisks.map((risk) => (
              <div
                key={risk.id}
                className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-white text-xs truncate">
                    {risk.title}
                  </h4>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                      risk.level === "CRITICAL"
                        ? "bg-rose-950/90 text-rose-300 border-rose-800"
                        : "bg-amber-950/90 text-amber-300 border-amber-800"
                    }`}
                  >
                    {risk.level}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-400 font-medium">Risk Driver: </strong>
                  {risk.driver}
                </p>

                <div className="text-[11px] text-emerald-400 pt-2 border-t border-slate-800 font-medium flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-300">Action: </strong>
                    {risk.mitigation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Recommended Actions */}
      {activeTab === "actions" && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Time-Phased Operational Directives
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {data.recommendedActions.map((plan, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>{plan.phase}</span>
                    <span className="text-[9px] font-semibold bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {plan.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1 mb-2">
                    {plan.timeframe}
                  </div>
                  <ul className="space-y-2 text-slate-300 text-[11px]">
                    {plan.actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">&bull;</span>
                        <span className="leading-snug">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export const GeminiIntelligencePanel = AIAnalysisPanel;
