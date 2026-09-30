"use client";

import React from "react";
import { X, Calculator, ShieldCheck, CheckCircle2 } from "lucide-react";

interface TransparentRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransparentRiskModal: React.FC<TransparentRiskModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="bg-sky-500/20 text-sky-400 p-2 rounded-lg">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Transparent Risk Model</h3>
            <p className="text-xs text-slate-400">
              Deterministic, explainable formula for infrastructure vulnerability prioritization
            </p>
          </div>
        </div>

        {/* Formula Box */}
        <div className="bg-slate-950 border border-sky-900/40 rounded-xl p-4 mb-4">
          <div className="text-xs font-mono text-sky-300 font-semibold mb-2">
            Composite Risk Formula:
          </div>
          <div className="text-sm font-mono text-white bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            Risk Score = <span className="text-rose-400 font-bold">40%</span> Hazard Exposure
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ <span className="text-amber-400 font-bold">30%</span> Infrastructure Vulnerability
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ <span className="text-sky-400 font-bold">20%</span> Infrastructure Criticality
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ <span className="text-emerald-400 font-bold">10%</span> Accessibility Risk
          </div>
        </div>

        {/* Components Explanation */}
        <div className="space-y-2.5 text-xs text-slate-300 mb-4">
          <div className="flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
            <div>
              <b className="text-white">Hazard Exposure (40%): </b>
              Calculated from great-circle distance to cyclone center, gale/destructive wind radii (R34/R50), and storm surge inundation threat adjusted for topography elevation.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
            <div>
              <b className="text-white">Infrastructure Vulnerability (30%): </b>
              Structural resilience, asset age, building standards, and pre-existing weaknesses.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1 flex-shrink-0" />
            <div>
              <b className="text-white">Infrastructure Criticality (20%): </b>
              Strategic importance, operational trauma bed capacity, power distribution role, and dependent population.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
            <div>
              <b className="text-white">Accessibility Risk (10%): </b>
              Isolation vulnerability if surrounding feeder roads or river causeways become submerged or impassable.
            </div>
          </div>
        </div>

        {/* Category Tiers */}
        <div className="border-t border-slate-800 pt-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Classification Thresholds
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-red-950/60 border border-red-800/60 rounded-lg p-2">
              <div className="font-bold text-red-300">CRITICAL</div>
              <div className="text-[11px] text-red-200">81 – 100</div>
            </div>
            <div className="bg-amber-950/60 border border-amber-800/60 rounded-lg p-2">
              <div className="font-bold text-amber-300">HIGH</div>
              <div className="text-[11px] text-amber-200">61 – 80</div>
            </div>
            <div className="bg-yellow-950/60 border border-yellow-800/60 rounded-lg p-2">
              <div className="font-bold text-yellow-300">MODERATE</div>
              <div className="text-[11px] text-yellow-200">31 – 60</div>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-lg p-2">
              <div className="font-bold text-emerald-300">LOW</div>
              <div className="text-[11px] text-emerald-200">0 – 30</div>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-xl text-xs transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
