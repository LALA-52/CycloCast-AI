"""
Stand-alone verification script for Gemini endpoint integration.
Tests both GET and POST endpoints using FastAPI TestClient.
"""
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
import json

def run_checks():
    client = TestClient(app)
    
    print("=" * 60)
    print("CycloCast AI - Gemini Endpoint Verification")
    print("=" * 60)

    # 1. Test POST /api/gemini/analyze with full payload
    payload = {
        "cyclone_information": {
            "name": "Cyclone Dana",
            "category": 3,
            "wind_speed_kmh": 130.0,
            "gusts_kmh": 150.0,
            "central_pressure_hpa": 980.0,
            "movement_speed_kmh": 15.0,
            "movement_direction": "NNW",
            "estimated_storm_surge_m": 2.4,
            "radius_destructive_km": 60.0,
            "radius_gale_km": 180.0,
            "landfall_location": "Dhamra Port, Odisha"
        },
        "weather_conditions": {
            "rainfall_mm": 300.0,
            "coastal_wind_gusts_kmh": 150.0,
            "barometric_pressure_hpa": 980.0,
            "tide_level_m": 2.4,
            "sea_surface_temp_c": 29.5,
            "weather_summary": "Extremely heavy rain bands and violent gusts"
        },
        "infrastructure_risk_data": {
            "overall_risk_score": 78.5,
            "critical_asset_count": 3,
            "high_risk_asset_count": 2,
            "total_assets": 18,
            "top_vulnerable_assets": [
                {
                    "name": "Dhamra Coastal Hospital",
                    "type": "Hospital",
                    "risk_score": 89.0,
                    "failure_mode": "ICU flooding and generator failure"
                },
                {
                    "name": "Baitarani Estuary Bridge",
                    "type": "Bridge",
                    "risk_score": 85.0,
                    "failure_mode": "Hydrodynamic surge impact and pier scour"
                }
            ]
        }
    }

    print("\n[1] Testing POST /api/gemini/analyze ...")
    res = client.post("/api/gemini/analyze", json=payload)
    print(f"Status: {res.status_code}")
    assert res.status_code == 200, f"POST /api/gemini/analyze failed: {res.text}"
    data = res.json()
    print("Response fields received:")
    print(f" - impact_summary: {data.get('impact_summary')[:80]}...")
    print(f" - key_risks count: {len(data.get('key_risks', []))}")
    print(f" - recommended_actions count: {len(data.get('recommended_actions', []))}")
    print(f" - model: {data.get('model')}")

    # 2. Test GET /api/gemini/analyze (active scenario)
    print("\n[2] Testing GET /api/gemini/analyze ...")
    res = client.get("/api/gemini/analyze")
    print(f"Status: {res.status_code}")
    assert res.status_code == 200, f"GET /api/gemini/analyze failed: {res.text}"
    data = res.json()
    print("Response fields received:")
    print(f" - impact_summary: {data.get('impact_summary')[:80]}...")
    print(f" - key_risks count: {len(data.get('key_risks', []))}")
    print(f" - recommended_actions count: {len(data.get('recommended_actions', []))}")

    print("\n" + "=" * 60)
    print("ALL GEMINI ENDPOINT VERIFICATIONS PASSED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    run_checks()
