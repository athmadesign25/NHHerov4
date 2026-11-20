#!/usr/bin/env python3
"""Import public NH detail pages from observed URLs; never enumerate item codes.

Uses only Python's standard library. Raw source sections are retained unchanged.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import socket
import sys
import time
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


PAGE_HOSTS = {"www.narayanahealth.org", "narayanahealth.org"}
IMAGE_HOSTS = {"res.cloudinary.com", "stgaccinwbsprdlrs02.blob.core.windows.net"} | PAGE_HOSTS
TRANSIENT_STATUS = {408, 425, 429, 500, 502, 503, 504}
MAX_PAGE_BYTES = 12 * 1024 * 1024
MAX_IMAGE_BYTES = 8 * 1024 * 1024
USER_AGENT = "NHHealthCheckupSourceImport/1.0 (public page content only)"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def validate_url(url: str, image: bool = False) -> tuple[str, str]:
    parsed = urlsplit(url)
    hosts = IMAGE_HOSTS if image else PAGE_HOSTS
    if (parsed.scheme != "https" or parsed.hostname not in hosts
            or parsed.username or parsed.password or parsed.port not in (None, 443)):
        raise ValueError("URL must use HTTPS and an allowed public source host")
    if image:
        if parsed.hostname in PAGE_HOSTS and not parsed.path.startswith("/images/"):
            raise ValueError("NH image URLs must be observed public /images/ assets")
        return "", ""
    if not re.fullmatch(r"/health-checkups/[A-Za-z0-9][A-Za-z0-9_-]*/?", parsed.path):
        raise ValueError("URL must identify an individual /health-checkups/<slug> page")
    query = parse_qs(parsed.query, keep_blank_values=True)
    values = []
    for key in ("unitCode", "code"):
        if len(query.get(key, [])) != 1 or not query[key][0].strip():
            raise ValueError("URL requires one nonempty " + key)
        values.append(query[key][0])
    return values[0], values[1]


class AllowedRedirects(HTTPRedirectHandler):
    def __init__(self, validator: Callable[[str], object]):
        super().__init__()
        self.validator = validator

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.validator(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url: str, image: bool = False, timeout: float = 30, retries: int = 2) -> tuple[bytes, str]:
    def validator(target: str) -> object:
        identity = validate_url(target, image)
        if not image and identity != validate_url(url):
            raise ValueError("Redirect changed the requested facility/item identity")
        return identity

    validator(url)
    opener = build_opener(AllowedRedirects(validator))
    maximum = MAX_IMAGE_BYTES if image else MAX_PAGE_BYTES
    for attempt in range(retries + 1):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT,
                                           "Accept": "image/*" if image else "text/html"})
            with opener.open(request, timeout=timeout) as response:
                validator(response.geturl())
                mime = response.headers.get_content_type()
                if (image and not mime.startswith("image/")) or (
                        not image and mime not in {"text/html", "application/xhtml+xml"}):
                    raise ValueError("Unexpected content type: " + mime)
                body = response.read(maximum + 1)
                if len(body) > maximum:
                    raise ValueError("Response exceeds import size limit")
                return body, mime
        except HTTPError as exc:
            if exc.code not in TRANSIENT_STATUS or attempt == retries:
                raise
            retry_after = exc.headers.get("Retry-After", "")
            delay = min(float(retry_after), 10) if retry_after.isdigit() else 2 ** attempt
        except (URLError, TimeoutError, socket.timeout):
            if attempt == retries:
                raise
            delay = 2 ** attempt
        time.sleep(delay)
    raise RuntimeError("Download did not complete")


def extract_details(html: str) -> dict[str, Any]:
    """Decode JSON arguments, then RSC records. No JavaScript is executed."""
    decoder = json.JSONDecoder()
    chunks: list[str] = []
    for match in re.finditer(r"self\.__next_f\.push\(\s*", html):
        try:
            argument, _ = decoder.raw_decode(html, match.end())
        except json.JSONDecodeError:
            continue
        if (isinstance(argument, list) and len(argument) > 1
                and argument[0] == 1 and isinstance(argument[1], str)):
            chunks.append(argument[1])
    if not chunks:
        raise ValueError("No JSON-encoded public RSC payload found")

    def find(node: Any) -> dict[str, Any] | None:
        if isinstance(node, dict):
            candidate = node.get("detailsData")
            if isinstance(candidate, dict) and isinstance(candidate.get("healthData"), dict):
                return candidate
            for value in node.values():
                found = find(value)
                if found is not None:
                    return found
        elif isinstance(node, list):
            for value in node:
                found = find(value)
                if found is not None:
                    return found
        return None

    for line in "".join(chunks).splitlines():
        _, separator, raw = line.partition(":")
        if not separator:
            continue
        try:
            record = json.loads(raw)
        except json.JSONDecodeError:
            # RSC imports, text, and references are not JSON detail records.
            continue
        details = find(record)
        if details and details["healthData"]:
            return details
    raise ValueError("Public page contains no nonempty detailsData.healthData record")


def source_image_urls(node: Any) -> list[str]:
    found: list[str] = []
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "package_image" and isinstance(value, str) and value:
                found.append(value)
            else:
                found.extend(source_image_urls(value))
    elif isinstance(node, list):
        for value in node:
            found.extend(source_image_urls(value))
    return list(dict.fromkeys(found))


def import_seed(seed: Any, images_dir: Path | None, timeout: float = 30, retries: int = 2) -> tuple[dict | None, dict]:
    ledger: dict[str, Any] = {"sourceUrl": seed.get("sourceUrl") if isinstance(seed, dict) else None,
                              "status": "error"}
    try:
        if not isinstance(seed, dict) or not isinstance(seed.get("sourceUrl"), str):
            raise ValueError("Each seed must contain a sourceUrl string")
        source_url = seed["sourceUrl"]
        unit_code, code = validate_url(source_url)
        facility_id = str(seed.get("facilityId", unit_code))
        if facility_id != unit_code:
            raise ValueError("facilityId must match the source URL unitCode")
        kind = seed.get("kind")
        if kind not in {"package", "test"}:
            raise ValueError("kind must be package or test")
        ledger.update({"facilityId": facility_id, "unitCode": unit_code, "code": code, "kind": kind})
        html, _ = fetch(source_url, timeout=timeout, retries=retries)
        details = extract_details(html.decode("utf-8"))
        health = details["healthData"]
        returned_code = health.get("packageCode") or health.get("testCode") or health.get("code")
        if returned_code is not None and str(returned_code) != code:
            raise ValueError("Returned item code does not match requested source")
        retrieved_at = utc_now()
        result = {"sourceUrl": source_url, "retrievedAt": retrieved_at,
                  "facilityId": facility_id, "unitCode": unit_code, "code": code,
                  "kind": kind, "detailsData": details}
        ledger.update({"status": "success", "retrievedAt": retrieved_at,
                       "displayName": health.get("displayName"),
                       "sourceSections": [tab.get("label", tab.get("id"))
                                          for tab in details.get("tabs", []) if isinstance(tab, dict)],
                       "sourceKeys": sorted(details.keys()),
                       "htmlSha256": hashlib.sha256(html).hexdigest()})
        if images_dir:
            images: list[dict[str, str]] = []
            for image_url in source_image_urls(details):
                try:
                    image, mime = fetch(image_url, image=True, timeout=timeout, retries=retries)
                    extension = {"image/webp": ".webp", "image/png": ".png", "image/jpeg": ".jpg",
                                 "image/avif": ".avif", "image/gif": ".gif"}.get(mime)
                    if not extension:
                        raise ValueError("Unsupported raster image type: " + mime)
                    filename = hashlib.sha256(image_url.encode()).hexdigest()[:24] + extension
                    images_dir.mkdir(parents=True, exist_ok=True)
                    destination = images_dir / filename
                    destination.write_bytes(image)
                    images.append({"sourceUrl": image_url, "path": str(destination)})
                except (ValueError, OSError) as exc:
                    ledger.setdefault("imageWarnings", []).append({"sourceUrl": image_url, "error": str(exc)})
            result["downloadedImages"] = images
        return result, ledger
    except (ValueError, OSError, RecursionError) as exc:
        ledger["error"] = str(exc)
        if isinstance(exc, HTTPError):
            ledger["httpStatus"] = exc.code
        ledger["checkedAt"] = utc_now()
        return None, ledger


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seeds", required=True, type=Path, help="JSON array of observed public detail URLs")
    parser.add_argument("--output", required=True, type=Path, help="JSON array of successful raw imports")
    parser.add_argument("--coverage", required=True, type=Path, help="Per-seed success/error ledger")
    parser.add_argument("--workers", type=int, default=2, choices=range(1, 4))
    parser.add_argument("--timeout", type=int, default=30, choices=range(1, 61), metavar="SECONDS")
    parser.add_argument("--retries", type=int, default=2, choices=range(3), help="Additional attempts for transient failures")
    parser.add_argument("--images-dir", type=Path, help="Optional destination for observed package_image assets")
    args = parser.parse_args()
    if len({args.seeds.resolve(), args.output.resolve(), args.coverage.resolve()}) != 3:
        parser.error("Seeds, output, and coverage must use different paths")
    try:
        seeds = json.loads(args.seeds.read_text(encoding="utf-8"))
        if not isinstance(seeds, list):
            raise ValueError("Seed document must be a JSON array")
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        results = list(executor.map(lambda seed: import_seed(seed, args.images_dir, args.timeout, args.retries), seeds))
    imports = [item for item, _ in results if item is not None]
    ledger = {"generatedAt": utc_now(), "scope": "Only the supplied observed public detail URLs",
              "completeCatalogue": False, "requested": len(seeds), "imported": len(imports),
              "failed": len(seeds) - len(imports), "entries": [entry for _, entry in results]}
    write_json(args.output, imports)
    write_json(args.coverage, ledger)
    print("Imported {}/{} supplied pages; {} failed. Coverage: {}".format(
        len(imports), len(seeds), ledger["failed"], args.coverage))
    return 0 if ledger["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
