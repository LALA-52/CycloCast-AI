"use client";

import React, { useEffect, useRef, useState } from "react";
import type * as LeafletType from "leaflet";
import { apiService } from "@/services/api";
import type { GEELayerResponse } from "@/types";

export interface DemoMapMarker {
  id: string;
  name: string;
  type: "Hospital" | "Bridge" | "Power station" | "Road" | "Emergency shelter";
  riskScore: number;
  priority: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  lat: number;
  lng: number;
  canvasX: number;
  canvasY: number;
  status: string;
  notes: string;
}

export const DEMO_MAP_MARKERS: DemoMapMarker[] = [
  {
    id: "infra-1",
    name: "Coastal Bridge A",
    type: "Bridge",
    riskScore: 92,
    priority: "CRITICAL",
    lat: 16.10,
    lng: 81.15,
    canvasX: 52,
    canvasY: 46,
    status: "Structural Risk Alert",
    notes: "Restrict access and inspect alternate routes.",
  },
  {
    id: "infra-2",
    name: "Coastal General Hospital",
    type: "Hospital",
    riskScore: 87,
    priority: "CRITICAL",
    lat: 15.90,
    lng: 80.95,
    canvasX: 38,
    canvasY: 64,
    status: "Flood Exposure Warning",
    notes: "Prepare emergency power and evacuation backup.",
  },
  {
    id: "infra-3",
    name: "East Coastal Power Station",
    type: "Power station",
    riskScore: 81,
    priority: "CRITICAL",
    lat: 16.20,
    lng: 81.30,
    canvasX: 59,
    canvasY: 38,
    status: "Surge Risk",
    notes: "Deploy flood protection and emergency inspection team.",
  },
  {
    id: "infra-4",
    name: "Coastal Highway Section A",
    type: "Road",
    riskScore: 78,
    priority: "HIGH",
    lat: 15.95,
    lng: 81.05,
    canvasX: 44,
    canvasY: 55,
    status: "Flood Watch",
    notes: "Monitor flooding and prepare alternate route.",
  },
  {
    id: "infra-5",
    name: "Relief Shelter A",
    type: "Emergency shelter",
    riskScore: 43,
    priority: "MODERATE",
    lat: 16.40,
    lng: 81.50,
    canvasX: 68,
    canvasY: 22,
    status: "Operational",
    notes: "Verify capacity, supplies, and accessibility.",
  },
  {
    id: "infra-6",
    name: "Coastal Bridge B",
    type: "Bridge",
    riskScore: 74,
    priority: "HIGH",
    lat: 15.80,
    lng: 80.85,
    canvasX: 35,
    canvasY: 70,
    status: "Monitoring",
    notes: "Increase monitoring.",
  },
  {
    id: "infra-7",
    name: "District Hospital B",
    type: "Hospital",
    riskScore: 69,
    priority: "MODERATE",
    lat: 16.30,
    lng: 81.00,
    canvasX: 42,
    canvasY: 30,
    status: "Contingency Planning",
    notes: "Prepare contingency evacuation capacity.",
  },
];

const CYCLONE_EYE = {
  name: "Demo Cyclone Varun (Cat 3)",
  lat: 16.05,
  lng: 82.00,
  windSpeed: 145,
};

export interface InteractiveMapProps {
  className?: string;
  selectedAssetId?: string | null;
  onSelectAsset?: (id: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  className = "",
  selectedAssetId: externalSelectedId,
  onSelectAsset,
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const destructiveCircleRef = useRef<LeafletType.Circle | null>(null);
  const galeCircleRef = useRef<LeafletType.Circle | null>(null);
  const satelliteLayerRef = useRef<LeafletType.TileLayer | null>(null);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>("infra-1");
  const [showWindZone, setShowWindZone] = useState<boolean>(true);
  const [showSurgeContour, setShowSurgeContour] = useState<boolean>(true);
  const [showSatelliteLayer, setShowSatelliteLayer] = useState<boolean>(false);
  const [geeLayerConfig, setGeeLayerConfig] = useState<GEELayerResponse | null>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "loaded">("loading");

  const activeId = externalSelectedId ?? internalSelectedId;
  const selectedMarker = DEMO_MAP_MARKERS.find((m) => m.id === activeId);

  const mapsApiKey =
    process.env.NEXT_PUBLIC_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    "2c7447dc1b174d74b95b9543420a3c71";

  const handleMarkerSelect = (marker: DemoMapMarker) => {
    setInternalSelectedId(marker.id);
    onSelectAsset?.(marker.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([marker.lat, marker.lng], 9, { duration: 1.2 });
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapElementRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapElementRef.current) return;

      const map = L.map(mapElementRef.current, {
        center: [16.05, 81.40],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      });

      const tileUrl = mapsApiKey
        ? `https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${mapsApiKey}`
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: "abcd",
      }).addTo(map);

