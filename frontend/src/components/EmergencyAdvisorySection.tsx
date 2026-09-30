"use client";

import React, { useState } from "react";
import {
  Radio,
  FileText,
  Copy,
  Check,
  ShieldAlert,
  Database,
  CheckCircle2,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";

export const DEMO_ADVISORY_TEXT = `[DEMO / AI-GENERATED CONTENT • SIMULATION ONLY]
======================================================
CYCLOCAST AI - OFFICIAL EMERGENCY BROADCAST ADVISORY
BULLETIN ID: CYC-DANA-ADV-03 | ISSUE TIME: 30 SEP 2026, 02:00 UTC
HAZARD: Very Severe Cyclonic Storm (Cyclone DANA - Cat 3)
TARGET REGION: North-West Bay of Bengal & Odisha Coastal Belt
======================================================

1. METEOROLOGICAL ALERT:
   - Sustained Surface Winds: 125 km/h (Gusts reaching 156 km/h).
   - Peak Coastal Storm Surge: 2.4 meters above astronomical tide.
   - Cumulative Precipitation: 280 mm in next 24 hours.

2. CIVILIAN MANDATORY DIRECTIVES:
   - Evacuate all populations within 1.5 km of coastal estuaries to reinforced shelters.
   - Complete civilian curfew along coastal roads (SH-9A) and low-elevation bridges.
   - Fishermen and coastal marine crafts: Total harbor lockdown.

3. EMERGENCY DISASTER HELPLINES:
   - State Disaster Control: 1070 / 112
   - Coastal Incident Command: 1077

ISSUED BY: CycloCast AI Emergency Operations Center
STATUS: BENCHMARK DEMO BULLETIN (NOT LIVE METEOROLOGICAL DATA)`;

export const DEMO_RESPONSE_PLAN_DATA = [
  {
    phase: "Phase 1: T - 12h (Readiness & Evacuation)",
    badge: "Pre-Landfall",
    tasks: [
      "Order priority evacuation of 450,000 residents in estuary lowlands.",
      "Relocate ICU patients at District General Hospital Puri to Level 2.",
      "Position backup diesel dewatering pumps at Paradip Substation.",
    ],
  },
  {
    phase: "Phase 2: T - 6h (Asset Hardening & Lockdown)",
    badge: "Lockdown",
    tasks: [
      "Halt heavy freight transport on Mahanadi Estuary Lifeline Bridge.",
      "De-energize exposed low-elevation busbars at 400kV Substation.",
      "Seal municipal shelters and test rooftop solar energy reserves.",
    ],
  },
  {
    phase: "Phase 3: Landfall (Emergency Stand-Down)",
    badge: "Crisis",
    tasks: [
      "Order emergency personnel to take refuge in reinforced bunkers.",
      "Activate remote acoustic bridge scour and estuary sensor feeds.",
      "Maintain satellite communication links with Incident Commander.",
    ],
  },
  {
    phase: "Phase 4: T + 6h (Rapid Recovery & Relief)",
    badge: "Recovery",
    tasks: [
      "Dispatch wheel loaders to clear storm debris along State Highway 9A.",
      "Conduct drone structural inspection of bridge piers and power lines.",
      "Distribute emergency water rations and medical triage packages.",
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <section
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm space-y-4 ${className}`}
      aria-label="Emergency Advisory & Operations Center"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4 gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-rose-500/15 border border-rose-500/30 p-2.5 rounded-xl text-rose-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Emergency Advisory & Operations Center
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                <Database className="w-2.5 h-2.5" />
                DEMO / AI-GENERATED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate emergency broadcast bulletins and operational response action directives
            </p>
          </div>
        </div>

        {/* The Two Control Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveOutput(activeOutput === "advisory" ? "none" : "advisory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
              activeOutput === "advisory"
                ? "bg-rose-600 text-white shadow-rose-900/40 ring-2 ring-rose-400"
                : "bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-900/20"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Generate Advisory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveOutput(activeOutput === "plan" ? "none" : "plan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md border ${
              activeOutput === "plan"
                ? "bg-sky-600 text-white border-sky-400 shadow-sky-900/40 ring-2 ring-sky-400"
                : "bg-slate-800 hover:bg-slate-700 text-sky-300 border-sky-500/40 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Generate Response Plan</span>
          </button>
        </div>
      </div>

      {/* Default Quick Status Prompt if neither button is toggled */}
      {activeOutput === "none" && (
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Click <strong className="text-rose-400 font-semibold">Generate Advisory</strong> for broadcast copy or <strong className="text-sky-400 font-semibold">Generate Response Plan</strong> for phased tactical checklists.
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded self-start sm:self-auto font-mono">
            Ready for Generation
          </span>
        </div>
      )}

      {/* Generated Result: Official Emergency Broadcast Advisory */}
      {activeOutput === "advisory" && (
        <div className="bg-slate-950/70 border border-rose-800/60 rounded-xl p-4 sm:p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-rose-400" />
                Generated Emergency Broadcast Bulletin
              </span>
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase font-mono">
                DEMO / AI-GENERATED
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(DEMO_ADVISORY_TEXT)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveOutput("none")}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <pre className="bg-black/60 border border-slate-800 rounded-lg p-3.5 font-mono text-xs sm:text-sm text-rose-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[300px]">
            {DEMO_ADVISORY_TEXT}
          </pre>
        </div>
      )}

      {/* Generated Result: Time-Phased Operational Response Plan */}
      {activeOutput === "plan" && (
        <div className="bg-slate-950/70 border border-sky-800/60 rounded-xl p-4 sm:p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                Generated Operational Response Checklist
              </span>
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase font-mono">
                DEMO / AI-GENERATED
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveOutput("none")}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_RESPONSE_PLAN_DATA.map((phaseGroup, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                    <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                      {phaseGroup.phase.split(":")[0]}
                    </span>
                    <span className="text-[9px] font-semibold bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {phaseGroup.badge}
                    </span>
                  </div>
                  <ul className="space-y-2 text-[11px]">
                    {phaseGroup.tasks.map((task, tIdx) => {
                      const taskId = `${idx}-${tIdx}`;
                      const isDone = !!checkedTasks[taskId];
                      return (
                        <li
                          key={tIdx}
                          onClick={() => toggleTask(taskId)}
                          className={`flex items-start gap-2 cursor-pointer select-none transition ${
                            isDone ? "text-slate-400 line-through" : "text-slate-300 hover:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer"
                          />
                          <span className="leading-snug">{task}</span>
                        </li>
                      );
                    })}
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
