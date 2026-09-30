from fastapi import APIRouter
from typing import Dict, Any
from app.services.data_loader import data_loader
from app.services.risk_engine import risk_engine
from app.services.gemini_service import gemini_service
from app.api.routes_cyclone import get_active_cyclone

router = APIRouter(prefix="/ai", tags=["Gemini AI Intelligence"])

@router.get("/analysis", response_model=Dict[str, Any])
def get_ai_impact_analysis():
    cyclone = get_active_cyclone()
    infrastructures = data_loader.get_infrastructure()
    risk_summary = risk_engine.evaluate_all(infrastructures, cyclone)
    return gemini_service.generate_impact_analysis(cyclone, risk_summary)
