from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field
from app.models.infrastructure import Infrastructure, InfrastructureType

class RiskCategory(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class InfrastructureRiskAssessment(BaseModel):
    infrastructure: Infrastructure
    distance_to_eye_km: float
    hazard_exposure: float = Field(..., ge=0, le=100, description="Calculated hazard exposure (0-100)")
    vulnerability_component: float = Field(..., description="30% of Vulnerability")
    hazard_component: float = Field(..., description="40% of Hazard Exposure")
    criticality_component: float = Field(..., description="20% of Criticality")
    accessibility_component: float = Field(..., description="10% of Accessibility Risk")
    risk_score: float = Field(..., ge=0, le=100, description="Overall Composite Risk Score (0-100)")
    risk_category: RiskCategory
    in_destructive_zone: bool
    in_gale_zone: bool
    projected_surge_threat_m: float
    recommended_priority_level: int = Field(..., description="Priority rank (1 being highest)")
    primary_failure_mode: str
    recommended_mitigation: str

class RiskOverviewSummary(BaseModel):
    total_assets: int
    critical_count: int
    critical_asset_count: int = Field(0, description="Total count of critical assets")
    high_count: int
    moderate_count: int
    low_count: int
    average_risk_score: float
    overall_risk_score: float = Field(0.0, description="Composite aggregate risk score (0-100)")
    flood_risk_score: float = Field(0.0, description="Average flood and storm surge risk index (0-100)")
    infrastructure_risk_score: float = Field(0.0, description="Average structural vulnerability index (0-100)")
    evacuation_risk_score: float = Field(0.0, description="Average evacuation accessibility risk index (0-100)")
    population_at_critical_risk: int
    population_at_high_risk: int
    highest_risk_infrastructure: List[InfrastructureRiskAssessment]
    by_type_breakdown: Dict[str, Dict[str, int]]
    cyclone_id: str
    calculation_timestamp: str
    model_version: str = "transparent-v1.0 (40/30/20/10)"

class RiskCalculationRequest(BaseModel):
    cyclone_id: Optional[str] = None
    override_wind_speed_kmh: Optional[float] = None
    override_center_lat: Optional[float] = None
    override_center_lon: Optional[float] = None
    override_surge_m: Optional[float] = None
