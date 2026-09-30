"use client";

import React from "react";
import { Cyclone } from "@/types";
import {
  ShieldAlert,
  RefreshCw,
  Sparkles,
  Activity,
  Database,
  Radio,
  SlidersHorizontal,
} from "lucide-react";

interface HeaderProps {
  activeCyclone: Cyclone | null;
  cycloneList: Cyclone[];
  onSelectCyclone: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
  aiSource?: string;
  isAiFallback?: boolean;
  onToggleTuner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCyclone,
  cycloneList,
  onSelectCyclone,
  onRefresh,
  loading,
  aiSource,
  isAiFallback,
  onToggleTuner,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Section 1: CycloCast AI Branding & Mission */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-rose-600/30 to-rose-900/40 border border-rose-500/50 p-2.5 rounded-xl text-rose-400 shadow-inner flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                CYCLOCAST AI
              </h1>
              <span className="text-[10px] font-bold tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded-full uppercase">
                DISASTER INTELLIGENCE PLATFORM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Cyclone Impact & Infrastructure Vulnerability Command System &bull;{" "}
              <span className="text-rose-400 font-semibold">Predict. Prioritize. Protect.</span>
            </p>
          </div>
        </div>

        {/* Section 2 & 3: Monitoring Status, Data Status Indicator & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Current Monitoring Status */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Monitoring Status
              </span>
              <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-400" />
                Active Tactical Watch
              </span>
            </div>
          </div>

          {/* Data Status Indicator (Clearly states Demo / Simulation Dataset) */}
          <div
            className="flex items-center gap-2 bg-amber-950/40 border border-amber-600/40 rounded-lg px-2.5 py-1 text-xs shadow-sm"
            title="Notice: Operational demo dataset based on Bay of Bengal meteorological benchmarks. Not connected to real-time live radar feeds."
          >
            <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-amber-400/90 font-bold uppercase tracking-wider">
                Data Provenance
              </span>
              <span className="text-[11px] font-semibold text-amber-200">
                Demo / Benchmark Dataset
              </span>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">Scenario:</span>
            <select
              value={activeCyclone?.id || ""}
              onChange={(e) => onSelectCyclone(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {cycloneList.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} (Cat {c.category})
                </option>
              ))}
            </select>
          </div>

          {/* AI Intelligence Engine Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              isAiFallback
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-emerald-950/40 border-emerald-700/50 text-emerald-300"
            }`}
            title={aiSource || "Gemini Multimodal Disaster Intelligence Engine"}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAiFallback ? "Reasoning: Rule Engine" : "Gemini 2.5 Live"}</span>
          </div>

          {/* Optional Tuner Button */}
          {onToggleTuner && (
            <button
              onClick={onToggleTuner}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
              title="Tune meteorological parameters for what-if simulation"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulate</span>
            </button>
          )}

          {/* Refresh / Sync Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
            title="Recalculate risk indices and synchronize telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
