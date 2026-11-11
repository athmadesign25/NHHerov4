# Importing public health-checkup details

The importer reads only observed public Narayana Health detail-page URLs supplied in a seed file. It does not enumerate package codes, call private APIs, log in, or access patient data. It preserves the complete `detailsData` object from each page, including optional and unfamiliar source sections.

Create a JSON array with the actual URLs discovered through the live website:

```json
[
  {
    "sourceUrl": "https://www.narayanahealth.org/health-checkups/male-enhanced-health-m-45?unitCode=6024&code=PKG037822",
    "facilityId": "6024",
    "kind": "package"
  }
]
```

Run from the repository root with Python 3.9 or newer; no packages are required:

```sh
python3 scripts/import-health-checkup-details.py \
  --seeds /tmp/nh-health-seeds.json \
  --output /tmp/nh-health-imported-details.json \
  --coverage /tmp/nh-health-import-coverage.json \
  --workers 2
```

For a degraded source, use `--timeout 15 --retries 1` to allow at most one retry per page. Concurrency is capped at three workers. The coverage ledger includes HTTP status codes for failed HTTP requests.

Optionally add `--images-dir public/health-checkups/source` to download observed `package_image` assets from the approved NH blob storage or Cloudinary hosts. Image failures are recorded separately without dropping successful text imports. Raw content remains unchanged; downloaded paths are separate metadata.

The output array records source URL, retrieval time, facility/unit code, item code, kind, and raw details. The coverage ledger records every supplied seed, section labels, a source HTML checksum, and failures. Exit code `1` means at least one seed failed. Both outputs are written before exiting. Each run replaces its output files; review and merge successful records into application data separately.

Coverage applies only to the supplied URLs, **not the entire live catalogue**. Do not infer unavailable item details or clinical instructions. Source inconsistencies (for example, title ages differing from subtitles or counts differing from the inclusion list) must remain visible in the raw source for editorial review.

## Extracting rendered catalogue listings

For catalogue pages that populate after login, use a browser-rendered snapshot obtained with the user's permission. Chrome **Webpage, Single File** (`.mhtml`) retains the rendered catalogue; **HTML Only** may refetch an empty server-rendered page. The snapshot can contain account UI, so keep it outside the repository and do not publish it.

```sh
python3 scripts/import-health-catalogue-snapshot.py \
  --html /tmp/nh-live-prestige-tests.mhtml \
  --city Bangalore \
  --facility 'Narayana Aarogyam, Prestige Tech Park' \
  --unit-code 6024 \
  --kind test \
  --output /tmp/nh-prestige-tests-catalogue.json
```

This script reads only the root NH listing HTML, finds rendered catalogue cards, and emits an explicit allowlist: names, prices, counts, public thumbnail/detail URLs, and the supplied facility context. It does not emit patient, account, header, cookie, or script data. The facility and unit code must be verified from the actual listing or observed package URL.

Tests without a public detail link retain `detailStatus: no-public-detail-link`; their sample requirements, preparation instructions, and API codes are not invented. `localId` is a deterministic local snapshot identifier, explicitly separate from the real `code` captured from public URLs. Coverage reports rendered cards only; absence of pagination does not prove an entire facility inventory was loaded.
