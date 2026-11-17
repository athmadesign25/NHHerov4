# Shared search and location surface

Doctor discovery and Health Checkups use the same `SearchLocationUnit` and CSS
modules here. Keep this folder free of route and feature imports.

- `SearchLocationUnit.tsx` owns the search input, clear action and submit action.
- `SearchToolbar.module.css` owns the shared control classes and the existing
  responsive toolbar rules. Import the same module for the caller-provided
  location control so its descendant selectors remain scoped consistently.
- `SearchTheme.module.css` supplies the existing scoped control palette.
- `ControlChip.module.css` owns the doctor-listing control capsule, touch target,
  focus and reduced-motion states. Doctor controls retain a compatibility export;
  Health Checkups imports this shared module directly and supplies blue selection tokens.

The location picker, query state, search results and navigation stay with each
feature. Pass them through props; do not put booking or catalogue logic here.
The retained `--d3-*` variables and `[data-design]` selectors are compatibility
hooks for the current doctor listing, not separate selectable designs.

A shared style change affects both modules. Check doctor discovery and both
Health Checkups previews at mobile and desktop widths before sharing it.
Module ownership and handoff checks are documented in
[`booking-health-module-handoff.md`](../../../../docs/booking-health-module-handoff.md).
