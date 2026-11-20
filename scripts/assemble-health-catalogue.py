#!/usr/bin/env python3
"""Merge allowlisted UI catalogue snapshots with imported public detail records.

Raw snapshots remain separate. Missing detail content stays empty; it is never
copied from a different package or facility. This builds the frontend snapshot,
not a live price, inventory, eligibility or booking API.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/health-checkups"
spec = importlib.util.spec_from_file_location("detail_builder", ROOT / "scripts/build-health-catalogue.py")
detail_builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(detail_builder)


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def assemble(snapshots, details, directory):
    items, facilities, reviews = {}, {}, []
    directory_by_code = {str(entry["unitCode"]): entry for entry in directory["facilities"]}
    source_by_key = {}
    for source in details:
        try:
            item, review = detail_builder.compact_item(source, ROOT / "public")
            source_by_key[(item["unitCode"], item["code"])] = item
            reviews.append(review)
        except ValueError as error:
            reviews.append({"code": source.get("code"), "error": str(error)})

    for snapshot in snapshots:
        unit = str(snapshot.get("unitCode") or snapshot.get("facilityId") or "")
        name, city = snapshot["facility"], snapshot["city"]
        facility_id = detail_builder.ALIASES.get(unit, unit) if unit else f"centre-{slug(city)}-{slug(name)}"
        directory_record = directory_by_code.get(unit, {})
        existing = facilities.get(facility_id, {})
        service_cities = sorted(set(existing.get("serviceCities", [])) | {city})
        facility = {"id": facility_id, "name": name, "city": directory_record.get("city") or city,
                    "serviceCities": service_cities,
                    "address": directory_record.get("address") or "",
                    "sourceUrl": snapshot.get("sourceUrl"), "catalogueObserved": True}
        if unit and unit.isdigit():
            facility["unitCode"] = unit
        facilities[facility_id] = facility
        for record in snapshot.get("items", []):
            code = record.get("code")
            item = source_by_key.get((unit, code))
            if item:
                merged = {**item, "facilityId": facility_id}
                # Prefer the actual listing artwork over CMS icon thumbnails.
                # The untouched detail record still retains its original media.
                image = record.get("localImage")
                if isinstance(image, str) and image.startswith("/health-checkups/source/") and (ROOT / "public" / image.lstrip("/")).is_file():
                    merged["image"] = image
                items[item["id"]] = merged
                continue
            price = detail_builder.amount(record.get("amount"))
            if price is None or not record.get("name"):
                reviews.append({"facilityId": facility_id, "name": record.get("name"), "error": "Missing source name or price"})
                continue
            # A local identity for tests without published codes is explicitly
            # distinct from a source/API code. No code is fabricated.
            identity = code.lower() if code else "local-" + hashlib.sha256(record["name"].encode()).hexdigest()[:12]
            item_id = f"source-{unit or facility_id}-{identity}"
            source_url = record.get("sourceUrl") or snapshot.get("sourceUrl")
            source_slug = urlsplit(record.get("sourceUrl", "")).path.rstrip("/").split("/")[-1]
            item = {"id": item_id, "slug": source_slug if source_slug and source_slug != "null" else slug(record["name"]),
                    "name": record["name"], "kind": record["kind"], "price": price,
                    "facilityId": facility_id, "category": "Health checkups" if record["kind"] == "package" else "Lab tests",
                    "description": record.get("subtitle") or "", "testCount": record.get("testCount") or 0,
                    "inclusions": [], "includedTestIds": [], "preparation": "", "reportTime": "",
                    # Observed live checkout branches on PACKAGE vs test-only.
                    "requiresSlot": record["kind"] == "package", "provenance": "live-listing",
                    "sourceUrl": source_url, "retrievedAt": snapshot.get("capturedAt", "")}
            if unit and unit.isdigit():
                item["unitCode"] = unit
            if code:
                item["code"] = code
            image = record.get("localImage")
            if isinstance(image, str) and image.startswith("/health-checkups/source/") and (ROOT / "public" / image.lstrip("/")).is_file():
                item["image"] = image
            previous = items.get(item_id)
            if previous and previous["price"] != item["price"]:
                reviews.append({"id": item_id, "error": "Price differs between observed city contexts",
                                "observedPrices": [previous["price"], item["price"]]})
            items[item_id] = item
    # Keep imported detail URLs usable even before their listing snapshot lands.
    for item in source_by_key.values():
        items.setdefault(item["id"], item)
        if item["facilityId"] not in facilities:
            entry = directory_by_code.get(item["unitCode"])
            if entry and entry.get("city"):
                facilities[item["facilityId"]] = {"id": item["facilityId"], "unitCode": item["unitCode"],
                    "name": entry["name"], "city": entry["city"], "address": entry.get("address") or "",
                    "sourceUrl": item["sourceUrl"], "catalogueObserved": True}
    return list(items.values()), list(facilities.values()), reviews


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshots", type=Path, default=DATA / "catalogues")
    args = parser.parse_args()
    snapshots = [json.loads(path.read_text()) for path in sorted(args.snapshots.glob("*.json"))]
    details = json.loads((DATA / "source-details.json").read_text())
    directory = json.loads((DATA / "facilities-directory.json").read_text())
    items, facilities, reviews = assemble(snapshots, details, directory)
    for name, data in [("items.json", items), ("active-facilities.json", facilities), ("assembly-review.json", reviews)]:
        detail_builder.write_json(DATA / name, data)
    print(f"Assembled {len(items)} items across {len(facilities)} observed facilities from {len(snapshots)} snapshots.")


if __name__ == "__main__":
    main()
