#!/usr/bin/env python3
"""Extract card content from captured NH data; never invent prices or test lists."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/health-checkups"
items = json.loads((DATA / "items.json").read_text())
snapshots = [json.loads(path.read_text()) for path in sorted((DATA / "catalogues").glob("*.json"))]
sources = json.loads((DATA / "source-details.json").read_text())
result = {}
for item in items:
    entry = {}
    for snapshot in snapshots:
        if str(snapshot.get("unitCode") or snapshot.get("facilityId")) != item.get("unitCode"):
            continue
        for record in snapshot.get("items", []):
            same = record.get("code") == item.get("code") if item.get("code") else record.get("name") == item["name"]
            if not same or record.get("amount") != item["price"]:
                continue
            if record.get("listPrice", 0) > item["price"]:
                entry["originalPrice"] = record["listPrice"]
            if record.get("sourceDisplayName"):
                entry["catalogueName"] = record["sourceDisplayName"]
    for source in sources:
        if (source.get("unitCode"), source.get("code")) != (item.get("unitCode"), item.get("code")):
            continue
        cms = source["detailsData"]["healthData"]["cmsInfo"]["data"][0]
        # Profile entries are actual tests; highlight sections overlap and must not be summed.
        groups = []
        for group in cms.get("profile_tests", []):
            name = group.get("Title") or group.get("Name")
            if not name:
                continue
            parameters = [test.get("Title") or test.get("Name") for test in group.get("TestList", [])]
            groups.append({"name": name, "parameters": [p for p in parameters if p], "itemLabel": "parameters"})
        if groups:
            entry["testGroups"] = groups
    if entry:
        result[item["id"]] = entry
(DATA / "card-content.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(f"Extracted card content for {len(result)} items")
