from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

samples = [
    {
        "desc": "Rural coastal clinic (Low risk)",
        "hazardExposure": 15.0,
        "vulnerability": 20.0,
        "criticality": 25.0,
        "accessibilityRisk": 10.0,
    },
    {
        "desc": "Boundary threshold (Score = 30.0)",
        "hazardExposure": 30.0,
        "vulnerability": 30.0,
        "criticality": 30.0,
        "accessibilityRisk": 30.0,
    },
    {
        "desc": "Inland evacuation shelter (Moderate risk)",
        "hazardExposure": 55.0,
        "vulnerability": 40.0,
        "criticality": 50.0,
        "accessibilityRisk": 30.0,
    },
    {
        "desc": "Boundary threshold (Score = 60.0)",
        "hazardExposure": 60.0,
        "vulnerability": 60.0,
        "criticality": 60.0,
        "accessibilityRisk": 60.0,
    },
    {
        "desc": "Regional coastal highway (High risk)",
        "hazardExposure": 75.0,
        "vulnerability": 68.0,
        "criticality": 78.0,
        "accessibilityRisk": 64.0,
    },
    {
        "desc": "Boundary threshold (Score = 80.0)",
        "hazardExposure": 80.0,
        "vulnerability": 80.0,
        "criticality": 80.0,
        "accessibilityRisk": 80.0,
    },
    {
        "desc": "Estuary bridge in destructive zone (Critical)",
        "hazardExposure": 95.0,
        "vulnerability": 88.0,
        "criticality": 94.0,
        "accessibilityRisk": 90.0,
    },
    {
        "desc": "Minimum bounds check (All zeros)",
        "hazardExposure": 0.0,
        "vulnerability": 0.0,
        "criticality": 0.0,
        "accessibilityRisk": 0.0,
    },
    {
        "desc": "Maximum bounds check (All 100s)",
        "hazardExposure": 100.0,
        "vulnerability": 100.0,
        "criticality": 100.0,
        "accessibilityRisk": 100.0,
    },
]

print(f"{'Scenario':<42} | {'Hazard':<6} | {'Vuln':<6} | {'Crit':<6} | {'Access':<6} | {'Risk Score':<10} | {'Category':<8}")
print("-" * 100)

for s in samples:
    payload = {
        "hazardExposure": s["hazardExposure"],
        "vulnerability": s["vulnerability"],
        "criticality": s["criticality"],
        "accessibilityRisk": s["accessibilityRisk"],
    }
    res = client.post("/api/risk/calculate", json=payload)
    data = res.json()
    print(f"{s['desc']:<42} | {s['hazardExposure']:>6.1f} | {s['vulnerability']:>6.1f} | {s['criticality']:>6.1f} | {s['accessibilityRisk']:>6.1f} | {data['riskScore']:>10.1f} | {data['riskCategory']:<8}")
