# Health Checkups

This feature owns the health-package/test listing, details, selection, checkout and confirmation. Add new UI and behaviour here with co-located CSS Modules.

- Routes and metadata: `src/app/health-checkups/`
- Catalogue/source data: `src/data/health-checkups/`
- Images: `public/health-checkups/`
- Source audit: `docs/health-checkups/`
- Existing tests: `tests/health-*`

Reuse member/payment/date behaviour through `src/features/booking/shared/`. Reuse the search surface from `src/components/ui/search-location/` and drag behaviour from `src/components/ui/useMouseDragScroll.ts`. Do not import implementations from `src/app/` or numbered Booking design folders.

See [module ownership and merge handoff](../../../docs/booking-health-module-handoff.md) before changing shared navigation, global styles or shared controls.
