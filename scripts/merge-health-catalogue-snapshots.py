#!/usr/bin/env python3
"""Merge allowlisted rendered catalogue captures, without assuming API completeness.

Accept a JSON manifest of capture jobs, or a single --snapshots glob plus context.
No network calls and no patient/member fields are emitted.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import glob
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/health-checkups"
spec = importlib.util.spec_from_file_location("catalogue_snapshot", ROOT / "scripts/import-health-catalogue-snapshot.py")
snapshot_parser = importlib.util.module_from_spec(spec)
spec.loader.exec_module(snapshot_parser)


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def merge_job(job: dict, output_dir: Path) -> dict:
    city, facility, kind = job["city"], job["facility"], job["kind"]
    if not city or not facility or kind not in {"package", "test"}:
        raise ValueError("Each job needs city, facility and package/test kind")
    unit = str(job.get("unitCode") or "")
    patterns = job["snapshots"] if isinstance(job["snapshots"], list) else [job["snapshots"]]
    paths = sorted({Path(path) for pattern in patterns for path in glob.glob(pattern)})
    if not paths:
        raise ValueError("No snapshots matched " + str(patterns))
    records, sources, queries, statuses, pagination = {}, [], set(), set(), set()
    last_result, skipped, observations = None, 0, 0
    for path in paths:
        html, fmt = snapshot_parser.read_snapshot(path)
        result = snapshot_parser.extract(html, city, facility, unit, kind)
        document = snapshot_parser.Document()
        document.feed(html)
        # Only the public catalogue search field is allowlisted. Never emit
        # header/profile inputs or any selected patient/member information.
        query = next((node.attrs.get("value", "") or "" for node in document.root.walk()
                      if node.tag == "input" and "search by name" in (node.attrs.get("placeholder", "") or "").lower()), "")
        queries.add(query)
        statuses.add(result["coverage"]["status"])
        skipped += result["coverage"]["unparsedCardCount"]
        pagination.update(result["coverage"]["paginationControls"])
        sources.append({"file": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                        "format": fmt, "renderedCardCount": len(result["items"]),
                        "status": result["coverage"]["status"]})
        for record in result["items"]:
            key = (record.get("code") or record["name"].casefold().strip(), kind)
            previous = records.get(key)
            if previous and previous["amount"] != record["amount"]:
                raise ValueError(f"Conflicting observed prices for {record['name']}; verify capture context before merging")
            records.setdefault(key, record)
            observations += 1
        last_result = result
    if len(queries) > 1:
        raise ValueError("Snapshots contain different search queries; keep searched result sets separate")
    if records and "observed-empty" in statuses:
        raise ValueError("Snapshots mix cards and empty states; verify facility/tab context")
    urls = list(dict.fromkeys(url for record in records.values() for url in record.get("observedDetailUrls", [])))
    # Reuse only an already-downloaded asset for the exact observed image URL.
    # A new city context for the same unit must not erase existing image maps.
    image_assets = {}
    for existing_path in output_dir.glob("*.json"):
        try:
            existing = json.loads(existing_path.read_text())
        except (OSError, ValueError):
            continue
        for entry in existing.get("items", []) if isinstance(existing, dict) else []:
            local = entry.get("localImage", "")
            if (entry.get("imageUrl") and isinstance(local, str)
                    and local.startswith("/health-checkups/source/")
                    and (ROOT / "public" / local.lstrip("/")).is_file()):
                image_assets[entry["imageUrl"]] = local
    for record in records.values():
        if record.get("imageUrl") in image_assets:
            record["localImage"] = image_assets[record["imageUrl"]]
    status = "captured" if records else "observed-empty" if statuses == {"observed-empty"} else "unverified-no-cards"
    last_result["items"] = list(records.values())
    last_result["observedDetailUrls"] = urls
    last_result["unitCode"] = unit or None
    last_result["snapshotFormat"] = "mhtml" if all(source["format"] == "mhtml" for source in sources) else "mixed"
    last_result["sourceSnapshots"] = sources
    last_result["searchQuery"] = next(iter(queries))
    last_result["coverage"].update({
        "status": status, "renderedCardCount": len(records), "unparsedCardCount": skipped,
        "observedDetailUrlCount": len(urls), "paginationControls": sorted(pagination),
        "mismatchedDetailUrlCount": sum(len(record.get("mismatchedDetailUrls", [])) for record in records.values()),
        "snapshotCount": len(sources), "cardObservations": observations,
        "duplicateCardObservations": observations - len(records),
        "completeRenderedTraversal": bool(job.get("completeRenderedTraversal", False)),
        "completeCatalogue": False,
        "scope": "Observed returned DOM for the selected facility, search and member/session context; not proof of complete server inventory",
    })
    filename = (unit or slug(city) + "-" + slug(facility)) + ("-packages.json" if kind == "package" else "-tests.json")
    destination = Path(job["output"]) if job.get("output") else output_dir / filename
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(last_result, ensure_ascii=False, indent=2) + "\n")
    print(f"{facility} / {kind}: {len(sources)} snapshots, {observations} card observations, {len(records)} unique; {status}")
    return last_result


def update_facility_ledger(catalogues: Path) -> None:
    entries = {}
    for path in sorted(catalogues.glob("*.json")):
        source = json.loads(path.read_text())
        raw = str(source.get("unitCode") or source.get("facilityId") or "")
        unit = raw if raw.isdigit() else None
        key = unit or "centre-" + slug(source["city"]) + "-" + slug(source["facility"])
        record = entries.setdefault(key, {"facilityKey": key, "unitCode": unit, "city": source["city"],
                                         "name": source["facility"], "observedInHealthCheckupsSelector": True,
                                         "evidence": "Verified selector context supplied with rendered Chrome catalogue captures",
                                         "serviceCities": [], "selectorContexts": {}, "catalogueTabs": {}})
        if source["city"] not in record["serviceCities"]:
            record["serviceCities"].append(source["city"])
        context = record["selectorContexts"].setdefault(source["city"], {"catalogueTabs": {}})
        coverage = source.get("coverage", {})
        tab = {
            "file": str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
            "status": coverage.get("status") or ("captured" if source.get("items") else "unverified-no-cards"),
            "renderedItems": len(source.get("items", [])), "emptyStateMessage": coverage.get("emptyStateMessage"),
            "completeRenderedTraversal": coverage.get("completeRenderedTraversal", False), "capturedAt": source.get("capturedAt")}
        record["catalogueTabs"][source["kind"]] = tab
        context["catalogueTabs"][source["kind"]] = tab
    target = catalogues.parent / "observed-facilities.json"
    target.write_text(json.dumps({"schemaVersion": 1, "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                                 "sourceUrl": "https://www.narayanahealth.org/health-checkups", "completeEnumeration": False,
                                 "scope": "Only selector contexts accompanying saved rendered catalogue captures; public directory membership does not imply availability",
                                 "facilities": list(entries.values())}, ensure_ascii=False, indent=2) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, help="JSON array of context + snapshots-glob jobs")
    parser.add_argument("--snapshots", nargs="+")
    parser.add_argument("--city")
    parser.add_argument("--facility")
    parser.add_argument("--unit-code", default="")
    parser.add_argument("--kind", choices=["package", "test"])
    parser.add_argument("--complete-rendered-traversal", action="store_true", help="Only when operator explicitly checked the full rendered list")
    parser.add_argument("--output-dir", type=Path, default=DATA / "catalogues")
    args = parser.parse_args()
    try:
        jobs = json.loads(args.manifest.read_text()) if args.manifest else [{"snapshots": args.snapshots,
            "city": args.city, "facility": args.facility, "unitCode": args.unit_code, "kind": args.kind,
            "completeRenderedTraversal": args.complete_rendered_traversal}]
        if not isinstance(jobs, list):
            raise ValueError("Manifest must be an array")
        results = [merge_job(job, args.output_dir) for job in jobs]
        update_facility_ledger(args.output_dir)
        return 1 if any(r["coverage"]["unparsedCardCount"] or r["coverage"]["status"] == "unverified-no-cards" for r in results) else 0
    except (ValueError, OSError, KeyError, TypeError) as exc:
        parser.error(str(exc))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
