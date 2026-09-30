"use client";

import React, { useState, useEffect } from "react";
import { Cyclone } from "@/types";
import { Wind, Waves, Gauge, Compass, MapPin, SlidersHorizontal, RotateCcw } from "lucide-react";

interface CycloneControlPanelProps {
  cyclone: Cyclone | null;
  onUpdateParams: (updates: Partial<Cyclone>) => void;
  onReset: () => void;
}

export const CycloneControlPanel: React.FC<CycloneControlPanelProps> = ({
  cyclone,
  onUpdateParams,
  onReset,
}) => {
  const [windSpeed, setWindSpeed] = useState<number>(cyclone?.wind_speed_kmh || 120);
  const [stormSurge, setStormSurge] = useState<number>(cyclone?.estimated_storm_surge_m || 2.0);
  const [lat, setLat] = useState<number>(cyclone?.center_lat || 20.65);
  const [lon, setLon] = useState<number>(cyclone?.center_lon || 87.20);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (cyclone) {
      setWindSpeed(cyclone.wind_speed_kmh);
      setStormSurge(cyclone.estimated_storm_surge_m);
      setLat(cyclone.center_lat);
      setLon(cyclone.center_lon);
    }
  }, [cyclone]);

  if (!cyclone) return null;

  const handleApply = () => {
    // Derive category based on Saffir-Simpson or IMD scale approximate:
    let cat = 1;
    if (windSpeed >= 210) cat = 5;
    else if (windSpeed >= 165) cat = 4;
    else if (windSpeed >= 130) cat = 3;
    else if (windSpeed >= 90) cat = 2;

    onUpdateParams({
      wind_speed_kmh: Number(windSpeed),
      estimated_storm_surge_m: Number(stormSurge),
      center_lat: Number(lat),
      center_lon: Number(lon),
      category: cat,
      radius_destructive_km: Math.round(35 + (windSpeed / 180) * 55),
      radius_gale_km: Math.round(120 + (windSpeed / 180) * 110),
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500/20 text-sky-400 p-1.5 rounded-lg">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">{cyclone.name}</h2>
              <span className="text-[11px] font-semibold bg-rose-900/60 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded">
                Category {cyclone.category}
              </span>
              {cyclone.is_simulated && (
                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                  Simulated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              {cyclone.landfall_location || "Coastal Sector"} &bull; {cyclone.estimated_landfall_time || "Tracking"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span>{isEditing ? "Cancel" : "Tune Parameters"}</span>
          </button>
          <button
            onClick={onReset}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            title="Reset to scenario defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Meteorological Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-slate-800/60 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-rose-400" />
            <span>Sustained Wind</span>
          </div>
          <div className="text-base font-bold text-white">
            {cyclone.wind_speed_kmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400">Gusts: {cyclone.gusts_kmh} km/h</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Peak Storm Surge</span>
          </div>
          <div className="text-base font-bold text-white">
            {cyclone.estimated_storm_surge_m} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <div className="text-[10px] text-slate-400">Above astronomical tide</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Central Pressure</span>
          </div>
          <div className="text-base font-bold text-white">
            {cyclone.central_pressure_hpa} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="text-[10px] text-slate-400">Deep pressure gradient</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Track Motion</span>
          </div>
          <div className="text-base font-bold text-white">
            {cyclone.movement_direction} <span className="text-xs font-normal text-slate-400">@ {cyclone.movement_speed_kmh} km/h</span>
          </div>
          <div className="text-[10px] text-slate-400">Eye: {cyclone.center_lat.toFixed(2)}°N, {cyclone.center_lon.toFixed(2)}°E</div>
        </div>
      </div>

      {/* Interactive Sliders when Editing */}
      {isEditing && (
        <div className="mt-3 p-3 bg-slate-950/70 border border-sky-900/40 rounded-lg space-y-3">
          <div className="text-xs font-semibold text-sky-300">
            Interactive Hazard Scenario Tuning
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Core Wind Speed</span>
                <span className="font-bold text-white">{windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="60"
                max="260"
                step="5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Peak Storm Surge</span>
                <span className="font-bold text-white">{stormSurge} meters</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={stormSurge}
                onChange={(e) => setStormSurge(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Center Latitude (°N)</span>
                <span className="font-bold text-white">{lat}</span>
              </div>
              <input
                type="range"
                min="18.0"
                max="23.0"
                step="0.05"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Center Longitude (°E)</span>
                <span className="font-bold text-white">{lon}</span>
              </div>
              <input
                type="range"
                min="84.0"
                max="90.0"
                step="0.05"
                value={lon}
                onChange={(e) => setLon(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded text-xs transition shadow"
            >
              Recalculate Risk Engine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
