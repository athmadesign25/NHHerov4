import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate && existsSync(candidate + ".ts")) return nextResolve(pathToFileURL(candidate + ".ts").href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const { confirmDesign20, design20RequestedSelection, design20CanRestoreSelection, design20ContinuePhase, design20DefaultMember, design20SignedInDraft, design20SafeStep, design20ChangedSelection, design20FlowUrl, design20InlineUrl, design20ListingReturnTo, design20PaymentDraft, design20PaymentIntent, design20SavedAppointment, design20SummaryDraft, parseDesign20Draft } = await import("../src/features/booking/design20/model.ts");
const { patientsForIdentity, holdAfterPaymentFailure } = await import("../src/features/booking/design15/model.ts");
const { getDesign20BookingDoctor } = await import("../src/features/search/design20Directory.ts");
const { getDesign3BookingSlots } = await import("../src/features/booking/design3Availability.ts");
const now = Date.parse("2026-10-27T02:00:00Z");
const doctor = getDesign20BookingDoctor("dr-1");
const selection = design20RequestedSelection(doctor, new URLSearchParams(), now);
selection.time = getDesign3BookingSlots(doctor.id, selection.date, selection.mode, selection.hospital, new Date(now), 21, "d20").find(slot => slot.available).time;
const guest = { version: 1, doctorId: doctor.id, identity: null, patients: [], selectedPatientId: null, selection, payment: "online", failureHold: null, receipt: null, stage: "patient" };
const identity = { method: "email", value: "account@example.com" };
const patients = patientsForIdentity(identity);
const member = { ...guest, identity, patients, selectedPatientId: patients[0].id, stage: "appointment" };

test("guest selects a real time without authentication, patient details or a reservation", () => {
  const draft = parseDesign20Draft(guest);
  assert.equal(draft.selection.time, selection.time);
  assert.equal(draft.identity, null);
  assert.equal(draft.failureHold, null);
  assert.equal(design20ContinuePhase(guest, false, now), "auth");
  assert.equal(design20ContinuePhase({ ...guest, selection: { ...selection, time: "" } }, false, now), "slots");
  assert.equal(design20RequestedSelection(doctor, new URLSearchParams({ time: selection.time }), now).time, "");
});

test("authentication retains the selected appointment and member selection remains gated", () => {
  assert.equal(design20ContinuePhase(member, true, now), "member");
  assert.equal(parseDesign20Draft(member).selection.time, selection.time);
  assert.equal(design20SafeStep("review", guest, false, now), "patient");
  assert.equal(design20SafeStep("payment", { ...member, selectedPatientId: null }, true, now), "patient");
  assert.equal(design20SafeStep("review", member, true, now), "review");
  assert.equal(confirmDesign20({ ...member, stage: "payment" }, false, true, now), null);
  assert.equal(parseDesign20Draft({ ...guest, patients }), null);
});

test("fresh sign-in defaults to the primary member, linked benefit and online payment", () => {
  const signedIn = design20SignedInDraft(guest, identity);
  assert.equal(signedIn.selectedPatientId, "existing-self");
  assert.equal(signedIn.patients.find(entry => entry.id === signedIn.selectedPatientId).patient.relation, "self");
  assert.equal(signedIn.sponsorshipId, "one-health-lite");
  assert.equal(signedIn.payment, "online");
  assert.equal(signedIn.stage, "appointment");
  assert.deepEqual(signedIn.selection, selection);
  assert.ok(parseDesign20Draft(signedIn));
  assert.ok(design20PaymentDraft(signedIn, "online", true, now));
  assert.equal(design20DefaultMember(guest, false), guest);
});

test("default member recovery prefers self then the first valid member only when unanswered", () => {
  const signedIn = design20SignedInDraft(guest, identity);
  const unanswered = { ...signedIn, selectedPatientId: null, stage: "patient", sponsorshipId: undefined };
  const reversed = { ...unanswered, patients: [...unanswered.patients].reverse() };
  assert.equal(design20DefaultMember(reversed, true).selectedPatientId, "existing-self");
  const withoutSelf = { ...unanswered, patients: unanswered.patients.filter(entry => entry.patient.relation !== "self") };
  assert.equal(design20DefaultMember(withoutSelf, true).selectedPatientId, withoutSelf.patients[0].id);
  assert.equal(design20DefaultMember({ ...unanswered, selectedPatientId: "removed-member" }, true).selectedPatientId, "existing-self");
  const invalidSelf = { ...unanswered, patients: unanswered.patients.map(entry => entry.id === "existing-self" ? { ...entry, patient: { ...entry.patient, name: "" } } : entry) };
  assert.equal(design20DefaultMember(invalidSelf, true).selectedPatientId, "existing-child");
  assert.equal(design20DefaultMember(unanswered, false), unanswered);
  assert.equal(design20DefaultMember({ ...unanswered, patients: [] }, true).selectedPatientId, null);
});

test("refresh, member edits and same-account sign-in preserve explicit member and payment choices", () => {
  const signedIn = design20SignedInDraft(guest, identity);
  const chosen = { ...signedIn, selectedPatientId: "existing-spouse", sponsorshipId: null, payment: "hospital", useHealthCredits: true, discountCode: "NHCARE10" };
  const restored = design20DefaultMember(parseDesign20Draft(chosen), true);
  assert.equal(restored.selectedPatientId, "existing-spouse");
  assert.equal(restored.sponsorshipId, null);
  assert.equal(restored.payment, "hospital");
  assert.equal(restored.useHealthCredits, true);
  assert.equal(restored.discountCode, "NHCARE10");
  const sameAccount = design20SignedInDraft(chosen, identity);
  assert.equal(sameAccount.selectedPatientId, "existing-spouse");
  assert.equal(sameAccount.payment, "hospital");
  assert.equal(sameAccount.sponsorshipId, null);
  const payment = design20PaymentDraft({ ...chosen, payment: "online" }, "online", true, now);
  const closed = design20DefaultMember(design20SummaryDraft(payment, now), true);
  assert.equal(closed.selectedPatientId, "existing-spouse");
  assert.equal(closed.payment, "online");
  assert.equal(closed.sponsorshipId, null);
  const receipt = confirmDesign20(payment, true, true, now);
  const confirmed = { ...payment, receipt, stage: "confirmation" };
  assert.equal(design20DefaultMember(confirmed, true), confirmed);
});

test("a different account receives its own defaults without previous member benefits", () => {
  const signedIn = design20SignedInDraft(guest, identity);
  const previous = { ...signedIn, selectedPatientId: "existing-spouse", sponsorshipId: "nhcare", payment: "hospital", useHealthCredits: true, discountCode: "NHCARE10" };
  const nextIdentity = { method: "email", value: "another@example.com" };
  const next = design20SignedInDraft(previous, nextIdentity);
  assert.equal(next.selectedPatientId, "existing-self");
  assert.equal(next.payment, "online");
  assert.equal(next.sponsorshipId, "one-health-lite");
  assert.equal(next.discountCode, undefined);
  assert.equal(next.useHealthCredits, undefined);
  assert.ok(next.patients.every(entry => entry.patient.email === nextIdentity.value));
  assert.deepEqual(next.selection, previous.selection);
});

test("changing doctor, hospital, date or consultation mode clears the old time", () => {
  for (const change of [{ doctorId: "dr-2" }, { hospital: "Another hospital" }, { date: "2026-10-28" }, { mode: "video" }]) {
    assert.equal(design20ChangedSelection(selection, { ...selection, ...change }).time, "");
  }
  assert.equal(design20ChangedSelection(selection, { ...selection, time: "02:00 PM" }).time, "02:00 PM");
});

test("reopening an unfinished card retains changed choices while an explicit new filter can override them", () => {
  const changed = { ...guest, selection: { ...selection, mode: "video", hospital: "Another hospital", date: "2026-10-28" } };
  assert.equal(design20CanRestoreSelection(changed, selection, true, true), false);
  assert.equal(design20CanRestoreSelection(changed, selection, true, false), false);
  assert.equal(design20CanRestoreSelection(guest, { ...selection, date: "2026-10-29" }, true, true), true);
  assert.equal(design20CanRestoreSelection(guest, { ...selection, date: "2026-10-29" }, true, false), false);
  assert.equal(design20CanRestoreSelection(guest, { ...selection, date: "2026-10-29" }, false, false), true);
  assert.equal(design20CanRestoreSelection({ ...guest, receipt: {} }, selection, true, true), false);
  assert.equal(design20CanRestoreSelection(null, selection, false, true), false);
});

test("Back from the summary restores hospital, mode and date edits without overriding a new explicit booking", () => {
  const edited = { ...member, selection: { ...selection, mode: "video", hospital: "Another hospital", date: "2026-10-28" } };
  assert.equal(design20CanRestoreSelection(edited, selection, true, false, true), true);
  assert.equal(design20CanRestoreSelection(edited, selection, true, false, false), false);
  assert.equal(design20CanRestoreSelection(edited, { ...selection, doctorId: "dr-2" }, true, false, true), false);
  assert.equal(design20CanRestoreSelection({ ...edited, receipt: {} }, selection, true, false, true), false);
  const backEntry = new URL(design20InlineUrl(member, "/search/doctors?design=d20&languages=Kannada"), "https://nh.local");
  assert.equal(backEntry.searchParams.get("bookingResume"), "1");
  assert.equal(backEntry.searchParams.get("booking"), member.doctorId);
  const directory = new URL(design20ListingReturnTo(backEntry.pathname + backEntry.search), "https://nh.local");
  assert.equal(directory.searchParams.has("bookingResume"), false);
  assert.equal(directory.searchParams.get("languages"), "Kannada");
  const nextPage = new URL(design20FlowUrl(edited, backEntry.pathname + backEntry.search), "https://nh.local");
  assert.equal(new URL(nextPage.searchParams.get("returnTo"), "https://nh.local").searchParams.has("bookingResume"), false);
});

test("expired or unavailable times cannot progress into authentication or payment", () => {
  const hold = holdAfterPaymentFailure(null, selection, now);
  const failed = { ...member, failureHold: hold, stage: "review" };
  assert.equal(design20ContinuePhase(failed, true, now), "member");
  assert.equal(design20ContinuePhase(failed, true, now + 15 * 60 * 1000), "slots");
  assert.equal(holdAfterPaymentFailure(hold, selection, now + 60_000), hold);
  assert.equal(confirmDesign20({ ...failed, stage: "payment" }, true, true, now + 15 * 60 * 1000), null);
  assert.equal(design20ContinuePhase({ ...guest, selection: { ...selection, date: "2026-10-26" } }, false, now), "slots");
});

test("review and return links retain D20, filters and appointment context without patient data", () => {
  const returnTo = "/search/doctors?design=d17-lite&location=Bangalore&languages=Kannada&mode=video&booking=dr-2&bookingMode=hospital";
  const review = new URL(design20FlowUrl({ ...member, stage: "review" }, returnTo), "https://nh.local");
  assert.equal(review.pathname, "/doctors/dr-1/book");
  assert.equal(review.searchParams.get("design"), "d20");
  assert.equal(review.searchParams.get("step"), "review");
  assert.equal(review.searchParams.get("hospital"), selection.hospital);
  const inline = new URL(design20InlineUrl(member, returnTo), "https://nh.local");
  assert.equal(inline.pathname, "/search/doctors");
  assert.equal(inline.searchParams.get("booking"), doctor.id);
  assert.equal(inline.searchParams.get("languages"), "Kannada");
  assert.equal(inline.searchParams.get("design"), "d20");
  assert.equal(inline.searchParams.get("mode"), "video");
  assert.equal(inline.searchParams.get("bookingMode"), "hospital");
  const cleanReturn = new URL(review.searchParams.get("returnTo"), "https://nh.local");
  assert.equal(cleanReturn.searchParams.get("mode"), "video");
  assert.equal(cleanReturn.searchParams.has("bookingMode"), false);
  assert.equal(inline.searchParams.has("time"), false);
  for (const url of [review, inline]) {
    assert.equal(url.href.includes(encodeURIComponent(identity.value)), false);
    assert.equal(url.href.includes(encodeURIComponent(patients[0].patient.name)), false);
  }
  for (const unsafe of ["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)"]) {
    assert.equal(design20ListingReturnTo(unsafe), "/search/doctors?design=d20&location=All");
  }
});

test("guest choices survive reopening in memory and signed-in drafts use an isolated opaque token", async () => {
  const { saveDesign20Draft, loadDesign20Draft } = await import("../src/features/booking/design20/draft.ts");
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const originalSession = globalThis.sessionStorage;
  const stored = new Map();
  const requests = [];
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.sessionStorage = { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) };
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response("{}", { status: 200 }); };
  try {
    assert.equal(await saveDesign20Draft(guest), true);
    assert.equal((await loadDesign20Draft(doctor.id)).selection.time, selection.time);
    assert.equal(requests.length, 0);
    assert.equal(stored.size, 0);
    assert.equal(await saveDesign20Draft(member), true);
    assert.equal(requests.length, 1);
    assert.deepEqual([...stored.keys()], ["nh:d20:booking-token"]);
    assert.match(stored.get("nh:d20:booking-token"), /^[a-f0-9-]{36}$/);
    assert.equal(requests[0].options.cache, "no-store");
    assert.equal(JSON.parse(requests[0].options.body).selectedPatientId, member.selectedPatientId);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.sessionStorage = originalSession;
  }
});

