"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection, PatientDraft, PaymentChoice } from "../design7/model";
import { remainingHoldSeconds, sameSelection } from "../design7/model";
import type { AuthIdentity } from "../design15/auth";
import { failureHoldExpired, holdAfterPaymentFailure, patientErrors, type Design15Step } from "../design15/model";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { defaultSponsorshipForPatient, isDesign20CouponEligible, isSponsorshipId, normalizeDesign20Coupon, type SponsorshipId } from "./pricing";
import { design17Patients } from "../design17/patients";
import { loadDesign20Draft, rememberDesign20Draft, saveDesign20Draft } from "./draft";
import { confirmDesign20, design20Available, design20RequestedSelection, design20CanRestoreSelection, design20ChangedSelection, design20ContinuePhase, design20DefaultMember, design20FlowUrl, design20HealthCreditDraft, design20InlineUrl, design20ListingReturnTo, design20PaymentIntent, design20SavedAppointment, design20SignedInDraft, design20SummaryDraft, design20SafeStep, type Design20Draft, type Design20Phase } from "./model";

const ACCOUNT: AuthIdentity = { method: "email", value: "signed-in@nh.example" };
export interface Design20BookingOptions {
  initialSelection?: AppointmentSelection;
  returnTo: string;
  inline?: boolean;
  /** Restore unfinished choices when reopening this card without a new filter intent. */
  resume?: boolean;
  confirmationRef?: string;
}

