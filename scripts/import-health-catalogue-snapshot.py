#!/usr/bin/env python3
"""Extract only public catalogue fields from a rendered HTML or MHTML snapshot.

No network requests; no member, patient, header, script, or cookie data is emitted.
"""
from __future__ import annotations

import argparse
import hashlib
from datetime import datetime, timezone
from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from typing import Iterator
from urllib.parse import parse_qs, urljoin, urlsplit


class Node:
    def __init__(self, tag: str, attrs: dict[str, str], parent: Node | None = None):
        self.tag, self.attrs, self.parent = tag, attrs, parent
        self.children: list[Node | str] = []

    def walk(self) -> Iterator[Node]:
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self) -> str:
        if self.tag in {"script", "style", "noscript"}:
            return ""
        return " ".join(" ".join(child.text() if isinstance(child, Node) else child
                                  for child in self.children).split())


class Document(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("document", {})
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs), self.current)
        self.current.children.append(node)
        if tag not in self.VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        self.current.children.append(Node(tag, dict(attrs), self.current))

    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, data):
        self.current.children.append(data)


def read_snapshot(path: Path) -> tuple[str, str]:
    raw = path.read_bytes()
    if path.suffix.lower() in {".mhtml", ".mht"} or b"multipart/related" in raw[:2048]:
        message = BytesParser(policy=policy.default).parsebytes(raw)
        for part in message.walk():
            if part.get_content_type() != "text/html":
                continue
            location = part.get("Content-Location", "")
            parsed = urlsplit(location)
            if parsed.hostname not in {"www.narayanahealth.org", "narayanahealth.org"}:
                continue
            if parsed.path.rstrip("/") != "/health-checkups":
                continue
            # Chromium omits charset here although its HTML is UTF-8.
            return part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8"), "mhtml"
        raise ValueError("No NH health-checkups root HTML part found in MHTML")
    return raw.decode("utf-8"), "html"


def public_detail_url(href: str, unit_code: str | None) -> str | None:
    url = urljoin("https://www.narayanahealth.org", href)
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname not in {"www.narayanahealth.org", "narayanahealth.org"}:
        return None
    if not re.fullmatch(r"/health-checkups/[A-Za-z0-9][A-Za-z0-9_-]*/?", parsed.path):
        return None
    query = parse_qs(parsed.query)
    if (len(query.get("unitCode", [])) != 1 or not query["unitCode"][0]
            or len(query.get("code", [])) != 1 or not query["code"][0]
            or (unit_code is not None and query["unitCode"] != [unit_code])):
        return None
    return url


