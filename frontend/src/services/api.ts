import {
  Cyclone,
  Infrastructure,
  InfrastructureRiskAssessment,
  RiskOverviewSummary,
  GeminiAnalysisResponse,
  GeminiDirectAnalysis,
  ResponsePlanResponse,
  EmergencyAdvisoryResponse,
  GEELayerResponse,
} from "@/types";

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/api";
  }
  return "http://localhost:8000/api";
};

const API_BASE = getApiBase();

// Demo Cyclone Varun scenario (AP coastal sector)
const FALLBACK_CYCLONE: Cyclone = {
  id: "CYC-2026-VARUN",
  name: "Demo Cyclone Varun",
  category: 3,
  center_lat: 16.05,
  center_lon: 82.00,
  wind_speed_kmh: 145,
  gusts_kmh: 175,
  central_pressure_hpa: 978,
  movement_speed_kmh: 16,
  movement_direction: "NNW",
  radius_destructive_km: 55,
  radius_gale_km: 120,
  estimated_storm_surge_m: 2.8,
  estimated_landfall_time: "Landfall in ~6 hours (Coastal Andhra Pradesh)",
  landfall_location: "Coastal Andhra Pradesh",
  rainfall_mm: 280,
  estimated_severity: "Very Severe Cyclonic Storm (VSCS)",
  last_updated_time: "30 Sep 2026, 01:30 UTC",
  data_mode: "Simulated Demo Dataset (AP Coast Benchmark)",
  is_simulated: true,
  forecast_track: [
    {
      time_offset_hours: 0,
      latitude: 16.05,
      longitude: 82.00,
      wind_speed_kmh: 145,
      central_pressure_hpa: 978,
      estimated_surge_m: 2.8,
    },
    {
      time_offset_hours: 6,
      latitude: 16.30,
      longitude: 81.70,
      wind_speed_kmh: 150,
      central_pressure_hpa: 975,
      estimated_surge_m: 3.0,
    },
    {
      time_offset_hours: 12,
      latitude: 16.60,
      longitude: 81.35,
      wind_speed_kmh: 110,
      central_pressure_hpa: 988,
      estimated_surge_m: 1.6,
    },
  ],
};

export interface RiskOverviewResult {
  data: RiskOverviewSummary;
  isLive: boolean;
  error?: string | null;
}

