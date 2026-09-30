from fastapi import APIRouter, Query
from typing import Optional, List
from app.models.risk import RiskOverviewSummary, InfrastructureRiskAssessment
from app.models.infrastructure import InfrastructureType, InfrastructureFilter
from app.services.data_loader import data_loader
from app.services.risk_engine import risk_engine
from app.api.routes_cyclone import get_active_cyclone

router = APIRouter(prefix="/risk", tags=["Risk Engine"])

@router.get("/overview", response_model=RiskOverviewSummary)
def get_risk_overview():
    cyclone = get_active_cyclone()
    infrastructures = data_loader.get_infrastructure()
    return risk_engine.evaluate_all(infrastructures, cyclone)

@router.get("/assessments", response_model=List[InfrastructureRiskAssessment])
def get_risk_assessments(
    types: Optional[List[InfrastructureType]] = Query(None),
    min_criticality: Optional[float] = Query(None),
    search: Optional[str] = Query(None)
):
    cyclone = get_active_cyclone()
    filters = InfrastructureFilter(
        types=types,
        min_criticality=min_criticality,
        search=search
    )
    infrastructures = data_loader.get_infrastructure(filters)
    summary = risk_engine.evaluate_all(infrastructures, cyclone)
    return summary.highest_risk_infrastructure