test("confirmation requires the right payment outcome and keeps the D20 return context", () => {
  const online = { ...member, stage: "payment", payment: "online" };
  assert.equal(confirmDesign20(online, true, false, now), null);
  const paidReceipt = confirmDesign20(online, true, true, now);
  assert.ok(paidReceipt);
  const hospital = { ...member, stage: "review", payment: "hospital" };
  assert.ok(confirmDesign20(hospital, true, false, now));
  assert.equal(confirmDesign20({ ...hospital, selection: { ...selection, mode: "video" } }, true, false, now), null);
  const confirmation = new URL(design20FlowUrl({ ...online, stage: "confirmation", receipt: paidReceipt }, "/search/doctors?design=d20&location=Bangalore&mode=video&booking=dr-1&bookingMode=hospital"), "https://nh.local");
  assert.equal(confirmation.pathname, "/doctors/dr-1/book/confirmation");
  assert.equal(confirmation.searchParams.get("design"), "d20");
  assert.equal(confirmation.searchParams.get("ref"), paidReceipt.ref);
  const directory = new URL(confirmation.searchParams.get("returnTo"), "https://nh.local");
  assert.equal(directory.searchParams.get("mode"), "video");
  assert.equal(directory.searchParams.has("booking"), false);
  assert.equal(directory.searchParams.has("bookingMode"), false);
});

