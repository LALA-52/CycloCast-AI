import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestRiskCalculate(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_risk_calculate_low(self):
        """Test LOW category calculation (0-30)."""
        payload = {
            "hazardExposure": 20.0,
            "vulnerability": 25.0,
            "criticality": 15.0,
            "accessibilityRisk": 10.0
        }
        # 0.40*20 + 0.30*25 + 0.20*15 + 0.10*10 = 8.0 + 7.5 + 3.0 + 1.0 = 19.5
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 19.5)
        self.assertEqual(data["riskCategory"], "LOW")

    def test_risk_calculate_boundary_30(self):
        """Test boundary exactly 30.0 (LOW)."""
        payload = {
            "hazardExposure": 30.0,
            "vulnerability": 30.0,
            "criticality": 30.0,
            "accessibilityRisk": 30.0
        }
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 30.0)
        self.assertEqual(data["riskCategory"], "LOW")

    def test_risk_calculate_moderate(self):
        """Test MODERATE category calculation (31-60)."""
        payload = {
            "hazardExposure": 50.0,
            "vulnerability": 40.0,
            "criticality": 60.0,
            "accessibilityRisk": 30.0
        }
        # 0.40*50 + 0.30*40 + 0.20*60 + 0.10*30 = 20.0 + 12.0 + 12.0 + 3.0 = 47.0
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 47.0)
        self.assertEqual(data["riskCategory"], "MODERATE")

    def test_risk_calculate_boundary_60(self):
        """Test boundary exactly 60.0 (MODERATE)."""
        payload = {
            "hazardExposure": 60.0,
            "vulnerability": 60.0,
            "criticality": 60.0,
            "accessibilityRisk": 60.0
        }
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 60.0)
        self.assertEqual(data["riskCategory"], "MODERATE")

    def test_risk_calculate_high(self):
        """Test HIGH category calculation (61-80)."""
        payload = {
            "hazardExposure": 75.0,
            "vulnerability": 70.0,
            "criticality": 80.0,
            "accessibilityRisk": 60.0
        }
        # 0.40*75 + 0.30*70 + 0.20*80 + 0.10*60 = 30.0 + 21.0 + 16.0 + 6.0 = 73.0
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 73.0)
        self.assertEqual(data["riskCategory"], "HIGH")

    def test_risk_calculate_boundary_80(self):
        """Test boundary exactly 80.0 (HIGH)."""
        payload = {
            "hazardExposure": 80.0,
            "vulnerability": 80.0,
            "criticality": 80.0,
            "accessibilityRisk": 80.0
        }
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 80.0)
        self.assertEqual(data["riskCategory"], "HIGH")

    def test_risk_calculate_critical(self):
        """Test CRITICAL category calculation (81-100)."""
        payload = {
            "hazardExposure": 95.0,
            "vulnerability": 90.0,
            "criticality": 85.0,
            "accessibilityRisk": 90.0
        }
        # 0.40*95 + 0.30*90 + 0.20*85 + 0.10*90 = 38.0 + 27.0 + 17.0 + 9.0 = 91.0
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 91.0)
        self.assertEqual(data["riskCategory"], "CRITICAL")

    def test_risk_calculate_extremes(self):
        """Test 0.0, 100.0, and clamping."""
        # Min 0
        res_zero = self.client.post("/api/risk/calculate", json={
            "hazardExposure": 0.0,
            "vulnerability": 0.0,
            "criticality": 0.0,
            "accessibilityRisk": 0.0
        })
        self.assertEqual(res_zero.status_code, 200)
        self.assertEqual(res_zero.json()["riskScore"], 0.0)
        self.assertEqual(res_zero.json()["riskCategory"], "LOW")

        # Max 100
        res_max = self.client.post("/api/risk/calculate", json={
            "hazardExposure": 100.0,
            "vulnerability": 100.0,
            "criticality": 100.0,
            "accessibilityRisk": 100.0
        })
        self.assertEqual(res_max.status_code, 200)
        self.assertEqual(res_max.json()["riskScore"], 100.0)
        self.assertEqual(res_max.json()["riskCategory"], "CRITICAL")

        # Clamp > 100
        res_clamp = self.client.post("/api/risk/calculate", json={
            "hazardExposure": 120.0,
            "vulnerability": 110.0,
            "criticality": 100.0,
            "accessibilityRisk": 100.0
        })
        self.assertEqual(res_clamp.status_code, 200)
        self.assertEqual(res_clamp.json()["riskScore"], 100.0)
        self.assertEqual(res_clamp.json()["riskCategory"], "CRITICAL")

    def test_risk_calculate_aliases(self):
        """Test that snake_case aliases work seamlessly."""
        payload = {
            "hazard_exposure": 70.0,
            "vulnerability": 60.0,
            "criticality": 80.0,
            "accessibility_risk": 50.0
        }
        res = self.client.post("/api/risk/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["riskScore"], 67.0)
        self.assertEqual(data["riskCategory"], "HIGH")

if __name__ == "__main__":
    unittest.main()
