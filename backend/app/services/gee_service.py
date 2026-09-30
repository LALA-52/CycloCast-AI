import os
import logging
from typing import Optional
from app.config import settings
from app.models.gee import GEELayerResponse, GEEStatusResponse

logger = logging.getLogger(__name__)

# Check if Earth Engine API is installed
try:
    import ee  # type: ignore
    EE_AVAILABLE = True
except ImportError:
    ee = None
    EE_AVAILABLE = False


class GEEService:
    """
    Isolated Google Earth Engine (GEE) Service.
    
    Responsible for:
    - Managing GEE authentication and session initialization using configuration variables.
    - Generating satellite / environmental Earth Engine tile layers.
    - Gracefully falling back to high-resolution satellite imagery if GEE credentials
      or the ee library are unavailable, ensuring zero downtime for the interactive map.
    """

    # High-resolution environmental satellite fallback layer
    FALLBACK_SATELLITE_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    FALLBACK_ATTRIBUTION = "Tiles &copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS"

    def __init__(self):
        self.project_id = settings.GEE_PROJECT.strip() if settings.GEE_PROJECT else None
        self.service_account = settings.GEE_SERVICE_ACCOUNT.strip() if settings.GEE_SERVICE_ACCOUNT else None
        self.private_key = settings.GEE_PRIVATE_KEY.strip() if settings.GEE_PRIVATE_KEY else None
        self.key_file = settings.GEE_KEY_FILE.strip() if settings.GEE_KEY_FILE else None
        self._initialized = False

    def is_configured(self) -> bool:
        """
        Check if sufficient GEE configuration is provided.
        """
        return bool(self.project_id or (self.service_account and (self.private_key or self.key_file)))

    def get_status(self) -> GEEStatusResponse:
        """
        Report current GEE integration and configuration status.
        """
        if not EE_AVAILABLE:
            return GEEStatusResponse(
                ee_installed=False,
                configured=self.is_configured(),
                project_id=self.project_id,
                service_account=self.service_account,
                status="library_missing",
                message="Google Earth Engine python library (earthengine-api) is not installed. Graceful fallback active."
            )
        
        if not self.is_configured():
            return GEEStatusResponse(
                ee_installed=True,
                configured=False,
                project_id=self.project_id,
                service_account=self.service_account,
                status="unconfigured",
                message="Google Earth Engine credentials (GEE_PROJECT or GEE_SERVICE_ACCOUNT) are not configured. Graceful fallback active."
            )

        return GEEStatusResponse(
            ee_installed=True,
            configured=True,
            project_id=self.project_id,
            service_account=self.service_account,
            status="configured",
            message="Google Earth Engine credentials configured and ready for initialization."
        )

    def _initialize_ee(self) -> bool:
        """
        Internal method to authenticate and initialize GEE session.
        Returns True if successful, False otherwise.
        """
        if self._initialized:
            return True

        if not EE_AVAILABLE:
            return False

        try:
            if self.service_account and (self.private_key or self.key_file):
                logger.info("Initializing GEE with service account: %s", self.service_account)
                credentials = ee.ServiceAccountCredentials(
                    self.service_account,
                    key_data=self.private_key if self.private_key else None,
                    key_file=self.key_file if self.key_file else None,
                )
                ee.Initialize(credentials, project=self.project_id or None)
            elif self.project_id:
                logger.info("Initializing GEE with project: %s", self.project_id)
                ee.Initialize(project=self.project_id)
            else:
                return False

            self._initialized = True
            return True
        except Exception as e:
            logger.warning("Google Earth Engine initialization failed: %s. Graceful fallback will be used.", e)
            return False

    def get_satellite_layer(self) -> GEELayerResponse:
        """
        Provide satellite / environmental layer tile parameters.
        
        If GEE is operational, generates a Copernicus Sentinel-2 multispectral tile layer.
        If GEE is unavailable or unconfigured, gracefully returns an environmental
        satellite imagery layer, ensuring the map remains completely functional.
        """
        if EE_AVAILABLE and self.is_configured():
            try:
                if self._initialize_ee():
                    # Request Sentinel-2 Harmonized Level-2A surface reflectance composite
                    sentinel = (
                        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                        .filterDate("2024-01-01", "2024-12-31")
                        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 25))
                        .median()
                    )
                    
                    vis_params = {
                        "min": 0.0,
                        "max": 3000.0,
                        "bands": ["B4", "B3", "B2"],  # Red, Green, Blue true color
                    }
                    
                    map_id_dict = sentinel.getMapId(vis_params)
                    tile_url = map_id_dict["tile_fetcher"].url_format

                    return GEELayerResponse(
                        status="ready",
                        layer_id="gee-sentinel2-layer",
                        name="Satellite / Environmental Layer",
                        tile_url=tile_url,
                        attribution="Google Earth Engine | Copernicus Sentinel-2",
                        source="Google Earth Engine",
                        is_gee_active=True,
                        message="Live Google Earth Engine Copernicus Sentinel-2 satellite layer loaded.",
                        dataset="COPERNICUS/S2_SR_HARMONIZED"
                    )
            except Exception as e:
                logger.warning("Error fetching GEE tiles: %s. Falling back to environmental satellite layer.", e)

        # Graceful fallback: return high-resolution satellite/environmental layer
        return GEELayerResponse(
            status="fallback",
            layer_id="satellite-environmental-layer",
            name="Satellite / Environmental Layer",
            tile_url=self.FALLBACK_SATELLITE_TILE_URL,
            attribution=self.FALLBACK_ATTRIBUTION,
            source="Environmental Satellite Imagery (Graceful Fallback)",
            is_gee_active=False,
            message="Google Earth Engine credentials unconfigured or unavailable. Environmental satellite layer active."
        )


# Global singleton instance
gee_service = GEEService()
