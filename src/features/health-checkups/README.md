# Health Checkups

This feature owns the health-package/test listing, details, selection, checkout and confirmation. Add new UI and behaviour here with co-located CSS Modules.

- Routes and metadata: `src/app/health-checkups/`
- Catalogue/source data: `src/data/health-checkups/`
- Images: `public/health-checkups/`
- Source audit: `docs/health-checkups/`
- Existing tests: `tests/health-*`

Reuse member/payment/date behaviour through `src/features/booking/shared/`. Reuse the search surface from `src/components/ui/search-location/` and drag behaviour from `src/components/ui/useMouseDragScroll.ts`. Do not import implementations from `src/app/` or numbered Booking design folders.

Design 2 uses `JourneyHeading` for the same heading wipe as doctor discovery,
`ControlChip` styles for service filters, and shared `BookingActionBar` and
`SuccessMark` for checkout and confirmation. Design 1 remains the earlier listing
preview. Discovery headings name a city only after a centre is selected.

Keep filters and detail sections driven by published catalogue fields. The current
source categories distinguish packages and tests; do not invent clinical filters
or missing inclusions. Packages require date/time selection; lab-only selections
continue without a slot. A mixed selection follows the package scheduling rule.

See [module ownership and merge handoff](../../../docs/booking-health-module-handoff.md) before changing shared navigation, global styles or shared controls.
