"use client";

import React, { useState, useEffect } from "react";
import { Cyclone } from "@/types";

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
  const [windSpeed, setWindSpeed] = useState<number>(cyclone?.wind_speed_kmh || 145);
  const [stormSurge, setStormSurge] = useState<number>(cyclone?.estimated_storm_surge_m || 2.8);
  const [lat, setLat] = useState<number>(cyclone?.center_lat || 16.05);
  const [lon, setLon] = useState<number>(cyclone?.center_lon || 82.00);
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
    <div className="bg-[#111827] border border-[#1e293b] rounded p-4">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{cyclone.name}</h2>
            <span className="text-[11px] font-semibold bg-red-900/60 text-red-300 border border-red-700 px-2 py-0.5 rounded">
              Category {cyclone.category}
            </span>
            {cyclone.is_simulated && (
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                Simulated
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {cyclone.landfall_location || "Coastal Sector"} / {cyclone.estimated_landfall_time || "Tracking"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-medium bg-[#0a0e17] text-slate-200 px-2.5 py-1.5 rounded border border-slate-700"
          >
            {isEditing ? "Cancel" : "Tune Parameters"}
          </button>
          <button
            onClick={onReset}
            className="text-xs text-slate-400 px-2 py-1.5 rounded border border-[#1e293b]"
            title="Reset to scenario defaults"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Meteorological Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-2.5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Sustained Wind</div>
          <div className="text-base font-bold text-white">
            {cyclone.wind_speed_kmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-slate-500">Gusts: {cyclone.gusts_kmh} km/h</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-2.5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Peak Storm Surge</div>
          <div className="text-base font-bold text-white">
            {cyclone.estimated_storm_surge_m} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <div className="text-[10px] text-slate-500">Above astronomical tide</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-2.5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Central Pressure</div>
          <div className="text-base font-bold text-white">
            {cyclone.central_pressure_hpa} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="text-[10px] text-slate-500">Deep pressure gradient</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded p-2.5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Track Motion</div>
          <div className="text-base font-bold text-white">
            {cyclone.movement_direction} <span className="text-xs font-normal text-slate-400">@ {cyclone.movement_speed_kmh} km/h</span>
          </div>
          <div className="text-[10px] text-slate-500">Eye: {cyclone.center_lat.toFixed(2)}N, {cyclone.center_lon.toFixed(2)}E</div>
        </div>
      </div>

      {/* Interactive Sliders when Editing */}
      {isEditing && (
        <div className="mt-3 p-3 bg-[#0a0e17] border border-slate-700 rounded space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
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
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-red-500"
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
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Center Latitude (N)</span>
                <span className="font-bold text-white">{lat}</span>
              </div>
              <input
                type="range"
                min="14.0"
                max="22.0"
                step="0.05"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-green-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Center Longitude (E)</span>
                <span className="font-bold text-white">{lon}</span>
              </div>
              <input
                type="range"
                min="78.0"
                max="86.0"
                step="0.05"
                value={lon}
                onChange={(e) => setLon(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-green-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1 bg-slate-700 text-white font-medium rounded text-xs border border-slate-600"
            >
              Recalculate Risk Engine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
