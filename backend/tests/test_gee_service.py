import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.gee_service import GEEService

class TestGEEService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_gee_service_graceful_fallback_when_unconfigured(self):
        """
        Verify that if GEE credentials are not configured or ee library is not present,
        the service fails gracefully, does not raise an exception, and provides
        a valid satellite / environmental tile layer.
        """
        service = GEEService()
        # Ensure credentials are empty for this test
        service.project_id = None
        service.service_account = None

        layer = service.get_satellite_layer()
        self.assertIsNotNone(layer)
        self.assertEqual(layer.name, "Satellite / Environmental Layer")
        self.assertTrue("{z}" in layer.tile_url and "{y}" in layer.tile_url and "{x}" in layer.tile_url)
        self.assertFalse(layer.is_gee_active)
        self.assertEqual(layer.status, "fallback")
        self.assertTrue("Satellite" in layer.source or "Esri" in layer.source)

    def test_gee_status_endpoint(self):
        """
        Verify GET /api/gee/status returns the service status.
        """
        res = self.client.get("/api/gee/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("ee_installed", data)
        self.assertIn("configured", data)
        self.assertIn("status", data)
        self.assertIn("message", data)

    def test_gee_layer_endpoint(self):
        """
        Verify GET /api/gee/layer returns 200 with valid satellite tile layer config.
        """
        res = self.client.get("/api/gee/layer")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("name", data)
        self.assertIn("tile_url", data)
        self.assertIn("attribution", data)
        self.assertIn("is_gee_active", data)
        self.assertEqual(data["name"], "Satellite / Environmental Layer")
        self.assertTrue(data["tile_url"].startswith("http"))

    def test_existing_endpoints_remain_operational(self):
        """
        Verify that integrating GEE did not break any existing endpoints.
        """
        health_res = self.client.get("/health")
        self.assertEqual(health_res.status_code, 200)

        cyclone_res = self.client.get("/api/cyclone/active")
        self.assertEqual(cyclone_res.status_code, 200)

        risk_res = self.client.get("/api/risk/overview")
        self.assertEqual(risk_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
