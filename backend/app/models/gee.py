from typing import Optional
from pydantic import BaseModel, Field

class GEELayerResponse(BaseModel):
    """
    Response schema for satellite / environmental layer tile delivery.
    """
    status: str = Field(..., description="Status of the layer: 'ready' (live GEE) or 'fallback' (graceful satellite layer)")
    layer_id: str = Field("satellite-environmental", description="Unique identifier for the map layer")
    name: str = Field("Satellite / Environmental Layer", description="Display name for UI toggle")
    tile_url: str = Field(..., description="XYZ tile URL template ({z}/{x}/{y}) for Leaflet")
    attribution: str = Field(..., description="Attribution text for the satellite provider")
    source: str = Field(..., description="Source name (e.g., Google Earth Engine or Environmental Satellite)")
    is_gee_active: bool = Field(False, description="Whether live Google Earth Engine session is active")
    message: str = Field(..., description="Informative status message")
    dataset: Optional[str] = Field(None, description="GEE dataset identifier if active")

class GEEStatusResponse(BaseModel):
    """
    Service health and configuration check for Google Earth Engine.
    """
    ee_installed: bool = Field(..., description="Whether earthengine-api python package is installed")
    configured: bool = Field(..., description="Whether required credentials/project are configured")
    project_id: Optional[str] = Field(None, description="Configured GCP/GEE project ID if any")
    service_account: Optional[str] = Field(None, description="Configured service account email if any")
    status: str = Field(..., description="Overall GEE service status: 'active', 'ready', 'unconfigured', or 'unavailable'")
    message: str = Field(..., description="Detailed status message")
