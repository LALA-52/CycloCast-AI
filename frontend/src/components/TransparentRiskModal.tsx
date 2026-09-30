"use client";

import React from "react";

export interface TransparentRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransparentRiskModal: React.FC<TransparentRiskModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#111827] border border-[#1e293b] rounded max-w-xl w-full p-5 relative">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 text-xs border border-[#1e293b] px-2 py-1 rounded bg-[#0a0e17]"
        >
          Close
        </button>

        <h2 className="text-base font-bold text-slate-100 mb-3 uppercase tracking-wider">
          Risk Scoring Model
        </h2>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          CycloCast AI uses a transparent 4-factor weighted model (40/30/20/10) to compute
          infrastructure vulnerability scores. Each factor is independently calculated and
          combined into a single 0-100 composite index.
        </p>

        <div className="space-y-2">
          <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Wind Exposure</span>
              <p className="text-[10px] text-slate-500">Sustained wind speed vs. structural threshold</p>
            </div>
            <span className="text-sm font-bold text-slate-200">40%</span>
          </div>
          <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Flood Risk</span>
              <p className="text-[10px] text-slate-500">Elevation vs. rainfall and storm surge</p>
            </div>
            <span className="text-sm font-bold text-slate-200">30%</span>
          </div>
          <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Structural Vulnerability</span>
              <p className="text-[10px] text-slate-500">Age, construction type, and condition</p>
            </div>
            <span className="text-sm font-bold text-slate-200">20%</span>
          </div>
          <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Population Impact</span>
              <p className="text-[10px] text-slate-500">Population served and criticality weighting</p>
            </div>
            <span className="text-sm font-bold text-slate-200">10%</span>
          </div>
        </div>

        <div className="mt-4 bg-amber-950/20 border border-amber-900/40 rounded p-3 text-[10px] text-amber-300">
          All risk scores are computed transparently. Scores are AI-generated decision support
          and should be validated by qualified personnel before being used in operational decisions.
        </div>
      </div>
    </div>
  );
};
