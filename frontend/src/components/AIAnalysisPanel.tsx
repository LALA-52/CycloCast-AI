"use client";

import React, { useState } from "react";
import { apiService } from "@/services/api";
import { GeminiDirectAnalysis } from "@/types";

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

export const DEFAULT_DEMO_AI_ANALYSIS: AIAnalysisData = {
  impactSummary: {
    executive:
      "Heavy rainfall and storm-surge exposure create elevated flood risk across low-lying coastal infrastructure. The highest-priority assets are Coastal Bridge A, Coastal General Hospital, and East Coastal Power Station because their exposure combines with high operational criticality.",
    vulnerabilityRationale:
      "Cross-referencing storm surge profiles with regional elevations reveals acute vulnerabilities in low-lying infrastructure. Facilities within 35 km of the projected eyewall face compounding risks from gale-force structural loading and tidal breaches.",
  },
  keyRisks: [
    {
      id: "risk-1",
      title: "Coastal flooding",
      level: "CRITICAL",
      driver: "Storm surge of 2.8m combined with 280mm rainfall creates severe inundation risk in low-elevation zones.",
      mitigation: "Deploy flood barriers at critical low-elevation facilities.",
    },
    {
      id: "risk-2",
      title: "Bridge accessibility disruption",
      level: "CRITICAL",
      driver: "Coastal Bridge A and B face hydrodynamic load stress and potential scour damage.",
      mitigation: "Restrict access, inspect alternate routes, deploy monitoring sensors.",
    },
    {
      id: "risk-3",
      title: "Hospital service disruption",
      level: "HIGH",
      driver: "Ground-level systems and backup generators at risk of water ingress.",
      mitigation: "Stage backup power, prepare patient transfer protocols.",
    },
    {
      id: "risk-4",
      title: "Power infrastructure exposure",
      level: "HIGH",
      driver: "East Coastal Power Station is within surge exposure zone with limited elevation margin.",
      mitigation: "Deploy flood protection and prepare controlled isolation protocols.",
    },
  ],
  recommendedActions: [
    {
      phase: "Phase 1",
      timeframe: "T - 12h",
      badge: "Readiness",
      actions: [
        "1. Inspect critical bridges and restrict heavy transport",
        "2. Prepare hospital backup power and patient transfer plans",
        "3. Identify alternate road access for evacuation corridors",
      ],
    },
    {
      phase: "Phase 2",
      timeframe: "T - 6h",
      badge: "Protective",
      actions: [
        "1. Protect exposed power infrastructure with flood barriers",
        "2. Enforce coastal road transit restrictions",
        "3. Verify emergency shelter readiness and supply stocks",
      ],
    },
    {
      phase: "Phase 3",
      timeframe: "Landfall",
      badge: "Crisis",
      actions: [
        "1. Issue shelter-in-place directives",
        "2. Monitor structural telemetry on bridges and power stations",
        "3. Maintain communication with incident coordination",
      ],
    },
    {
      phase: "Phase 4",
      timeframe: "T + 6h",
      badge: "Recovery",
      actions: [
        "1. Deploy clearance teams on coastal highway sections",
        "2. Conduct structural assessment of bridges",
        "3. Restore power grid and distribute emergency supplies",
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
  loading: externalLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "risks" | "actions">("summary");
  const [liveData, setLiveData] = useState<GeminiDirectAnalysis | null>(null);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = externalLoading || internalLoading;

  const handleAnalyzeImpact = async () => {
    setInternalLoading(true);
    setError(null);
    try {
      const result = await apiService.analyzeGeminiImpact();
      setLiveData(result);
    } catch (err: any) {
      console.error("Gemini analysis failed:", err);
      setError(err?.message || "Failed to communicate with analysis engine.");
    } finally {
      setInternalLoading(false);
    }
  };

  const keyRisksCount = liveData
    ? (liveData.key_risks || liveData.keyRisks || []).length
    : data.keyRisks.length;

  const actionsCount = liveData
    ? (liveData.recommended_actions || liveData.recommendedActions || []).length
    : data.recommendedActions.length;

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "CRITICAL": return "bg-red-900/80 text-red-300 border-red-700";
      case "HIGH": return "bg-orange-900/80 text-orange-300 border-orange-700";
      case "MODERATE": return "bg-amber-900/80 text-amber-300 border-amber-700";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <section
      className={`bg-[#111827] border border-[#1e293b] rounded p-4 sm:p-5 relative space-y-4 ${className}`}
      aria-label="AI Impact Analysis"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1e293b] pb-3 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              AI Impact Analysis
            </h3>
            {liveData ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-700 uppercase font-mono">
                GEMINI LIVE ({liveData.model || "gemini"})
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                DEMO CONTENT
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {liveData
              ? "Live multi-hazard analysis generated by Gemini"
              : "Simulated disaster assessment and infrastructure recommendations"}
          </p>
        </div>

        {/* Analyze Button */}
        <button
          type="button"
          onClick={handleAnalyzeImpact}
          disabled={isLoading}
          className={`px-3.5 py-1.5 rounded text-xs font-semibold border ${
            isLoading
              ? "bg-slate-800 text-slate-400 border-slate-700 cursor-wait"
              : "bg-[#0a0e17] text-slate-200 border-slate-600 cursor-pointer"
          }`}
          title={isLoading ? "Analyzing..." : "Analyze Impact with Gemini"}
        >
          {isLoading ? "Analyzing..." : liveData ? "Re-analyze" : "Analyze Impact"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-950/30 border border-red-800 rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="text-red-300">
            <span className="font-bold">Analysis Error:</span> {error}
          </div>
          <button
            type="button"
            onClick={handleAnalyzeImpact}
            disabled={isLoading}
            className="px-3 py-1 bg-red-900/40 text-red-300 border border-red-700 rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-6 text-center text-xs text-slate-500">
          Processing analysis with Gemini...
        </div>
      )}

      {/* Tab Navigation */}
      {!isLoading && (
        <>
          <div className="flex items-center gap-1 border-b border-[#1e293b]">
            {([
              { id: "summary" as const, label: "Summary" },
              { id: "risks" as const, label: `Key Risks (${keyRisksCount})` },
              { id: "actions" as const, label: `Actions (${actionsCount})` },
            ]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-slate-200 border-slate-400"
                    : "text-slate-500 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="space-y-3">
              {liveData ? (
                <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Impact Summary</h4>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {liveData.impact_summary || liveData.impactSummary}
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Executive Assessment</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{data.impactSummary.executive}</p>
                  </div>
                  <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Vulnerability Rationale</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{data.impactSummary.vulnerabilityRationale}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Risks Tab */}
          {activeTab === "risks" && (
            <div className="space-y-2">
              {liveData ? (
                (liveData.key_risks || liveData.keyRisks || []).map((risk: string, i: number) => (
                  <div key={i} className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-xs text-slate-300">{risk}</p>
                    </div>
                  </div>
                ))
              ) : (
                data.keyRisks.map((risk) => (
                  <div key={risk.id} className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200">{risk.title}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getLevelBadge(risk.level)}`}>
                        {risk.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1">{risk.driver}</p>
                    <p className="text-[11px] text-slate-400">Action: {risk.mitigation}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === "actions" && (
            <div className="space-y-3">
              {liveData ? (
                (liveData.recommended_actions || liveData.recommendedActions || []).map((action: string, i: number) => (
                  <div key={i} className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-xs text-slate-300">{action}</p>
                    </div>
                  </div>
                ))
              ) : (
                data.recommendedActions.map((phase) => (
                  <div key={phase.phase} className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-200">{phase.phase}</span>
                      <span className="text-[10px] font-mono text-slate-500">{phase.timeframe}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {phase.badge}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {phase.actions.map((action, i) => (
                        <p key={i} className="text-[11px] text-slate-400 pl-2">{action}</p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};
