"use client";

import React from "react";

export interface HeaderProps {
  loading?: boolean;
  isLive?: boolean;
  onRefresh?: () => void;
  error?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  loading = false,
  isLive = false,
  onRefresh,
  error,
}) => {
  return (
    <header className="bg-[#111827] border-b border-[#1e293b] text-white sticky top-0 z-40 px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-red-900/40 border border-red-700 p-2 rounded flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm font-mono">CC</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
              CycloCast AI
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              Cyclone Impact Intelligence System
            </p>
          </div>
        </div>

        {/* Right Cluster */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono rounded border ${
            isLive
              ? "bg-green-900/20 text-green-400 border-green-800"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-slate-600"}`}></span>
            {isLive ? "API CONNECTED" : "DEMO MODE"}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-[10px] font-mono border ${
              loading
                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-wait"
                : "bg-[#0a0e17] text-slate-400 border-slate-700 cursor-pointer"
            }`}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    </header>
  );
};
