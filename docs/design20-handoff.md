# Design 20 booking handoff

`aditya4_work` contains Design 20 as the only doctor discovery and appointment flow. The full iteration archive is on `aditya3_work` at `c327f9b`. Earlier Git history remains available; this cleanup removes rejected flow implementations from the current checkout.

## Entry points and journey

- `/search/doctors` and `/book-an-appointment/...` render Design 20. Older `?design=` preview links also render Design 20.
- Doctor profile, booking and confirmation routes use the same Design 20 journey.
- Book appointment opens date/time selection inside the doctor card. Login follows slot selection when needed.
- Continue opens the full-page member selection and booking summary, with appointment editing, coupons, sponsorship, health credits and payment details.
- Pay online opens the demo payment gateway; pay at hospital follows the confirmation path.
- The only booking preview API route is `/api/booking-preview/design20`.

## Files to work in

- `src/app/search/designs/d20/`: cards, slot selector, hospital selection, expertise and sharing.
- `src/features/booking/design20/`: booking summary, benefits, payment bar, demo gateway, draft and flow state.
- `src/features/search/design20*`: directory data, availability and card presentation.
- `docs/design20-directory-provenance.md`: real-source versus presentation/demo data notes.

Some retained shared modules have historical names (`d3`, `d16`, `d17`, booking `design7`, `design13`–`design18`). These provide the current search/filter engine, date helpers, model types, draft validation, member UI and confirmation surface. They are required dependencies, not selectable earlier designs. Their old flow controllers, cards, workspaces, preview switcher and obsolete API routes have been removed. Shared behavior tests remain; tests exclusively for removed iterations were removed with those implementations.

Unrelated website sections and their existing history are preserved.

## Validation

- `node --test tests/*.test.mjs`: 240 passing tests.
- `npm run build`: passing production build and TypeScript checks.
- ESLint for the changed source and test files: passing.
- Browser smoke check: stale D19 listing URL renders D20; card slot selection continues to the full booking summary with the chosen date, time, doctor and hospital.
- Repository-wide `npm run lint`: existing 12 errors and 5 warnings remain in unrelated scripts/components; this is not a clean full-repository lint result.

This remains a stakeholder demo: mock login/OTP, benefits and the Razorpay-style payment screen do not implement production authentication, insurance eligibility or real payment processing.
