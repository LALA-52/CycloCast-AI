"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Building2,
  Zap,
  Route,
  ShieldCheck,
  Database,
  Compass,
  Wind,
  Waves,
  AlertTriangle,
  Key,
  ShieldAlert,
  Info,
  ExternalLink,
} from "lucide-react";

export interface DemoMapMarker {
  id: string;
  name: string;
  type: "Hospital" | "Bridge" | "Power station" | "Road" | "Emergency shelter";
  riskScore: number;
  priority: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  lat: number;
  lng: number;
  canvasX: number; // Fallback percentage for tactical canvas
  canvasY: number;
  status: string;
  notes: string;
}

export const DEMO_MAP_MARKERS: DemoMapMarker[] = [
  {
    id: "infra-1",
    name: "District General Hospital Puri",
    type: "Hospital",
    riskScore: 92,
    priority: "CRITICAL",
    lat: 19.8135,
    lng: 85.8312,
    canvasX: 38,
    canvasY: 64,
    status: "Severe Inundation Warning",
    notes: "ICU level-2 transfer required. Stage dewatering pumps.",
  },
  {
    id: "infra-2",
    name: "Mahanadi Estuary Lifeline Bridge",
    type: "Bridge",
    riskScore: 88,
    priority: "CRITICAL",
    lat: 20.2961,
    lng: 86.6667,
    canvasX: 52,
    canvasY: 46,
    status: "Pier Scour Hazard",
    notes: "Freight closure enforced. Hydrodynamic telemetry active.",
  },
  {
    id: "infra-3",
    name: "Paradip Coastal 400kV Substation",
    type: "Power station",
    riskScore: 81,
    priority: "HIGH",
    lat: 20.3165,
    lng: 86.6114,
    canvasX: 59,
    canvasY: 38,
    status: "Substation Surge Risk",
    notes: "De-energize 400kV busbars. Surge barrier installed.",
  },
  {
    id: "infra-4",
    name: "State Highway 9A Coastal Corridor",
    type: "Road",
    riskScore: 74,
    priority: "HIGH",
    lat: 19.9821,
    lng: 86.2514,
    canvasX: 44,
    canvasY: 55,
    status: "Tidal Breach Watch",
    notes: "Heavy clearing machinery pre-positioned at Sector 4.",
  },
  {
    id: "infra-5",
    name: "Chandipur Multi-Purpose Cyclone Shelter",
    type: "Emergency shelter",
    riskScore: 46,
    priority: "MODERATE",
    lat: 21.4705,
    lng: 87.0175,
    canvasX: 68,
    canvasY: 22,
    status: "Operational Readiness",
    notes: "3,500 capacity. Potable water & solar reserves verified.",
  },
];

const CYCLONE_EYE = {
  name: "Cyclone DANA (Category 3)",
  lat: 20.65,
  lng: 87.2,
  windSpeed: 125,
};