export default function useDesign20Booking(doctor: BookingDoctorSummary, options: Design20BookingOptions) {
  const params = useSearchParams();
  const router = useRouter();
  const returnTo = design20ListingReturnTo(options.returnTo);
  const { isUserLoggedIn } = useAuthState();
  const [authReady, setAuthReady] = useState(false);
  const authenticated = useRef(isUserLoggedIn);
  const initial = useRef({ query: params.toString(), selection: options.initialSelection, resume: options.resume });
  const [draft, setDraft] = useState<Design20Draft>(() => {
    const query = new URLSearchParams(params.toString());
    if (options.initialSelection) {
      query.set("mode", options.initialSelection.mode);
      query.set("hospital", options.initialSelection.hospital);
      query.set("date", options.initialSelection.date);
    }
    return { version: 1, doctorId: doctor.id, identity: null, patients: [], selectedPatientId: null,
      selection: design20RequestedSelection(doctor, query), stage: "patient", payment: "online", failureHold: null, receipt: null };
  });
  const latest = useRef(draft);
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<Design20Phase>("slots");
  const currentPhase = useRef<Design20Phase>("slots");
  const [busy, setBusy] = useState(false);
  const committing = useRef(false);
  const reviewing = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState("");
  const [paymentOutcome, setPaymentOutcome] = useState<"success" | "failure">("success");
  const [recoveryUnavailable, setRecoveryUnavailable] = useState(false);
  const [missingReceipt, setMissingReceipt] = useState(false);
  const currentFee = (value: Design20Draft) => getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: value.selection.hospital }))?.fee ?? doctor.fee;
  const reconcileCoupon = (value: Design20Draft): Design20Draft => value.discountCode && !isDesign20CouponEligible(currentFee(value), value.discountCode, value.sponsorshipId)
    ? { ...value, discountCode: undefined } : value;
  const update = (next: Design20Draft) => { latest.current = next; rememberDesign20Draft(next); setDraft(next); };
  const changePhase = (next: Design20Phase) => { currentPhase.current = next; setPhase(next); };

  // useAuthState reads this tab's session in its mount effect. Wait for that
  // first render update before restoring an immediately available memory draft.
  useEffect(() => { setAuthReady(true); }, []);
  useEffect(() => { authenticated.current = isUserLoggedIn; }, [isUserLoggedIn]);
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    void loadDesign20Draft(doctor.id).then(saved => {
      if (cancelled) return;
      const query = new URLSearchParams(initial.current.query);
      const requested = latest.current.selection;
      const returnFromSummary = options.inline === true && query.get("bookingResume") === "1" && query.get("booking") === doctor.id;
      const sameContext = design20CanRestoreSelection(saved, requested, Boolean(query.get("date")), initial.current.resume, returnFromSummary);
      let next = latest.current;
      if (options.confirmationRef !== undefined) {
        if (saved?.receipt?.ref === options.confirmationRef) next = saved;
        else setMissingReceipt(true);
      } else if (saved && sameContext && !saved.receipt) {
        next = { ...saved, stage: options.inline ? "patient" : design20SafeStep(query.get("step") ?? saved.stage, saved, authenticated.current) };
      } else if (saved && authenticated.current) {
        next = { ...next, identity: saved.identity, patients: saved.patients, selectedPatientId: saved.selectedPatientId, useHealthCredits: saved.useHealthCredits };
      }
      if (!authenticated.current && !next.receipt) next = { ...next, identity: null, patients: [], selectedPatientId: null, stage: "patient", failureHold: null, sponsorshipId: undefined, discountCode: undefined, useHealthCredits: undefined };
      if (authenticated.current && !next.identity) next = design20SignedInDraft(next, ACCOUNT);
      if (next.identity && !next.receipt) next = { ...next, patients: design17Patients(next.identity, next.patients) };
      next = design20DefaultMember(next, authenticated.current);
      if (!next.receipt) next = reconcileCoupon(next);
      if (!next.receipt && next.selection.time && (!design20Available(next.selection) || failureHoldExpired(next.failureHold, next.selection))) {
        next = { ...next, selection: { ...next.selection, time: "" }, failureHold: null, stage: "patient" };
        setNotice("That time is no longer available. Choose another time; your other selections are kept.");
      }
      if (next.identity && next.selectedPatientId && next.stage === "patient") next = { ...next, stage: "appointment" };
      update(next);
      // A reopened card or Edit details always exposes its appointment choices.
      // An explicit Continue advances to members, retaining any chosen member.
      setLoaded(true); setNow(Date.now());
    });
    return () => { cancelled = true; };
  }, [authReady, doctor.id, options.confirmationRef, options.inline]);

  useEffect(() => {
    if (loaded && !missingReceipt) void saveDesign20Draft(draft).then(saved => setRecoveryUnavailable(!saved));
  }, [draft, loaded, missingReceipt]);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = draft.failureHold ? window.setInterval(refresh, 1000) : undefined;
    window.addEventListener("focus", refresh);
    return () => { if (timer) window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [draft.failureHold]);
  useEffect(() => {
    if (options.inline) return;
    const pop = () => {
      if (!window.location.pathname.endsWith(`/doctors/${encodeURIComponent(doctor.id)}/book`)) return;
      const current = latest.current;
      update({ ...current, stage: design20SafeStep(new URLSearchParams(window.location.search).get("step"), current, authenticated.current) });
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, [doctor.id, options.inline]);

  const cancelSignIn = () => { changePhase("slots"); setNotice(""); };
  const onSignedIn = (identity: AuthIdentity = ACCOUNT) => {
    authenticated.current = true;
    const current = latest.current;
    // Reauthentication reveals the completed receipt as booked. It must not
    // turn the receipt back into an editable draft or recheck a past slot.
    if (current.receipt) {
      update({ ...current, stage: "confirmation" });
      changePhase("member");
      setNotice("");
      return;
    }
    const next = reconcileCoupon(design20SignedInDraft(current, identity));
    update(next);
    changePhase("member");
    if (design20ContinuePhase(next, true) === "slots") {
      changePhase("slots");
      setNotice("That time is no longer available. Choose another time; you’re still signed in.");
      return;
    }
    setNotice("");
    if (options.inline) void openBookingSummary();
  };

  const go = (stage: Design15Step, changes: Partial<Design20Draft> = {}) => {
    if (committing.current || reviewing.current) return;
    let next = { ...latest.current, ...changes, stage };
    if (stage === "appointment" || stage === "patient") {
      next = { ...next, stage: authenticated.current && next.selectedPatientId ? "appointment" : "patient" };
      update(next); changePhase("slots"); setNotice("");
      if (!options.inline) window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
      return;
    }
    if (!authenticated.current) { changePhase("auth"); return; }
    if (!next.selectedPatientId) { changePhase("member"); return; }
    if (stage === "payment" && !validSlot()) return;
    update(next); setNotice("");
    // These are states of one summary page, including its payment overlay.
    window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
  };

  const selectPatient = (id: string) => {
    if (!busy && !committing.current && !reviewing.current && !latest.current.receipt && authenticated.current && latest.current.patients.some(patient => patient.id === id)) {
      const current = latest.current;
      const sponsorshipId = current.selectedPatientId === id && current.sponsorshipId !== undefined ? current.sponsorshipId
        : defaultSponsorshipForPatient(current.patients.find(entry => entry.id === id));
      const next = reconcileCoupon({ ...current, selectedPatientId: id, stage: "appointment", sponsorshipId });
      update(next);
      setNotice(current.discountCode && !next.discountCode ? "The coupon no longer meets its minimum amount after this benefit. Choose another coupon." : "");
    }
  };
  const addPatient = (patient: PatientDraft) => {
    const current = latest.current;
    if (busy || committing.current || reviewing.current || current.receipt || !authenticated.current || !current.identity || current.patients.length >= 10 || Object.keys(patientErrors(patient, current.identity)).length) return;
    const id = crypto.randomUUID();
    update(reconcileCoupon({ ...current, patients: [...current.patients, { id, patient }], selectedPatientId: id, stage: "appointment", sponsorshipId: null }));
    setNotice("");
  };
  const selectTime = (incoming: AppointmentSelection) => {
    if (!loaded || busy || committing.current || reviewing.current || incoming.doctorId !== doctor.id) return;
    const current = latest.current;
    const selection = design20ChangedSelection(current.selection, incoming);
    if (selection.time && !design20Available(selection)) { setNotice("That time is no longer available. Choose another time."); return; }
    const failureHold = current.failureHold && sameSelection(current.failureHold.selection, selection) ? current.failureHold : null;
    if (failureHoldExpired(failureHold, selection)) { setNotice("That reservation has expired. Choose another time."); return; }
    const next: Design20Draft = { ...current, stage: authenticated.current && current.selectedPatientId ? "appointment" : "patient", selection, failureHold,
      receipt: null, payment: selection.mode === "video" ? "online" : current.payment };
    update(reconcileCoupon(next));
    if (!options.inline) window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
    // Keep the listing URL and scroll position stable while the visitor explores slots.
    if (currentPhase.current === "auth") changePhase("slots");
    setNotice(""); setNow(Date.now());
  };
  const saveAppointment = (selection: AppointmentSelection): boolean => {
    if (!loaded || busy || committing.current || reviewing.current) return false;
    const next = design20SavedAppointment(latest.current, selection, authenticated.current);
    if (!next) { setNotice("That time is no longer available. Choose another time; your other selections are kept."); return false; }
    const reconciled = reconcileCoupon(next);
    update(reconciled); setNotice(next.discountCode && !reconciled.discountCode ? "The coupon no longer meets its minimum amount. Choose another coupon." : ""); setNow(Date.now());
    if (!options.inline) window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
    return true;
  };
  const validSlot = () => {
    const current = latest.current;
    if (design20ContinuePhase(current, authenticated.current) === "slots") {
      const next = design20SummaryDraft(current);
      update(next);
      if (!options.inline) window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
      changePhase("slots"); setNotice("Choose an available time to continue. Your other selections are kept."); return false;
    }
    return true;
  };
  const ready = () => {
    if (!validSlot()) return false;
    if (!authenticated.current) { changePhase("auth"); return false; }
    if (!latest.current.identity || !latest.current.patients.some(patient => patient.id === latest.current.selectedPatientId)) {
      changePhase("member"); setNotice("Choose a member to continue."); return false;
    }
    return true;
  };
  const openBookingSummary = async () => {
    if (busy || committing.current || reviewing.current || !validSlot() || !authenticated.current || !latest.current.identity) return;
    reviewing.current = true; setBusy(true);
    const next: Design20Draft = { ...latest.current, stage: "patient" };
    update(next); changePhase("member"); setNotice("");
    const saved = await saveDesign20Draft(next);
    setRecoveryUnavailable(!saved);
    // An account may sign out while the save is in flight. Never navigate with
    // the previous account's member data after that event.
    const sameAccount = latest.current.identity?.method === next.identity?.method && latest.current.identity?.value === next.identity?.value;
    if (authenticated.current && sameAccount && sameSelection(latest.current.selection, next.selection) && options.inline) {
      // Back from the summary must reopen the choices the user actually made, even if
      // they changed the hospital or date after entering from the doctor card.
      window.history.replaceState(null, "", design20InlineUrl(next, returnTo));
      router.push(design20FlowUrl(next, returnTo));
    }
    else if (authenticated.current && sameAccount && !options.inline) window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
    setBusy(false); reviewing.current = false;
  };
  useEffect(() => {
    if (!loaded) return;
    const current = latest.current;
    if (!isUserLoggedIn) {
      if (current.identity && !current.receipt) update({ ...current, identity: null, patients: [], selectedPatientId: null, stage: "patient", failureHold: null, sponsorshipId: undefined, discountCode: undefined, useHealthCredits: undefined });
      return;
    }
    // An auth event may arrive before or after the shared dialog's callback.
    // Both paths use the same continuation; its synchronous lock prevents double navigation.
    if (currentPhase.current === "auth") onSignedIn(current.identity ?? ACCOUNT);
    else if (!current.identity) update(reconcileCoupon(design20SignedInDraft(current, ACCOUNT)));
  }, [loaded, isUserLoggedIn]);
  // Retained for existing entry points; the destination combines member selection and review.
  const reviewAppointment = () => openBookingSummary();
  const continueBooking = () => {
    if (!loaded || busy || committing.current || reviewing.current || !validSlot()) return;
    const nextPhase = design20ContinuePhase(latest.current, authenticated.current);
    if (nextPhase === "auth") { changePhase("auth"); setNotice(""); return; }
    void openBookingSummary();
  };
  const finish = async (paid: boolean, current = latest.current) => {
    if (committing.current || !ready()) return;
    const receipt = confirmDesign20(current, authenticated.current, paid);
    if (!receipt) return;
    committing.current = true; setBusy(true);
    const next: Design20Draft = { ...current, receipt, failureHold: null, stage: "confirmation" };
    const saved = await saveDesign20Draft(next);
    setRecoveryUnavailable(!saved); update(next); setNotice("");
    if (saved) router.replace(design20FlowUrl(next, returnTo));
    setBusy(false);
  };
  const submitReview = async (payment: PaymentChoice = latest.current.payment) => {
    if (busy || committing.current || reviewing.current || !ready()) return;
    const intent = design20PaymentIntent(latest.current, payment, currentFee(latest.current), authenticated.current);
    if (!intent) return;
    const next = intent.draft;
    if (intent.destination !== "gateway") {
      await finish(intent.destination === "covered" && payment === "online", next);
      return;
    }
    reviewing.current = true; setBusy(true);
    const saved = await saveDesign20Draft(next);
    setRecoveryUnavailable(!saved);
    const sameAccount = latest.current.identity?.method === next.identity?.method && latest.current.identity?.value === next.identity?.value;
    if (authenticated.current && sameAccount && sameSelection(latest.current.selection, next.selection) && validSlot()) {
      update(next); setNotice("");
      window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
    }
    setBusy(false); reviewing.current = false;
  };
  const closePayment = () => {
    if (busy || committing.current || reviewing.current || latest.current.receipt || latest.current.stage !== "payment") return;
    const next = design20SummaryDraft(latest.current);
    update(next);
    changePhase(next.selection.time ? "member" : "slots");
    setNotice(next.selection.time ? "" : "Choose an available time to continue. Your other selections are kept.");
    window.history.replaceState(null, "", design20FlowUrl(next, returnTo));
  };
  const applyDiscount = (code: string): boolean => {
    if (!authenticated.current || busy || committing.current || reviewing.current || latest.current.receipt || latest.current.stage === "payment") return false;
    const discountCode = code.trim() ? normalizeDesign20Coupon(code) : undefined;
    if (discountCode === null || (discountCode && !isDesign20CouponEligible(currentFee(latest.current), discountCode, latest.current.sponsorshipId))) return false;
    update({ ...latest.current, discountCode }); return true;
  };
  const applySponsorship = (id: SponsorshipId | null): boolean => {
    const current = latest.current;
    if (!authenticated.current || !current.selectedPatientId || busy || committing.current || reviewing.current || current.receipt || current.stage === "payment" || (id !== null && !isSponsorshipId(id))) return false;
    const next = reconcileCoupon({ ...current, sponsorshipId: id });
    update(next);
    setNotice(current.discountCode && !next.discountCode ? "The coupon no longer meets its minimum amount after this benefit. Choose another coupon." : "");
    return true;
  };
  const setUseHealthCredits = (enabled: boolean): boolean => {
    if (busy || committing.current || reviewing.current) return false;
    const next = design20HealthCreditDraft(latest.current, enabled, authenticated.current);
    if (!next) return false;
    update(next);
    return true;
  };
  const pay = async () => {
    if (busy || committing.current || !ready() || latest.current.stage !== "payment") return;
    if (paymentOutcome === "failure") {
      go("review", { failureHold: holdAfterPaymentFailure(latest.current.failureHold, latest.current.selection) });
      setNow(Date.now()); setNotice("Your payment wasn’t completed. Retry or choose another payment option while your appointment time is reserved.");
      setPaymentOutcome("success");
    } else await finish(true);
  };
  const setPayment = (payment: PaymentChoice) => {
    if (busy || committing.current || reviewing.current || latest.current.receipt || !authenticated.current || (payment === "hospital" && latest.current.selection.mode !== "hospital")) return;
    update({ ...latest.current, payment });
  };
  const backToSlots = async () => {
    if (busy || committing.current || reviewing.current || latest.current.receipt) return;
    reviewing.current = true; setBusy(true);
    const current = latest.current;
    const next: Design20Draft = { ...current, stage: current.identity && current.selectedPatientId ? "appointment" : "patient" };
    update(next); changePhase("slots"); setNotice("");
    const saved = await saveDesign20Draft(next);
    setRecoveryUnavailable(!saved);
    if (!options.inline) router.push(design20InlineUrl(next, returnTo), { scroll: false });
    setBusy(false); reviewing.current = false;
  };
  const startAgain = async () => {
    committing.current = false;
    const next: Design20Draft = { ...latest.current, stage: "patient", selectedPatientId: null,
      selection: { ...latest.current.selection, time: "" }, receipt: null, failureHold: null, discountCode: undefined, sponsorshipId: undefined, useHealthCredits: undefined };
    await saveDesign20Draft(next); update(next); changePhase("slots"); setNotice("");
    if (!options.inline) router.push(design20InlineUrl(next, returnTo));
  };
  const finishLater = async () => { await saveDesign20Draft(latest.current); router.push(returnTo); };
  const expireFailureHold = () => {
    const current = latest.current;
    if (!current.failureHold) return;
    const duration = current.failureHold.expiresAt - current.failureHold.createdAt;
    const expiresAt = Date.now() - 1;
    update({ ...current, failureHold: { ...current.failureHold, createdAt: expiresAt - duration, expiresAt } }); setNow(Date.now());
  };
  const setLoginOpen = (open: boolean) => {
    // Direct summary/confirmation links may need authentication before a valid
    // time can be recovered or edited. Only the listing card gates login on a slot.
    if (open && !options.inline && loaded) { changePhase("auth"); setNotice(""); }
    else if (open) continueBooking();
    // The shared dialog closes after its success callback. Do not undo the
    // member phase that onSignedIn has just opened.
    else if (currentPhase.current === "auth") cancelSignIn();
  };
  return { draft, loaded, phase, isUserLoggedIn, loginOpen: phase === "auth", setLoginOpen, busy, now, notice, recoveryUnavailable, missingReceipt, returnTo,
    continueBooking, cancelSignIn, onSignedIn, go, backToSlots, selectPatient, addPatient, selectTime, saveAppointment, reviewAppointment, setPayment, submitReview, closePayment, applyDiscount, applySponsorship, setUseHealthCredits, pay,
    startAgain, finishLater, expireFailureHold, paymentOutcome, setPaymentOutcome,
    expired: failureHoldExpired(draft.failureHold, draft.selection, now), seconds: remainingHoldSeconds(draft.failureHold, now) };
}
