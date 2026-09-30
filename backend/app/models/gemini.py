from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CycloneInformation(BaseModel):
    name: str = Field(default="Cyclone Dana", description="Name of the cyclonic system")
    category: int = Field(default=3, description="Cyclone category (1-5)")
    wind_speed_kmh: float = Field(default=125.0, description="Sustained core wind speed (km/h)")
    gusts_kmh: float = Field(default=145.0, description="Peak wind gusts (km/h)")
    central_pressure_hpa: float = Field(default=982.0, description="Central atmospheric pressure (hPa)")
    movement_speed_kmh: float = Field(default=14.0, description="Forward movement velocity (km/h)")
    movement_direction: str = Field(default="NNW", description="Direction of movement")
    estimated_storm_surge_m: float = Field(default=2.2, description="Projected storm surge height (meters)")
    radius_destructive_km: float = Field(default=65.0, description="Radius of destructive core winds (km)")
    radius_gale_km: float = Field(default=190.0, description="Radius of gale-force winds (km)")
    landfall_location: Optional[str] = Field(default="Dhamra Port - Bhitarkanika Estuary, Odisha", description="Projected landfall sector")

class WeatherConditions(BaseModel):
    rainfall_mm: float = Field(default=280.0, description="Observed/projected precipitation (mm)")
    coastal_wind_gusts_kmh: Optional[float] = Field(default=145.0, description="Current coastal gust velocity (km/h)")
    barometric_pressure_hpa: Optional[float] = Field(default=982.0, description="Barometric pressure reading (hPa)")
    tide_level_m: Optional[float] = Field(default=2.2, description="Astronomical tide anomaly (m)")
    sea_surface_temp_c: Optional[float] = Field(default=29.5, description="Sea surface temperature in Celsius")
    weather_summary: Optional[str] = Field(default="Heavy rainbands, squally gale winds, rising tidal surge", description="Observed weather status")

class InfrastructureRiskData(BaseModel):
    overall_risk_score: float = Field(default=66.1, description="Composite aggregate risk score (0-100)")
    critical_asset_count: int = Field(default=3, description="Count of facilities facing critical risk")
    high_risk_asset_count: int = Field(default=1, description="Count of facilities facing high risk")
    total_assets: int = Field(default=18, description="Total number of evaluated infrastructure nodes")
    top_vulnerable_assets: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Top high-risk infrastructure nodes with primary failure modes and locations"
    )

class GeminiAnalyzeRequest(BaseModel):
    cyclone_information: Optional[CycloneInformation] = Field(
        default=None,
        alias="cycloneInformation",
        description="Cyclone parameters and track dynamics"
    )
    weather_conditions: Optional[WeatherConditions] = Field(
        default=None,
        alias="weatherConditions",
        description="Meteorological and coastal weather conditions"
    )
    infrastructure_risk_data: Optional[InfrastructureRiskData] = Field(
        default=None,
        alias="infrastructureRiskData",
        description="Infrastructure risk assessments and vulnerability scores"
    )

    model_config = {
        "populate_by_name": True,
        "extra": "ignore"
    }

class GeminiAnalyzeResponse(BaseModel):
    impact_summary: str = Field(..., description="High-level synthesis of cyclone impact on the coastal zone")
    key_risks: List[str] = Field(..., description="Key hazards and infrastructure failure risks")
    recommended_actions: List[str] = Field(..., description="Time-phased recommended actions and directives")

    # CamelCase aliases for frontend compatibility
    impactSummary: Optional[str] = None
    keyRisks: Optional[List[str]] = None
    recommendedActions: Optional[List[str]] = None

    model: str = Field(default="gemini-3.5-flash", description="Gemini model utilized")
    source: str = Field(default="Google Gemini Live Intelligence", description="Intelligence engine source")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 UTC timestamp")

    model_config = {
        "populate_by_name": True
    }

class ResponsePlanItem(BaseModel):
    priority: int = Field(..., description="Priority ranking for this infrastructure action")
    infrastructure: str = Field(..., description="Name of the infrastructure facility")
    risk_score: float = Field(..., description="Assessed risk score (0-100)")
    reason: str = Field(..., description="Failure vector or rationale why this asset is at risk")
    recommended_action: str = Field(..., description="Specific recommended mitigation or emergency directive")

class ResponsePlanResponse(BaseModel):
    decision_support_label: str = Field(default="AI-Generated Decision Support", description="Official decision support label")
    disclaimer: str = Field(default="AI-Generated Decision Support • Verify with Disaster Response Command", description="Advisory disclaimer")
    plan_title: str = Field(default="Operational Infrastructure Response Plan", description="Response plan title")
    items: List[ResponsePlanItem] = Field(..., description="Prioritized response directives for highest-risk assets")
    model: str = Field(default="gemini-3.5-flash-lite", description="Gemini model utilized")
    source: str = Field(default="Google Gemini Live Intelligence", description="Intelligence engine source")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 UTC timestamp")

    model_config = {
        "populate_by_name": True
    }

class EmergencyAdvisoryResponse(BaseModel):
    decision_support_label: str = Field(default="AI-GENERATED DECISION SUPPORT", description="Explicit AI decision support label")
    disclaimer: str = Field(
        default="AI-GENERATED DECISION SUPPORT • NOT AN OFFICIAL GOVERNMENT WARNING. Consult State Disaster Management Authority (SDMA) / IMD for official civil protection orders.",
        description="Explicit notice that this is not an official government warning"
    )
    title: str = Field(default="Emergency Disaster Intelligence Advisory", description="Advisory title")
    threat_summary: str = Field(..., description="Synthesis of storm severity, central pressure, peak wind speeds, and surge dynamics")
    affected_area: str = Field(..., description="Target coastal sector, districts, and vulnerable river estuaries")
    major_hazards: List[str] = Field(..., description="List of primary hazards (storm surge, destructive winds, torrential rainfall, estuary inundation)")
    infrastructure_priorities: List[str] = Field(..., description="Priority infrastructure protection directives for critical facilities")
    preparedness_actions: List[str] = Field(..., description="Time-sensitive preparedness and protective action directives")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 UTC timestamp")
    model: str = Field(default="gemini-3.5-flash-lite", description="Gemini model utilized")
    source: str = Field(default="Google Gemini Live Intelligence", description="Intelligence engine source")

    model_config = {
        "populate_by_name": True
    }
