# Design 20 Bangalore directory provenance

Captured on 28 October 2026 from Narayana Health's [official Bangalore doctor directory](https://www.narayanahealth.org/ocaapp/doctors/bangalore).

## Sample and source fidelity

- All 16 Bangalore hospital/clinic filters were visited. The first six individual doctor cards per filter were captured; team entries were excluded.
- The resulting 96 unit memberships resolve to 72 distinct clinicians. The sample is deliberately incomplete and is not an exhaustive NH clinician directory.
- Names, professional roles, qualifications, specialties, expertise and visible hospital affiliations retain their official wording. A doctor appearing in a selected hospital filter is evidence of that affiliation, even when the card collapses additional locations behind `+N`.
- Repeated doctors are deduplicated and their observed affiliations merged. Thirteen official profile pages were also inspected to resolve full affiliations and any stated years in practice. Unopened `+N` locations are not invented; displayed affiliation lists can therefore be incomplete.
- The source snapshot in `src/features/search/design20DirectoryData.ts` records each unit's six selected clinician IDs, original portrait URL, listing source URL and any inspected profile URL. The application's internal IDs add `d20-` to avoid collisions with earlier preview fixtures.
- Sixty-two actual official portraits are preserved in `public/images/doctors/d20-real`. Ten source entries have only the website's generic placeholder; those entries retain an empty photo and render a person icon.
- Twelve of the already-inspected profiles provided higher-resolution portraits (637 × 694, or 637 × 751) than the directory thumbnails (typically 115 × 110). These official `-profile.webp` assets remain unchanged; the source snapshot records their original official image URLs.
- Per the subsequent picture-only design request, the 50 remaining contained thumbnail images use the earlier Design 19 preview portraits to fill the card width. `design20PreviewPortrait.ts` applies this separately from the verified source snapshot: Dr. Bagirath Raghuraman uses his earlier large portrait, and the other 49 use the two existing illustrative Design 19 assets. These illustrative portraits are not verified images of the named clinicians. Clinical text, missing-image states, the 12 full-bleed official portraits and the three featured cards are unchanged. Listing, profile and booking resolve the same presentation image.
- Years in practice were explicitly published for Dr. Abhinandan S Punit (17) and Dr. Akhila Vasanth Hassan (12). Every other experience field remains empty. Languages were not supplied in the captured content and remain empty. No genders, ratings or review counts are fabricated.

## Separate interaction simulation

`DESIGN20_SIMULATED_BOOKING` in `src/features/search/design20Directory.ts` supplies the preview's common ₹1,500 fee, hospital/video mode controls and initial availability hints. The existing preview calendar generates selectable times. These are **not verified clinical-service offerings, fees, real appointments or live availability**. Existing kilometre values are also stakeholder-preview values, not measured journeys.

These simulated values support the already-established local booking walkthrough. They must be replaced with hospital-specific booking inventory, consultation capabilities, fees and route distances before any production use. They are separate from the captured clinical records and are not written back to them. Per user direction, technical provenance copy is kept out of the stakeholder UI.

The signed-in D20 "Previously consulted" walkthrough seeds Dr. Abhinandan S Punit and Dr. Akhila Vasanth Hassan. This is simulated history, not evidence of an actual consultation; existing session history is retained. D20 suppresses the regional-language shortcut whenever the current directory records do not supply that language.

## Isolation and navigation

- Only D20 replaces Bangalore fixtures with this sample. Other city fixtures remain available; D17/D19 keep their existing directory and booking-doctor resolver.
- D20 has explicit listing, profile, booking and related-doctor resolvers. Its draft recovery uses `/api/booking-preview/design20` and a separate process-memory store.
- The common preview calendar recognizes only these explicitly captured D20 IDs in addition to its original fixtures. Unknown IDs never receive a generated schedule.
- Official department labels remain visible. Optional navigation aliases retain existing links such as `Cardiologist` → `Adult Cardiology` without changing the source label or duplicating default filter choices.
- Hospital selection is validated against each clinician's captured affiliations and is retained through card availability, inline booking, review, confirmation, profile and return links.

## Validation

`tests/design20-directory.test.mjs` verifies all 16 × 6 sampled unit memberships, source-to-listing fidelity, local portrait existence, D17/D19 resolver isolation, specialty/name discovery, every captured hospital's displayed availability against selectable slots, booking round trips and isolated draft recovery.

## Restored featured preview cards

Per the subsequent design request, the existing preview cards for Dr. Devi Prasad Shetty, Dr. Ashley Lucien Joseph D Cruz and Dr. Arun Krishnan appear before the 72 sourced clinicians. Their IDs, order and portraits remain unchanged. Bangalore therefore contains 75 cards in D20.

On 28 October 2026, the first two featured clinicians received a bounded D20-only clinical correction, recorded in `src/features/search/design20FeaturedClinicalMetadata.ts`:

- [Dr. Devi Prasad Shetty's official profile](https://www.narayanahealth.org/c/bangalore/cardiac-surgery-adult/dr-devi-prasad-shetty) supplies Founder & Chairman; Paediatric & Congenital Heart Surgery and Adult Cardiac Surgery; MBBS, MS (General Surgery), FRCS (Cardiac Thoracic Surgery); the same two areas of expertise; and Narayana Institute of Cardiac Sciences, Bangalore. D20 no longer labels or filters him as a Cardiologist. The navigation alias is Cardiac Surgeon.
- [Dr. Ashley Lucien Joseph D Cruz's official profile](https://www.narayanahealth.org/c/bangalore/paediatric-surgery/dr-ashley-lucien-joseph-d-cruz) supplies Senior Consultant; Paediatric Surgery; MBBS, MS (General Surgery), MCh (Paediatric Surgery); Paediatric Surgery, Robotic Surgery, Paediatric Airway Surgery and Paediatric Urology & Kidney Transplant; and Mazumdar Shaw Medical Centre, Bangalore plus Narayana Multispeciality Hospital, HSR Bangalore. D20 no longer labels or filters him as a General Surgeon. The navigation alias is Paediatric Surgeon.

These profile captures do not substantiate the former fixture experience, languages, gender, ratings or review counts, so the two D20 records leave those values unknown. Their existing fee, consultation-mode and availability controls remain interaction-preview values, not verified service facts. Profile and booking presentation resolve the corrected D20 metadata; global fixtures and older design resolvers remain unchanged. Dr. Arun Krishnan retains his earlier fixture content and is not newly verified by this correction.

The shared preview calendar accepts an explicit `d20` context for the corrected affiliations. D20 passes that context from listing refinements, card availability, slot selection, continuation, review and confirmation; callers without it retain the older featured fixtures and their calendar behavior. The D20 draft store already validates against the D20 booking resolver. Tests cover corrected hospital selection, matching advertised/selectable times, successful confirmation, rejection of superseded affiliations in D20, and unchanged older-design schedules.
