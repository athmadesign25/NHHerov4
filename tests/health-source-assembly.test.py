import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("assembler", ROOT / "scripts/assemble-health-catalogue.py")
assembler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assembler)


class CatalogueAssemblyTests(unittest.TestCase):
    def snapshot(self, items, **changes):
        return {"facilityId": "6024", "facility": "Narayana Aarogyam, Prestige Tech Park",
                "city": "Bangalore", "capturedAt": "2026-11-06T10:00:00Z",
                "sourceUrl": "https://www.narayanahealth.org/health-checkups", "items": items, **changes}

    def test_missing_price_is_not_zero_but_explicit_zero_is_preserved(self):
        records = [{"name": "Missing", "kind": "test"}, {"name": "Covered", "kind": "test", "amount": 0}]
        items, facilities, reviews = assembler.assemble([self.snapshot(records)], [], {"facilities": []})
        self.assertEqual([(item["name"], item["price"]) for item in items], [("Covered", 0)])
        self.assertEqual(len(reviews), 1)
        self.assertEqual(facilities[0]["id"], "prestige")

    def test_missing_codes_use_local_identity_without_invented_api_metadata(self):
        record = {"name": "Aldolase", "kind": "test", "amount": 1200, "testCount": 1}
        items, _, _ = assembler.assemble([self.snapshot([record]), self.snapshot([record])], [], {"facilities": []})
        self.assertEqual(len(items), 1)
        self.assertIn("local-", items[0]["id"])
        self.assertNotIn("code", items[0])
        self.assertNotIn("audience", items[0])
        self.assertEqual(items[0]["preparation"], "")
        self.assertEqual(items[0]["reportTime"], "")
        self.assertEqual(items[0]["includedTestIds"], [])

    def test_empty_observed_centre_survives_without_fabricated_catalogue(self):
        items, facilities, _ = assembler.assemble([self.snapshot([], facilityId=None)], [], {"facilities": []})
        self.assertEqual(items, [])
        self.assertEqual(len(facilities), 1)
        self.assertNotIn("unitCode", facilities[0])

    def test_only_source_content_enters_catalogue_and_package_flow_is_explicit(self):
        record = {"name": "Package A", "kind": "package", "amount": 1500, "code": "PKG1",
                  "patientName": "Private value", "token": "private-token"}
        items, _, _ = assembler.assemble([self.snapshot([record])], [], {"facilities": []})
        self.assertTrue(items[0]["requiresSlot"])
        self.assertNotIn("patientName", items[0])
        self.assertNotIn("token", items[0])

    def test_city_clusters_share_a_centre_and_keep_all_selector_contexts(self):
        snapshots = [self.snapshot([], facilityId="1760", facility="Hospital", city=city)
                     for city in ["Kolkata", "Barasat", "Kolkata"]]
        directory = {"facilities": [{"unitCode": "1760", "city": "Barasat"}]}
        _, facilities, _ = assembler.assemble(snapshots, [], directory)
        self.assertEqual(len(facilities), 1)
        self.assertEqual(facilities[0]["city"], "Barasat")
        self.assertEqual(facilities[0]["serviceCities"], ["Barasat", "Kolkata"])


if __name__ == "__main__":
    unittest.main()
