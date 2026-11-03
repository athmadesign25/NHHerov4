# Design 21 booking handoff

`aditya4_work` contains Design 21 as the only doctor discovery and appointment flow. The full iteration archive is on `aditya3_work` at `881d021`. Earlier Git history remains available; this cleanup removes rejected flow implementations from the current checkout.

## Entry points and journey

- `/search/doctors` and `/book-an-appointment/...` render Design 21. Older `?design=` preview links also render Design 21.
- Doctor profile, booking and confirmation routes use the same Design 21 journey.
- Book appointment opens date/time selection inside the doctor card. Login follows slot selection when needed.
- Continue opens the full-page member selection and booking summary, with appointment editing, coupons, sponsorship, health credits and payment details.
- Pay online opens the demo payment gateway; pay at hospital follows the confirmation path.
- The only booking preview API route is `/api/booking-preview/design20`.

## Files to work in

- `src/app/search/designs/d21/`: current filters, smart chips and applied filters.
- `src/app/doctors/[slug]/DoctorProfile*`: updated reading-first doctor profile and floating booking bar.

- `src/app/search/designs/d20/`: cards, slot selector, hospital selection, expertise and sharing.
- `src/features/booking/design20/`: booking summary, benefits, payment bar, demo gateway, draft and flow state.
- `src/features/search/design20*`: directory data, availability and card presentation.
- `docs/design20-directory-provenance.md`: real-source versus presentation/demo data notes.

Some retained shared modules have historical names (`d3`, `d16`, `d17`, booking `design7`, `design13`–`design18`). These provide the current search/filter engine, date helpers, model types, draft validation, member UI and confirmation surface. They are required dependencies, not selectable earlier designs. Their old flow controllers, cards, workspaces, preview switcher and obsolete API routes have been removed. Shared behavior tests remain; tests exclusively for removed iterations were removed with those implementations.

Unrelated website sections and their existing history are preserved.

## Validation

- `node --test tests/*.test.mjs`: 264 passing tests.
- `npm run build`: passing production build and TypeScript checks.
- ESLint for the handoff conflict-resolution files: passing.
- Browser smoke check: stale preview listing links render D21; card slots, the updated doctor profile, automatic first-slot selection and login after slot selection were checked.
- Repository-wide lint has pre-existing errors in unrelated scripts/components; this handoff does not claim a clean full-repository lint result.

This remains a stakeholder demo: mock login/OTP, benefits and the Razorpay-style payment screen do not implement production authentication, insurance eligibility or real payment processing.

## Combined local preview — 3 November 2026

Merged the reviewed `demo-no-tokens` commit `293c8a1` into this branch. The combined homepage, search experience, speciality pages and desktop menus are retained. Design 21 remains the doctor listing and booking flow, including the member picker in the combined navbar. Legacy design tokens needed by the booking surfaces remain available as compatibility aliases.

Validation: 279 tests pass; TypeScript and the production build pass. Browser checks cover stale listing links, slot selection, profile booking, demo login, booking summary, navbar member selection and listing overflow at 375, 768 and 1440 pixels. Full repository lint reports 15 existing errors in reference/test scripts and the legacy DoctorFilterDialog; these are not merge-resolution errors.
