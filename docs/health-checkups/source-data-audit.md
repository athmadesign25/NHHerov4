# Health-checkup source data audit

This audit separates the public facility directory from the health-checkup catalogue. A hospital appearing in the directory does **not** establish that it offers a particular package, test, price or appointment slot.

The machine-readable [coverage manifest](./data-coverage.json) is regenerated from the saved source files. It reports `completeCatalogue: false` and `authenticatedCatalogueEnumerationComplete: false`; inspecting every visible city/centre and discovering detail pages cannot establish uncapped server inventory or all member-specific availability. Completed **UI selector traversal** is recorded separately in `selectors.allCitySelectorsChecked` and `src/data/health-checkups/selector-coverage.json`.

## Checked source coverage

| Source | Verified coverage | Limit |
| --- | --- | --- |
| NH city catalogue | 18 named cities | Geographic directory, not package availability |
| Public hospitals and clinics directory | 40 explicit facility codes, across seven normal pages | 37 records have a city; three have blank source city/profile fields |
| Public hospital profiles | 37 inspected pages and directions links | Related facility metadata does not establish health-checkup availability |
| Health-checkup city/centre selectors | All 18 city choices checked; 40 city–centre contexts representing 36 distinct centres | Kolar and Davangere have no centre options in the observed session |
| Rendered health-checkup listing snapshots | 501 unique facility-specific items: 51 packages and 450 lab tests | Captured for the selected member/session; rendered cards do not establish uncapped server inventory or full detail content |
| Public detail-page content | 51 distinct package URLs checked; three complete imported records retained, 48 still missing full details | Source detail requests return HTTP 500; literal `/null` source slugs are preserved, not invented replacements |
| Full authenticated server inventory | Unverified | Do not describe the visible returned snapshot as every possible member-specific package/test |

Counts describe the checked 6 November 2026 snapshot. Use the generated manifest and `detail-coverage.json` for the current imported detail totals and request outcomes as further source records arrive.

Shared units are counted once in the item catalogue: the same Hosur clinic unit `2013` appears under Bangalore and Hosur, and three centres appear under both the Kolkata cluster and their own Barasat/Howrah contexts. Their city-specific captures remain separate; service-city membership is unioned without duplicating their items. Four observed centres have no verified unit code: Banashankari Clinic in Bangalore, NH Children's Hospital in Mumbai, and the Mysore/Vijayanagar clinics. They retain internal UI identities only.