// Dark style theme for Google Maps
const GOOGLE_MAPS_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b1324" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1324" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f1f38" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#030712" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
];

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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>("infra-1");
  const [showWindZone, setShowWindZone] = useState<boolean>(true);
  const [showSurgeContour, setShowSurgeContour] = useState<boolean>(true);
  const [showTrack, setShowTrack] = useState<boolean>(true);
  const [useFallbackCanvas, setUseFallbackCanvas] = useState<boolean>(false);

  // API Key state and loading status
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "";

  const [mapStatus, setMapStatus] = useState<"loading" | "loaded" | "missing_key" | "error">(
    !apiKey || apiKey.trim() === "" ? "missing_key" : "loading"
  );
  const [authErrorMessage, setAuthErrorMessage] = useState<string>("");

  const activeId = externalSelectedId ?? internalSelectedId;
  const selectedMarker = DEMO_MAP_MARKERS.find((m) => m.id === activeId);

  const handleMarkerSelect = (marker: DemoMapMarker) => {
    setInternalSelectedId(marker.id);
    onSelectAsset?.(marker.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: marker.lat, lng: marker.lng });
    }
  };

  // Initialize Google Maps when API key is present
  useEffect(() => {
    if (!apiKey || apiKey.trim() === "") {
      setMapStatus("missing_key");
      return;
    }

    let isMounted = true;

    // Listen for Google Maps Authentication failure
    (window as any).gm_authFailure = () => {
      if (isMounted) {
        setAuthErrorMessage(
          "Google Maps authentication failed. Please verify that the API key is active, has Maps JavaScript API enabled, and billing is activated."
        );
        setMapStatus("error");
      }
    };

    const scriptId = "google-maps-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const onScriptLoaded = () => {
      if (!isMounted || !mapElementRef.current || !window.google?.maps) return;

      try {
        const center = { lat: 20.45, lng: 86.65 };
        const map = new google.maps.Map(mapElementRef.current, {
          center,
          zoom: 8,
          styles: GOOGLE_MAPS_DARK_STYLE,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Clear existing markers/circles
        markersRef.current.forEach((m) => m.setMap(null));
        circlesRef.current.forEach((c) => c.setMap(null));
        markersRef.current = [];
        circlesRef.current = [];

        // 1. Add Cyclone Eye Marker
        const eyeMarker = new google.maps.Marker({
          position: { lat: CYCLONE_EYE.lat, lng: CYCLONE_EYE.lng },
          map,
          title: CYCLONE_EYE.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#f43f5e",
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        markersRef.current.push(eyeMarker);

        // Wind radii circles
        const destructiveCircle = new google.maps.Circle({
          strokeColor: "#f43f5e",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#f43f5e",
          fillOpacity: 0.15,
          map,
          center: { lat: CYCLONE_EYE.lat, lng: CYCLONE_EYE.lng },
          radius: 55000, // 55 km
        });
        circlesRef.current.push(destructiveCircle);

        const galeCircle = new google.maps.Circle({
          strokeColor: "#f59e0b",
          strokeOpacity: 0.6,
          strokeWeight: 1.5,
          fillColor: "#f59e0b",
          fillOpacity: 0.08,
          map,
          center: { lat: CYCLONE_EYE.lat, lng: CYCLONE_EYE.lng },
          radius: 120000, // 120 km
        });
        circlesRef.current.push(galeCircle);

        // 2. Add DEMO Infrastructure Markers
        DEMO_MAP_MARKERS.forEach((item) => {
          const color =
            item.priority === "CRITICAL"
              ? "#f43f5e"
              : item.priority === "HIGH"
              ? "#f97316"
              : item.priority === "MODERATE"
              ? "#f59e0b"
              : "#10b981";

          const marker = new google.maps.Marker({
            position: { lat: item.lat, lng: item.lng },
            map,
            title: `${item.name} (${item.priority} - Score: ${item.riskScore})`,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 1.5,
            },
          });

          marker.addListener("click", () => {
            handleMarkerSelect(item);
          });

          markersRef.current.push(marker);
        });

        setMapStatus("loaded");
      } catch (err: any) {
        if (isMounted) {
          setAuthErrorMessage(err?.message || "Failed to initialize Google Maps.");
          setMapStatus("error");
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = onScriptLoaded;
      script.onerror = () => {
        if (isMounted) {
          setAuthErrorMessage(
            "Failed to load Google Maps script. Check network connection or API key validity."
          );
          setMapStatus("error");
        }
      };
      document.head.appendChild(script);
    } else if (window.google?.maps) {
      onScriptLoaded();
    } else {
      script.addEventListener("load", onScriptLoaded);
    }

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      const current = mapInstanceRef.current.getZoom() || 8;
      mapInstanceRef.current.setZoom(current + delta);
    }
  };

  const getMarkerIcon = (type: DemoMapMarker["type"]) => {
    switch (type) {
      case "Hospital":
        return <Building2 className="w-3.5 h-3.5 text-rose-400" />;
      case "Bridge":
        return <Layers className="w-3.5 h-3.5 text-sky-400" />;
      case "Power station":
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case "Road":
        return <Route className="w-3.5 h-3.5 text-indigo-400" />;
      case "Emergency shelter":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getPriorityBadgeClass = (priority: DemoMapMarker["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-950/90 text-rose-200 border-rose-600 shadow-rose-950/40";
      case "HIGH":
        return "bg-orange-950/90 text-orange-200 border-orange-600 shadow-orange-950/40";
      case "MODERATE":
        return "bg-amber-950/90 text-amber-200 border-amber-600 shadow-amber-950/40";
      case "LOW":
        return "bg-emerald-950/90 text-emerald-200 border-emerald-600 shadow-emerald-950/40";
    }
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl relative flex flex-col backdrop-blur-sm ${className}`}
      aria-label="Tactical Geospatial Threat Map"
    >
      {/* 1. Map Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tactical Geospatial Threat Map
              </h3>
              {mapStatus === "loaded" ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Google Maps Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider font-mono">
                  <Database className="w-2.5 h-2.5" />
                  DEMO CARTOGRAPHY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Bay of Bengal & Odisha Coastal Belt (20.65°N, 87.20°E) &bull; Threat Radii & Lifeline Assets
            </p>
          </div>
        </div>

        {/* Map Controls Area */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-center">
          {mapStatus === "loaded" ? (
            <>
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleZoom(1)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(-1)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition border-l border-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Recenter Map */}
              <button
                type="button"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo({ lat: 20.45, lng: 86.65 });
                    mapInstanceRef.current.setZoom(8);
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Recenter Map View"
              >
                <Compass className="w-3 h-3" />
                <span>Center</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setUseFallbackCanvas(!useFallbackCanvas)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 text-sky-300 border border-slate-700 hover:bg-slate-750 transition"
            >
              <Layers className="w-3 h-3" />
              <span>{useFallbackCanvas ? "View API Status" : "Preview Tactical Grid"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Viewport Area */}
      <div className="relative w-full h-[440px] sm:h-[480px] bg-[#070d18] rounded-xl border border-slate-800/90 overflow-hidden select-none shadow-inner flex flex-col justify-between">
        {/* Real Google Maps Container (Hidden if key missing and fallback enabled) */}
        <div
          ref={mapElementRef}
          className={`w-full h-full ${
            mapStatus === "loaded" && !useFallbackCanvas ? "block" : "hidden"
          }`}
        />

        {/* Graceful Fallback 1: Missing API Key Message */}
        {mapStatus === "missing_key" && !useFallbackCanvas && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070d18]/95 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
              <Key className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Google Maps API Key Required
            </h4>

            <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-4">
              To render live Google Maps cartography and satellite overlays, configure your API key in{" "}
              <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-800">
                frontend/.env.local
              </code>
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-w-md w-full text-left space-y-2 mb-4 font-mono text-[11px] text-slate-400">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">
                Setup Instructions:
              </div>
              <div className="bg-slate-900 p-2 rounded text-emerald-300 border border-slate-800 select-all">
                NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_api_key_here
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                Then restart your Next.js dev server to activate Google Maps.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUseFallbackCanvas(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-950/40 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View Demo Tactical Grid Instead</span>
              </button>
            </div>
          </div>
        )}

        {/* Graceful Fallback 2: Map Loading Error / Auth Failure */}
        {mapStatus === "error" && !useFallbackCanvas && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070d18]/95 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Google Maps Authentication / Load Error
            </h4>

            <p className="text-xs text-rose-300/90 max-w-md leading-relaxed mb-4">
              {authErrorMessage || "The Google Maps API key provided was rejected or could not be loaded."}
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-w-md w-full text-left space-y-1.5 mb-4 text-[11px] text-slate-400">
              <div className="text-slate-300 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Troubleshooting Checklist:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px]">
                <li>Verify Maps JavaScript API is enabled in Google Cloud Console.</li>
                <li>Ensure billing is linked to your Google Cloud project.</li>
                <li>Check HTTP referrer restrictions allow <code>http://localhost:3000/*</code>.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setUseFallbackCanvas(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold transition border border-slate-700"
            >
              Switch to Fallback Tactical Grid
            </button>
          </div>
        )}

        {/* Fallback 3: Interactive Tactical Grid Display (Visible during fallback or preview) */}
        {(useFallbackCanvas || mapStatus === "loading") && (
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between">
            {/* Background Coordinate Grid */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
                backgroundSize: "40px 40px, 40px 40px, 40px 40px",
              }}
            />

            {/* Coastal Boundary Silhouette SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 500"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,0 L 280,0 L 320,120 L 390,210 L 460,260 L 520,380 L 480,500 L 0,500 Z"
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="2"
                opacity="0.85"
              />
              <circle
                cx="580"
                cy="310"
                r="70"
                fill="rgba(244, 63, 94, 0.15)"
                stroke="#f43f5e"
                strokeWidth="2"
              />
              <circle
                cx="580"
                cy="310"
                r="135"
                fill="rgba(245, 158, 11, 0.08)"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />
            </svg>

            {/* Cyclone Eye Indicator */}
            <div
              className="absolute z-20 flex flex-col items-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "72.5%", top: "62%" }}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-rose-500 opacity-60"></span>
                <div className="w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-rose-900/80">
                  <Wind className="w-3.5 h-3.5 animate-spin" />
                </div>
              </div>
              <div className="mt-1 px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-700 text-rose-200 text-[9px] font-black font-mono">
                Eye: 125 km/h
              </div>
            </div>

            {/* Fallback Markers */}
            {DEMO_MAP_MARKERS.map((marker) => {
              const isSelected = marker.id === activeId;
              const badgeClass = getPriorityBadgeClass(marker.priority);

              return (
                <div
                  key={marker.id}
                  onClick={() => handleMarkerSelect(marker)}
                  className="absolute z-30 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                  style={{ left: `${marker.canvasX}%`, top: `${marker.canvasY}%` }}
                >
                  <div
                    className={`relative flex items-center justify-center p-2 rounded-xl border shadow-lg ${
                      isSelected
                        ? "bg-slate-900 border-sky-400 ring-2 ring-sky-400/80 scale-125 z-40"
                        : `${badgeClass} bg-slate-900/90 hover:border-slate-300`
                    }`}
                  >
                    {getMarkerIcon(marker.type)}
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md border ${
                        isSelected
                          ? "bg-sky-950 text-sky-200 border-sky-400"
                          : "bg-slate-950/90 text-slate-300 border-slate-800"
                      }`}
                    >
                      {marker.name.split(" ")[0]} ({marker.riskScore})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Asset Spotlight Callout Overlay */}
        {selectedMarker && (
          <div className="absolute top-3 left-3 z-30 max-w-[270px] bg-slate-900/95 border border-sky-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-1.5 animate-fadeIn pointer-events-auto">
            <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1.5">
              <span className="text-[10px] font-black text-sky-300 uppercase tracking-wider flex items-center gap-1">
                {getMarkerIcon(selectedMarker.type)}
                {selectedMarker.type}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${getPriorityBadgeClass(
                  selectedMarker.priority
                )}`}
              >
                {selectedMarker.priority} &bull; {selectedMarker.riskScore}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white line-clamp-1">
              {selectedMarker.name}
            </h4>
            <p className="text-[11px] text-amber-300/90 font-medium">
              {selectedMarker.status}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {selectedMarker.notes}
            </p>
            <div className="pt-1 text-[9px] text-slate-500 font-mono">
              GPS: {selectedMarker.lat.toFixed(4)}°N, {selectedMarker.lng.toFixed(4)}°E
            </div>
          </div>
        )}

        {/* HUD Center Coordinate Stamp */}
        <div className="absolute top-3 right-3 z-20 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-400 font-mono shadow">
          <span>Center: 20.65°N, 87.20°E</span>
        </div>
      </div>

      {/* Dual Legends (Risk Legend & Infrastructure Legend) */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Risk Legend */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Risk Legend</span>
            <span className="text-[9px] text-slate-400 font-normal">Score Range</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[11px] text-slate-300">Critical (85+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-[11px] text-slate-300">High (70-84)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-[11px] text-slate-300">Moderate (40-69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-slate-300">Low (&lt;40)</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Legend */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Infrastructure Legend</span>
            <span className="text-[9px] text-slate-400 font-normal">Lifeline Categories</span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-rose-400" />
              Hospital
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-sky-400" />
              Bridge
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Power
            </span>
            <span className="flex items-center gap-1">
              <Route className="w-3 h-3 text-indigo-400" />
              Road
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Shelter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
