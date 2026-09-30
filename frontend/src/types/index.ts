export type InfrastructureType =
  | "Hospital"
  | "Road"
  | "Bridge"
  | "Power Station"
  | "Emergency Shelter";

export type RiskCategory = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface Infrastructure {
  id: string;
  name: string;
  type: InfrastructureType;
  latitude: number;
  longitude: number;
  criticality: number;
  elevation: number;
  population_served: number;
  flood_exposure: number;
  vulnerability: number;
  accessibility_risk: number;
  condition_notes?: string;
}

export interface ForecastPoint {
  time_offset_hours: number;
  latitude: number;
  longitude: number;
  wind_speed_kmh: number;
  central_pressure_hpa: number;
  estimated_surge_m: number;
}

export interface Cyclone {
  id: string;
  name: string;
  category: number;
  center_lat: number;
  center_lon: number;
  wind_speed_kmh: number;
  gusts_kmh: number;
  central_pressure_hpa: number;
  movement_speed_kmh: number;
  movement_direction: string;
  radius_destructive_km: number;
  radius_gale_km: number;
  estimated_storm_surge_m: number;
  estimated_landfall_time?: string;
  landfall_location?: string;
  rainfall_mm?: number;
  estimated_severity?: string;
  last_updated_time?: string;
  data_mode?: string;
  forecast_track: ForecastPoint[];
  is_simulated: boolean;
}

export interface InfrastructureRiskAssessment {
  infrastructure: Infrastructure;
  distance_to_eye_km: number;
  hazard_exposure: number;
  vulnerability_component: number;
  hazard_component: number;
  criticality_component: number;
  accessibility_component: number;
  risk_score: number;
  risk_category: RiskCategory;
  in_destructive_zone: boolean;
  in_gale_zone: boolean;
  projected_surge_threat_m: number;
  recommended_priority_level: number;
  primary_failure_mode: string;
  recommended_mitigation: string;
}

export interface RiskOverviewSummary {
  total_assets: number;
  critical_count: number;
  critical_asset_count?: number;
  high_count: number;
  moderate_count: number;
  low_count: number;
  average_risk_score: number;
  overall_risk_score?: number;
  flood_risk_score?: number;
  infrastructure_risk_score?: number;
  evacuation_risk_score?: number;
  population_at_critical_risk: number;
  population_at_high_risk: number;
  highest_risk_infrastructure: InfrastructureRiskAssessment[];
  by_type_breakdown: Record<string, Record<string, number>>;
  cyclone_id: string;
  calculation_timestamp: string;
  model_version: string;
}

export interface TopPriorityItem {
  asset_name: string;
  risk_level: string;
  rationale: string;
  immediate_action: string;
}

export interface AIActionPlan {
  phase_t_minus_12h: string[];
  phase_t_minus_6h: string[];
  phase_landfall: string[];
  phase_post_landfall: string[];
}

export interface GeminiAnalysisResponse {
  condition_interpretation: string;
  infrastructure_risk_explanation: string;
  top_priorities: TopPriorityItem[];
  action_plan: AIActionPlan;
  official_emergency_advisory: string;
  source: string;
  model: string;
  is_fallback: boolean;
}
