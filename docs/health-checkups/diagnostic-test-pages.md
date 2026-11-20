# Diagnostic / test pages — marketing P0

Marketing requirement received 13 November 2026: an individual page for each
diagnostic test, with what it is, preparation, where to book, and permitted price
or package information, across web and mobile.

## Implementation

- Route: `/health-checkups/[slug]`. The existing facility/item identifiers resolve
  the correct centre and price; ambiguous matches return 404 rather than selecting
  a different centre. The latest catalogue links test titles directly to these URLs.
- One master detail template serves tests and packages. Source descriptions appear
  under **What is this test?** (packages retain **About this package**).
- Source preparation content appears under **How to prepare**. All imported
  instruction groups, nested test parameters, sample information, report timings
  and additional source sections remain supported.
- **Where to book** shows the selected centre, address/city, directions and that
  centre's test/package price. The Add action retains the same item and centre.
- **Packages that include this test** appears only for explicit `includedTestIds`
  relationships at the same centre. No membership is inferred from similar names.
- Responsive sections use the shared NH typography and colour tokens. The booking
  action bar retains the shared 896px maximum width.
- The route provides item/city-specific titles and item/centre-specific descriptions.
  Visible content is included in the initial server-rendered page, not fetched only
  after a click or hover.

## Researched stakeholder content

The detail route uses `content/withHealthDemoContent.ts` to fill missing explanatory
and preparation copy for the stakeholder preview. The 501 catalogue records
(450 tests/services and 51 packages) receive non-empty About and preparation
sections. All 293 distinct test/service names match one of 43 researched content
families in `content/researchedProfiles.ts`.

References include MedlinePlus, NHS, CDC and ICMR. Each generated field is marked
in `details.editorial.draftFields`, with its content family, source URLs and
research date. An unobtrusive **Information sources** disclosure is available on
the page. This is research-based demonstration copy, not NH-approved clinical
instructions. Family-level explanations still require review for each test.

Existing source descriptions, preparation instructions and structured instruction
groups take precedence. The adapter does not generate prices, discounts, report
times, package inclusions, eligibility or package/test relationships. Imaging and
non-test services use appropriate page labels. Preparation copy avoids invented
fasting durations and directs users to confirm test-specific requirements.

Before production indexing, supply reviewed descriptions and preparation content,
verified catalogue availability (including MRI/ECG if offered), approved current
centre prices and explicit package/test associations. The marketing note makes
price publication conditional on approval. No cross-centre price ranges or new
clinical claims have been generated.

The design preview remains `noindex, nofollow`. Replace the demonstration adapter
with approved item-specific API content before release. This is not a claim that
every diagnostic page has production-ready clinical content.
See [the source audit](./source-data-audit.md) for inventory and content gaps.