      // Cyclone eye marker - simple red circle, no emoji
      const eyeIcon = L.divIcon({
        className: "cyclone-eye-icon",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid #dc2626; opacity: 0.4;"></div>
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #dc2626; border: 2px solid #fca5a5; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; font-family: monospace;">C</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const eyeMarker = L.marker([CYCLONE_EYE.lat, CYCLONE_EYE.lng], { icon: eyeIcon }).addTo(map);
      eyeMarker.bindPopup(`
        <div style="padding: 10px; color: #e2e8f0; font-family: system-ui, sans-serif;">
          <div style="font-weight: bold; color: #dc2626; font-size: 12px;">${CYCLONE_EYE.name}</div>
          <div style="font-size: 11px; margin-top: 4px; color: #94a3b8;">Core Winds: <strong>${CYCLONE_EYE.windSpeed} km/h</strong></div>
          <div style="font-size: 11px; color: #64748b;">SIMULATED SCENARIO</div>
        </div>
      `);

      // Destructive wind radius (55 km)
      const destructiveCircle = L.circle([CYCLONE_EYE.lat, CYCLONE_EYE.lng], {
        radius: 55000,
        color: "#dc2626",
        fillColor: "#dc2626",
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);
      destructiveCircleRef.current = destructiveCircle;

      // Gale wind radius (120 km)
      const galeCircle = L.circle([CYCLONE_EYE.lat, CYCLONE_EYE.lng], {
        radius: 120000,
        color: "#d97706",
        fillColor: "#d97706",
        fillOpacity: 0.06,
        weight: 1,
        dashArray: "6, 6",
      }).addTo(map);
      galeCircleRef.current = galeCircle;

      // Infrastructure markers - no emojis, use type abbreviation
      DEMO_MAP_MARKERS.forEach((item) => {
        const borderColor = item.priority === "CRITICAL" ? "#dc2626" : item.priority === "HIGH" ? "#ea580c" : item.priority === "MODERATE" ? "#d97706" : "#16a34a";
        const typeAbbr = item.type === "Hospital" ? "H" : item.type === "Bridge" ? "B" : item.type === "Power station" ? "P" : item.type === "Road" ? "R" : "S";

        const infraIcon = L.divIcon({
          className: `infra-marker-${item.id}`,
          html: `
            <div style="position: relative; cursor: pointer; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
              <div style="background: #111827; border: 2px solid ${borderColor}; border-radius: 4px; padding: 4px; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px;">
                <span style="font-size: 11px; font-weight: bold; color: ${borderColor}; font-family: monospace;">${typeAbbr}</span>
              </div>
              <div style="margin-top: 2px; background: #111827; color: #e2e8f0; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 2px; border: 1px solid ${borderColor}; white-space: nowrap; font-family: monospace;">
                ${item.riskScore}
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([item.lat, item.lng], { icon: infraIcon }).addTo(map);

        marker.on("click", () => {
          handleMarkerSelect(item);
        });

        marker.bindPopup(`
          <div style="padding: 10px; min-width: 180px; color: #e2e8f0; font-family: system-ui, sans-serif;">
            <div style="font-weight: bold; font-size: 12px; color: #e2e8f0; margin-bottom: 4px;">${item.name}</div>
            <div style="font-size: 10px; font-weight: 800; color: ${borderColor}; margin-bottom: 6px;">
              ${item.type.toUpperCase()} / RISK: ${item.riskScore} (${item.priority})
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${item.status}</div>
            <div style="font-size: 10px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 4px;">
              ${item.notes}
            </div>
          </div>
        `);
      });

      mapInstanceRef.current = map;
      setMapStatus("loaded");
    }

    initMap();

    return () => {
      isMounted = false;
      if (satelliteLayerRef.current) {
        satelliteLayerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapsApiKey]);

  // Load GEE / Satellite layer configuration
  useEffect(() => {
    let isMounted = true;
    apiService
      .getEarthEngineLayer()
      .then((cfg) => {
        if (isMounted) setGeeLayerConfig(cfg);
      })
      .catch((err) => {
        console.warn("Satellite layer service unavailable, map operational:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync Satellite / Environmental Layer on map
  useEffect(() => {
    let isMounted = true;

    async function syncSatelliteLayer() {
      if (!mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;

      if (showSatelliteLayer) {
        const tileUrl =
          geeLayerConfig?.tile_url ||
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        const attribution =
          geeLayerConfig?.attribution || "Esri, Earthstar Geographics";

        if (!satelliteLayerRef.current) {
          const satLayer = L.tileLayer(tileUrl, {
            maxZoom: 18,
            attribution,
            opacity: 0.95,
          });
          satLayer.addTo(map);
          satelliteLayerRef.current = satLayer;
        } else {
          if (!map.hasLayer(satelliteLayerRef.current)) {
            satelliteLayerRef.current.addTo(map);
          }
          satelliteLayerRef.current.setOpacity(0.95);
        }
      } else {
        if (satelliteLayerRef.current && map.hasLayer(satelliteLayerRef.current)) {
          map.removeLayer(satelliteLayerRef.current);
        }
      }
    }

    syncSatelliteLayer();

    return () => {
      isMounted = false;
    };
  }, [showSatelliteLayer, geeLayerConfig]);

  // Toggle Wind Zone Layers
  useEffect(() => {
    if (destructiveCircleRef.current) {
      if (showWindZone) {
        destructiveCircleRef.current.setStyle({ opacity: 1, fillOpacity: 0.12 });
      } else {
        destructiveCircleRef.current.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    }
  }, [showWindZone]);

  useEffect(() => {
    if (galeCircleRef.current) {
      if (showSurgeContour) {
        galeCircleRef.current.setStyle({ opacity: 1, fillOpacity: 0.06 });
      } else {
        galeCircleRef.current.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    }
  }, [showSurgeContour]);

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      const current = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(current + delta);
    }
  };

  return (
    <div
      className={`bg-[#111827] border border-[#1e293b] rounded p-4 sm:p-5 relative flex flex-col ${className}`}
      aria-label="Geospatial Threat Map"
    >
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1e293b] pb-3 mb-3 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Geospatial Threat Map
          </h3>
          <p className="text-[11px] text-slate-500">
            Bay of Bengal, Andhra Pradesh Coast - Threat Radii and Infrastructure Assets
          </p>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-center">
          <div className="flex items-center bg-[#0a0e17] border border-[#1e293b] rounded overflow-hidden">
            <button
              type="button"
              onClick={() => handleZoom(1)}
              className="px-2 py-1 text-xs text-slate-300 border-r border-[#1e293b]"
              title="Zoom In"
            >+</button>
            <button
              type="button"
              onClick={() => handleZoom(-1)}
              className="px-2 py-1 text-xs text-slate-300"
              title="Zoom Out"
            >-</button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([16.05, 81.40], 8, { duration: 1.0 });
              }
            }}
            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#0a0e17] text-slate-400 border border-[#1e293b]"
            title="Recenter Map"
          >
            Center
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative w-full h-[440px] sm:h-[480px] bg-[#0a0e17] rounded border border-[#1e293b] overflow-hidden select-none flex flex-col justify-between">
        <div
          ref={mapElementRef}
          className="w-full h-full z-0"
          style={{ minHeight: "100%", width: "100%" }}
        />

        {/* Selected Asset Info */}
        {selectedMarker && (
          <div className="absolute top-3 left-3 z-10 max-w-xs sm:max-w-sm bg-[#111827] border border-[#1e293b] rounded p-3">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h5 className="text-xs font-bold text-slate-200 leading-tight">
                  {selectedMarker.name}
                </h5>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedMarker.type} - {selectedMarker.lat.toFixed(4)}N, {selectedMarker.lng.toFixed(4)}E
                </span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                selectedMarker.priority === "CRITICAL" ? "bg-red-900/80 text-red-300 border-red-700" :
                selectedMarker.priority === "HIGH" ? "bg-orange-900/80 text-orange-300 border-orange-700" :
                "bg-amber-900/80 text-amber-300 border-amber-700"
              }`}>
                {selectedMarker.priority}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mb-1">
              <span className="font-semibold text-slate-300">{selectedMarker.status}</span>
            </div>
            <p className="text-[10px] text-slate-500">{selectedMarker.notes}</p>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-[#1e293b] mt-1.5 font-mono">
              Risk Score: <strong className="text-slate-200">{selectedMarker.riskScore}/100</strong>
            </div>
          </div>
        )}

        {/* Layer Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5 bg-[#111827] border border-[#1e293b] rounded p-2.5 text-[11px] min-w-[200px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#1e293b] pb-1 mb-1">
            Map Layers
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              id="satellite-environmental-layer-toggle"
              checked={showSatelliteLayer}
              onChange={(e) => setShowSatelliteLayer(e.target.checked)}
              className="rounded bg-[#0a0e17] border-slate-600 w-3.5 h-3.5 cursor-pointer accent-teal-500"
            />
            <span>Satellite / Environmental</span>
            <span className="text-[8px] font-mono text-slate-500 ml-auto">
              {geeLayerConfig?.is_gee_active ? "GEE" : "SAT"}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showWindZone}
              onChange={(e) => setShowWindZone(e.target.checked)}
              className="rounded bg-[#0a0e17] border-slate-600 w-3.5 h-3.5 cursor-pointer accent-red-500"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-red-600"></span>
              Destructive Core (55km)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showSurgeContour}
              onChange={(e) => setShowSurgeContour(e.target.checked)}
              className="rounded bg-[#0a0e17] border-slate-600 w-3.5 h-3.5 cursor-pointer accent-amber-500"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-amber-600"></span>
              Gale Field (120km)
            </span>
          </label>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 bg-[#111827] border border-[#1e293b] rounded px-3 py-1.5 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-600"></span>
            <span>Critical (&gt;80)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-orange-600"></span>
            <span>High (60-80)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-600"></span>
            <span>Moderate (30-60)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-green-600"></span>
            <span>Low (&lt;30)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
