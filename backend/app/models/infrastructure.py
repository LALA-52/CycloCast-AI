from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, AliasChoices, computed_field

class InfrastructureType(str, Enum):
    HOSPITAL = "Hospital"
    ROAD = "Road"
    BRIDGE = "Bridge"
    POWER_STATION = "Power Station"
    EMERGENCY_SHELTER = "Emergency Shelter"

class Infrastructure(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Unique asset identifier")
    name: str = Field(..., description="Asset name (Simulated/Demo Benchmark)")
    type: InfrastructureType = Field(..., description="Infrastructure category")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    criticality: float = Field(..., ge=0, le=100, description="Criticality score (0-100)")
    elevation: float = Field(..., description="Elevation above sea level in meters")
    population_served: int = Field(
        ...,
        ge=0,
        validation_alias=AliasChoices("population_served", "populationServed"),
        description="Estimated dependent population"
    )
    flood_exposure: float = Field(
        ...,
        ge=0,
        le=100,
        validation_alias=AliasChoices("flood_exposure", "floodExposure"),
        description="Base flood/surge exposure (0-100)"
    )
    vulnerability: float = Field(..., ge=0, le=100, description="Structural vulnerability (0-100)")
    accessibility_risk: float = Field(
        ...,
        ge=0,
        le=100,
        validation_alias=AliasChoices("accessibility_risk", "accessibilityRisk"),
        description="Isolation risk (0-100)"
    )
    condition_notes: Optional[str] = Field(None, description="Operational notes or maintenance status")
    data_provenance: str = Field(
        "DEMO / SIMULATED BENCHMARK DATASET",
        description="Dataset provenance indicator. Not verified real-world telemetry."
    )
    is_demo: bool = Field(True, description="Flag indicating simulated benchmark record")

    @computed_field
    @property
    def populationServed(self) -> int:
        return self.population_served

    @computed_field
    @property
    def floodExposure(self) -> float:
        return self.flood_exposure

    @computed_field
    @property
    def accessibilityRisk(self) -> float:
        return self.accessibility_risk

class InfrastructureFilter(BaseModel):
    types: Optional[List[InfrastructureType]] = None
    min_criticality: Optional[float] = None
    max_risk_score: Optional[float] = None
    min_risk_score: Optional[float] = None
    search: Optional[str] = None

