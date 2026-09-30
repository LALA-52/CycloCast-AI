import os
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.services.gee_service import gee_service
from app.services.gemini_service import gemini_service
from app.services.risk_engine import risk_engine

class SystemAuditTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_backend_startup_and_health(self):
        """Audit Backend Startup & Health endpoints."""
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json().get("status"), "ok")

        root = self.client.get("/")
        self.assertEqual(root.status_code, 200)
        self.assertEqual(root.json().get("status"), "ok")

    def test_02_environment_variables(self):
        """Audit Environment Variables configuration."""
        self.assertIsNotNone(settings.PROJECT_NAME)
        self.assertIsNotNone(settings.GEMINI_API_KEY)
        self.assertIsNotNone(settings.WEATHER_API_KEY)
        self.assertIsNotNone(settings.GOOGLE_MAPS_API_KEY)
        # Verify GEE settings exist
        self.assertTrue(hasattr(settings, "GEE_PROJECT"))
        self.assertTrue(hasattr(settings, "GEE_SERVICE_ACCOUNT"))

    def test_03_api_communication_cyclone_and_infra(self):
        """Audit core API communication for cyclone and infrastructure endpoints."""
        res_cyc = self.client.get("/api/cyclone/active")
        self.assertEqual(res_cyc.status_code, 200)
        cyclone_data = res_cyc.json()
        self.assertIn("name", cyclone_data)
        self.assertIn("category", cyclone_data)
        self.assertIn("wind_speed_kmh", cyclone_data)

        res_infra = self.client.get("/api/infrastructure")
        self.assertEqual(res_infra.status_code, 200)
        infra_data = res_infra.json()
        self.assertIsInstance(infra_data, list)
        self.assertGreater(len(infra_data), 0)

    def test_04_risk_calculation(self):
        """Audit risk engine calculation and multi-variable scoring."""
        # Test calculation endpoint
        calc_payload = {
            "hazardExposure": 85.0,
            "vulnerability": 75.0,
            "criticality": 90.0,
            "accessibilityRisk": 80.0
        }
        res_calc = self.client.post("/api/risk/calculate", json=calc_payload)
        self.assertEqual(res_calc.status_code, 200)
        calc_data = res_calc.json()
        self.assertIn("riskScore", calc_data)
        self.assertIn("riskCategory", calc_data)
        # Expected: 85*0.4 + 75*0.3 + 90*0.2 + 80*0.1 = 34 + 22.5 + 18 + 8 = 82.5 (CRITICAL)
        self.assertAlmostEqual(calc_data["riskScore"], 82.5, delta=0.5)
        self.assertEqual(calc_data["riskCategory"], "CRITICAL")

        # Test risk overview endpoint
        res_overview = self.client.get("/api/risk/overview")
        self.assertEqual(res_overview.status_code, 200)
        overview_data = res_overview.json()
        self.assertIn("overall_risk_score", overview_data)
        self.assertIn("highest_risk_infrastructure", overview_data)

    def test_05_gemini_service_and_endpoints(self):
        """Audit Gemini AI analysis endpoint."""
        self.assertTrue(gemini_service.is_configured())
        res = self.client.get("/api/gemini/analyze")
        # Either live 200 or 502 with graceful error message
        self.assertIn(res.status_code, [200, 502])
        if res.status_code == 200:
            data = res.json()
            self.assertIn("impact_summary", data)
            self.assertIn("key_risks", data)
            self.assertIn("recommended_actions", data)

    def test_06_response_plan_generation(self):
        """Audit AI Response Plan generation."""
        res = self.client.get("/api/gemini/response-plan")
        self.assertIn(res.status_code, [200, 502])
        if res.status_code == 200:
            data = res.json()
            self.assertIn("items", data)
            self.assertIn("decision_support_label", data)
            self.assertIn("AI-Generated Decision Support", data["decision_support_label"])

    def test_07_emergency_advisory_generation(self):
        """Audit AI Emergency Advisory generation with 5 fields & disclaimer."""
        res = self.client.get("/api/gemini/advisory")
        self.assertIn(res.status_code, [200, 502])
        if res.status_code == 200:
            data = res.json()
            self.assertIn("threat_summary", data)
            self.assertIn("affected_area", data)
            self.assertIn("major_hazards", data)
            self.assertIn("infrastructure_priorities", data)
            self.assertIn("preparedness_actions", data)
            self.assertIn("decision_support_label", data)
            self.assertIn("disclaimer", data)
            self.assertIn("AI-GENERATED DECISION SUPPORT", data["decision_support_label"].upper())

    def test_08_gee_service_and_fallback(self):
        """Audit GEE Service and graceful environmental satellite fallback."""
        res_status = self.client.get("/api/gee/status")
        self.assertEqual(res_status.status_code, 200)

        res_layer = self.client.get("/api/gee/layer")
        self.assertEqual(res_layer.status_code, 200)
        layer_data = res_layer.json()
        self.assertEqual(layer_data["name"], "Satellite / Environmental Layer")
        self.assertIn("tile_url", layer_data)
        self.assertTrue("{z}" in layer_data["tile_url"])

    def test_09_api_error_handling(self):
        """Audit API error handling on malformed or bad inputs."""
        # 1. Invalid payload to calculate risk
        bad_calc = self.client.post("/api/risk/calculate", json={"invalidField": 123})
        self.assertEqual(bad_calc.status_code, 422)  # Pydantic validation error

        # 2. Invalid cyclone update
        bad_cyc = self.client.post("/api/cyclone/update", json={"category": "not-an-int"})
        self.assertEqual(bad_cyc.status_code, 422)

        # 3. Missing endpoint
        not_found = self.client.get("/api/non-existent-endpoint")
        self.assertEqual(not_found.status_code, 404)

if __name__ == "__main__":
    unittest.main()
