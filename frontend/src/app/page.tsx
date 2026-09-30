"use client";

import React, { useState } from "react";
import { CycloneOverview } from "@/components/CycloneOverview";
import { RiskSummary } from "@/components/RiskSummaryMetrics";
import { InteractiveMap } from "@/components/InteractiveMap";
import { InfrastructurePriorityPanel } from "@/components/InfrastructurePriorityPanel";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { EmergencyAdvisorySection } from "@/components/EmergencyAdvisorySection";
import {
  ShieldAlert,
  Radio,
  Database,
  Layers,
  MapPin,
  AlertTriangle,
  Building2,
  Sparkles,
  FileText,
  Activity,
  BarChart3,
  Compass,
} from "lucide-react";

export default function DashboardShellPage() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: Compass },
    { id: "map", label: "Tactical Map", icon: MapPin },
    { id: "risk", label: "Risk Analytics", icon: AlertTriangle },
    { id: "infrastructure", label: "Infrastructure", icon: Building2 },
    { id: "ai-advisory", label: "AI Intelligence", icon: Sparkles },
    { id: "emergency", label: "Emergency Protocols", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation & Status Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-600/30 to-rose-950/60 border border-rose-500/40 p-2.5 rounded-xl text-rose-400 shadow-inner flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black tracking-tight text-white">
                  CYCLOCAST AI
                </h1>
                <span className="text-[10px] font-bold tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded-full uppercase">
                  Disaster Intelligence Shell
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Cyclone Impact & Infrastructure Vulnerability Command System
              </p>
            </div>
          </div>

          {/* Status Indicators & Operational Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Monitoring Status */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Monitoring Status
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  System Active &bull; Standby Watch
                </span>
              </div>
            </div>

            {/* Data Status */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs shadow-sm">
              <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Data Status
                </span>
                <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Local Shell Mode &bull; Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 pt-2 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-400" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area: Dashboard Module Shells */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Module Section 1: Cyclone Threat Overview (Active Telemetry - Demo Data) */}
        <CycloneOverview />

        {/* Module Section 2: Impact & Risk Summary Metrics (Demo Data) */}
        <RiskSummary />

        {/* Module Section 3 & 4: Tactical Map & Infrastructure Priority Grid Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Module Section 3: Tactical Geospatial Threat Map (Demo Layout) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <InteractiveMap />
          </div>

          {/* Module Section 4: Infrastructure Priority Panel (Demo Data) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <InfrastructurePriorityPanel />
          </div>
        </div>

        {/* Module Section 5: AI Situational Intelligence & Impact Analysis (Demo Content) */}
        <AIAnalysisPanel />

        {/* Module Section 6: Emergency Advisory & Operations Center (Demo Data) */}
        <EmergencyAdvisorySection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-300">CYCLOCAST AI</span> &bull; Disaster Intelligence Shell
          </div>
          <div className="text-[11px] text-slate-400">
            Shell Environment &bull; No External Services Active
          </div>
        </div>
      </footer>
    </div>
  );
}
