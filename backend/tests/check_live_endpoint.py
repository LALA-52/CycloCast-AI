import urllib.request
import json

url = "http://127.0.0.1:8000/api/risk/calculate"

tests = [
    {
        "label": "Test 1: Low Risk Scenario",
        "payload": {
            "hazardExposure": 15.0,
            "vulnerability": 20.0,
            "criticality": 25.0,
            "accessibilityRisk": 10.0,
        },
    },
    {
        "label": "Test 2: Moderate Risk Scenario",
        "payload": {
            "hazardExposure": 55.0,
            "vulnerability": 40.0,
            "criticality": 50.0,
            "accessibilityRisk": 30.0,
        },
    },
    {
        "label": "Test 3: High Risk Scenario",
        "payload": {
            "hazardExposure": 75.0,
            "vulnerability": 68.0,
            "criticality": 78.0,
            "accessibilityRisk": 64.0,
        },
    },
    {
        "label": "Test 4: Critical Risk Scenario",
        "payload": {
            "hazardExposure": 95.0,
            "vulnerability": 88.0,
            "criticality": 94.0,
            "accessibilityRisk": 90.0,
        },
    },
    {
        "label": "Test 5: Boundary Exact 30.0 (LOW)",
        "payload": {
            "hazardExposure": 30.0,
            "vulnerability": 30.0,
            "criticality": 30.0,
            "accessibilityRisk": 30.0,
        },
    },
    {
        "label": "Test 6: Boundary Exact 60.0 (MODERATE)",
        "payload": {
            "hazardExposure": 60.0,
            "vulnerability": 60.0,
            "criticality": 60.0,
            "accessibilityRisk": 60.0,
        },
    },
    {
        "label": "Test 7: Boundary Exact 80.0 (HIGH)",
        "payload": {
            "hazardExposure": 80.0,
            "vulnerability": 80.0,
            "criticality": 80.0,
            "accessibilityRisk": 80.0,
        },
    },
    {
        "label": "Test 8: Lower Bound Minimum (0.0)",
        "payload": {
            "hazardExposure": 0.0,
            "vulnerability": 0.0,
            "criticality": 0.0,
            "accessibilityRisk": 0.0,
        },
    },
    {
        "label": "Test 9: Upper Bound Maximum (100.0)",
        "payload": {
            "hazardExposure": 100.0,
            "vulnerability": 100.0,
            "criticality": 100.0,
            "accessibilityRisk": 100.0,
        },
    },
]

print(f"Target: POST {url}\n")
for t in tests:
    req = urllib.request.Request(
        url,
        data=json.dumps(t["payload"]).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        print(f"[{t['label']}]")
        print(f"  Request Payload : {t['payload']}")
        print(f"  Response (HTTP {resp.status}): {json.dumps(body)}")
        print()
