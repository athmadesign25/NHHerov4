# Health Checkups

This feature owns the health-package/test listing, details, selection, checkout and confirmation. Add new UI and behaviour here with co-located CSS Modules.

- Routes and metadata: `src/app/health-checkups/`
- Catalogue/source data: `src/data/health-checkups/`
- Images: `public/health-checkups/`
- Source audit: `docs/health-checkups/`
- Existing tests: `tests/health-*`
- Diagnostic/test page requirements and publication gaps: `docs/health-checkups/diagnostic-test-pages.md`

Reuse member/payment/date behaviour through `src/features/booking/shared/`. Reuse the search surface from `src/components/ui/search-location/` and drag behaviour from `src/components/ui/useMouseDragScroll.ts`. Do not import implementations from `src/app/` or numbered Booking design folders.

The route-level `HealthEntryGate` handles every entry, including package/test
links: sign in when logged out → choose a member → catalogue. Member selection
is required once per module visit and remains selected through detail navigation
and checkout. Checkout shows that member with an optional Change action.
Leaving the module or signing out resets the entry check. This is a prototype
UI gate, not server-side authentication or authorization.

Design 6 is the default listing preview, with landing-page-style cards in
`design6/` and the health-focus rail reused from Design 4. The shared listing
controller and search components live in `design3/`:
`HealthListing3` composes the shared search surface with `HealthLocationPicker`
(desktop popover / mobile sheet) and `HealthDiscoveryCard` (package and test
cards). City selection stays local until a centre is chosen; the shared controller
still handles centre-change confirmation, selection and checkout.
Search groups matches across both service types. Switching the type preserves
the selection. Detail links retain the selected preview.

`HealthCatalogueSearch` provides grouped suggestions and keyboard navigation.
The shared `RotatingSearchHint` highlights the current search term in NH blue;
it is also used by doctor search. Typing searches both service types at the
chosen centre; the browse shortcuts clear the query and show one service type.

`content/` contains the researched stakeholder-copy adapter and source references.
It fills missing detail-page descriptions/preparation without changing source
prices or package membership. Source fields take priority; draft-field provenance
is retained. These pages stay unindexed until item-specific clinical and pricing
approval. See the diagnostic-page document above before preparing a release.

Designs 1 and 2 remain available from the bottom-left preview switcher or
`?design=1` / `?design=2`; `?design=3` opens the new listing. All previews use the
same catalogue and booking state, not separate booking implementations.

Designs 2 and 3 use `JourneyHeading` for the same heading wipe as doctor discovery,
`ControlChip` styles for service filters, and shared `BookingActionBar` and
`SuccessMark` for checkout and confirmation. Design 1 remains the earlier listing
preview. Discovery headings name a city only after a centre is selected.

Keep filters and detail sections driven by published catalogue fields. The current
source categories distinguish packages and tests; do not invent clinical filters
or missing inclusions. Packages require date/time selection; lab-only selections
continue without a slot. A mixed selection follows the package scheduling rule.

See [module ownership and merge handoff](../../../docs/booking-health-module-handoff.md) before changing shared navigation, global styles or shared controls.

Design 3 uses image-led package and test cards; catalogue comparison is intentionally removed from every preview. Selection feedback is a transient accessible success notice. The listing action bar uses the shared booking bar’s 896px maximum width and responsive gutters.
