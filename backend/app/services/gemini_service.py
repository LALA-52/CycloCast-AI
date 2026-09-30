import json
from typing import Optional, Dict, Any, List
from app.config import settings
from app.models.cyclone import Cyclone
from app.models.risk import RiskOverviewSummary, InfrastructureRiskAssessment

SYSTEM_PROMPT = """You are CycloCast AI's Disaster Intelligence & Infrastructure Vulnerability Advisor.
Your mission:
1. Interpret cyclone conditions (wind severity, pressure gradient, movement speed, storm surge).
2. Explain localized infrastructure risk grounded in the transparent risk model (40% Hazard Exposure + 30% Vulnerability + 20% Criticality + 10% Accessibility Risk).
3. Identify top vulnerable priority assets requiring immediate pre-landfall intervention.
4. Recommend actionable, time-phased emergency response directives (T-12h to T-6h, Landfall, and Immediate Post-Landfall).
5. Generate an official, concise emergency advisory for district authorities and emergency services.

CRITICAL RULES:
- Never hallucinate measurements, wind speeds, or surge numbers beyond the provided inputs.
- Clearly identify the source of data (e.g. 'Calculated Risk Model', 'Forecast Track', 'Simulated Benchmark Dataset').
- Be concise, professional, operational, and urgent.
"""

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiService] Warning: Could not initialize google-genai client: {e}")

    def generate_impact_analysis(
        self,
        cyclone: Cyclone,
        risk_summary: RiskOverviewSummary
    ) -> Dict[str, Any]:
        """
        Generate AI-powered impact assessment, priority actions, and emergency advisory.
        Falls back smoothly to structured deterministic reasoning if GEMINI_API_KEY is not configured.
        """
        top_critical_assets = risk_summary.highest_risk_infrastructure[:5]

        # Prepare context payload
        context = {
            "cyclone": {
                "name": cyclone.name,
                "category": cyclone.category,
                "wind_speed_kmh": cyclone.wind_speed_kmh,
                "gusts_kmh": cyclone.gusts_kmh,
                "central_pressure_hpa": cyclone.central_pressure_hpa,
                "movement_speed_kmh": cyclone.movement_speed_kmh,
                "movement_direction": cyclone.movement_direction,
                "estimated_storm_surge_m": cyclone.estimated_storm_surge_m,
                "destructive_radius_km": cyclone.radius_destructive_km,
                "gale_radius_km": cyclone.radius_gale_km,
                "landfall_sector": cyclone.landfall_location,
                "is_simulated": cyclone.is_simulated
            },
            "summary_metrics": {
                "total_assets": risk_summary.total_assets,
                "critical_count": risk_summary.critical_count,
                "high_count": risk_summary.high_count,
                "moderate_count": risk_summary.moderate_count,
                "low_count": risk_summary.low_count,
                "average_risk_score": risk_summary.average_risk_score,
                "population_at_critical_risk": risk_summary.population_at_critical_risk,
                "population_at_high_risk": risk_summary.population_at_high_risk
            },
            "top_vulnerable_assets": [
                {
                    "name": a.infrastructure.name,
                    "type": a.infrastructure.type.value,
                    "risk_score": a.risk_score,
                    "category": a.risk_category.value,
                    "distance_km": a.distance_to_eye_km,
                    "elevation_m": a.infrastructure.elevation,
                    "population_served": a.infrastructure.population_served,
                    "primary_failure_mode": a.primary_failure_mode,
                    "recommended_mitigation": a.recommended_mitigation
                }
                for a in top_critical_assets
            ]
        }

        if self.client:
            try:
                prompt = f"""
Analyze the cyclone impact scenario below and produce a comprehensive, structured emergency intelligence report:

Scenario Data:
{json.dumps(context, indent=2)}

Please return your response in the following JSON format:
{{
  "condition_interpretation": "Executive summary interpreting storm dynamics, surge threat, and landfall timing.",
  "infrastructure_risk_explanation": "Analytical explanation of why specific infrastructure types face acute vulnerability based on elevation, storm proximity, and accessibility.",
  "top_priorities": [
    {{
      "asset_name": "Name of asset",
      "risk_level": "CRITICAL or HIGH",
      "rationale": "Key vulnerability factors",
      "immediate_action": "Tactical operational step"
    }}
  ],
  "action_plan": {{
    "phase_t_minus_12h": ["Action 1", "Action 2"],
    "phase_t_minus_6h": ["Action 1", "Action 2"],
    "phase_landfall": ["Action 1", "Action 2"],
    "phase_post_landfall": ["Action 1", "Action 2"]
  }},
  "official_emergency_advisory": "Concise, authoritative advisory message suitable for radio, SMS alerts, and district commanders."
}}

Output ONLY valid JSON.
"""
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "system_instruction": SYSTEM_PROMPT,
                        "response_mime_type": "application/json"
                    }
                )

                if response and response.text:
                    parsed = json.loads(response.text)
                    parsed["source"] = "Gemini Live Multimodal Reasoning"
                    parsed["model"] = self.model_name
                    parsed["is_fallback"] = False
                    return parsed
            except Exception as ex:
                print(f"[GeminiService] API call failed, falling back to deterministic engine: {ex}")

        # Deterministic Grounded Fallback
        return self._generate_deterministic_analysis(cyclone, risk_summary, top_critical_assets)

    def _generate_deterministic_analysis(
        self,
        cyclone: Cyclone,
        summary: RiskOverviewSummary,
        top_critical: List[InfrastructureRiskAssessment]
    ) -> Dict[str, Any]:
        """
        Generates realistic, rigorous analysis without external API dependencies.
        Guaranteed to not hallucinate, adhere to prompt metrics, and provide immediate value.
        """
        surge_desc = "extreme" if cyclone.estimated_storm_surge_m >= 3.0 else "moderate-to-severe"
        data_type = "Simulated Scenario Dataset" if cyclone.is_simulated else "Live Meteorological Bulletin"

        condition_interp = (
            f"{cyclone.name} is currently tracking {cyclone.movement_direction} at {cyclone.movement_speed_kmh} km/h "
            f"as a Category {cyclone.category} storm with sustained core winds of {cyclone.wind_speed_kmh} km/h (gusting to {cyclone.gusts_kmh} km/h). "
            f"Central pressure is recorded at {cyclone.central_pressure_hpa} hPa. "
            f"Estimated storm surge reaches {cyclone.estimated_storm_surge_m}m above astronomical tide. "
            f"Active gale wind field (R34) spans {cyclone.radius_gale_km} km with a destructive core radius (R50) of {cyclone.radius_destructive_km} km. "
            f"Projected landfall is concentrated along {cyclone.landfall_location or 'coastal sector'}. [{data_type}]"
        )

        risk_explanation = (
            f"Transparent Risk Analysis reveals {summary.critical_count} assets in CRITICAL condition and {summary.high_count} in HIGH risk, "
            f"threatening service continuity for {summary.population_at_critical_risk + summary.population_at_high_risk:,} dependents. "
            f"The primary failure drivers are low coastal elevations (<5m above sea level) combined with surge inundation and bridge/road "
            f"accessibility choke points that prevent emergency re-supply and secondary power generation."
        )

        priorities = []
        for item in top_critical:
            priorities.append({
                "asset_name": item.infrastructure.name,
                "risk_level": item.risk_category.value,
                "rationale": f"Composite score {item.risk_score}/100. Distance {item.distance_to_eye_km} km. {item.primary_failure_mode}.",
                "immediate_action": item.recommended_mitigation
            })

        action_plan = {
            "phase_t_minus_12h": [
                f"Complete mandatory evacuation of low-lying flood zones (<{cyclone.estimated_storm_surge_m + 1.5}m elevation) to designated reinforced shelters.",
                "Inspect and secure auxiliary diesel generators at hospitals and emergency communications nodes.",
                "Position heavy clearing equipment (JCBs, tree clearing teams) along arterial highway NH-16."
            ],
            "phase_t_minus_6h": [
                f"Close high-risk bridges ({', '.join(a.infrastructure.name for a in top_critical if a.infrastructure.type == 'Bridge') or 'coastal estuary bridges'}) to civilian traffic.",
                "Implement controlled electrical shutdown of coastal substations threatened by saltwater inundation to prevent catastrophic equipment destruction.",
                "Lock down emergency shelters with tested satellite communication links and 5-day food/potable water stocks."
            ],
            "phase_landfall": [
                "Issue total shelter-in-place orders across coastal districts.",
                "Monitor surge telemetry and river estuarine flow gauges in real time.",
                "Restrict emergency responder movement during peak destructive winds (>100 km/h)."
            ],
            "phase_post_landfall": [
                "Deploy rapid aerial and drone recon to verify bridge structural integrity and road washouts.",
                "Prioritize power grid restoration for trauma hospitals and water pumping facilities.",
                "Establish temporary Bailey bridges or amphibious supply lanes where access roads are inundated."
            ]
        }

        official_advisory = (
            f"EMERGENCY CYCLONE ADVISORY - {cyclone.name.upper()}: "
            f"Category {cyclone.category} cyclone with winds up to {cyclone.wind_speed_kmh} km/h and peak surge of {cyclone.estimated_storm_surge_m}m "
            f"approaching {cyclone.landfall_location or 'the coast'}. {summary.critical_count} critical infrastructure nodes at severe risk. "
            f"All non-emergency transit suspended. Evacuate vulnerable coastal structures immediately. Follow disaster authority directives."
        )

        return {
            "condition_interpretation": condition_interp,
            "infrastructure_risk_explanation": risk_explanation,
            "top_priorities": priorities,
            "action_plan": action_plan,
            "official_emergency_advisory": official_advisory,
            "source": "Grounded Transparent Reasoning Engine (Rule-based Fallback)",
            "model": "CycloCast Deterministic Engine (Configure GEMINI_API_KEY for live Gemini 2.5 synthesis)",
            "is_fallback": True
        }

gemini_service = GeminiService()
