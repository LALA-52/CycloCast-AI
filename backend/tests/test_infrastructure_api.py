import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.models.infrastructure import InfrastructureType

class TestInfrastructureAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_get_all_infrastructure(self):
        """Test GET /api/infrastructure returns all benchmark demo assets."""
        response = self.client.get("/api/infrastructure")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 18)

        # Check required fields on all items
        required_fields = [
            "id", "name", "type", "latitude", "longitude",
            "criticality", "elevation", "population_served",
            "flood_exposure", "vulnerability", "accessibility_risk"
        ]
        for item in data:
            for field in required_fields:
                self.assertIn(field, item, f"Missing required field '{field}' in item {item.get('id')}")

    def test_all_five_types_present(self):
        """Verify the DEMO dataset contains all 5 supported types."""
        response = self.client.get("/api/infrastructure")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        types_in_data = {item["type"] for item in data}

        expected_types = {
            InfrastructureType.HOSPITAL.value,
            InfrastructureType.ROAD.value,
            InfrastructureType.BRIDGE.value,
            InfrastructureType.POWER_STATION.value,
            InfrastructureType.EMERGENCY_SHELTER.value,
        }
        self.assertEqual(types_in_data, expected_types)

    def test_filter_hospitals(self):
        """Test filtering by hospitals (plural and singular)."""
        for param in ["hospitals", "hospital", "Hospital"]:
            response = self.client.get(f"/api/infrastructure?type={param}")
            self.assertEqual(response.status_code, 200)
            items = response.json()
            self.assertEqual(len(items), 4)
            self.assertTrue(all(i["type"] == "Hospital" for i in items))

    def test_filter_roads(self):
        """Test filtering by roads (plural and singular)."""
        for param in ["roads", "road", "Road"]:
            response = self.client.get(f"/api/infrastructure?type={param}")
            self.assertEqual(response.status_code, 200)
            items = response.json()
            self.assertEqual(len(items), 4)
            self.assertTrue(all(i["type"] == "Road" for i in items))

    def test_filter_bridges(self):
        """Test filtering by bridges (plural and singular)."""
        for param in ["bridges", "bridge", "Bridge"]:
            response = self.client.get(f"/api/infrastructure?type={param}")
            self.assertEqual(response.status_code, 200)
            items = response.json()
            self.assertEqual(len(items), 3)
            self.assertTrue(all(i["type"] == "Bridge" for i in items))

    def test_filter_power_stations(self):
        """Test filtering by power stations (variations)."""
        for param in ["power stations", "power station", "power_stations", "power_station"]:
            response = self.client.get(f"/api/infrastructure?type={param}")
            self.assertEqual(response.status_code, 200)
            items = response.json()
            self.assertEqual(len(items), 3)
            self.assertTrue(all(i["type"] == "Power Station" for i in items))

    def test_filter_emergency_shelters(self):
        """Test filtering by emergency shelters (variations)."""
        for param in ["emergency shelters", "emergency shelter", "emergency_shelters", "emergency_shelter", "shelters"]:
            response = self.client.get(f"/api/infrastructure?type={param}")
            self.assertEqual(response.status_code, 200)
            items = response.json()
            self.assertEqual(len(items), 4)
            self.assertTrue(all(i["type"] == "Emergency Shelter" for i in items))

    def test_category_alias(self):
        """Test category query parameter alias."""
        response = self.client.get("/api/infrastructure?category=bridges")
        self.assertEqual(response.status_code, 200)
        items = response.json()
        self.assertEqual(len(items), 3)
        self.assertTrue(all(i["type"] == "Bridge" for i in items))

    def test_multi_type_filter(self):
        """Test filtering multiple types via comma-separated query param."""
        response = self.client.get("/api/infrastructure?type=hospitals,roads")
        self.assertEqual(response.status_code, 200)
        items = response.json()
        self.assertEqual(len(items), 8)
        self.assertTrue(all(i["type"] in ["Hospital", "Road"] for i in items))

    def test_invalid_type_returns_400(self):
        """Test invalid infrastructure type returns 400 with helpful message."""
        response = self.client.get("/api/infrastructure?type=airports")
        self.assertEqual(response.status_code, 400)
        detail = response.json().get("detail", "")
        self.assertIn("Invalid infrastructure type", detail)
        self.assertIn("hospitals", detail)
        self.assertIn("emergency shelters", detail)

    def test_get_infrastructure_by_id_success(self):
        """Test GET /api/infrastructure/{id} for valid IDs across categories."""
        test_ids = [
            ("INF-HOSP-001", "Hospital"),
            ("INF-ROAD-001", "Road"),
            ("INF-BRID-001", "Bridge"),
            ("INF-POW-001", "Power Station"),
            ("INF-SHEL-001", "Emergency Shelter"),
        ]
        for asset_id, expected_type in test_ids:
            response = self.client.get(f"/api/infrastructure/{asset_id}")
            self.assertEqual(response.status_code, 200)
            item = response.json()
            self.assertEqual(item["id"], asset_id)
            self.assertEqual(item["type"], expected_type)

    def test_get_infrastructure_by_id_case_insensitive(self):
        """Test GET /api/infrastructure/{id} handles case-insensitivity."""
        response = self.client.get("/api/infrastructure/inf-hosp-001")
        self.assertEqual(response.status_code, 200)
        item = response.json()
        self.assertEqual(item["id"], "INF-HOSP-001")

    def test_get_infrastructure_by_id_not_found(self):
        """Test GET /api/infrastructure/{id} with unknown ID returns 404."""
        response = self.client.get("/api/infrastructure/UNKNOWN-999")
        self.assertEqual(response.status_code, 404)
        self.assertIn("not found", response.json().get("detail", "").lower())

    def test_search_parameter(self):
        """Test searching by asset name, ID, or notes."""
        response = self.client.get("/api/infrastructure?search=dhamra")
        self.assertEqual(response.status_code, 200)
        items = response.json()
        self.assertGreater(len(items), 0)
        for item in items:
            text = f"{item['name']} {item.get('condition_notes', '')} {item['id']}".lower()
            self.assertIn("dhamra", text)

    def test_trailing_slash_compatibility(self):
        """Test /api/infrastructure/ works same as /api/infrastructure."""
        response = self.client.get("/api/infrastructure/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 18)

if __name__ == "__main__":
    unittest.main()
