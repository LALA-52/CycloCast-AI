from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.models.cyclone import Cyclone
from app.services.data_loader import data_loader

router = APIRouter(prefix="/cyclone", tags=["Cyclone"])

_active_cyclone_id: Optional[str] = None
_custom_cyclone: Optional[Cyclone] = None

class CycloneUpdateRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[int] = None
    center_lat: Optional[float] = None
    center_lon: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    gusts_kmh: Optional[float] = None
    central_pressure_hpa: Optional[float] = None
    movement_speed_kmh: Optional[float] = None
    movement_direction: Optional[str] = None
    radius_destructive_km: Optional[float] = None
    radius_gale_km: Optional[float] = None
    estimated_storm_surge_m: Optional[float] = None
    landfall_location: Optional[str] = None

@router.get("/list", response_model=List[Cyclone])
def get_cyclones():
    return data_loader.get_all_cyclones()

@router.get("/active", response_model=Cyclone)
def get_active_cyclone():
    global _custom_cyclone, _active_cyclone_id
    if _custom_cyclone:
        return _custom_cyclone
    if _active_cyclone_id:
        c = data_loader.get_cyclone_by_id(_active_cyclone_id)
        if c:
            return c
    return data_loader.get_active_cyclone()

@router.post("/select/{cyclone_id}", response_model=Cyclone)
def select_cyclone(cyclone_id: str):
    global _custom_cyclone, _active_cyclone_id
    c = data_loader.get_cyclone_by_id(cyclone_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Cyclone with id '{cyclone_id}' not found")
    _active_cyclone_id = cyclone_id
    _custom_cyclone = None
    return c

@router.post("/update", response_model=Cyclone)
def update_cyclone_params(updates: CycloneUpdateRequest):
    global _custom_cyclone
    current = get_active_cyclone()
    data = current.model_dump()

    for k, v in updates.model_dump(exclude_unset=True).items():
        if v is not None:
            data[k] = v

    data["is_simulated"] = True
    _custom_cyclone = Cyclone(**data)
    return _custom_cyclone

@router.post("/reset", response_model=Cyclone)
def reset_cyclone():
    global _custom_cyclone, _active_cyclone_id
    _custom_cyclone = None
    _active_cyclone_id = None
    return data_loader.get_active_cyclone()
