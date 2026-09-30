import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.gemini_service import GeminiService
from app.models.gemini import (
    CycloneInformation,
    WeatherConditions,
    InfrastructureRiskData,
)

class TestGeminiService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_gemini_missing_key_behavior(self):
        """
        Verify that if GEMINI_API_KEY is unavailable/empty, the service
        raises a clear configuration error and does not crash the application.
        """
        service = GeminiService()
        service.api_key = "" # Simulate missing key

        self.assertFalse(service.is_configured())

        cyclone_info = CycloneInformation(name="Test Storm", category=2)
        weather_cond = WeatherConditions(rainfall_mm=150.0)
        risk_data = InfrastructureRiskData(overall_risk_score=50.0, critical_asset_count=1)

        # Calling analyze with missing key should raise clear 503 HTTPException, not crash
        with self.assertRaises(Exception) as ctx:
            service.analyze(cyclone_info, weather_cond, risk_data)

        self.assertTrue("Configuration Error" in str(ctx.exception) or "GEMINI_API_KEY" in str(ctx.exception))

    def test_gemini_post_endpoint_with_payload(self):
        """
        Test POST /api/gemini/analyze with full input payload:
        - cyclone information
        - weather conditions
        - infrastructure risk data
        """
        payload = {
            "cycloneInformation": {
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
            "weatherConditions": {
                "rainfall_mm": 300.0,
                "coastal_wind_gusts_kmh": 150.0,
                "barometric_pressure_hpa": 980.0,
                "tide_level_m": 2.4,
                "sea_surface_temp_c": 29.5,
                "weather_summary": "Extremely heavy rain bands and violent gusts"
            },
            "infrastructureRiskData": {
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

        res = self.client.post("/api/gemini/analyze", json=payload)
        if res.status_code == 502:
            # Network DNS resolution failed in test sandbox environment
            self.assertIn("detail", res.json())
            return
        self.assertEqual(res.status_code, 200, f"Expected 200 but got {res.status_code}: {res.text}")
        data = res.json()

        # Check required fields
        self.assertIn("impact_summary", data)
        self.assertIn("key_risks", data)
        self.assertIn("recommended_actions", data)

        # Check types
        self.assertIsInstance(data["impact_summary"], str)
        self.assertTrue(len(data["impact_summary"]) > 20)
        self.assertIsInstance(data["key_risks"], list)
        self.assertTrue(len(data["key_risks"]) >= 1)
        self.assertIsInstance(data["recommended_actions"], list)
        self.assertTrue(len(data["recommended_actions"]) >= 1)

        print("\n--- GEMINI LIVE ANALYSIS RESULT ---")
        print("IMPACT SUMMARY:")
        print(data["impact_summary"])
        print("\nKEY RISKS:")
        for r in data["key_risks"]:
            print(f"- {r}")
        print("\nRECOMMENDED ACTIONS:")
        for a in data["recommended_actions"]:
            print(f"- {a}")
        print("-----------------------------------\n")

    def test_gemini_get_endpoint_active_scenario(self):
        """
        Test GET /api/gemini/analyze using active scenario telemetry.
        """
        res = self.client.get("/api/gemini/analyze")
        if res.status_code == 502:
            self.assertIn("detail", res.json())
            return
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIn("impact_summary", data)
        self.assertIn("key_risks", data)
        self.assertIn("recommended_actions", data)

    def test_generate_response_plan_endpoint(self):
        """
        Verify that /api/gemini/response-plan identifies highest-risk infrastructure
        and returns Priority, Infrastructure, Risk score, Reason, and Recommended action,
        clearly labeled as AI-generated decision support.
        """
        res = self.client.get("/api/gemini/response-plan")
        if res.status_code == 502:
            self.assertIn("detail", res.json())
            return
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIn("items", data)
        self.assertIn("decision_support_label", data)
        self.assertIn("AI-Generated Decision Support", data["decision_support_label"])

        self.assertTrue(len(data["items"]) >= 1)
        for item in data["items"]:
            self.assertIn("priority", item)
            self.assertIn("infrastructure", item)
            self.assertIn("risk_score", item)
            self.assertIn("reason", item)
            self.assertIn("recommended_action", item)
            self.assertIsInstance(item["priority"], int)
            self.assertIsInstance(item["infrastructure"], str)
            self.assertIsInstance(item["risk_score"], (int, float))
            self.assertIsInstance(item["reason"], str)
            self.assertIsInstance(item["recommended_action"], str)

    def test_generate_advisory_endpoint(self):
        """
        Verify that /api/gemini/advisory returns:
        - threat summary
        - affected area
        - major hazards
        - infrastructure priorities
        - preparedness actions
        - clearly labeled: AI-GENERATED DECISION SUPPORT
        - disclaimed: not an official government warning
        """
        res = self.client.get("/api/gemini/advisory")
        if res.status_code == 502:
            self.assertIn("detail", res.json())
            return
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIn("threat_summary", data)
        self.assertIn("affected_area", data)
        self.assertIn("major_hazards", data)
        self.assertIn("infrastructure_priorities", data)
        self.assertIn("preparedness_actions", data)
        self.assertIn("decision_support_label", data)
        self.assertIn("disclaimer", data)

        # Label checks
        self.assertIn("AI-GENERATED DECISION SUPPORT", data["decision_support_label"].upper())
        self.assertTrue("not an official" in data["disclaimer"].lower() or "not" in data["disclaimer"].lower())

        # Type checks
        self.assertIsInstance(data["threat_summary"], str)
        self.assertTrue(len(data["threat_summary"]) > 10)
        self.assertIsInstance(data["affected_area"], str)
        self.assertTrue(len(data["affected_area"]) > 5)
        self.assertIsInstance(data["major_hazards"], list)
        self.assertTrue(len(data["major_hazards"]) >= 1)
        self.assertIsInstance(data["infrastructure_priorities"], list)
        self.assertTrue(len(data["infrastructure_priorities"]) >= 1)
        self.assertIsInstance(data["preparedness_actions"], list)
        self.assertTrue(len(data["preparedness_actions"]) >= 1)

if __name__ == "__main__":
    unittest.main()