def extract(html: str, city: str, facility: str, unit_code: str, kind: str) -> dict:
    document = Document()
    document.feed(html)
    mains = [node for node in document.root.walk() if node.tag == "main"]
    if not mains:
        raise ValueError("Snapshot does not contain a main catalogue region")
    cards: list[dict] = []
    seen: set[int] = set()
    skipped = 0
    for main in mains:
        for heading in (node for node in main.walk() if node.tag == "h2"):
            node = heading.parent
            card = None
            while node and node is not main:
                descendants = list(node.walk())
                headings = [child for child in descendants if child.tag == "h2"]
                if len(headings) > 1:
                    break
                buttons = [child.text() for child in descendants if child.tag == "button"]
                if any(re.fullmatch(r"Add(?: Package)?|Added(?: Package)?|Remove", label, re.I) for label in buttons) and "₹" in node.text():
                    card = node
                    # Package artwork is a sibling of its name/price block.
                    # Expand only within the same single-heading card.
                    if node.parent and node.parent is not main:
                        outer = list(node.parent.walk())
                        if sum(child.tag == "h2" for child in outer) == 1 and any(child.tag == "img" for child in outer):
                            card = node.parent
                    break
                node = node.parent
            if card is None:
                continue
            if id(card) in seen:
                continue
            seen.add(id(card))
            descendants = list(card.walk())
            # Leaf amounts distinguish current price from the struck-through list price.
            prices = []
            for child in descendants:
                text = child.text()
                if re.fullmatch(r"₹\s*[\d,]+(?:\.\d{1,2})?", text) and not any(
                        isinstance(grandchild, Node) and "₹" in grandchild.text() for grandchild in child.children):
                    price = float(re.sub(r"[^\d.]", "", text))
                    classes = child.attrs.get("class", "") or ""
                    prices.append((price, "line-through" in classes or child.tag in {"s", "del"}))
            current = [price for price, struck in prices if not struck]
            if not heading.text() or len(current) != 1:
                skipped += 1
                continue
            links = list(dict.fromkeys(url for child in descendants if child.tag == "a"
                                       for url in [public_detail_url(child.attrs.get("href", "") or "", unit_code)] if url))
            mismatched_links = list(dict.fromkeys(url for child in descendants if child.tag == "a"
                                       for url in [public_detail_url(child.attrs.get("href", "") or "", None)]
                                       if url and url not in links))
            images = [child for child in descendants if child.tag == "img"]
            subtitle = next((child.text() for child in descendants if child.tag == "p"
                             and child.text() and "₹" not in child.text()
                             and not re.search(r"\d+\s+tests?", child.text(), re.I)), None)
            count_match = re.search(r"\b(\d+)\s+tests?\b", card.text(), re.I)
            name = heading.text()
            identity = f"{unit_code}:{kind}:{name}"
            record = {"name": name, "kind": kind, "city": city,
                      "facility": facility, "facilityId": unit_code, "amount": current[0],
                      "localId": "snapshot-" + hashlib.sha256(identity.encode()).hexdigest()[:16],
                      "detailStatus": "public-link-observed" if links else "no-public-detail-link"}
            if subtitle:
                record["subtitle"] = subtitle
            if count_match:
                record["testCount"] = int(count_match.group(1))
            list_price = next((price for price, struck in prices if struck), None)
            if list_price is not None:
                record["listPrice"] = list_price
            if images:
                alt = images[0].attrs.get("alt", "")
                src = images[0].attrs.get("src", "")
                if alt:
                    record["sourceDisplayName"] = alt
                parsed_image = urlsplit(urljoin("https://www.narayanahealth.org", src or ""))
                trusted_image = parsed_image.hostname in {"res.cloudinary.com", "stgaccinwbsprdlrs02.blob.core.windows.net"}
                trusted_image = trusted_image or (parsed_image.hostname in {"www.narayanahealth.org", "narayanahealth.org"}
                                                  and parsed_image.path.startswith("/images/"))
                if src and parsed_image.scheme == "https" and trusted_image:
                    record["imageUrl"] = parsed_image.geturl()
                    record["imageStatus"] = "source-placeholder" if "placeholder" in parsed_image.path.lower() else "source-image"
            if links:
                record["sourceUrl"] = links[0]
                record["observedDetailUrls"] = links
                record["code"] = parse_qs(urlsplit(links[0]).query)["code"][0]
            if mismatched_links:
                # Preserve the observed source defect, but do not use another
                # facility's URL/code for this card's routing or price identity.
                record["mismatchedDetailUrls"] = mismatched_links
                record["detailStatus"] = "facility-mismatch-review"
            # Missing IDs and detail links remain absent. Never manufacture them from names.
            cards.append(record)
    pagination = sorted({node.text() for main in mains for node in main.walk()
                         if node.tag in {"button", "a"} and re.fullmatch(
                             r"(?:Load|Show|View) more(?: \w+)?|Next(?: page)?|Previous(?: page)?", node.text(), re.I)})
    expected_empty = "No health packages found" if kind == "package" else "No lab tests found"
    observed_empty = any(node.text() == expected_empty for main in mains for node in main.walk())
    if observed_empty and cards:
        raise ValueError("Snapshot contains both cards and the empty-state message; recapture after loading settles")
    status = "observed-empty" if observed_empty else "captured" if cards else "unverified-no-cards"
    urls = list(dict.fromkeys(url for card in cards for url in card.get("observedDetailUrls", [])))
    return {"capturedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "sourceUrl": "https://www.narayanahealth.org/health-checkups",
            "city": city, "facility": facility, "facilityId": unit_code, "kind": kind,
            "coverage": {"renderedCardCount": len(cards), "unparsedCardCount": skipped,
                         "observedDetailUrlCount": len(urls), "paginationControls": pagination,
                         "mismatchedDetailUrlCount": sum(len(card.get("mismatchedDetailUrls", [])) for card in cards),
                         "status": status, "emptyStateMessage": expected_empty if observed_empty else None,
                         "completeCatalogue": False,
                         "scope": "Rendered catalogue cards present in the supplied snapshot; not proof of complete facility inventory"},
            "items": cards, "observedDetailUrls": urls}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", required=True, type=Path, help="Rendered HTML or Chrome MHTML snapshot")
    parser.add_argument("--city", required=True)
    parser.add_argument("--facility", required=True)
    parser.add_argument("--unit-code", required=True)
    parser.add_argument("--kind", required=True, choices=["package", "test"])
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    if args.html.resolve() == args.output.resolve():
        parser.error("Output must differ from the source snapshot")
    try:
        html, snapshot_format = read_snapshot(args.html)
        result = extract(html, args.city, args.facility, args.unit_code, args.kind)
        result["snapshotFormat"] = snapshot_format
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    count = result["coverage"]["renderedCardCount"]
    print(f"Extracted {count} {args.kind} cards; {len(result['observedDetailUrls'])} observed detail URLs.")
    observed_empty = result["coverage"]["status"] == "observed-empty"
    if observed_empty:
        print("Verified rendered empty state: " + result["coverage"]["emptyStateMessage"])
    elif not count:
        print("No rendered cards found. HTML-only browser saves may contain unhydrated server HTML.", file=__import__("sys").stderr)
    return 0 if (count or observed_empty) and not result["coverage"]["unparsedCardCount"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