test("member and summary page proceeds directly to either payment choice without a review transition", () => {
  for (const stage of ["patient", "appointment", "review"]) {
    const current = { ...member, stage, discountCode: "NHCARE" };
    const online = design20PaymentDraft(current, "online", true, now);
    assert.equal(online.stage, "payment");
    assert.equal(online.selectedPatientId, member.selectedPatientId);
    assert.equal(online.discountCode, "NHCARE");
    assert.deepEqual(online.selection, selection);
    assert.equal(confirmDesign20(online, true, false, now), null);
    assert.ok(confirmDesign20(online, true, true, now));
    const atHospital = design20PaymentDraft(current, "hospital", true, now);
    assert.equal(atHospital.stage, "review");
    assert.ok(confirmDesign20(atHospital, true, false, now));
    assert.ok(parseDesign20Draft(atHospital));
  }
});

test("payment still requires authentication, a valid member and a current slot", () => {
  assert.equal(design20PaymentDraft(member, "online", false, now), null);
  assert.equal(design20PaymentDraft(guest, "online", true, now), null);
  assert.equal(design20PaymentDraft({ ...member, selectedPatientId: null }, "online", true, now), null);
  assert.equal(design20PaymentDraft({ ...member, selectedPatientId: "missing" }, "online", true, now), null);
  assert.equal(design20PaymentDraft({ ...member, selection: { ...selection, time: "" } }, "online", true, now), null);
  assert.equal(design20PaymentDraft({ ...member, receipt: {} }, "hospital", true, now), null);
  const failed = { ...member, failureHold: holdAfterPaymentFailure(null, selection, now) };
  assert.equal(design20PaymentDraft(failed, "online", true, now + 15 * 60 * 1000), null);
  const videoTime = getDesign3BookingSlots(doctor.id, selection.date, "video", selection.hospital, new Date(now), 21, "d20").find(slot => slot.available).time;
  assert.equal(design20PaymentDraft({ ...member, selection: { ...selection, mode: "video", time: videoTime } }, "hospital", true, now), null);
});

