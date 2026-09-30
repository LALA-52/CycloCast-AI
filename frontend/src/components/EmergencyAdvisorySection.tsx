"use client";

import React, { useState } from "react";
import { apiService } from "@/services/api";
import { ResponsePlanResponse, EmergencyAdvisoryResponse } from "@/types";

export const DEMO_ADVISORY_TEXT = `[SIMULATED SCENARIO - AI-GENERATED DECISION SUPPORT]
==========================================================
CYCLOCAST AI - EMERGENCY ADVISORY
SCENARIO: Demo Cyclone Varun (Category 3)
REGION: Bay of Bengal, near coastal Andhra Pradesh
==========================================================

1. CONDITIONS:
   - Sustained Winds: 145 km/h
   - Storm Surge: 2.8 meters
   - Rainfall: 280 mm / 24h

2. ASSESSMENT:
   Simulated cyclone conditions indicate elevated flood and
   infrastructure risk along the coastal zone. Authorities
   should prioritize critical bridge access, hospital continuity,
   power infrastructure protection, and emergency shelter readiness.

3. PRIORITY ACTIONS:
   - Inspect critical bridges
   - Prepare hospital backup power
   - Identify alternate road access
   - Protect exposed power infrastructure
   - Verify emergency shelter readiness

STATUS: SIMULATED DATA - NOT AN OFFICIAL WARNING`;

export const DEMO_RESPONSE_PLAN_DATA = [
  {
    phase: "Phase 1: T - 12h (Readiness)",
    badge: "Pre-Landfall",
    tasks: [
      "1. Restrict heavy transport on Coastal Bridge A",
      "2. Stage backup power at Coastal General Hospital",
      "3. Deploy flood protection at East Coastal Power Station",
    ],
  },
  {
    phase: "Phase 2: T - 6h (Protective Action)",
    badge: "Lockdown",
    tasks: [
      "1. Enforce coastal road restrictions on Highway Section A",
      "2. Verify Relief Shelter A capacity and supplies",
      "3. Prepare controlled isolation at power station",
    ],
  },
  {
    phase: "Phase 3: Landfall (Stand-Down)",
    badge: "Crisis",
    tasks: [
      "1. Shelter-in-place directive for coastal zone",
      "2. Monitor bridge structural telemetry",
      "3. Maintain coordination with incident command",
    ],
  },
  {
    phase: "Phase 4: T + 6h (Recovery)",
    badge: "Recovery",
    tasks: [
      "1. Clear storm debris on coastal highway",
      "2. Conduct structural inspections on bridges",
      "3. Restore power grid and distribute emergency supplies",
    ],
  },
];

export interface EmergencyAdvisorySectionProps {
  className?: string;
}

