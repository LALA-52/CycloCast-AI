from fastapi import APIRouter
from app.services.gee_service import gee_service
from app.models.gee import GEELayerResponse, GEEStatusResponse

router = APIRouter(prefix="/gee", tags=["Google Earth Engine"])

@router.get("/layer", response_model=GEELayerResponse)
def get_satellite_layer():
    """
    Get satellite / environmental tile layer configuration.
    
    If Google Earth Engine credentials and ee package are available,
    returns live GEE tiles. Otherwise, fails gracefully and provides
    high-resolution environmental satellite tiles, keeping the map
    100% operational.
    """
    return gee_service.get_satellite_layer()

@router.get("/status", response_model=GEEStatusResponse)
def get_gee_status():
    """
    Check Google Earth Engine configuration and runtime status.
    """
    return gee_service.get_status()
