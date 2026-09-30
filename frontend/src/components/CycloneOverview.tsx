import React from "react";
import { Cyclone } from "@/types";

export interface CycloneOverviewProps {
  cyclone?: Cyclone | null;
  onToggleControls?: () => void;
  showControls?: boolean;
  className?: string;
}

export const DEFAULT_VARUN_CYCLONE: Cyclone = {
  id: "CYC-VARUN",
  name: "Demo Cyclone Varun",
  category: 3,
  wind_speed_kmh: 145,
  gusts_kmh: 180,
  central_pressure_hpa: 978,
  movement_speed_kmh: 14,
  movement_direction: "NNW",
  center_lat: 16.05,
  center_lon: 82.00,
  radius_destructive_km: 55,
  radius_gale_km: 120,
  estimated_storm_surge_m: 2.8,
  landfall_location: "Coastal Andhra Pradesh",
  estimated_landfall_time: "T + 18h",
  forecast_track: [],
  is_simulated: true,
};

export const CycloneOverview: React.FC<CycloneOverviewProps> = ({
  cyclone = DEFAULT_VARUN_CYCLONE,
  onToggleControls,
  showControls = false,
  className = "",
}) => {
  const current = cyclone || DEFAULT_VARUN_CYCLONE;

  const getSeverityLabel = (cat: number) => {
    if (cat >= 5) return "Extremely Severe";
    if (cat >= 4) return "Very Severe";
    if (cat >= 3) return "Severe";
    if (cat >= 2) return "Moderate";
    return "Cyclonic Storm";
  };

  return (
    <section
      className={`bg-[#111827] border border-[#1e293b] rounded p-4 sm:p-5 ${className}`}
      aria-label="Cyclone Threat Overview"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-base font-bold text-slate-100 tracking-wide uppercase">
              {current.name}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700 uppercase tracking-wider">
              Simulated Scenario
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {current.landfall_location || "Bay of Bengal, near coastal Andhra Pradesh"}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {onToggleControls && (
            <button
              type="button"
              onClick={onToggleControls}
              className="text-xs font-mono px-3 py-1.5 rounded border bg-[#0a0e17] text-slate-300 border-slate-700 hover:border-slate-500 cursor-pointer flex items-center gap-1.5"
            >
              <span>{showControls ? "[x] Close Tuning" : "[+] Tune Parameters"}</span>
            </button>
          )}
          <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
            Status: SIMULATED DATA
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Wind Speed</div>
          <div className="text-lg font-bold text-slate-100">
            {current.wind_speed_kmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
        </div>
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Rainfall</div>
          <div className="text-lg font-bold text-slate-100">
            280 <span className="text-xs font-normal text-slate-400">mm/24h</span>
          </div>
        </div>
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Severity</div>
          <div className="text-sm font-bold text-red-400">{getSeverityLabel(current.category)}</div>
        </div>
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Storm Surge</div>
          <div className="text-lg font-bold text-slate-100">
            {current.estimated_storm_surge_m} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
        </div>
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Category</div>
          <div className="text-lg font-bold text-orange-400">{current.category}</div>
        </div>
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Pressure</div>
          <div className="text-lg font-bold text-slate-100">
            {current.central_pressure_hpa} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
        </div>
      </div>
    </section>
  );
};