export const EmergencyAdvisorySection: React.FC<EmergencyAdvisorySectionProps> = ({
  className = "",
}) => {
  const [activeOutput, setActiveOutput] = useState<"none" | "advisory" | "plan">("none");
  const [copied, setCopied] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // Live Response Plan State
  const [planData, setPlanData] = useState<ResponsePlanResponse | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Live Emergency Advisory State
  const [advisoryData, setAdvisoryData] = useState<EmergencyAdvisoryResponse | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryError, setAdvisoryError] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormattedAdvisoryText = (adv: EmergencyAdvisoryResponse): string => {
    return `[AI-GENERATED DECISION SUPPORT - NOT AN OFFICIAL GOVERNMENT WARNING]
==========================================================
${adv.title.toUpperCase()}
DECISION SUPPORT LEVEL: AI-GENERATED
TIMESTAMP: ${adv.timestamp || new Date().toISOString()}
MODEL: ${adv.model || "gemini"}
==========================================================

1. THREAT SUMMARY:
${adv.threat_summary}

2. AFFECTED AREA:
${adv.affected_area}

3. MAJOR HAZARDS:
${adv.major_hazards.map((h, i) => ` ${i + 1}. ${h}`).join("\n")}

4. INFRASTRUCTURE PRIORITIES:
${adv.infrastructure_priorities.map((p, i) => ` ${i + 1}. ${p}`).join("\n")}

5. PREPAREDNESS ACTIONS:
${adv.preparedness_actions.map((a, i) => ` ${i + 1}. ${a}`).join("\n")}

DISCLAIMER:
${adv.disclaimer}
`;
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleGenerateAdvisory = async () => {
    setActiveOutput("advisory");
    setAdvisoryLoading(true);
    setAdvisoryError(null);
    try {
      const result = await apiService.generateEmergencyAdvisory();
      setAdvisoryData(result);
    } catch (err: any) {
      console.error("Advisory generation failed:", err);
      setAdvisoryError(err?.message || "Failed to generate advisory.");
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setActiveOutput("plan");
    setPlanLoading(true);
    setPlanError(null);
    try {
      const result = await apiService.generateResponsePlan();
      setPlanData(result);
    } catch (err: any) {
      console.error("Response plan generation failed:", err);
      setPlanError(err?.message || "Failed to generate response plan.");
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <section
      className={`bg-[#111827] border border-[#1e293b] rounded p-4 sm:p-5 relative space-y-4 ${className}`}
      aria-label="Emergency Advisory and Operations"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1e293b] pb-3 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Emergency Advisory
          </h3>
          <p className="text-[11px] text-slate-500">
            Generate advisory bulletins and operational response directives
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleGenerateAdvisory}
            disabled={advisoryLoading}
            className={`px-3.5 py-1.5 rounded text-xs font-bold border ${
              activeOutput === "advisory"
                ? "bg-red-900/40 text-red-300 border-red-700"
                : "bg-[#0a0e17] text-slate-300 border-slate-600"
            } ${advisoryLoading ? "cursor-wait opacity-60" : "cursor-pointer"}`}
            title="Generate AI Emergency Advisory"
          >
            {advisoryLoading ? "Generating..." : "Generate Advisory"}
          </button>

          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={planLoading}
            className={`px-3.5 py-1.5 rounded text-xs font-bold border ${
              activeOutput === "plan"
                ? "bg-blue-900/40 text-blue-300 border-blue-700"
                : "bg-[#0a0e17] text-slate-300 border-slate-600"
            } ${planLoading ? "cursor-wait opacity-60" : "cursor-pointer"}`}
            title="Generate Response Plan"
          >
            {planLoading ? "Generating..." : "Generate Response Plan"}
          </button>
        </div>
      </div>

      {/* Advisory Output */}
      {activeOutput === "advisory" && (
        <div className="bg-[#0a0e17] border border-red-900/60 rounded p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700 uppercase tracking-wider">
                AI-Generated Decision Support
              </span>
            </div>
            {(advisoryData || !advisoryLoading) && (
              <button
                type="button"
                onClick={() => handleCopy(advisoryData ? getFormattedAdvisoryText(advisoryData) : DEMO_ADVISORY_TEXT)}
                className="px-2 py-1 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {advisoryLoading && (
            <div className="py-6 text-center text-xs text-slate-500">
              Generating advisory with Gemini...
            </div>
          )}

          {advisoryError && (
            <div className="bg-red-950/30 border border-red-800 rounded p-3 text-xs">
              <div className="text-red-300 mb-2">
                <span className="font-bold">Error:</span> {advisoryError}
              </div>
              <button
                type="button"
                onClick={handleGenerateAdvisory}
                className="px-2.5 py-1 bg-red-900/40 text-red-300 border border-red-700 rounded text-[10px] font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {!advisoryLoading && !advisoryError && advisoryData && (
            <div className="space-y-3">
              <div className="bg-red-950/20 border border-red-900/40 rounded p-2 text-[10px] text-red-300">
                DISCLAIMER: {advisoryData.disclaimer}
              </div>

              <div className="bg-[#111827] border border-[#1e293b] rounded p-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Threat Summary</h4>
                <p className="text-xs text-slate-300">{advisoryData.threat_summary}</p>
              </div>
              <div className="bg-[#111827] border border-[#1e293b] rounded p-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Affected Area</h4>
                <p className="text-xs text-slate-300">{advisoryData.affected_area}</p>
              </div>
              <div className="bg-[#111827] border border-[#1e293b] rounded p-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Major Hazards</h4>
                <div className="space-y-1">
                  {advisoryData.major_hazards.map((h, i) => (
                    <p key={i} className="text-xs text-slate-300">{i + 1}. {h}</p>
                  ))}
                </div>
              </div>
              <div className="bg-[#111827] border border-[#1e293b] rounded p-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Infrastructure Priorities</h4>
                <div className="space-y-1">
                  {advisoryData.infrastructure_priorities.map((p, i) => (
                    <p key={i} className="text-xs text-slate-300">{i + 1}. {p}</p>
                  ))}
                </div>
              </div>
              <div className="bg-[#111827] border border-[#1e293b] rounded p-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Preparedness Actions</h4>
                <div className="space-y-1">
                  {advisoryData.preparedness_actions.map((a, i) => (
                    <p key={i} className="text-xs text-slate-300">{i + 1}. {a}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!advisoryLoading && !advisoryError && !advisoryData && (
            <div className="space-y-3">
              <div className="bg-amber-950/20 border border-amber-900/40 rounded p-2 text-[10px] text-amber-300">
                SIMULATED CONTENT - NOT AN OFFICIAL WARNING
              </div>
              <div className="bg-[#111827] border border-[#1e293b] rounded p-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulated cyclone conditions indicate elevated flood and infrastructure risk along the coastal zone.
                  Authorities should prioritize critical bridge access, hospital continuity, power infrastructure
                  protection, and emergency shelter readiness.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Response Plan Output */}
      {activeOutput === "plan" && (
        <div className="bg-[#0a0e17] border border-blue-900/60 rounded p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700 uppercase tracking-wider">
              AI-Generated Decision Support
            </span>
          </div>

          {planLoading && (
            <div className="py-6 text-center text-xs text-slate-500">
              Generating response plan with Gemini...
            </div>
          )}

          {planError && (
            <div className="bg-red-950/30 border border-red-800 rounded p-3 text-xs">
              <div className="text-red-300 mb-2">
                <span className="font-bold">Error:</span> {planError}
              </div>
              <button
                type="button"
                onClick={handleGeneratePlan}
                className="px-2.5 py-1 bg-red-900/40 text-red-300 border border-red-700 rounded text-[10px] font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {!planLoading && !planError && planData && (
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 mb-2">{planData.disclaimer}</div>
              {planData.items.map((item, i) => (
                <div key={i} className="bg-[#111827] border border-[#1e293b] rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{String(item.priority).padStart(2, "0")}</span>
                      <span className="text-xs font-semibold text-slate-200">{item.infrastructure}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{item.risk_score}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">{item.reason}</p>
                  <p className="text-[11px] text-slate-400">Action: {item.recommended_action}</p>
                </div>
              ))}
            </div>
          )}

          {!planLoading && !planError && !planData && (
            <div className="space-y-2">
              <div className="bg-amber-950/20 border border-amber-900/40 rounded p-2 text-[10px] text-amber-300">
                SIMULATED CONTENT - Demo Response Plan
              </div>
              {DEMO_RESPONSE_PLAN_DATA.map((phase, phaseIdx) => (
                <div key={phaseIdx} className="bg-[#111827] border border-[#1e293b] rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-200">{phase.phase}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{phase.badge}</span>
                  </div>
                  <div className="space-y-1">
                    {phase.tasks.map((task, taskIdx) => {
                      const taskId = `${phaseIdx}-${taskIdx}`;
                      return (
                        <button
                          key={taskIdx}
                          type="button"
                          onClick={() => toggleTask(taskId)}
                          className={`w-full text-left text-[11px] p-1.5 rounded border ${
                            checkedTasks[taskId]
                              ? "bg-green-950/30 border-green-800 text-green-300 line-through"
                              : "bg-[#0a0e17] border-[#1e293b] text-slate-400"
                          }`}
                        >
                          {task}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Default state - no output selected */}
      {activeOutput === "none" && (
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-4 text-center">
          <p className="text-xs text-slate-500 mb-2">
            Use the buttons above to generate an advisory or response plan.
          </p>
          <p className="text-[10px] text-slate-600">
            Requires backend connection with Gemini API. Falls back to simulated content if unavailable.
          </p>
        </div>
      )}
    </section>
  );
};