test("fully covered bookings skip the gateway while retaining all booking validation", () => {
  const covered = { ...member, useHealthCredits: true };
  const intent = design20PaymentIntent(covered, "online", "₹250", true, now);
  assert.equal(intent.destination, "covered");
  assert.ok(confirmDesign20(intent.draft, true, true, now));
  assert.equal(design20PaymentIntent(covered, "hospital", "₹250", true, now).destination, "covered");
  assert.equal(design20PaymentIntent(covered, "online", "₹750", true, now).destination, "gateway");
  assert.equal(design20PaymentIntent(covered, "hospital", "₹750", true, now).destination, "hospital");
  assert.equal(design20PaymentIntent({ ...covered, useHealthCredits: false }, "online", "₹250", true, now).destination, "gateway");
  assert.equal(design20PaymentIntent(covered, "online", "₹250", false, now), null);
  assert.equal(design20PaymentIntent({ ...covered, selectedPatientId: null }, "online", "₹250", true, now), null);
  assert.equal(design20PaymentIntent({ ...covered, selection: { ...selection, time: "" } }, "online", "₹250", true, now), null);
  const expired = { ...covered, failureHold: holdAfterPaymentFailure(null, selection, now) };
  assert.equal(design20PaymentIntent(expired, "online", "₹250", true, now + 15 * 60 * 1000), null);
});