The public directory was read from [Narayana Health hospitals and clinics](https://www.narayanahealth.org/hospitals-clinics), using the site's observed `fetchHospitalList` action and its own six-item pagination. The final page contained four records. Action provenance and every requested page are retained in `src/data/health-checkups/facilities-directory.json`. Three records have no source city: BNMH Dialysis Centre, Jamshedpur; Narayana Hrudayalaya Eye Care; and Rotary Narayana Nethralaya. Their city stays `null` instead of being inferred from a name.

## Rebuild the compact catalogue

Run from the repository root; Python 3.9 or newer is sufficient:

```sh
python3 scripts/build-health-catalogue.py
```

This reads `source-details.json` and `facilities-directory.json`, then writes the detail-only `detail-items.json` and `docs/health-checkups/data-coverage.json`. It also reads allowlisted `catalogues/*.json` for listing coverage, without treating listing cards as full details. It makes no network calls, changes no raw source payloads and does not modify preview fixtures. The default output is deliberately separate from `items.json`, so a two-detail import cannot replace the larger assembled listing catalogue. To inspect a build before integration:

```sh
python3 scripts/build-health-catalogue.py \
  --output /tmp/nh-compact-items.json \
  --manifest /tmp/nh-data-coverage.json
```

For an incremental batch, include both the existing source array and the new array. The converter rebuilds the union; it does not append to stale compact output:

```sh
python3 scripts/build-health-catalogue.py \
  --sources src/data/health-checkups/source-details.json /tmp/nh-new-details.json
```

The identity is `(unitCode, code)`. The most recently retrieved duplicate wins; a tied timestamp uses the later input. Duplicate decisions are recorded. Merge the raw arrays separately if those new records should be available to the master detail page. `--strict` exits with status 1 after writing the outputs when records were skipped, counts conflict, or slot rules remain unverified.

To rebuild the actual frontend catalogue from both allowlisted rendered listings and complete imported detail records, run:

```sh
python3 scripts/assemble-health-catalogue.py
```

The assembler imports this script's `compact_item` adapter and writes `items.json`, `active-facilities.json` and `assembly-review.json`. Use that command for application integration; the standalone builder is for detail conversion and coverage reporting.

## Merge rendered browser captures

Use `scripts/merge-health-catalogue-snapshots.py` to deduplicate multiple saved views of the same facility/tab. For example:

```sh
python3 scripts/merge-health-catalogue-snapshots.py \
  --snapshots '/private/tmp/nh-live-6530-tests*.mhtml' \
  --city Bangalore --facility 'Narayana Clinic, Chandapura' \
  --unit-code 6530 --kind test --complete-rendered-traversal
```

Only pass `--complete-rendered-traversal` when the operator explicitly checked the entire rendered list. It records that inspection; it does **not** mark the server catalogue complete. Base and scrolled MHTML captures for Chandapura and HSR Layout contained the same 30 test cards each. Their union is 30, not 90. The client renders its returned test array normally; accessibility-tree viewport limits are not evidence of virtualised or missing DOM cards. Whether the server returns a capped or member-filtered list remains unverified.

For a batch, `--manifest /tmp/captures.json` accepts an array of objects with `city`, `facility`, `unitCode` (or null), `kind`, `snapshots` (a glob or array of globs), and optional `completeRenderedTraversal`/`output`. The merger keeps source snapshot hashes, detects price/query conflicts, and refreshes `observed-facilities.json`. Unknown unit codes stay absent; an internal city/name key does not become an API code.

Zero cards count as an observed empty state only when the DOM explicitly says `No health packages found` or `No lab tests found`. Otherwise coverage is `unverified-no-cards`. Both remain scoped to the selected facility, search and member/session context. The parser emits no patient identity or session credentials. A detail href for another unit is retained in `mismatchedDetailUrls` for review, never used as this facility's routing identity.

## Mapping rules

| Compact field | Source and treatment |
| --- | --- |
| `id` | `source-{unitCode}-{lowercase code}`; preserve original code separately and reject ID collisions |
| `facilityId` | `6024 → prestige`, `3010 → electronic-city`; all other explicit unit codes are kept as strings |
| Name | CMS `PackageName`/`TestName`, falling back to operational `displayName`; never manufacture a display name |
| Price | Operational `healthData.amount`; preserve the observed amount, including zero. Missing, negative or invalid prices are excluded from compact items and listed in the manifest |
| Image | Observed CMS `package_image`, then CMS `PackageImage.url`; prefer its matching downloaded public asset if present |
| Count | Compare operational `noOfTests`, CMS `HealthTestsCount` and nonempty `profile_tests` length. Conflicting values produce `testCount: 0`, so the UI can omit the headline count; all original values remain in raw data and the manifest |
| Inclusions | Source `TestHighlights.Title` values in source order; these are display text, not proof of billable test identity |
| Slot | Explicit source `requiresSlot` takes precedence. Otherwise follow the observed NH client checkout branch: a cart containing a package goes to slot selection; a test-only cart goes to summary |
| Preparation/report time | Empty strings; source instructions remain in the full details, without fabricated summaries or turnaround estimates |
| Eligibility | No age/gender rules inferred from product names or marketing subtitles |
| Covered tests | Empty `includedTestIds` until source item-code relationships are verified; no name-based deduplication |

The slot rule comes from the observed live client flow and does not establish real appointment capacity. No available dates or times are inferred from the catalogue import.

## Source inconsistencies requiring review

- Enhanced Health `PKG037822`: operational count 28 versus CMS/profile count 26. Its operational name says `m >45`; its CMS subtitle says ages 35–45. Both source strings are preserved; neither becomes enforced eligibility.
- Comprehensive Health `PKG037823`: operational count 1 versus CMS/profile count 31.
- Both initial packages contain the instruction `Avoid high-fat meals, snacks, and fried foods 46 hours prior to the scan.` It is preserved as source-authored text, without silently correcting it. Clinical editorial review is needed before production use.
- CMS crossed-out totals and discount labels are not substitutes for the operational payable amount.

The full `detailsData` remains the authoritative content snapshot for the master detail page: About, Sample Required, Tests Included, parameters, instruction groups, highlights and optional additional source fields. The compact file is only for listing/selection performance. A successful data import does not establish live stock, slot availability, patient eligibility, payment processing or a complete catalogue.
