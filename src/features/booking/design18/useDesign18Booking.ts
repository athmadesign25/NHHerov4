"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection, PatientDraft, PaymentChoice } from "../design7/model";
import { remainingHoldSeconds, sameSelection } from "../design7/model";
import type { AuthIdentity } from "../design15/auth";
import { failureHoldExpired, holdAfterPaymentFailure, patientErrors, type Design15Draft, type Design15Step } from "../design15/model";
import { confirmDesign17, design17Available, design17RequestedSelection } from "../design17/model";
import { normalizeDiscountCode } from "../design17/pricing";
import { design17Patients } from "../design17/patients";
import { loadDesign18Draft, rememberDesign18Draft, saveDesign18Draft } from "./draft";
import { design18ChangedSelection, design18ContinuePhase, design18FlowUrl, design18InlineUrl, design18ListingReturnTo, design18SafeStep, type Design18Phase } from "./model";

const ACCOUNT: AuthIdentity = { method: "email", value: "signed-in@nh.example" };
export interface Design18BookingOptions {
  initialSelection?: AppointmentSelection;
  returnTo: string;
  inline?: boolean;
  confirmationRef?: string;
}

export default function useDesign18Booking(doctor: BookingDoctorSummary, options: Design18BookingOptions) {
  const params = useSearchParams();
  const router = useRouter();
  const returnTo = design18ListingReturnTo(options.returnTo);
  const { isUserLoggedIn } = useAuthState();
  const [authReady, setAuthReady] = useState(false);
  const authenticated = useRef(isUserLoggedIn);
  const initial = useRef({ query: params.toString(), selection: options.initialSelection });
  const [draft, setDraft] = useState<Design15Draft>(() => {
    const query = new URLSearchParams(params.toString());
    if (options.initialSelection) {
      query.set("mode", options.initialSelection.mode);
      query.set("hospital", options.initialSelection.hospital);
      query.set("date", options.initialSelection.date);
    }
    return { version: 1, doctorId: doctor.id, identity: null, patients: [], selectedPatientId: null,
      selection: design17RequestedSelection(doctor, query), stage: "patient", payment: "online", failureHold: null, receipt: null };
  });
  const latest = useRef(draft);
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<Design18Phase>("slots");
  const currentPhase = useRef<Design18Phase>("slots");
  const [busy, setBusy] = useState(false);
  const committing = useRef(false);
  const reviewing = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState("");
  const [paymentOutcome, setPaymentOutcome] = useState<"success" | "failure">("success");
  const [recoveryUnavailable, setRecoveryUnavailable] = useState(false);
  const [missingReceipt, setMissingReceipt] = useState(false);
  const update = (next: Design15Draft) => { latest.current = next; rememberDesign18Draft(next); setDraft(next); };
  const changePhase = (next: Design18Phase) => { currentPhase.current = next; setPhase(next); };

  // useAuthState reads this tab's session in its mount effect. Wait for that
  // first render update before restoring an immediately available memory draft.
  useEffect(() => { setAuthReady(true); }, []);
  useEffect(() => { authenticated.current = isUserLoggedIn; }, [isUserLoggedIn]);
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    void loadDesign18Draft(doctor.id).then(saved => {
      if (cancelled) return;
      const query = new URLSearchParams(initial.current.query);
      const requested = latest.current.selection;
      const sameContext = saved && saved.selection.mode === requested.mode && saved.selection.hospital === requested.hospital &&
        (!query.get("date") || saved.selection.date === requested.date);
      let next = latest.current;
      if (options.confirmationRef !== undefined) {
        if (saved?.receipt?.ref === options.confirmationRef) next = saved;
        else setMissingReceipt(true);
      } else if (saved && sameContext && !saved.receipt) {
        next = { ...saved, stage: options.inline ? "patient" : design18SafeStep(query.get("step") ?? saved.stage, saved, authenticated.current) };
      } else if (saved && authenticated.current) {
        next = { ...next, identity: saved.identity, patients: saved.patients, selectedPatientId: saved.selectedPatientId };
      }
      if (!authenticated.current && !next.receipt) next = { ...next, identity: null, patients: [], selectedPatientId: null, stage: "patient", failureHold: null };
      if (authenticated.current && !next.identity) next = { ...next, identity: ACCOUNT, patients: design17Patients(ACCOUNT) };
      if (next.identity && !next.receipt) next = { ...next, patients: design17Patients(next.identity, next.patients) };
      if (!next.receipt && next.selection.time && (!design17Available(next.selection) || failureHoldExpired(next.failureHold, next.selection))) {
        next = { ...next, selection: { ...next.selection, time: "" }, failureHold: null, stage: "patient" };
        setNotice("That time is no longer available. Choose another time; your other selections are kept.");
      }
      if (next.identity && next.selectedPatientId && next.stage === "patient") next = { ...next, stage: "appointment" };
      update(next);
      if (authenticated.current && next.selection.time) changePhase("member");
      setLoaded(true); setNow(Date.now());
    });
    return () => { cancelled = true; };
  }, [authReady, doctor.id, options.confirmationRef, options.inline]);

  useEffect(() => {
    if (!loaded) return;
    const current = latest.current;
    if (!isUserLoggedIn) {
      if (current.identity && !current.receipt) update({ ...current, identity: null, patients: [], selectedPatientId: null, stage: "patient", failureHold: null });
      return;
    }
    if (!current.identity) update({ ...current, identity: ACCOUNT, patients: design17Patients(ACCOUNT), stage: "patient" });
    // Signing in elsewhere never opens the auth surface; only explicit continuation does.
    if (currentPhase.current === "auth") changePhase("member");
  }, [loaded, isUserLoggedIn]);
  useEffect(() => {
    if (loaded && !missingReceipt) void saveDesign18Draft(draft).then(saved => setRecoveryUnavailable(!saved));
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
      update({ ...current, stage: design18SafeStep(new URLSearchParams(window.location.search).get("step"), current, authenticated.current) });
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
    const sameAccount = current.identity?.method === identity.method && current.identity.value === identity.value;
    update({ ...current, identity, patients: design17Patients(identity, sameAccount ? current.patients : []),
      selectedPatientId: sameAccount ? current.selectedPatientId : null, stage: "patient" });
    changePhase("member");
    setNotice(design17Available(current.selection) ? "" : "That time is no longer available. Choose another time; you’re still signed in.");
    if (!design17Available(current.selection)) changePhase("slots");
  };

  const go = (stage: Design15Step, changes: Partial<Design15Draft> = {}) => {
    if (committing.current || reviewing.current) return;
    let next = { ...latest.current, ...changes, stage };
    if (stage === "appointment" || stage === "patient") {
      next = { ...next, stage: authenticated.current && next.selectedPatientId ? "appointment" : "patient" };
      update(next); changePhase("slots"); setNotice("");
      if (!options.inline) void saveDesign18Draft(next).then(() => router.push(design18InlineUrl(next, returnTo)));
      return;
    }
    if (!authenticated.current) { changePhase("auth"); return; }
    if (!next.selectedPatientId) { changePhase("member"); return; }
    update(next); setNotice("");
    window.history.pushState(null, "", design18FlowUrl(next, returnTo));
  };

  const selectPatient = (id: string) => {
    if (authenticated.current && latest.current.patients.some(patient => patient.id === id)) {
      update({ ...latest.current, selectedPatientId: id, stage: "appointment" });
      setNotice("");
    }
  };
  const addPatient = (patient: PatientDraft) => {
    const current = latest.current;
    if (!authenticated.current || !current.identity || current.patients.length >= 10 || Object.keys(patientErrors(patient, current.identity)).length) return;
    const id = crypto.randomUUID();
    update({ ...current, patients: [...current.patients, { id, patient }], selectedPatientId: id, stage: "appointment" });
    setNotice("");
  };
  const selectTime = (incoming: AppointmentSelection) => {
    if (!loaded || busy || committing.current || incoming.doctorId !== doctor.id) return;
    const current = latest.current;
    const selection = design18ChangedSelection(current.selection, incoming);
    if (selection.time && !design17Available(selection)) { setNotice("That time is no longer available. Choose another time."); return; }
    const failureHold = current.failureHold && sameSelection(current.failureHold.selection, selection) ? current.failureHold : null;
    if (failureHoldExpired(failureHold, selection)) { setNotice("That reservation has expired. Choose another time."); return; }
    update({ ...current, stage: authenticated.current && current.selectedPatientId ? "appointment" : "patient", selection, failureHold,
      receipt: null, payment: selection.mode === "video" ? "online" : current.payment });
    // Keep the listing URL and scroll position stable while the visitor explores slots.
    if (currentPhase.current === "auth") changePhase("slots");
    setNotice(""); setNow(Date.now());
  };
  const validSlot = () => {
    const current = latest.current;
    if (design18ContinuePhase(current, authenticated.current) === "slots") {
      changePhase("slots"); setNotice("Choose an available time to continue. Your other selections are kept."); return false;
    }
    return true;
  };
  const ready = () => {
    if (!validSlot()) return false;
    if (!authenticated.current) { changePhase("auth"); return false; }
    if (!latest.current.selectedPatientId) { changePhase("member"); setNotice("Choose a member to continue."); return false; }
    return true;
  };
  const reviewAppointment = async () => {
    if (busy || committing.current || reviewing.current || !ready()) return;
    reviewing.current = true; setBusy(true);
    const next: Design15Draft = { ...latest.current, stage: "review" };
    const saved = await saveDesign18Draft(next);
    setRecoveryUnavailable(!saved);
    update(next); setNotice("");
    if (options.inline) {
      // Back from review must reopen the choices the user actually made, even if
      // they changed the hospital or date after entering from the doctor card.
      window.history.replaceState(null, "", design18InlineUrl(next, returnTo));
      router.push(design18FlowUrl(next, returnTo));
    }
    else window.history.pushState(null, "", design18FlowUrl(next, returnTo));
    setBusy(false); reviewing.current = false;
  };
  const continueBooking = () => {
    if (!loaded || busy || committing.current || !validSlot()) return;
    const nextPhase = design18ContinuePhase(latest.current, authenticated.current);
    if (nextPhase === "auth") { changePhase("auth"); setNotice(""); return; }
    if (currentPhase.current !== "member" || !latest.current.selectedPatientId) {
      changePhase("member"); setNotice(""); return;
    }
    void reviewAppointment();
  };
  const finish = async (paid: boolean) => {
    if (committing.current || !ready()) return;
    const receipt = confirmDesign17(latest.current, authenticated.current, paid);
    if (!receipt) return;
    committing.current = true; setBusy(true);
    const next: Design15Draft = { ...latest.current, receipt, failureHold: null, stage: "confirmation" };
    const saved = await saveDesign18Draft(next);
    setRecoveryUnavailable(!saved); update(next); setNotice("");
    if (saved) router.replace(design18FlowUrl(next, returnTo));
    setBusy(false);
  };
  const submitReview = async (payment: PaymentChoice = latest.current.payment) => {
    if (busy || committing.current || !ready() || latest.current.stage !== "review") return;
    if (payment === "hospital" && latest.current.selection.mode !== "hospital") return;
    update({ ...latest.current, payment });
    if (payment === "hospital") await finish(false);
    else go("payment");
  };
  const applyDiscount = (code: string): boolean => {
    if (!authenticated.current || busy || committing.current || latest.current.stage !== "review") return false;
    const discountCode = code.trim() ? normalizeDiscountCode(code) : undefined;
    if (discountCode === null) return false;
    update({ ...latest.current, discountCode }); return true;
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
    if (!authenticated.current || (payment === "hospital" && latest.current.selection.mode !== "hospital")) return;
    update({ ...latest.current, payment });
  };
  const startAgain = async () => {
    committing.current = false;
    const next: Design15Draft = { ...latest.current, stage: "patient", selectedPatientId: null,
      selection: { ...latest.current.selection, time: "" }, receipt: null, failureHold: null, discountCode: undefined };
    await saveDesign18Draft(next); update(next); changePhase("slots"); setNotice("");
    if (!options.inline) router.push(design18InlineUrl(next, returnTo));
  };
  const finishLater = async () => { await saveDesign18Draft(latest.current); router.push(returnTo); };
  const expireFailureHold = () => {
    const current = latest.current;
    if (!current.failureHold) return;
    const duration = current.failureHold.expiresAt - current.failureHold.createdAt;
    const expiresAt = Date.now() - 1;
    update({ ...current, failureHold: { ...current.failureHold, createdAt: expiresAt - duration, expiresAt } }); setNow(Date.now());
  };
  const setLoginOpen = (open: boolean) => { if (open) continueBooking(); else cancelSignIn(); };
  return { draft, loaded, phase, isUserLoggedIn, loginOpen: phase === "auth", setLoginOpen, busy, now, notice, recoveryUnavailable, missingReceipt, returnTo,
    continueBooking, cancelSignIn, onSignedIn, go, selectPatient, addPatient, selectTime, reviewAppointment, setPayment, submitReview, applyDiscount, pay,
    startAgain, finishLater, expireFailureHold, paymentOutcome, setPaymentOutcome,
    expired: failureHoldExpired(draft.failureHold, draft.selection, now), seconds: remainingHoldSeconds(draft.failureHold, now) };
}