test("saving a complete appointment edit keeps the member and discount and clears only the obsolete hold", () => {
  const original = { ...member, payment: "hospital", discountCode: "NHCARE", useHealthCredits: true, failureHold: holdAfterPaymentFailure(null, selection, now) };
  const time = getDesign3BookingSlots(doctor.id, selection.date, "video", selection.hospital, new Date(now), 21, "d20").find(slot => slot.available).time;
  const incoming = { ...selection, mode: "video", time };
  const next = design20SavedAppointment(original, incoming, true, now);
  assert.equal(next.selection.date, selection.date);
  assert.equal(next.selection.time, time);
  assert.equal(next.selection.mode, "video");
  assert.equal(next.payment, "online");
  assert.equal(next.failureHold, null);
  assert.equal(next.selectedPatientId, original.selectedPatientId);
  assert.equal(next.patients, original.patients);
  assert.equal(next.discountCode, original.discountCode);
  assert.equal(next.useHealthCredits, true);
  assert.ok(parseDesign20Draft(next));
  assert.equal(design20SavedAppointment(original, incoming, false, now), null);
  assert.equal(design20SavedAppointment(original, { ...incoming, time: "" }, true, now), null);
  assert.equal(design20SavedAppointment(original, { ...incoming, doctorId: "dr-2" }, true, now), null);
  assert.equal(design20SavedAppointment(original, selection, true, now).failureHold, original.failureHold);
  assert.equal(design20SavedAppointment(original, selection, true, now + 15 * 60 * 1000), null);
});

test("closing payment retains valid selections and returns to the combined summary", () => {
  const payment = { ...member, stage: "payment", discountCode: "NHCARE" };
  const next = design20SummaryDraft(payment, now);
  assert.equal(next.stage, "appointment");
  assert.equal(next.selectedPatientId, payment.selectedPatientId);
  assert.equal(next.discountCode, payment.discountCode);
  assert.deepEqual(next.selection, payment.selection);
  assert.ok(parseDesign20Draft(next));
  const summaryUrl = new URL(design20FlowUrl(next, "/search/doctors?design=d20"), "https://nh.local");
  assert.equal(summaryUrl.searchParams.get("step"), "appointment");
  assert.equal(design20SafeStep(summaryUrl.searchParams.get("step"), next, true, now), "appointment");
});

test("an expired payment slot reopens editing without losing member, hospital, date or discount", () => {
  const payment = { ...member, stage: "payment", discountCode: "NHCARE", failureHold: holdAfterPaymentFailure(null, selection, now) };
  const next = design20SummaryDraft(payment, now + 15 * 60 * 1000);
  assert.equal(next.stage, "appointment");
  assert.equal(next.selection.time, "");
  assert.equal(next.selection.date, payment.selection.date);
  assert.equal(next.selection.hospital, payment.selection.hospital);
  assert.equal(next.selectedPatientId, payment.selectedPatientId);
  assert.equal(next.discountCode, payment.discountCode);
  assert.equal(next.failureHold, null);
  assert.ok(parseDesign20Draft(next));
  assert.equal(design20PaymentDraft(next, "online", true, now), null);
  const unavailable = design20SummaryDraft({ ...payment, failureHold: null, selection: { ...selection, date: "2026-10-26" } }, now);
  assert.equal(unavailable.selection.time, "");
  assert.equal(unavailable.stage, "appointment");
  const receipt = confirmDesign20(payment, true, true, now);
  const confirmed = { ...payment, receipt, failureHold: null, stage: "confirmation" };
  assert.equal(design20SummaryDraft(confirmed, now + 31 * 86400000), confirmed);
});
