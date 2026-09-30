from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from app.services.data_loader import data_loader
from app.services.risk_engine import risk_engine
from app.services.gemini_service import gemini_service
from app.api.routes_cyclone import get_active_cyclone
from app.models.gemini import (
    CycloneInformation,
    WeatherConditions,
    InfrastructureRiskData,
    GeminiAnalyzeRequest,
    GeminiAnalyzeResponse,
    ResponsePlanResponse,
    EmergencyAdvisoryResponse,
)

router = APIRouter(tags=["Gemini AI Intelligence"])

@router.post(
    "/gemini/analyze",
    response_model=GeminiAnalyzeResponse,
    summary="Generate Gemini Impact Assessment, Key Risks, and Recommended Actions",
)
@router.post(
    "/ai/analyze",
    response_model=GeminiAnalyzeResponse,
    include_in_schema=False,
)
def analyze_scenario(payload: Optional[GeminiAnalyzeRequest] = None):
    """
    Integrates Google Gemini Live Intelligence.
    Receives:
    - cyclone information
    - weather conditions
    - infrastructure risk data

    Returns:
    - impact summary
    - key risks
    - recommended actions

    API key is kept strictly on the backend and read from environment variable GEMINI_API_KEY.
    If the key is unavailable, returns a clear HTTP 503 configuration error without crashing.
    """
    cyclone = get_active_cyclone()
    infrastructures = data_loader.get_infrastructure()
    risk_summary = risk_engine.evaluate_all(infrastructures, cyclone)

    cyclone_info = (
        payload.cyclone_information
        if payload and payload.cyclone_information
        else CycloneInformation(
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
            landfall_location=cyclone.landfall_location or "Dhamra Port, Odisha",
        )
    )

    weather_cond = (
        payload.weather_conditions
        if payload and payload.weather_conditions
        else WeatherConditions(
            rainfall_mm=cyclone.rainfall_mm or 280.0,
            coastal_wind_gusts_kmh=cyclone.gusts_kmh,
            barometric_pressure_hpa=cyclone.central_pressure_hpa,
            tide_level_m=cyclone.estimated_storm_surge_m,
        )
    )

    top_critical = risk_summary.highest_risk_infrastructure[:5]
    risk_data = (
        payload.infrastructure_risk_data
        if payload and payload.infrastructure_risk_data
        else InfrastructureRiskData(
            overall_risk_score=risk_summary.overall_risk_score or risk_summary.average_risk_score,
            critical_asset_count=risk_summary.critical_count,
            high_risk_asset_count=risk_summary.high_count,
            total_assets=risk_summary.total_assets,
            top_vulnerable_assets=[
                {
                    "name": a.infrastructure.name,
                    "type": str(a.infrastructure.type.value if hasattr(a.infrastructure.type, "value") else a.infrastructure.type),
                    "risk_score": a.risk_score,
                    "category": str(a.risk_category.value if hasattr(a.risk_category, "value") else a.risk_category),
                    "distance_km": a.distance_to_eye_km,
                    "elevation_m": a.infrastructure.elevation,
                    "primary_failure_mode": a.primary_failure_mode,
                    "recommended_mitigation": a.recommended_mitigation,
                }
                for a in top_critical
            ],
        )
    )

    return gemini_service.analyze(cyclone_info, weather_cond, risk_data)

@router.get(
    "/gemini/analyze",
    response_model=GeminiAnalyzeResponse,
    summary="Get Gemini Impact Assessment for Active Scenario",
)
@router.get(
    "/ai/analyze",
    response_model=GeminiAnalyzeResponse,
    include_in_schema=False,
)
def get_gemini_analysis():
    """
    Convenience GET endpoint executing Gemini assessment against active telemetry data.
    """
    return analyze_scenario(None)

@router.get(
    "/ai/analysis",
    response_model=Dict[str, Any],
    summary="Legacy full report endpoint for dashboard compatibility",
)
def get_ai_impact_analysis():
    cyclone = get_active_cyclone()
    infrastructures = data_loader.get_infrastructure()
    risk_summary = risk_engine.evaluate_all(infrastructures, cyclone)
    return gemini_service.generate_impact_analysis(cyclone, risk_summary)

@router.post(
    "/gemini/response-plan",
    response_model=ResponsePlanResponse,
    summary="Generate AI Operational Response Plan for Highest-Risk Infrastructure",
)
@router.get(
    "/gemini/response-plan",
    response_model=ResponsePlanResponse,
    summary="Generate AI Operational Response Plan for Highest-Risk Infrastructure",
)
def generate_response_plan_endpoint():
    """
    Identifies the highest-risk infrastructure using existing risk assessment data
    and generates prioritized tactical directives using the Gemini service.
    Returns:
    - Priority
    - Infrastructure
    - Risk score
    - Reason
    - Recommended action
    Clearly labeled as AI-generated decision support.
    """
    cyclone = get_active_cyclone()
    infrastructures = data_loader.get_infrastructure()
    risk_summary = risk_engine.evaluate_all(infrastructures, cyclone)
    return gemini_service.generate_response_plan(cyclone, risk_summary)

@router.post(
    "/gemini/advisory",
    response_model=EmergencyAdvisoryResponse,
    summary="Generate Emergency Disaster Intelligence Advisory",
)
@router.get(
    "/gemini/advisory",
    response_model=EmergencyAdvisoryResponse,
    summary="Generate Emergency Disaster Intelligence Advisory",
)
def generate_emergency_advisory_endpoint():
    """
    Generates an AI-generated Emergency Advisory using the existing Gemini service.
    Returns:
    - threat summary
    - affected area
    - major hazards
    - infrastructure priorities
    - preparedness actions
    Clearly labeled as AI-GENERATED DECISION SUPPORT.
    Does not claim that it is an official government warning.
    """
    cyclone = get_active_cyclone()
    infrastructures = data_loader.get_infrastructure()
    risk_summary = risk_engine.evaluate_all(infrastructures, cyclone)
    return gemini_service.generate_emergency_advisory(cyclone, risk_summary)
