from typing import Optional, List
from pydantic import BaseModel, Field

class ForecastPoint(BaseModel):
    time_offset_hours: int
    latitude: float
    longitude: float
    wind_speed_kmh: float
    central_pressure_hpa: float
    estimated_surge_m: float

class Cyclone(BaseModel):
    id: str = Field(..., description="Unique cyclone identifier or storm code")
    name: str = Field(..., description="Storm name, e.g. Cyclone Dana")
    category: int = Field(..., ge=1, le=5, description="Cyclone category (1-5)")
    center_lat: float = Field(..., description="Current center latitude")
    center_lon: float = Field(..., description="Current center longitude")
    wind_speed_kmh: float = Field(..., ge=0, description="Maximum sustained wind speed in km/h")
    gusts_kmh: float = Field(..., ge=0, description="Peak wind gusts in km/h")
    central_pressure_hpa: float = Field(..., description="Central pressure in hPa")
    movement_speed_kmh: float = Field(..., ge=0, description="Forward speed of storm in km/h")
    movement_direction: str = Field(..., description="Direction of movement, e.g. NNW, WNW")
    radius_destructive_km: float = Field(..., description="Radius of destructive winds (>100 km/h) in km")
    radius_gale_km: float = Field(..., description="Radius of gale-force winds (>60 km/h) in km")
    estimated_storm_surge_m: float = Field(..., description="Peak estimated storm surge above normal tide in meters")
    estimated_landfall_time: Optional[str] = Field(None, description="Projected landfall timestamp or hours")
    landfall_location: Optional[str] = Field(None, description="Projected landfall coastal sector")
    forecast_track: List[ForecastPoint] = Field(default_factory=list, description="Projected 24-48h forecast points")
    is_simulated: bool = Field(True, description="Flag indicating if dataset is simulated or live forecast")
    rainfall_mm: float = Field(280.0, description="24-hour accumulated rainfall estimate in mm")
    estimated_severity: str = Field("Very Severe Cyclonic Storm (VSCS)", description="Severity classification")
    last_updated_time: str = Field("2026-09-30 01:30 UTC", description="Last meteorological bulletin timestamp")
    data_mode: str = Field("DEMO / SIMULATED", description="Data provenance indicator: DEMO / SIMULATED vs LIVE")