export const apiService = {
  async getActiveCyclone(): Promise<Cyclone> {
    try {
      const res = await fetch(`${API_BASE}/cyclone/active`, { cache: "no-store" });
      if (!res.ok) throw new Error("Backend response error");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback cyclone data (backend unreachable):", err);
      return FALLBACK_CYCLONE;
    }
  },

  async getCycloneList(): Promise<Cyclone[]> {
    try {
      const res = await fetch(`${API_BASE}/cyclone/list`, { cache: "no-store" });
      if (!res.ok) throw new Error("Backend response error");
      return await res.json();
    } catch {
      return [FALLBACK_CYCLONE];
    }
  },

  async selectCyclone(id: string): Promise<Cyclone> {
    const res = await fetch(`${API_BASE}/cyclone/select/${encodeURIComponent(id)}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to select cyclone");
    return await res.json();
  },

  async updateCycloneParams(updates: Partial<Cyclone>): Promise<Cyclone> {
    const res = await fetch(`${API_BASE}/cyclone/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update cyclone parameters");
    return await res.json();
  },

  async resetCyclone(): Promise<Cyclone> {
    const res = await fetch(`${API_BASE}/cyclone/reset`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset cyclone");
    return await res.json();
  },

  async getRiskOverview(): Promise<RiskOverviewSummary> {
    const res = await this.getRiskOverviewWithStatus();
    return res.data;
  },

  async getRiskOverviewWithStatus(): Promise<RiskOverviewResult> {
    try {
      const res = await fetch(`${API_BASE}/risk/overview`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
      const data: RiskOverviewSummary = await res.json();
      return { data, isLive: true, error: null };
    } catch (err: any) {
      console.warn("FastAPI backend /risk/overview unavailable, using calibrated DEMO data:", err);
      return {
        data: this._fallbackRiskOverview(),
        isLive: false,
        error: err?.message || "Backend server unreachable",
      };
    }
  },

  async calculateRisk(payload: {
    hazardExposure: number;
    vulnerability: number;
    criticality: number;
    accessibilityRisk: number;
  }): Promise<{ riskScore: number; riskCategory: string }> {
    const res = await fetch(`${API_BASE}/risk/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Risk calculation failed with status ${res.status}`);
    return await res.json();
  },

  async analyzeGeminiImpact(payload?: {
    cyclone_information?: any;
    weather_conditions?: any;
    infrastructure_risk_data?: any;
  }): Promise<GeminiDirectAnalysis> {
    const options: RequestInit = {
      method: payload ? "POST" : "GET",
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
      cache: "no-store",
    };
    const res = await fetch(`${API_BASE}/gemini/analyze`, options);
    if (!res.ok) {
      let errorMsg = `FastAPI server returned HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return await res.json();
  },

  async generateResponsePlan(): Promise<ResponsePlanResponse> {
    const res = await fetch(`${API_BASE}/gemini/response-plan`, { cache: "no-store" });
    if (!res.ok) {
      let errorMsg = `FastAPI server returned HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return await res.json();
  },

  async generateEmergencyAdvisory(): Promise<EmergencyAdvisoryResponse> {
    const res = await fetch(`${API_BASE}/gemini/advisory`, { cache: "no-store" });
    if (!res.ok) {
      let errorMsg = `FastAPI server returned HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return await res.json();
  },

  async getEarthEngineLayer(): Promise<GEELayerResponse> {
    try {
      const res = await fetch(`${API_BASE}/gee/layer`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("FastAPI GEE service unreachable, using graceful satellite fallback:", err);
      return {
        status: "fallback",
        layer_id: "satellite-environmental-layer",
        name: "Satellite / Environmental Layer",
        tile_url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS",
        source: "Environmental Satellite Imagery (Graceful Fallback)",
        is_gee_active: false,
        message: "GEE backend service offline. Environmental satellite layer fallback active.",
      };
    }
  },

  async getAIAnalysis(): Promise<GeminiAnalysisResponse> {
    try {
      const res = await fetch(`${API_BASE}/ai/analysis`, { cache: "no-store" });
      if (!res.ok) throw new Error("Backend response error");
      return await res.json();
    } catch (err) {
      console.warn("Using fallback AI analysis:", err);
      return {
        condition_interpretation:
          "Cyclone Varun is tracking NNW at 14 km/h with core sustained winds of 145 km/h. Coastal surge estimated at 2.8m.",
        infrastructure_risk_explanation:
          "High risk concentrated along coastal lowlands where low elevation (<4m) and road vulnerability coincide with peak tidal surge.",
        top_priorities: [
          {
            asset_name: "Coastal General Hospital",
            risk_level: "CRITICAL",
            rationale: "Elevation 3.5m, surge exposure 92%, single access corridor.",
            immediate_action:
              "Deploy backup generator flood barricades and stage evacuation ambulances.",
          },
          {
            asset_name: "Coastal Bridge A",
            risk_level: "CRITICAL",
            rationale: "Pier scour risk and storm surge water pressure.",
            immediate_action:
              "Enforce emergency transit-only closure 6 hours prior to landfall.",
          },
        ],
        action_plan: {
          phase_t_minus_12h: [
            "Evacuate vulnerable populations in coastal lowlands.",
            "Verify backup diesel fuel for trauma hospitals and mobile substations.",
          ],
          phase_t_minus_6h: [
            "Controlled power shutdown for coastal substations below 4m elevation.",
            "Close exposed estuarine bridges to civilian vehicles.",
          ],
          phase_landfall: [
            "Issue district-wide stay-indoors order.",
            "Monitor water gauge telemetry continuously.",
          ],
          phase_post_landfall: [
            "Deploy tree-clearing rapid teams along coastal evacuation corridors.",
            "Restore power to hospitals and emergency response shelters.",
          ],
        },
        official_emergency_advisory:
          "OFFICIAL ADVISORY: Demo Cyclone Varun approaching coastal region. Severe surge and destructive winds expected. Follow emergency directives.",
        source: "Client Fallback Mode (Start backend on port 8000 for live pipeline)",
        model: "CycloCast Offline Engine",
        is_fallback: true,
      };
    }
  },

  _fallbackRiskOverview(): RiskOverviewSummary {
    const demoAssessments: InfrastructureRiskAssessment[] = [
      {
        infrastructure: {
          id: "INF-HOSP-002",
          name: "Coastal General Hospital",
          type: "Hospital",
          latitude: 16.05,
          longitude: 82.02,
          criticality: 92.0,
          elevation: 3.5,
          population_served: 75000,
          flood_exposure: 92.0,
          vulnerability: 82.0,
          accessibility_risk: 91.0,
          condition_notes: "Very low elevation coastal facility. Highly vulnerable to storm surge inundation.",
        },
        distance_to_eye_km: 34.2,
        hazard_exposure: 92.4,
        hazard_component: 36.96,
        vulnerability_component: 24.6,
        criticality_component: 18.4,
        accessibility_component: 9.1,
        risk_score: 89.1,
        risk_category: "CRITICAL",
        in_destructive_zone: true,
        in_gale_zone: true,
        projected_surge_threat_m: 2.8,
        recommended_priority_level: 1,
        primary_failure_mode: "Ground floor flooding and backup generator failure due to low elevation and storm surge",
        recommended_mitigation: "Deploy submersible pumps, move critical ICU equipment to upper floors, pre-position mobile generators on elevated pads.",
      },
      {
        infrastructure: {
          id: "INF-BRID-001",
          name: "Coastal Bridge A",
          type: "Bridge",
          latitude: 16.08,
          longitude: 81.98,
          criticality: 96.0,
          elevation: 4.8,
          population_served: 480000,
          flood_exposure: 88.0,
          vulnerability: 78.0,
          accessibility_risk: 88.0,
          condition_notes: "Primary logistical artery connecting coastal evacuation routes with mainland highways.",
        },
        distance_to_eye_km: 42.1,
        hazard_exposure: 88.2,
        hazard_component: 35.28,
        vulnerability_component: 22.2,
        criticality_component: 19.2,
        accessibility_component: 8.8,
        risk_score: 85.5,
        risk_category: "CRITICAL",
        in_destructive_zone: true,
        in_gale_zone: true,
        projected_surge_threat_m: 2.5,
        recommended_priority_level: 2,
        primary_failure_mode: "Hydrodynamic wave impact on superstructure and approach road scouring",
        recommended_mitigation: "Close bridge to non-emergency heavy traffic 6h before landfall; place rock armor along abutments.",
      },
      {
        infrastructure: {
          id: "INF-PWR-001",
          name: "East Coastal Power Station",
          type: "Power Station",
          latitude: 16.02,
          longitude: 82.05,
          criticality: 89.0,
          elevation: 4.1,
          population_served: 210000,
          flood_exposure: 84.0,
          vulnerability: 78.0,
          accessibility_risk: 75.0,
          condition_notes: "Supplies regional drinking water pumps and emergency hospital distribution grids.",
        },
        distance_to_eye_km: 36.8,
        hazard_exposure: 86.5,
        hazard_component: 34.6,
        vulnerability_component: 23.4,
        criticality_component: 17.8,
        accessibility_component: 7.5,
        risk_score: 83.3,
        risk_category: "CRITICAL",
        in_destructive_zone: true,
        in_gale_zone: true,
        projected_surge_threat_m: 2.4,
        recommended_priority_level: 3,
        primary_failure_mode: "Substation control room flooding and high-voltage transformer short-circuit",
        recommended_mitigation: "Execute controlled sectional isolation, install temporary flood deflection barriers, ready mobile substations.",
      },
      {
        infrastructure: {
          id: "INF-ROAD-001",
          name: "Coastal Evacuation Highway",
          type: "Road",
          latitude: 15.98,
          longitude: 81.95,
          criticality: 90.0,
          elevation: 3.5,
          population_served: 165000,
          flood_exposure: 84.0,
          vulnerability: 72.0,
          accessibility_risk: 86.0,
          condition_notes: "Low-lying embankment road vulnerable to river overflow and storm wave overtopping.",
        },
        distance_to_eye_km: 48.0,
        hazard_exposure: 80.0,
        hazard_component: 32.0,
        vulnerability_component: 21.6,
        criticality_component: 18.0,
        accessibility_component: 8.6,
        risk_score: 80.2,
        risk_category: "HIGH",
        in_destructive_zone: true,
        in_gale_zone: true,
        projected_surge_threat_m: 2.0,
        recommended_priority_level: 4,
        primary_failure_mode: "Complete inundation and coastal embankment washout cutting off evacuation corridor",
        recommended_mitigation: "Establish bypass detours via elevated inland routes; mark flood poles; deploy water-rescue teams.",
      },
      {
        infrastructure: {
          id: "INF-SHEL-001",
          name: "Regional High-Elevation Shelter",
          type: "Emergency Shelter",
          latitude: 16.12,
          longitude: 81.90,
          criticality: 94.0,
          elevation: 9.8,
          population_served: 4500,
          flood_exposure: 45.0,
          vulnerability: 28.0,
          accessibility_risk: 58.0,
          condition_notes: "Engineered 3-tier concrete cyclone shelter with rainwater harvesting and solar battery array.",
        },
        distance_to_eye_km: 41.5,
        hazard_exposure: 74.0,
        hazard_component: 29.6,
        vulnerability_component: 8.4,
        criticality_component: 18.8,
        accessibility_component: 5.8,
        risk_score: 62.6,
        risk_category: "MODERATE",
        in_destructive_zone: true,
        in_gale_zone: true,
        projected_surge_threat_m: 0.0,
        recommended_priority_level: 5,
        primary_failure_mode: "Access road impassability preventing evacuees from reaching shelter",
        recommended_mitigation: "Initiate priority bus evacuations at least 12 hours prior to landfall; test auxiliary power and water stocks.",
      },
    ];

    return {
      total_assets: 5,
      critical_count: 3,
      critical_asset_count: 3,
      high_count: 1,
      moderate_count: 1,
      low_count: 0,
      average_risk_score: 80.1,
      overall_risk_score: 80.1,
      flood_risk_score: 84.2,
      infrastructure_risk_score: 66.8,
      evacuation_risk_score: 79.6,
      population_at_critical_risk: 765000,
      population_at_high_risk: 165000,
      highest_risk_infrastructure: demoAssessments,
      by_type_breakdown: {
        Hospital: { CRITICAL: 1, HIGH: 0, MODERATE: 0, LOW: 0, TOTAL: 1 },
        Bridge: { CRITICAL: 1, HIGH: 0, MODERATE: 0, LOW: 0, TOTAL: 1 },
        "Power Station": { CRITICAL: 1, HIGH: 0, MODERATE: 0, LOW: 0, TOTAL: 1 },
        Road: { CRITICAL: 0, HIGH: 1, MODERATE: 0, LOW: 0, TOTAL: 1 },
        "Emergency Shelter": { CRITICAL: 0, HIGH: 0, MODERATE: 1, LOW: 0, TOTAL: 1 },
      },
      cyclone_id: "CYC-DEMO-VARUN",
      calculation_timestamp: new Date().toISOString(),
      model_version: "transparent-v1.0 (40/30/20/10)",
    };
  },
};
