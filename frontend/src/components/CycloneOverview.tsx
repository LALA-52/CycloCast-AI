"use client";

import React from "react";
import {
  Wind,
  CloudRain,
  MapPin,
  Clock,
  AlertTriangle,
  Activity,
  Waves,
  Gauge,
  Database,
} from "lucide-react";

export interface CycloneOverviewData {
  id?: string;
  name: string;
  category: number;
  location: {
    lat: number;
    lon: number;
    description: string;
  };
  windSpeedKmh: number;
  rainfallMm: number;
  estimatedSeverity: string;
  lastUpdated: string;
  pressureHpa?: number;
  stormSurgeM?: number;
}

// Local static DEMO dataset
export const DEFAULT_DEMO_CYCLONE: CycloneOverviewData = {
  id: "demo-cyclone-dana",
  name: "Cyclone DANA",
  category: 3,
  location: {
    lat: 20.65,
    lon: 87.2,
    description: "North-West Bay of Bengal (Approaching Odisha Coast)",
  },
  windSpeedKmh: 125,
  rainfallMm: 280,
  estimatedSeverity: "Very Severe Cyclonic Storm (VSCS) - Category 3",
  lastUpdated: "30 Sep 2026, 02:00 UTC",
  pressureHpa: 974,
  stormSurgeM: 2.4,
};

export interface CycloneOverviewProps {
  data?: CycloneOverviewData;
  className?: string;
}

export const CycloneOverview: React.FC<CycloneOverviewProps> = ({
  data = DEFAULT_DEMO_CYCLONE,
  className = "",
}) => {
  return (
    <section
      className={`bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm ${className}`}
      aria-label="Cyclone Overview"
    >
      {/* Decorative gradient top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-sky-500" />

      {/* Header Bar: Cyclone Name, Category, Demo Badge, and Last Updated */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-rose-500/15 border border-rose-500/30 p-2.5 rounded-xl text-rose-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black tracking-tight text-white">
                {data.name}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/80 uppercase tracking-wide">
                Category {data.category}
              </span>
              {/* Clearly labeled DEMO DATA badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                <Database className="w-2.5 h-2.5" />
                DEMO DATA
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {data.location.description} (
                <span className="font-mono text-slate-300">
                  {data.location.lat.toFixed(2)}°N, {data.location.lon.toFixed(2)}°E
                </span>
                )
              </span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 self-start md:self-auto text-xs bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400">Last updated:</span>
          <span className="text-[11px] font-semibold text-slate-200 font-mono">
            {data.lastUpdated}
          </span>
        </div>
      </div>

      {/* Primary Meteorological Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Metric 1: Estimated Severity */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Estimated Severity
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2.5">
            <div className="text-base font-bold text-amber-400">
              {data.estimatedSeverity}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              High destructive threat potential
            </p>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            IMD / JTWC Classification
          </div>
        </div>

        {/* Metric 2: Wind Speed */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Wind Speed
            </span>
            <Wind className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-black text-rose-400 font-mono">
              {data.windSpeedKmh} <span className="text-xs font-semibold text-slate-400">km/h</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sustained 3-min average
            </p>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Gusts up to {Math.round(data.windSpeedKmh * 1.25)} km/h
          </div>
        </div>

        {/* Metric 3: Rainfall */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Expected Rainfall
            </span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-black text-sky-400 font-mono">
              {data.rainfallMm} <span className="text-xs font-semibold text-slate-400">mm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cumulative 24-hr accumulation
            </p>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            High localized flood potential
          </div>
        </div>

        {/* Metric 4: Pressure & Surge */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Atmospheric & Surge
            </span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {data.pressureHpa ?? 974} <span className="text-xs font-semibold text-slate-400">hPa</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Central barometric pressure
            </p>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Waves className="w-3 h-3 text-cyan-400" />
            Storm Surge: {data.stormSurgeM ?? 2.4} m
          </div>
        </div>
      </div>
    </section>
  );
};
