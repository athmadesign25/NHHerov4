# Booking and Health Checkups: module ownership

Use `aditya4_work` for the current Booking and Health Checkup work. Keep each change in its module; this reduces shared-file edits and merge conflicts. It cannot guarantee a conflict-free merge when two branches edit the same file.

## Where changes belong

| Area | Owned files |
| --- | --- |
| Health Checkups UI, catalogue behaviour, checkout and confirmation | `src/features/health-checkups/` |
| Health catalogue and source records | `src/data/health-checkups/` |
| Health images | `public/health-checkups/` |
| Health route metadata and page composition | `src/app/health-checkups/` |
| Health import scripts, provenance and tests | `scripts/*health*.py`, `docs/health-checkups/`, `tests/health-*` |
| Doctor listing filters, smart chips and applied filters | `src/app/search/designs/d21/` |
| Doctor cards, slot selection, hospital selection and sharing | `src/app/search/designs/d20/` |
| Doctor profile and its booking bar | `src/app/doctors/[slug]/` |
| Booking summary, discounts, payment and flow state | `src/features/booking/design20/` |
| Directory/search models and presentation helpers | Relevant doctor files in `src/features/search/` |
| Booking interfaces reused by Health Checkups | `src/features/booking/shared/` |
| Shared search/location surface and styles | `src/components/ui/search-location/` |
| Shared horizontal mouse-drag behaviour | `src/components/ui/useMouseDragScroll.ts` |

Historical folder names such as `d3`, `d16`, `d17` and booking `design14`–`design18` still contain active dependencies. They are not proof that rejected previews are being shipped. Keep their implementations in place while current consumers use them; a mass rename creates unnecessary overlap for other designers. See [the existing booking handoff](./design21-handoff.md) for the current journey.

## Import rules

- Health UI stays in its feature folder; its route files remain thin composition/metadata entry points.
- Health Checkups imports reusable Booking behaviour through explicit files in `booking/shared/`, never through numbered design folders or `src/app/`.
- Keep types and pure date helpers separate from client components and session APIs. Do not introduce a single barrel that mixes server and client code.
- Shared search and drag controls must not import a route or feature. Booking and Health both consume the same implementation, preserving their visual and interaction consistency.
- Put module-specific styling in co-located CSS Modules. Use existing global tokens; do not add global overrides for a single page.

## Shared integration points

These files affect other modules. Change only the required integration and call it out in the handoff/PR:

- `src/components/layout/Navbar.tsx` and `BookingMemberMenu.tsx`: navigation and shared member selection.
- `src/components/layout/navigation/service-menu-data.ts`: Services entries.
- `src/features/search/searchTabs.ts` and `navigationEntries.ts`: shared discovery entry points.
- Homepage health-package sections in `src/components/sections/health-packages/`.
- `src/app/globals.css`, the root layout, dependency/configuration files and shared UI primitives.

Avoid unrelated formatting, global token renaming, dependency updates and asset moves in a module change. Agree with the other designer before changing a shared component's props or behaviour; keep existing consumers working.

## Before sharing a change

1. Check the active worktree/branch and `git status`; preserve unrelated local work.
2. Keep Booking and Health changes in separate, focused commits where practical. Shared-control extraction should be an identifiable prerequisite, not copied into each module.
3. Review the changed-file list against the table above and list any shared integration edits in the PR. Include required assets and data; exclude runtime binaries, generated build files and unrelated permission changes.
4. Run the boundary check, relevant existing tests, TypeScript/build and scoped lint. Record actual outcomes and any pre-existing failures.
5. Review overlap against the intended receiving branch. This branch also contains earlier combined website work: merging the entire branch includes all divergent commits. For a module-only handoff, agree on a baseline and the focused commits, including shared prerequisites; do not copy only route folders.

```bash
export PATH="/Users/a374590/Desktop/NH website main/.node-portable/bin:$PATH"
node scripts/check-booking-health-boundaries.mjs
node scripts/check-booking-health-boundaries.mjs --base origin/main
```

The checker reads TypeScript/JavaScript import syntax, including relative paths and aliases, and uses the already-installed TypeScript compiler. It adds no package dependency. It checks direct module boundaries, not every transitive dependency or CSS reference. `--base` uses the local Git ref and reports files changed on both sides since their common ancestor, including local uncommitted work. It does not fetch, modify Git state, prove that a merge will conflict, or prove that the application works. Refresh the receiving ref through the team's normal sync process before relying on the comparison.

Current public URLs and approved previews remain unchanged by this organisation. New Health Checkup iterations belong under that feature's preview structure, not in the Booking route folders.
