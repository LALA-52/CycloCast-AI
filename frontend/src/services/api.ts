import {
  Cyclone,
  Infrastructure,
  InfrastructureRiskAssessment,
  RiskOverviewSummary,
  GeminiAnalysisResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Realistic demo benchmark data (Odisha coastal sector scenario)
const FALLBACK_CYCLONE: Cyclone = {
  id: "CYC-2024-DANA",
  name: "Cyclone Dana",
  category: 3,
  center_lat: 20.65,
  center_lon: 87.20,
  wind_speed_kmh: 125,
  gusts_kmh: 145,
  central_pressure_hpa: 982,
  movement_speed_kmh: 14,
  movement_direction: "NNW",
  radius_destructive_km: 65,
  radius_gale_km: 190,
  estimated_storm_surge_m: 2.2,
  estimated_landfall_time: "Landfall in ~6 hours (Dhamra/Bhitarkanika Coast)",
  landfall_location: "Dhamra Port - Bhitarkanika Estuary, Odisha",
  rainfall_mm: 280,
  estimated_severity: "Very Severe Cyclonic Storm (VSCS)",
  last_updated_time: "30 Sep 2026, 01:30 UTC",
  data_mode: "Realistic Demo Dataset (Odisha Coast Benchmark)",
  is_simulated: true,
  forecast_track: [
    {
      time_offset_hours: 0,
      latitude: 20.65,
      longitude: 87.20,
      wind_speed_kmh: 125,
      central_pressure_hpa: 982,
      estimated_surge_m: 2.2,
    },
    {
      time_offset_hours: 6,
      latitude: 20.88,
      longitude: 86.95,
      wind_speed_kmh: 130,
      central_pressure_hpa: 980,
      estimated_surge_m: 2.5,
    },
    {
      time_offset_hours: 12,
      latitude: 21.15,
      longitude: 86.60,
      wind_speed_kmh: 95,
      central_pressure_hpa: 990,
      estimated_surge_m: 1.4,
    },
  ],
};

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
    try {
      const res = await fetch(`${API_BASE}/risk/overview`, { cache: "no-store" });
      if (!res.ok) throw new Error("Backend response error");
      return await res.json();
    } catch (err) {
      console.warn("Calculating client fallback risk overview:", err);
      return this._fallbackRiskOverview();
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
          "Cyclone Dana is tracking NNW at 14 km/h with core sustained winds of 125 km/h. Coastal surge estimated at 2.2m.",
        infrastructure_risk_explanation:
          "High risk concentrated along Dhamra and Baitarani river estuary where low elevation (<4m) and road vulnerability coincide with peak tidal surge.",
        top_priorities: [
          {
            asset_name: "Dhamra Coastal Primary Emergency Hospital",
            risk_level: "CRITICAL",
            rationale: "Elevation 3.8m, surge exposure 88%, single access corridor.",
            immediate_action:
              "Deploy backup generator flood barricades and stage evacuation ambulances.",
          },
          {
            asset_name: "Baitarani River Estuary Mega Bridge",
            risk_level: "CRITICAL",
            rationale: "Pier scour risk and storm surge water pressure.",
            immediate_action:
              "Enforce emergency transit-only closure 6 hours prior to landfall.",
          },
        ],
        action_plan: {
          phase_t_minus_12h: [
            "Evacuate vulnerable populations in Dhamra and Bhitarkanika coastal belt.",
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
            "Deploy tree-clearing rapid teams along NH-16 evacuation corridor.",
            "Restore power to hospitals and emergency response shelters.",
          ],
        },
        official_emergency_advisory:
          "OFFICIAL ADVISORY: Cyclone Dana approaching coastal Odisha. Severe surge and destructive winds expected. Follow emergency directives.",
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
          name: "Dhamra Coastal Primary Emergency Hospital",
          type: "Hospital",
          latitude: 20.812,
          longitude: 86.915,
          criticality: 92.0,
          elevation: 3.8,
          population_served: 75000,
          flood_exposure: 88.0,
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
        projected_surge_threat_m: 2.2,
        recommended_priority_level: 1,
        primary_failure_mode: "Ground floor flooding and backup generator failure due to low elevation and storm surge",
        recommended_mitigation: "Deploy submersible pumps, move critical ICU equipment to upper floors, pre-position mobile generators on elevated pads.",
      },
      {
        infrastructure: {
          id: "INF-BRID-001",
          name: "Baitarani River Estuary Mega Bridge",
          type: "Bridge",
          latitude: 20.760,
          longitude: 86.820,
          criticality: 96.0,
          elevation: 5.2,
          population_served: 480000,
          flood_exposure: 85.0,
          vulnerability: 74.0,
          accessibility_risk: 88.0,
          condition_notes: "Primary logistical artery connecting coastal evacuation routes with mainland highway NH-16.",
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
        projected_surge_threat_m: 2.1,
        recommended_priority_level: 2,
        primary_failure_mode: "Hydrodynamic wave impact on superstructure and approach road scouring",
        recommended_mitigation: "Close bridge to non-emergency heavy traffic 6h before landfall; place rock armor along abutments.",
      },
      {
        infrastructure: {
          id: "INF-PWR-001",
          name: "Dhamra Port 220kV Grid Substation",
          type: "Power Station",
          latitude: 20.805,
          longitude: 86.960,
          criticality: 89.0,
          elevation: 4.1,
          population_served: 210000,
          flood_exposure: 82.0,
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
        projected_surge_threat_m: 2.0,
        recommended_priority_level: 3,
        primary_failure_mode: "Substation control room flooding and high-voltage transformer short-circuit",
        recommended_mitigation: "Execute controlled sectional isolation, install temporary flood deflection barriers, ready mobile substations.",
      },
      {
        infrastructure: {
          id: "INF-ROAD-001",
          name: "Rajnagar-Dhamra Coastal Evacuation Corridor (SH-9A)",
          type: "Road",
          latitude: 20.740,
          longitude: 86.780,
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
        projected_surge_threat_m: 1.8,
        recommended_priority_level: 4,
        primary_failure_mode: "Complete inundation and coastal embankment washout cutting off evacuation corridor",
        recommended_mitigation: "Establish bypass detours via elevated inland routes; mark flood poles; deploy water-rescue teams.",
      },
      {
        infrastructure: {
          id: "INF-SHEL-001",
          name: "Bhitarkanika High-Elevation Cyclone Shelter",
          type: "Emergency Shelter",
          latitude: 20.710,
          longitude: 86.870,
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
      cyclone_id: "CYC-2024-DANA",
      calculation_timestamp: new Date().toISOString(),
      model_version: "transparent-v1.0 (40/30/20/10)",
    };
  },
};
