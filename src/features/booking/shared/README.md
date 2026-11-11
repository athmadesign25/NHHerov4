# Shared booking API

Health Checkups uses these explicit entrypoints instead of importing booking's
historically named implementation folders. The adapters preserve the existing
components, styles, payment demo and member-selection store; they do not create
a second copy of state or change the booking flow.

| Entry | Purpose | Boundary |
| --- | --- | --- |
| `types.ts` | `SavedPatient`, `AuthIdentity` contracts | Type-only; server/client safe |
| `dates.ts` | Appointment dates, India timestamps and date formatting | Pure; server/client safe |
| `patients.ts` | `patientAvatar` image lookup | Pure; server/client safe |
| `memberSelection.ts` | Shared selected member, subscriptions and confirmation protection | Client |
| `MemberAvatar.tsx` | Member image with initials fallback | Client component |
| `BookingMemberPicker.tsx` | Existing member selection | Client component |
| `NewPatient.tsx` | New member form | Client component |
| `RazorpayDemo.tsx` | Frontend demo payment gateway | Client component |
| `BookingActionBar.tsx` | Existing booking FAB surface and animated amount with neutral action labels | Client component |
| `BookingOutcomeActions.tsx` | Persistent confirmation/reservation FAB with contextual message or payable amount; reserves space below page content | Client component |
| `SuccessMark.tsx` | Existing confirmation tick and success microinteraction | Client component |

Import the specific entry needed. Keep pure utilities and types separate from
client components; do not add a combined barrel that pulls browser code into
server consumers. `getServerBookingMemberSelection` is the client store's stable
SSR snapshot for `useSyncExternalStore`, not a server-side patient store.

The `design14`–`design20` targets are live dependencies retained for compatibility.
Their names do not indicate obsolete previews. Future implementation moves can
update these adapters without changing Health Checkups imports. Changes to shared
member contracts, selection behaviour or payment props affect both modules and
should be coordinated and checked in both flows.
