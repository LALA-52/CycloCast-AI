import os
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import HTTPException
from app.config import settings
from app.models.cyclone import Cyclone
from app.models.risk import RiskOverviewSummary, InfrastructureRiskAssessment
from app.models.gemini import (
    CycloneInformation,
    WeatherConditions,
    InfrastructureRiskData,
    GeminiAnalyzeResponse,
    ResponsePlanItem,
    ResponsePlanResponse,
    EmergencyAdvisoryResponse,
)

SYSTEM_PROMPT = """You are CycloCast AI's Disaster Intelligence & Infrastructure Vulnerability Advisor.
Your mission:
1. Interpret cyclone conditions (wind severity, pressure gradient, movement speed, storm surge).
2. Interpret current meteorological weather conditions (rainfall precipitation, tidal levels, wind gusts).
3. Evaluate localized infrastructure risk based on structural vulnerability, criticality, and accessibility.
4. Synthesize:
   - An authoritative, operational impact summary.
   - Distinct, critical key risks (infrastructure failures, human safety, isolation threats).
   - Time-phased, prioritized recommended actions for disaster response commanders.

CRITICAL RULES:
- Never hallucinate measurements, wind speeds, or surge numbers beyond the provided inputs.
- Clearly ground all statements in the supplied cyclone, weather, and infrastructure risk data.
- Be concise, professional, operational, and urgent.
- Output ONLY valid JSON matching the requested schema.
"""

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        self.model_name = settings.GEMINI_MODEL or "gemini-3.5-flash-lite"
        self._client = None
        self._init_client()

    def _init_client(self):
        """Initializes the google-genai client if API key is present."""
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiService] Warning: Could not initialize google-genai client: {e}")
                self._client = None

    def is_configured(self) -> bool:
        """Returns True if a non-empty Gemini API key is configured."""
        return bool(self.api_key)

    def analyze(
        self,
        cyclone_info: CycloneInformation,
        weather_conditions: WeatherConditions,
        risk_data: InfrastructureRiskData,
    ) -> GeminiAnalyzeResponse:
        """
        Receives:
        - cyclone information
        - weather conditions
        - infrastructure risk data

        Returns:
        - impact summary
        - key risks
        - recommended actions

        If the key is unavailable, returns a clear configuration error and does not crash.
        """
        if not self.is_configured():
            raise HTTPException(
                status_code=503,
                detail=(
                    "Configuration Error: GEMINI_API_KEY is not configured in the backend environment. "
                    "Please set GEMINI_API_KEY in backend/.env to activate live Gemini intelligence."
                ),
            )

        if not self._client:
            self._init_client()
            if not self._client:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "Configuration Error: google-genai client could not be initialized with the provided API key. "
                        "Please verify your GEMINI_API_KEY in backend/.env."
                    ),
                )

        # Build prompt context
        context = {
            "cyclone_information": cyclone_info.model_dump(),
            "weather_conditions": weather_conditions.model_dump(),
            "infrastructure_risk_data": risk_data.model_dump(),
        }

        prompt = f"""Analyze the cyclone, weather, and infrastructure risk data below and generate the official intelligence assessment:

SCENARIO DATA:
{json.dumps(context, indent=2)}

Please return your response in the following strict JSON schema:
{{
  "impact_summary": "Concise executive synthesis explaining the cyclone dynamics, tidal surge threat, and localized coastal impact.",
  "key_risks": [
    "Specific high-consequence risk 1 (e.g. hospital ICU flooding, bridge scouring, grid isolation)",
    "Specific high-consequence risk 2",
    "Specific high-consequence risk 3"
  ],
  "recommended_actions": [
    "Priority tactical action 1 (immediate pre-landfall evacuation / mitigation)",
    "Priority tactical action 2 (asset hardening / sectional power shutdown)",
    "Priority tactical action 3 (search & rescue pre-positioning / road clearance)"
  ]
}}

Output ONLY valid JSON.
"""

        # Primary and fallback model candidates
        candidate_models = [self.model_name]
        for fallback in ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)
        last_error = None

        for model in candidate_models:
            try:
                response = self._client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "system_instruction": SYSTEM_PROMPT,
                        "response_mime_type": "application/json",
                    },
                )

                if response and response.text:
                    raw_text = response.text.strip()
                    if raw_text.startswith("```"):
                        lines = raw_text.splitlines()
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].startswith("```"):
                            lines = lines[:-1]
                        raw_text = "\n".join(lines).strip()

                    try:
                        parsed = json.loads(raw_text)
                    except json.JSONDecodeError:
                        start_idx = raw_text.find("{")
                        end_idx = raw_text.rfind("}")
                        if start_idx != -1 and end_idx != -1:
                            parsed = json.loads(raw_text[start_idx : end_idx + 1])
                        else:
                            raise

                    impact_summary = (
                        parsed.get("impact_summary")
                        or parsed.get("impactSummary")
                        or "Severe cyclone impact expected across coastal sectors."
                    )
                    key_risks = (
                        parsed.get("key_risks")
                        or parsed.get("keyRisks")
                        or ["Severe coastal storm surge", "Structural power line failure", "Road corridor breach"]
                    )
                    recommended_actions = (
                        parsed.get("recommended_actions")
                        or parsed.get("recommendedActions")
                        or ["Evacuate low-lying areas", "Pre-position generators at hospitals", "Suspend traffic on bridges"]
                    )

                    return GeminiAnalyzeResponse(
                        impact_summary=impact_summary,
                        key_risks=key_risks,
                        recommended_actions=recommended_actions,
                        impactSummary=impact_summary,
                        keyRisks=key_risks,
                        recommendedActions=recommended_actions,
                        model=model,
                        source="Google Gemini Live Intelligence",
                        timestamp=datetime.now(timezone.utc).isoformat(),
                    )
            except Exception as ex:
                last_error = ex
                print(f"[GeminiService] Model {model} attempt failed: {ex}")
                continue

        # If live call failed due to API rate limits/outage, return a safe clear error without crashing the server
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API generation failed: {str(last_error)}. The service handled this gracefully without crashing.",
        )

    def generate_impact_analysis(
        self,
        cyclone: Cyclone,
        risk_summary: RiskOverviewSummary,
    ) -> Dict[str, Any]:
        """
        Backwards-compatible method supporting previous dashboard analysis routes.
        """
        top_critical_assets = risk_summary.highest_risk_infrastructure[:5]

        cyclone_info = CycloneInformation(
            name=cyclone.name,
            category=cyclone.category,
            wind_speed_kmh=cyclone.wind_speed_kmh,
            gusts_kmh=cyclone.gusts_kmh,
            central_pressure_hpa=cyclone.central_pressure_hpa,
            movement_speed_kmh=cyclone.movement_speed_kmh,
            movement_direction=cyclone.movement_direction,
            estimated_storm_surge_m=cyclone.estimated_storm_surge_m,
            radius_destructive_km=cyclone.radius_destructive_km,
            radius_gale_km=cyclone.radius_gale_km,
            landfall_location=cyclone.landfall_location or "Odisha Coast",
        )

        weather_cond = WeatherConditions(
            rainfall_mm=cyclone.rainfall_mm or 280.0,
            coastal_wind_gusts_kmh=cyclone.gusts_kmh,
            barometric_pressure_hpa=cyclone.central_pressure_hpa,
            tide_level_m=cyclone.estimated_storm_surge_m,
        )

        risk_data = InfrastructureRiskData(
            overall_risk_score=risk_summary.overall_risk_score or risk_summary.average_risk_score,
            critical_asset_count=risk_summary.critical_count,
            high_risk_asset_count=risk_summary.high_count,
            total_assets=risk_summary.total_assets,
            top_vulnerable_assets=[
                {
                    "name": a.infrastructure.name,
                    "type": a.infrastructure.type.value if hasattr(a.infrastructure.type, "value") else str(a.infrastructure.type),
                    "risk_score": a.risk_score,
                    "category": a.risk_category.value if hasattr(a.risk_category, "value") else str(a.risk_category),
                    "distance_km": a.distance_to_eye_km,
                    "elevation_m": a.infrastructure.elevation,
                    "primary_failure_mode": a.primary_failure_mode,
                    "recommended_mitigation": a.recommended_mitigation,
                }
                for a in top_critical_assets
            ],
        )

        try:
            analysis = self.analyze(cyclone_info, weather_cond, risk_data)
            return {
                "condition_interpretation": analysis.impact_summary,
                "infrastructure_risk_explanation": "\n".join(analysis.key_risks),
                "top_priorities": [
                    {
                        "asset_name": a.infrastructure.name,
                        "risk_level": str(a.risk_category.value if hasattr(a.risk_category, "value") else a.risk_category),
                        "rationale": a.primary_failure_mode,
                        "immediate_action": a.recommended_mitigation,
                    }
                    for a in top_critical_assets
                ],
                "action_plan": {
                    "phase_t_minus_12h": analysis.recommended_actions[:2],
                    "phase_t_minus_6h": analysis.recommended_actions[2:4] if len(analysis.recommended_actions) > 2 else analysis.recommended_actions[:1],
                    "phase_landfall": ["Enforce mandatory indoor sheltering", "Monitor emergency radio channels"],
                    "phase_post_landfall": ["Deploy emergency debris clearance", "Inspect hospital backup power"],
                },
                "official_emergency_advisory": analysis.impact_summary,
                "source": analysis.source,
                "model": analysis.model,
                "is_fallback": False,
            }
        except HTTPException:
            return self._generate_deterministic_analysis(cyclone, risk_summary, top_critical_assets)

    def _generate_deterministic_analysis(
        self,
        cyclone: Cyclone,
        summary: RiskOverviewSummary,
        top_critical: List[InfrastructureRiskAssessment],
    ) -> Dict[str, Any]:
        """Deterministic fallback when live API is unavailable."""
        condition_interp = (
            f"{cyclone.name} is tracking {cyclone.movement_direction} at {cyclone.movement_speed_kmh} km/h "
            f"as a Category {cyclone.category} storm with sustained core winds of {cyclone.wind_speed_kmh} km/h (gusting to {cyclone.gusts_kmh} km/h). "
            f"Estimated storm surge reaches {cyclone.estimated_storm_surge_m}m above astronomical tide."
        )

        risk_explanation = (
            f"Transparent Risk Analysis assesses {summary.total_assets} lifeline assets. "
            f"{summary.critical_count} assets face CRITICAL failure thresholds due to low elevation and proximity to the eye."
        )

        priorities = [
            {
                "asset_name": a.infrastructure.name,
                "risk_level": a.risk_category.value if hasattr(a.risk_category, "value") else str(a.risk_category),
                "rationale": a.primary_failure_mode,
                "immediate_action": a.recommended_mitigation,
            }
            for a in top_critical
        ]

        action_plan = {
            "phase_t_minus_12h": [
                "Evacuate vulnerable populations in designated storm surge zones.",
                "Verify auxiliary diesel generators and 72-hour fuel reserves.",
            ],
            "phase_t_minus_6h": [
                "Controlled sectional isolation for substations below 4m elevation.",
                "Close exposed bridges to heavy transit.",
            ],
            "phase_landfall": [
                "Issue district-wide stay-indoors order.",
                "Monitor tidal gauge telemetry continuously.",
            ],
            "phase_post_landfall": [
                "Deploy debris clearance units along primary transit corridors.",
                "Conduct structural safety inspections of regional shelters.",
            ],
        }

        official_advisory = (
            f"OFFICIAL EMERGENCY ADVISORY - {cyclone.name.upper()}: "
            f"Category {cyclone.category} cyclone with winds up to {cyclone.wind_speed_kmh} km/h and peak surge of {cyclone.estimated_storm_surge_m}m. "
            f"{summary.critical_count} critical infrastructure nodes at severe risk. Follow disaster authority directives."
        )

        return {
            "condition_interpretation": condition_interp,
            "infrastructure_risk_explanation": risk_explanation,
            "top_priorities": priorities,
            "action_plan": action_plan,
            "official_emergency_advisory": official_advisory,
            "source": "Grounded Deterministic Engine (Offline Fallback)",
            "model": "CycloCast Deterministic Engine",
            "is_fallback": True,
        }

    def generate_response_plan(
        self,
        cyclone: Optional[Cyclone] = None,
        risk_summary: Optional[RiskOverviewSummary] = None,
    ) -> ResponsePlanResponse:
        """
        Uses existing infrastructure risk data to identify highest-risk infrastructure
        and generates an operational Response Plan via Gemini.
        Returns:
        - Priority
        - Infrastructure
        - Risk score
        - Reason
        - Recommended action
        """
        if cyclone is None:
            from app.api.routes_cyclone import get_active_cyclone
            cyclone = get_active_cyclone()

        if risk_summary is None:
            from app.services.data_loader import data_loader
            from app.services.risk_engine import risk_engine
            infrastructures = data_loader.get_infrastructure()
            risk_summary = risk_engine.evaluate_all(infrastructures, cyclone)

        # Identify highest-risk infrastructure sorted by risk_score descending
        sorted_assets = sorted(
            risk_summary.highest_risk_infrastructure,
            key=lambda x: x.risk_score,
            reverse=True,
        )
        highest_risk_assets = sorted_assets[:5]

        # Check configuration
        if not self.is_configured():
            raise HTTPException(
                status_code=503,
                detail=(
                    "Configuration Error: GEMINI_API_KEY is not configured in the backend environment. "
                    "Please set GEMINI_API_KEY in backend/.env to activate live Gemini intelligence."
                ),
            )

        if not self._client:
            self._init_client()
            if not self._client:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "Configuration Error: google-genai client could not be initialized with the provided API key. "
                        "Please verify your GEMINI_API_KEY in backend/.env."
                    ),
                )

        # Build payload with relevant information
        assets_payload = [
            {
                "priority": idx + 1,
                "infrastructure": a.infrastructure.name,
                "type": a.infrastructure.type.value if hasattr(a.infrastructure.type, "value") else str(a.infrastructure.type),
                "risk_score": round(a.risk_score, 1),
                "risk_category": a.risk_category.value if hasattr(a.risk_category, "value") else str(a.risk_category),
                "distance_km": round(a.distance_to_eye_km, 1),
                "elevation_m": a.infrastructure.elevation,
                "surge_threat_m": a.projected_surge_threat_m,
                "primary_failure_mode": a.primary_failure_mode,
                "baseline_mitigation": a.recommended_mitigation,
            }
            for idx, a in enumerate(highest_risk_assets)
        ]

        prompt = f"""You are CycloCast AI's Emergency Incident Commander.
Analyze the following highest-risk infrastructure assets threatened by {cyclone.name} (Category {cyclone.category}, winds {cyclone.wind_speed_kmh} km/h, surge {cyclone.estimated_storm_surge_m}m).

HIGHEST-RISK INFRASTRUCTURE DATA:
{json.dumps(assets_payload, indent=2)}

TASK:
For each highest-risk infrastructure asset, generate the tactical operational response plan directive with:
1. "priority": integer ranking (1 is highest priority)
2. "infrastructure": exact name of the facility
3. "risk_score": float score (0-100)
4. "reason": concise explanation of why this facility is at extreme risk (failure modes, low elevation, surge/inundation)
5. "recommended_action": clear, actionable directive for emergency responders or facility managers

Strictly output JSON in the following schema:
{{
  "items": [
    {{
      "priority": 1,
      "infrastructure": "Facility Name",
      "risk_score": 89.1,
      "reason": "Specific risk rationale",
      "recommended_action": "Specific tactical action"
    }}
  ]
}}
"""

        candidate_models = [self.model_name]
        for fallback in ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        for model in candidate_models:
            try:
                response = self._client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "system_instruction": "You are CycloCast AI's Emergency Incident Commander generating AI-generated decision support response plans.",
                        "response_mime_type": "application/json",
                    },
                )
                if response and response.text:
                    raw_text = response.text.strip()
                    if raw_text.startswith("```"):
                        lines = raw_text.splitlines()
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].startswith("```"):
                            lines = lines[:-1]
                        raw_text = "\n".join(lines).strip()

                    parsed = json.loads(raw_text)
                    items_raw = parsed.get("items", [])
                    if isinstance(items_raw, list) and len(items_raw) > 0:
                        plan_items = [
                            ResponsePlanItem(
                                priority=item.get("priority", idx + 1),
                                infrastructure=item.get("infrastructure", highest_risk_assets[idx].infrastructure.name if idx < len(highest_risk_assets) else "Critical Facility"),
                                risk_score=float(item.get("risk_score", highest_risk_assets[idx].risk_score if idx < len(highest_risk_assets) else 80.0)),
                                reason=item.get("reason", "Critical hazard exposure"),
                                recommended_action=item.get("recommended_action", "Implement immediate asset hardening and protective standby."),
                            )
                            for idx, item in enumerate(items_raw)
                        ]
                        return ResponsePlanResponse(
                            decision_support_label="AI-Generated Decision Support",
                            disclaimer="AI-Generated Decision Support • Verify with Disaster Response Command",
                            plan_title=f"Tactical Response Plan • {cyclone.name.upper()}",
                            items=plan_items,
                            model=model,
                            source="Google Gemini Live Intelligence",
                            timestamp=datetime.now(timezone.utc).isoformat(),
                        )
            except Exception as e:
                print(f"[GeminiService.generate_response_plan] Model {model} attempt failed: {e}")
                continue

        # Grounded fallback if all live candidate models were temporarily unavailable
        plan_items = [
            ResponsePlanItem(
                priority=idx + 1,
                infrastructure=a.infrastructure.name,
                risk_score=round(a.risk_score, 1),
                reason=a.primary_failure_mode or f"Critical risk category with elevation {a.infrastructure.elevation}m facing {a.projected_surge_threat_m}m surge.",
                recommended_action=a.recommended_mitigation or "Deploy emergency protective barriers and continuous telemetry monitoring.",
            )
            for idx, a in enumerate(highest_risk_assets)
        ]
        return ResponsePlanResponse(
            decision_support_label="AI-Generated Decision Support",
            disclaimer="AI-Generated Decision Support • Verify with Disaster Response Command",
            plan_title=f"Tactical Response Plan • {cyclone.name.upper()}",
            items=plan_items,
            model=self.model_name,
            source="Grounded Decision Support Engine (Fallback)",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    def generate_emergency_advisory(
        self,
        cyclone: Optional[Cyclone] = None,
        risk_summary: Optional[RiskOverviewSummary] = None,
    ) -> EmergencyAdvisoryResponse:
        """
        Generates an AI-generated Emergency Advisory using the existing Gemini service.
        Returns:
        - threat summary
        - affected area
        - major hazards
        - infrastructure priorities
        - preparedness actions
        Clearly labeled as: AI-GENERATED DECISION SUPPORT.
        Does not claim that it is an official government warning.
        """
        if cyclone is None:
            from app.api.routes_cyclone import get_active_cyclone
            cyclone = get_active_cyclone()

        if risk_summary is None:
            from app.services.data_loader import data_loader
            from app.services.risk_engine import risk_engine
            infrastructures = data_loader.get_infrastructure()
            risk_summary = risk_engine.evaluate_all(infrastructures, cyclone)

        if not self.is_configured():
            raise HTTPException(
                status_code=503,
                detail=(
                    "Configuration Error: GEMINI_API_KEY is not configured in the backend environment. "
                    "Please set GEMINI_API_KEY in backend/.env to activate live Gemini intelligence."
                ),
            )

        if not self._client:
            self._init_client()
            if not self._client:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "Configuration Error: google-genai client could not be initialized with the provided API key. "
                        "Please verify your GEMINI_API_KEY in backend/.env."
                    ),
                )

        top_critical = risk_summary.highest_risk_infrastructure[:5]
        context = {
            "cyclone": {
                "name": cyclone.name,
                "category": cyclone.category,
                "wind_speed_kmh": cyclone.wind_speed_kmh,
                "gusts_kmh": cyclone.gusts_kmh,
                "central_pressure_hpa": cyclone.central_pressure_hpa,
                "movement_direction": cyclone.movement_direction,
                "movement_speed_kmh": cyclone.movement_speed_kmh,
                "estimated_storm_surge_m": cyclone.estimated_storm_surge_m,
                "landfall_location": cyclone.landfall_location or "Odisha Coastal Belt (Dhamra / Bhitarkanika)",
                "rainfall_mm": cyclone.rainfall_mm or 280.0,
            },
            "infrastructure_summary": {
                "total_assets": risk_summary.total_assets,
                "critical_assets_count": risk_summary.critical_count,
                "high_risk_count": risk_summary.high_count,
                "top_critical_assets": [
                    {
                        "name": a.infrastructure.name,
                        "type": str(a.infrastructure.type.value if hasattr(a.infrastructure.type, "value") else a.infrastructure.type),
                        "risk_score": round(a.risk_score, 1),
                        "distance_km": round(a.distance_to_eye_km, 1),
                        "failure_mode": a.primary_failure_mode,
                    }
                    for a in top_critical
                ],
            },
        }

        prompt = f"""You are CycloCast AI's Emergency Disaster Intelligence System.
Analyze the following active cyclone scenario and infrastructure risk data to generate an authoritative emergency decision support advisory:

DATA CONTEXT:
{json.dumps(context, indent=2)}

CRITICAL POLICY REQUIREMENTS:
- Clearly label this bulletin as AI-GENERATED DECISION SUPPORT.
- DO NOT claim to be an official government agency or official government warning. Include explicit notation that local civil protection and SDMA/IMD official directives supersede this intelligence bulletin.
- Generate realistic, professional, urgent disaster intelligence for incident commanders.

Please return your response in the following strict JSON schema:
{{
  "threat_summary": "Comprehensive executive threat summary detailing storm dynamics, surge severity, and imminent coastal impact.",
  "affected_area": "Designated coastal zones, landfall sector, low-lying river estuaries, and neighboring districts.",
  "major_hazards": [
    "Hazard 1 (e.g. Destructive storm surge reaching X meters above normal astronomical tide)",
    "Hazard 2 (e.g. Core sustained winds of X km/h with violent gusts exceeding Y km/h)",
    "Hazard 3 (e.g. Torrential precipitation of Z mm driving flash inundation)",
    "Hazard 4 (e.g. Estuary saltwater backflow and breach of coastal embankments)"
  ],
  "infrastructure_priorities": [
    "Priority 1 (e.g. Dhamra Coastal Hospital: Evacuate ground-level ICU and protect backup generator)",
    "Priority 2 (e.g. Baitarani Estuary Bridge: Enforce emergency vehicle transit limits due to scour and hydrodynamic load)",
    "Priority 3 (e.g. 220kV Grid Substation: Implement sectional power isolation to prevent equipment destruction)"
  ],
  "preparedness_actions": [
    "Action 1 (e.g. Order mandatory evacuation of civilian populations residing within 2 km of vulnerable estuaries)",
    "Action 2 (e.g. Suspend all non-armored transit on coastal highway corridors 6 hours prior to projected landfall)",
    "Action 3 (e.g. Stage search & rescue, heavy debris-clearing equipment, and emergency communications outside the 65 km destructive wind core)",
    "Action 4 (e.g. Verify auxiliary fuel, potable drinking water, and emergency medical kits in all designated cyclone shelters)"
  ]
}}

Output ONLY valid JSON.
"""

        candidate_models = [self.model_name]
        for fallback in ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        for model in candidate_models:
            try:
                response = self._client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "system_instruction": "You are CycloCast AI's Emergency Disaster Intelligence System generating AI-generated decision support advisories. Never claim to be an official government warning.",
                        "response_mime_type": "application/json",
                    },
                )
                if response and response.text:
                    raw_text = response.text.strip()
                    if raw_text.startswith("```"):
                        lines = raw_text.splitlines()
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].startswith("```"):
                            lines = lines[:-1]
                        raw_text = "\n".join(lines).strip()

                    parsed = json.loads(raw_text)
                    return EmergencyAdvisoryResponse(
                        decision_support_label="AI-GENERATED DECISION SUPPORT",
                        disclaimer="AI-GENERATED DECISION SUPPORT • NOT AN OFFICIAL GOVERNMENT WARNING. Consult State Disaster Management Authority (SDMA) / IMD for official civil protection orders.",
                        title=f"Disaster Intelligence Advisory • {cyclone.name.upper()}",
                        threat_summary=parsed.get("threat_summary", f"{cyclone.name} is tracking {cyclone.movement_direction} with sustained winds of {cyclone.wind_speed_kmh} km/h and peak surge of {cyclone.estimated_storm_surge_m}m."),
                        affected_area=parsed.get("affected_area", cyclone.landfall_location or "Odisha Coastal Belt"),
                        major_hazards=parsed.get("major_hazards", [
                            f"Dangerous storm surge of {cyclone.estimated_storm_surge_m}m above tide level",
                            f"Destructive core winds up to {cyclone.wind_speed_kmh} km/h (gusts {cyclone.gusts_kmh} km/h)",
                            f"Torrential rainfall of ~{cyclone.rainfall_mm or 280}mm",
                            "Tidal estuary breaches and low-elevation saltwater inundation",
                        ]),
                        infrastructure_priorities=parsed.get("infrastructure_priorities", [
                            f"{a.infrastructure.name}: {a.recommended_mitigation or a.primary_failure_mode}"
                            for a in top_critical
                        ]),
                        preparedness_actions=parsed.get("preparedness_actions", [
                            "Evacuate vulnerable populations residing within 2 km of coastal estuary zones.",
                            "Implement complete transit curfew on exposed coastal bridges and highway corridors.",
                            "Pre-position search, rescue, and dewatering units outside the destructive core zone.",
                            "Verify backup generator fuel stocks and emergency medical reserves at all regional shelters.",
                        ]),
                        timestamp=datetime.now(timezone.utc).isoformat(),
                        model=model,
                        source="Google Gemini Live Intelligence",
                    )
            except Exception as e:
                print(f"[GeminiService.generate_emergency_advisory] Model {model} attempt failed: {e}")
                continue

        # Grounded fallback if upstream models were temporarily unavailable
        return EmergencyAdvisoryResponse(
            decision_support_label="AI-GENERATED DECISION SUPPORT",
            disclaimer="AI-GENERATED DECISION SUPPORT • NOT AN OFFICIAL GOVERNMENT WARNING. Consult State Disaster Management Authority (SDMA) / IMD for official civil protection orders.",
            title=f"Disaster Intelligence Advisory • {cyclone.name.upper()}",
            threat_summary=(
                f"{cyclone.name} is maintaining Category {cyclone.category} intensity tracking {cyclone.movement_direction} at {cyclone.movement_speed_kmh} km/h. "
                f"Sustained core winds reach {cyclone.wind_speed_kmh} km/h with gusts to {cyclone.gusts_kmh} km/h. "
                f"Peak storm surge estimated at {cyclone.estimated_storm_surge_m}m with {cyclone.rainfall_mm or 280}mm cumulative rainfall threatening coastal infrastructure."
            ),
            affected_area=cyclone.landfall_location or "Odisha Coastal Belt (Dhamra Port - Bhitarkanika Estuary)",
            major_hazards=[
                f"Coastal storm surge of {cyclone.estimated_storm_surge_m} meters above normal astronomical tide",
                f"Destructive sustained winds of {cyclone.wind_speed_kmh} km/h with gusts exceeding {cyclone.gusts_kmh} km/h",
                f"Torrential rainfall exceeding {cyclone.rainfall_mm or 280} mm driving localized estuary flooding",
                "Severe wave scour on estuarine bridges and low-lying arterial transit cuts",
            ],
            infrastructure_priorities=[
                f"{a.infrastructure.name} (Risk: {a.risk_score:.1f}): {a.recommended_mitigation or a.primary_failure_mode}"
                for a in top_critical
            ],
            preparedness_actions=[
                "Order mandatory evacuation of populations within 1.5 km of coastal estuaries to designated shelters.",
                "Enforce complete transit curfew on coastal highway bridges and low-elevation roads.",
                "Verify auxiliary diesel generator capacity and fuel reserves across regional trauma centers.",
                "Pre-position mobile communications and rapid road-clearing units outside the 65 km destructive radius.",
            ],
            timestamp=datetime.now(timezone.utc).isoformat(),
            model=self.model_name,
            source="Grounded Decision Support Engine (Fallback)",
        )

gemini_service = GeminiService()
