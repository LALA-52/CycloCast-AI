import json
from pathlib import Path
from typing import List, Optional
from app.models.cyclone import Cyclone
from app.models.infrastructure import Infrastructure, InfrastructureFilter

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

class DataLoader:
    def __init__(self):
        self._cyclones: List[Cyclone] = []
        self._infrastructure: List[Infrastructure] = []
        self._load_data()

    def _load_data(self):
        cyclones_file = DATA_DIR / "sample_cyclones.json"
        if cyclones_file.exists():
            with open(cyclones_file, "r", encoding="utf-8") as f:
                raw_cyclones = json.load(f)
                self._cyclones = [Cyclone(**item) for item in raw_cyclones]

        infra_file = DATA_DIR / "sample_infrastructure.json"
        if infra_file.exists():
            with open(infra_file, "r", encoding="utf-8") as f:
                raw_infra = json.load(f)
                self._infrastructure = [Infrastructure(**item) for item in raw_infra]

    def get_all_cyclones(self) -> List[Cyclone]:
        return self._cyclones

    def get_cyclone_by_id(self, cyclone_id: str) -> Optional[Cyclone]:
        for c in self._cyclones:
            if c.id == cyclone_id:
                return c
        return None

    def get_active_cyclone(self) -> Cyclone:
        # Default active cyclone is Cyclone Dana or the first cyclone in list
        if self._cyclones:
            return self._cyclones[0]
        # Fallback default if empty
        return Cyclone(
            id="CYC-DEFAULT",
            name="Simulated Coastal Cyclone",
            category=3,
            center_lat=20.65,
            center_lon=87.20,
            wind_speed_kmh=120.0,
            gusts_kmh=140.0,
            central_pressure_hpa=985.0,
            movement_speed_kmh=15.0,
            movement_direction="NW",
            radius_destructive_km=60.0,
            radius_gale_km=180.0,
            estimated_storm_surge_m=2.0,
            is_simulated=True
        )

    def get_infrastructure(self, filters: Optional[InfrastructureFilter] = None) -> List[Infrastructure]:
        results = self._infrastructure
        if not filters:
            return results

        if filters.types:
            results = [item for item in results if item.type in filters.types]
        if filters.min_criticality is not None:
            results = [item for item in results if item.criticality >= filters.min_criticality]
        if filters.search:
            q = filters.search.strip().lower()
            results = [
                item for item in results
                if q in item.name.lower()
                or (item.condition_notes and q in item.condition_notes.lower())
                or q in item.id.lower()
                or q in item.type.value.lower()
            ]
        return results

    def get_infrastructure_by_id(self, asset_id: str) -> Optional[Infrastructure]:
        normalized = asset_id.strip().lower()
        for item in self._infrastructure:
            if item.id.lower() == normalized:
                return item
        return None

    def add_or_update_infrastructure(self, asset: Infrastructure):
        for idx, existing in enumerate(self._infrastructure):
            if existing.id == asset.id:
                self._infrastructure[idx] = asset
                return
        self._infrastructure.append(asset)

data_loader = DataLoader()
