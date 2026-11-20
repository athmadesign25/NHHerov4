#!/usr/bin/env python3
"""Build compact health items and an honest coverage manifest from saved sources.

Offline only. Never guesses catalogue codes, prices, eligibility or clinical copy.
Run from any directory with Python 3.9+; no third-party packages are needed.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import re
from typing import Any
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/health-checkups"
ALIASES = {"6024": "prestige", "3010": "electronic-city"}


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def amount(value: Any) -> float | int | None:
    if isinstance(value, bool) or value is None:
        return None
    if not isinstance(value, (int, float, str)):
        return None
    try:
        number = float(value)
    except (ValueError, OverflowError):
        return None
    if not math.isfinite(number) or number < 0:
        return None
    return int(number) if number.is_integer() else number


def count(value: Any) -> int | None:
    number = amount(value)
    return int(number) if number is not None and number == int(number) else None


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def cms_record(health: dict, code: str) -> dict:
    data = health.get("cmsInfo", {}).get("data", []) if isinstance(health.get("cmsInfo"), dict) else []
    candidates = data if isinstance(data, list) else [data]
    candidates = [entry.get("attributes", entry) for entry in candidates if isinstance(entry, dict)]
    matched = [entry for entry in candidates if str(entry.get("AthmaId", "")) == code]
    candidates = matched or candidates
    return next((entry for entry in candidates if entry.get("locale") == "en"), candidates[0] if candidates else {})


def local_image(source: dict, image_url: str, public_dir: Path) -> str:
    for image in source.get("downloadedImages", []):
        if not isinstance(image, dict) or image.get("sourceUrl") != image_url:
            continue
        stored = Path(text(image.get("path")))
        candidates = [stored] if stored.is_absolute() else [ROOT / stored]
        # Imports are portable: only the suffix beneath public/ is needed.
        if "public" in stored.parts:
            candidates.append(public_dir.joinpath(*stored.parts[stored.parts.index("public") + 1:]))
        for candidate in candidates:
            try:
                relative = candidate.resolve().relative_to(public_dir.resolve())
            except ValueError:
                continue
            if candidate.is_file():
                return "/" + relative.as_posix()
    return image_url


def compact_item(source: dict, public_dir: Path) -> tuple[dict, dict]:
    unit = text(str(source.get("unitCode", "")))
    code = text(str(source.get("code", "")))
    if not re.fullmatch(r"[A-Za-z0-9_-]+", unit) or not re.fullmatch(r"[A-Za-z0-9_-]+", code):
        raise ValueError("Missing or invalid explicit unitCode/code")
    kind = source.get("kind")
    if kind not in {"package", "test"}:
        raise ValueError("Missing explicit package/test kind")
    url = text(source.get("sourceUrl"))
    parsed = urlsplit(url)
    query = parse_qs(parsed.query)
    if (parsed.scheme != "https" or parsed.hostname not in {"www.narayanahealth.org", "narayanahealth.org"}
            or not re.fullmatch(r"/health-checkups/[A-Za-z0-9_-]+/?", parsed.path)
            or query.get("unitCode") != [unit] or query.get("code") != [code]):
        raise ValueError("Source detail URL does not match explicit unitCode/code")
    details = source.get("detailsData")
    health = details.get("healthData") if isinstance(details, dict) else None
    if not isinstance(health, dict):
        raise ValueError("Missing detailsData.healthData")
    returned_code = health.get("packageCode") or health.get("testCode") or health.get("code")
    if returned_code is not None and str(returned_code) != code:
        raise ValueError("Payload item code differs from source identity")
    price = amount(health.get("amount"))
    if price is None:
        raise ValueError("Missing or invalid operational amount; CMS prices are not a fallback")
    cms = cms_record(health, code)
    name = text(cms.get("PackageName")) or text(cms.get("TestName")) or text(health.get("displayName"))
    if not name:
        raise ValueError("No observed item display name")
    counts = {"operational": count(health.get("noOfTests")), "cms": count(cms.get("HealthTestsCount"))}
    profiles = cms.get("profile_tests")
    if isinstance(profiles, list) and profiles:
        counts["profileGroups"] = len(profiles)
    counts = {key: value for key, value in counts.items() if value is not None}
    inconsistent = len(set(counts.values())) > 1
    headline_count = 0 if inconsistent else next(iter(counts.values()), 0)
    highlights = cms.get("TestHighlights", [])
    inclusions = list(dict.fromkeys(text(entry.get("Title")) for entry in highlights
                                   if isinstance(entry, dict) and text(entry.get("Title")))) if isinstance(highlights, list) else []
    image_url = text(cms.get("package_image"))
    if not image_url and isinstance(cms.get("PackageImage"), dict):
        image_url = text(cms["PackageImage"].get("url"))
    image = local_image(source, image_url, public_dir) if image_url else ""
    explicit_slot = source.get("requiresSlot", health.get("requiresSlot"))
    if isinstance(explicit_slot, bool):
        requires_slot, slot_basis = explicit_slot, "explicit requiresSlot"
    else:
        # The observed NH checkout branches on whether the cart contains a
        # PACKAGE. Test-only carts go directly to summary. This is a recorded
        # flow rule, not a conclusion drawn from missing schedule metadata.
        requires_slot = kind == "package"
        slot_basis = "observed NH checkout rule: package requires slot; test-only skips slot"
    item = {
        "id": f"source-{unit}-{code.lower()}", "slug": parsed.path.rstrip("/").split("/")[-1],
        "unitCode": unit, "code": code, "sourceUrl": url, "retrievedAt": text(source.get("retrievedAt")),
        "provenance": "live-detail", "name": name, "kind": kind,
        "description": text(cms.get("AboutTheTest")), "price": price,
        "facilityId": ALIASES.get(unit, unit), "category": "Health checkups" if kind == "package" else "Lab tests",
        "testCount": headline_count, "inclusions": inclusions, "includedTestIds": [],
        "preparation": "", "reportTime": "", "requiresSlot": requires_slot,
    }
    if image:
        item["image"] = image
    review = {
        "unitCode": unit, "code": code, "sourceUrl": url, "testCounts": counts,
        "testCountConflict": inconsistent, "slotRuleBasis": slot_basis,
        "imageStorage": "local" if image.startswith("/") else "remote" if image else "absent",
        "sourceDisplayName": health.get("displayName"), "sourceSubtitle": cms.get("Subtitle"),
        "eligibilityInferred": False,
    }
    return item, review


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources", nargs="+", type=Path, default=[DATA / "source-details.json"])
    parser.add_argument("--directory", type=Path, default=DATA / "facilities-directory.json")
    parser.add_argument("--output", type=Path, default=DATA / "detail-items.json")
    parser.add_argument("--manifest", type=Path, default=ROOT / "docs/health-checkups/data-coverage.json")
    parser.add_argument("--catalogues", type=Path, default=DATA / "catalogues", help="Allowlisted listing snapshots, for coverage only")
    parser.add_argument("--selector-coverage", type=Path, default=DATA / "selector-coverage.json")
    parser.add_argument("--detail-coverage", type=Path, default=DATA / "detail-coverage.json")
    parser.add_argument("--public-dir", type=Path, default=ROOT / "public")
    parser.add_argument("--strict", action="store_true", help="Exit 1 after reporting any skipped or unresolved record")
    args = parser.parse_args()
    inputs = [*args.sources, args.directory]
    if args.output.resolve() in {p.resolve() for p in inputs} or args.manifest.resolve() in {p.resolve() for p in inputs}:
        parser.error("Outputs must not replace raw source files")
    if args.output.resolve() == args.manifest.resolve():
        parser.error("Item output and coverage manifest must use separate paths")
    try:
        directory = read_json(args.directory)
        facilities = directory["facilities"]
        if not isinstance(facilities, list):
            raise ValueError("Directory facilities must be an array")
        by_unit = {str(facility["unitCode"]): facility for facility in facilities}
        selected: dict[tuple[str, str], dict] = {}
        duplicates, skipped, snapshots = [], [], []
        input_count = 0
        for path in args.sources:
            records = read_json(path)
            if not isinstance(records, list):
                raise ValueError(f"Source {path} must be an array")
            snapshots.append({"file": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "records": len(records)})
            for index, source in enumerate(records):
                input_count += 1
                if not isinstance(source, dict):
                    skipped.append({"file": str(path), "index": index, "reason": "Source record must be an object"})
                    continue
                key = (str(source.get("unitCode", "")), str(source.get("code", "")))
                if key in selected:
                    previous = selected[key]
                    duplicates.append({"unitCode": key[0], "code": key[1], "policy": "Newest retrievedAt; later input wins a tie"})
                    if text(previous.get("retrievedAt")) > text(source.get("retrievedAt")):
                        continue
                selected[key] = source
        items, reviews = [], []
        for key, source in selected.items():
            try:
                item, review = compact_item(source, args.public_dir)
            except ValueError as exc:
                skipped.append({"unitCode": key[0], "code": key[1], "sourceUrl": source.get("sourceUrl"), "reason": str(exc)})
                continue
            review["facilityInPublicDirectory"] = item["unitCode"] in by_unit
            items.append(item)
            reviews.append(review)
        if len({item["id"] for item in items}) != len(items):
            raise ValueError("Case-normalised compact item IDs collide; reconcile source codes")
        observed_units = {item["unitCode"] for item in items}
        city_counts = Counter(by_unit[unit].get("city") for unit in observed_units if unit in by_unit)
        conflicts = sum(review["testCountConflict"] for review in reviews)
        unknown_slots = sum(review["slotRuleBasis"] == "unverified" for review in reviews)
        listing_snapshots, listing_keys, listing_facilities, listing_cities = [], set(), set(), set()
        listing_contexts = set()
        for path in sorted(args.catalogues.glob("*.json")):
            snapshot = read_json(path)
            if not isinstance(snapshot, dict) or not isinstance(snapshot.get("items"), list):
                raise ValueError(f"Invalid allowlisted catalogue snapshot: {path}")
            facility_key = str(snapshot.get("unitCode") or snapshot.get("facilityId") or
                               f"{snapshot.get('city', '')}|{snapshot.get('facility', '')}")
            listing_facilities.add(facility_key)
            listing_contexts.add((snapshot.get("city"), facility_key))
            if snapshot.get("city"):
                listing_cities.add(snapshot["city"])
            for record in snapshot["items"]:
                if isinstance(record, dict):
                    listing_keys.add((facility_key, record.get("kind", snapshot.get("kind")),
                                      record.get("code") or record.get("name")))
            listing_snapshots.append({"file": str(path), "city": snapshot.get("city"),
                                      "facility": snapshot.get("facility"), "facilityKey": facility_key,
                                      "kind": snapshot.get("kind"), "capturedAt": snapshot.get("capturedAt"),
                                      "renderedItems": len(snapshot["items"]), "coverage": snapshot.get("coverage", {})})
        selector_coverage = read_json(args.selector_coverage) if args.selector_coverage.exists() else {}
        selector_cities = selector_coverage.get("cities", [])
        detail_coverage = read_json(args.detail_coverage) if args.detail_coverage.exists() else {}
        manifest = {
            "schemaVersion": 1, "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "completeCatalogue": False, "authenticatedCatalogueEnumerationComplete": False,
            "scope": "Observed catalogue, selector and detail snapshots; public hospital directory is not package/test availability.",
            "directory": {"source": str(args.directory), "cities": len(directory.get("cities", [])),
                          "facilities": len(facilities), "facilitiesWithCity": sum(bool(f.get("city")) for f in facilities),
                          "facilitiesWithoutCity": sum(not f.get("city") for f in facilities),
                          "sourceUrl": directory.get("provenance", {}).get("directoryUrl")},
            "details": {"inputRecords": input_count, "uniqueSourceRecords": len(selected), "compactItems": len(items),
                        "packages": sum(i["kind"] == "package" for i in items), "tests": sum(i["kind"] == "test" for i in items),
                        "facilitiesRepresented": len(observed_units), "knownCitiesRepresented": sum(bool(c) for c in city_counts),
                        "skippedRecords": len(skipped), "testCountConflicts": conflicts, "unverifiedSlotRules": unknown_slots},
            "detailRequests": {"source": str(args.detail_coverage),
                               "observedUniqueUrls": detail_coverage.get("requestedUnique"),
                               "availableFullDetails": detail_coverage.get("availableDetails"),
                               "missingFullDetails": detail_coverage.get("missingDetails"),
                               "scope": detail_coverage.get("scope")},
            "listings": {"snapshots": len(listing_snapshots), "uniqueRenderedItems": len(listing_keys),
                         "packages": sum(key[1] == "package" for key in listing_keys),
                         "tests": sum(key[1] == "test" for key in listing_keys),
                         "facilitiesCaptured": len(listing_facilities), "citiesCaptured": len(listing_cities),
                         "cityFacilityContexts": len(listing_contexts),
                         "snapshotCoverage": listing_snapshots},
            "selectors": {"allCitySelectorsChecked": bool(selector_coverage.get("completeAllCities")),
                          "citiesChecked": sum(row.get("status") in {"both-tabs-captured", "no-facilities-in-selector"} for row in selector_cities),
                          "citiesWithNoFacilityOptions": [row["city"] for row in selector_cities if row.get("status") == "no-facilities-in-selector"],
                          "source": str(args.selector_coverage), "completeServerInventory": False},
            "sourceSnapshots": snapshots, "facilityAliases": ALIASES,
            "sourceReviews": reviews, "skipped": skipped, "duplicates": duplicates,
            "limits": ["Missing catalogue coverage is unknown, not an empty or unavailable catalogue.",
                       "No age or gender eligibility is inferred from names or subtitles.",
                       "No preparation, reporting estimate or included-test identity is fabricated.",
                       "Slot routing follows the observed PACKAGE versus test-only checkout branch; real availability is not imported.",
                       "Rendered listing snapshots are not proof of all inventory or all optional detail sections.",
                       "Clinical source wording and all optional sections remain untouched in source-details.json."]
        }
        write_json(args.output, items)
        write_json(args.manifest, manifest)
        print(f"Built {len(items)} compact items; {len(skipped)} skipped; {conflicts} count conflicts; {unknown_slots} unverified slot rules.")
        return 1 if args.strict and (skipped or conflicts or unknown_slots) else 0
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.error(str(exc))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
