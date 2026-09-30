from fastapi import APIRouter, Query, HTTPException, Path
from typing import List, Optional, Set
from app.models.infrastructure import Infrastructure, InfrastructureType, InfrastructureFilter
from app.services.data_loader import data_loader

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure"])

TYPE_MAPPING = {
    # Hospitals
    "hospital": InfrastructureType.HOSPITAL,
    "hospitals": InfrastructureType.HOSPITAL,
    # Roads
    "road": InfrastructureType.ROAD,
    "roads": InfrastructureType.ROAD,
    # Bridges
    "bridge": InfrastructureType.BRIDGE,
    "bridges": InfrastructureType.BRIDGE,
    # Power stations
    "power station": InfrastructureType.POWER_STATION,
    "power stations": InfrastructureType.POWER_STATION,
    "power_station": InfrastructureType.POWER_STATION,
    "power_stations": InfrastructureType.POWER_STATION,
    "powerstation": InfrastructureType.POWER_STATION,
    "powerstations": InfrastructureType.POWER_STATION,
    "power": InfrastructureType.POWER_STATION,
    # Emergency shelters
    "emergency shelter": InfrastructureType.EMERGENCY_SHELTER,
    "emergency shelters": InfrastructureType.EMERGENCY_SHELTER,
    "emergency_shelter": InfrastructureType.EMERGENCY_SHELTER,
    "emergency_shelters": InfrastructureType.EMERGENCY_SHELTER,
    "emergencyshelter": InfrastructureType.EMERGENCY_SHELTER,
    "emergencyshelters": InfrastructureType.EMERGENCY_SHELTER,
    "shelter": InfrastructureType.EMERGENCY_SHELTER,
    "shelters": InfrastructureType.EMERGENCY_SHELTER,
}

SUPPORTED_TYPE_NAMES = [
    "hospitals",
    "roads",
    "bridges",
    "power stations",
    "emergency shelters"
]

def resolve_infrastructure_type(raw_val: str) -> Optional[InfrastructureType]:
    normalized = raw_val.strip().lower().replace("-", " ")
    if normalized in TYPE_MAPPING:
        return TYPE_MAPPING[normalized]
    normalized_space = normalized.replace("_", " ")
    if normalized_space in TYPE_MAPPING:
        return TYPE_MAPPING[normalized_space]
    for t in InfrastructureType:
        if t.value.lower() == normalized or t.name.lower() == normalized:
            return t
        if t.value.lower() == normalized_space or t.name.lower() == normalized_space:
            return t
        if normalized.endswith("s") and t.value.lower() == normalized[:-1]:
            return t
        if normalized_space.endswith("s") and t.value.lower() == normalized_space[:-1]:
            return t
    return None

@router.get("", response_model=List[Infrastructure], summary="List all infrastructure assets")
@router.get("/", response_model=List[Infrastructure], include_in_schema=False)
@router.get("/list", response_model=List[Infrastructure], include_in_schema=False)
def list_infrastructure(
    type: Optional[List[str]] = Query(None, description="Filter by type: hospitals, roads, bridges, power stations, emergency shelters"),
    category: Optional[List[str]] = Query(None, description="Alias for type filter"),
    search: Optional[str] = Query(None, description="Search query by asset name, ID, or notes"),
    q: Optional[str] = Query(None, description="Alias for search query"),
    min_criticality: Optional[float] = Query(None, ge=0, le=100, description="Minimum criticality score (0-100)")
):
    """
    Retrieve all DEMO infrastructure assets (Hospitals, Roads, Bridges, Power Stations, Emergency Shelters).
    Supports filtering by type/category, minimum criticality, and search text.
    """
    type_inputs = []
    if type:
        type_inputs.extend(type)
    if category:
        type_inputs.extend(category)

    selected_types: Optional[List[InfrastructureType]] = None
    if type_inputs:
        matched_set: Set[InfrastructureType] = set()
        for raw in type_inputs:
            for part in raw.split(","):
                part_trimmed = part.strip()
                if not part_trimmed:
                    continue
                resolved = resolve_infrastructure_type(part_trimmed)
                if not resolved:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Invalid infrastructure type '{part_trimmed}'. "
                            f"Supported types are: {', '.join(SUPPORTED_TYPE_NAMES)}."
                        )
                    )
                matched_set.add(resolved)
        if matched_set:
            selected_types = list(matched_set)

    search_query = search or q
    filters = InfrastructureFilter(
        types=selected_types,
        min_criticality=min_criticality,
        search=search_query
    )
    return data_loader.get_infrastructure(filters)

@router.get("/{id}", response_model=Infrastructure, summary="Get infrastructure asset by ID")
def get_infrastructure_by_id(
    id: str = Path(..., description="Unique infrastructure asset identifier, e.g. INF-HOSP-001")
):
    """
    Retrieve a single infrastructure asset record by its unique ID.
    """
    item = data_loader.get_infrastructure_by_id(id)
    if item is None:
        raise HTTPException(
            status_code=404,
            detail=f"Infrastructure asset with ID '{id}' not found."
        )
    return item

