"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection, PatientDraft, PaymentChoice } from "../design7/model";
import { remainingHoldSeconds, sameSelection } from "../design7/model";
import { failureHoldExpired, holdAfterPaymentFailure, patientErrors, type Design15Draft, type Design15Step } from "../design15/model";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { design17ListingReturnTo, type Design17Variant } from "@/features/search/design17Navigation";
import { confirmDesign17, design17Available, design17FlowUrl, design17RequestedSelection, design17SafeStep } from "./model";
import { normalizeDiscountCode } from "./pricing";
import { design17Patients } from "./patients";
import { loadDesign17Draft, saveDesign17Draft } from "./draft";

// The shared login supplies a session flag, not a patient/account API. This opaque
// fixture identity is never displayed as the user's email or saved in the browser.
const ACCOUNT = { method: "email" as const, value: "signed-in@nh.example" };

export default function useDesign17Booking(doctor: BookingDoctorSummary, design: Design17Variant, confirmationRef?: string) {
  const params = useSearchParams();
  const router = useRouter();
  const returnTo = design17ListingReturnTo(params.get("returnTo"), design);
  const { isUserLoggedIn } = useAuthState();
  const authenticated = useRef(isUserLoggedIn);
  useEffect(() => { authenticated.current = isUserLoggedIn; }, [isUserLoggedIn]);
  const initial = useRef(params.toString());
  const [draft, setDraft] = useState<Design15Draft>(() => ({ version: 1, doctorId: doctor.id, identity: null, patients: [], selectedPatientId: null,
    selection: design17RequestedSelection(doctor, new URLSearchParams(params.toString())), stage: "patient", payment: "online", failureHold: null, receipt: null }));
  const latest = useRef(draft);
  const [loaded, setLoaded] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const committing = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState("");
  const [paymentOutcome, setPaymentOutcome] = useState<"success" | "failure">("success");
  const [recoveryUnavailable, setRecoveryUnavailable] = useState(false);
  const [missingReceipt, setMissingReceipt] = useState(false);
  const update = (next: Design15Draft) => { latest.current = next; setDraft(next); };
  const sync = (next: Design15Draft, replace = false) => {
    const url = design17FlowUrl(next, design, returnTo);
    if (next.receipt || confirmationRef !== undefined) router[replace ? "replace" : "push"](url);
    else window.history[replace ? "replaceState" : "pushState"](null, "", url);
  };
  const go = (stage: Design15Step, changes: Partial<Design15Draft> = {}) => {
    if (!authenticated.current || committing.current) { setLoginOpen(true); return; }
    const next = { ...latest.current, ...changes, stage };
    // Both persisted states render the same appointment screen. Keep the shared
    // draft schema's patient state until a patient has actually been selected.
    if (next.stage === "appointment" && !next.selectedPatientId) next.stage = "patient";
    update(next); sync(next); setNotice("");
  };

  useEffect(() => {
    let cancelled = false;
    void loadDesign17Draft(doctor.id).then(saved => {
      if (cancelled) return;
      const query = new URLSearchParams(initial.current);
      const requested = latest.current.selection;
      const sameContext = saved && saved.selection.mode === requested.mode && saved.selection.hospital === requested.hospital &&
        (!query.get("date") || saved.selection.date === requested.date);
      let next = latest.current;
      if (confirmationRef !== undefined) {
        if (saved?.receipt?.ref === confirmationRef) next = saved;
        else setMissingReceipt(true);
      } else if (saved && sameContext && !saved.receipt) {
        next = { ...saved, stage: design17SafeStep(query.get("step") ?? saved.stage, saved, authenticated.current) };
      } else if (saved) next = { ...next, identity: saved.identity, patients: saved.patients, selectedPatientId: saved.selectedPatientId };
      if (authenticated.current && !next.identity) next = { ...next, identity: ACCOUNT, patients: design17Patients(ACCOUNT) };
      if (next.identity && !next.receipt) next = { ...next, patients: design17Patients(next.identity, next.patients) };
      update(next); setLoaded(true); setNow(Date.now());
    });
    return () => { cancelled = true; };
  }, [doctor.id, confirmationRef]);

  useEffect(() => {
    if (!loaded) return;
    if (!isUserLoggedIn) { setLoginOpen(true); return; }
    setLoginOpen(false);
    if (!latest.current.identity) update({ ...latest.current, identity: ACCOUNT, patients: design17Patients(ACCOUNT), stage: "patient" });
  }, [loaded, isUserLoggedIn]);
  useEffect(() => {
    if (loaded && isUserLoggedIn && !missingReceipt) void saveDesign17Draft(draft).then(saved => setRecoveryUnavailable(!saved));
  }, [draft, loaded, isUserLoggedIn, missingReceipt]);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = draft.failureHold ? window.setInterval(refresh, 1000) : undefined;
    window.addEventListener("focus", refresh);
    return () => { if (timer) window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [draft.failureHold]);
  useEffect(() => {
    const pop = () => {
      if (!window.location.pathname.endsWith(`/doctors/${encodeURIComponent(doctor.id)}/book`)) return;
      const current = latest.current;
      update({ ...current, stage: design17SafeStep(new URLSearchParams(window.location.search).get("step"), current, authenticated.current) });
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, [doctor.id]);

  const selectPatient = (id: string) => {
    if (authenticated.current && latest.current.patients.some(patient => patient.id === id)) update({ ...latest.current, selectedPatientId: id });
  };
  const addPatient = (patient: PatientDraft) => {
    const current = latest.current;
    if (!authenticated.current || !current.identity || current.patients.length >= 10 || Object.keys(patientErrors(patient, current.identity)).length) return;
    const id = crypto.randomUUID();
    update({ ...current, patients: [...current.patients, { id, patient }], selectedPatientId: id });
  };
  const selectTime = (selection: AppointmentSelection) => {
    const current = latest.current;
    if (!authenticated.current) { setLoginOpen(true); return; }
    if (selection.time && !design17Available(selection)) { setNotice("That time is no longer available. Choose another time."); return; }
    const failureHold = current.failureHold && sameSelection(current.failureHold.selection, selection) ? current.failureHold : null;
    if (failureHoldExpired(failureHold, selection)) { setNotice("That reservation has expired. Choose another time."); return; }
    const next: Design15Draft = { ...current, stage: current.selectedPatientId ? "appointment" : "patient", selection, failureHold, receipt: null, payment: selection.mode === "video" ? "online" : current.payment };
    update(next); sync(next, true);
    setNotice("");
  };
  const reviewAppointment = () => {
    if (!latest.current.selectedPatientId) {
      setNotice("Choose a patient to continue.");
      requestAnimationFrame(() => document.getElementById("d17-patient-title")?.focus());
      return;
    }
    if (ready()) go("review");
  };
  const ready = () => {
    const current = latest.current;
    if (!authenticated.current) { setLoginOpen(true); return false; }
    if (!current.selectedPatientId) { go("patient"); return false; }
    if (!design17Available(current.selection) || failureHoldExpired(current.failureHold, current.selection)) {
      go("appointment"); setNotice("Choose an available time to continue. Your patient details are kept."); return false;
    }
    return true;
  };
  const finish = async (paid: boolean) => {
    if (committing.current || !ready()) return;
    const receipt = confirmDesign17(latest.current, authenticated.current, paid);
    if (!receipt) return;
    committing.current = true; setBusy(true);
    const next: Design15Draft = { ...latest.current, receipt, failureHold: null, stage: "confirmation" };
    const saved = await saveDesign17Draft(next);
    setRecoveryUnavailable(!saved);
    update(next); setNotice("");
    // Keep a successfully completed local journey visible if recovery storage fails.
    // Navigating to a receipt that cannot survive reload would lose that context.
    if (saved) sync(next, true);
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
    update({ ...latest.current, discountCode });
    return true;
  };
  const pay = async () => {
    if (busy || committing.current || !ready()) return;
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
    if (!authenticated.current) { setLoginOpen(true); return; }
    const next: Design15Draft = { ...latest.current, stage: "patient", selectedPatientId: null,
      selection: { ...latest.current.selection, time: "" }, receipt: null, failureHold: null, discountCode: undefined };
    await saveDesign17Draft(next);
    update(next); setNotice(""); sync(next);
  };
  const finishLater = async () => { await saveDesign17Draft(latest.current); router.push(returnTo); };
  const expireFailureHold = () => {
    const current = latest.current;
    if (!current.failureHold) return;
    const duration = current.failureHold.expiresAt - current.failureHold.createdAt;
    const expiresAt = Date.now() - 1;
    update({ ...current, failureHold: { ...current.failureHold, createdAt: expiresAt - duration, expiresAt } }); setNow(Date.now());
  };
  return { draft, loaded, isUserLoggedIn, loginOpen, setLoginOpen, busy, now, notice, recoveryUnavailable, missingReceipt, returnTo,
    go, selectPatient, addPatient, selectTime, reviewAppointment, setPayment, submitReview, applyDiscount, pay, startAgain, finishLater, expireFailureHold,
    paymentOutcome, setPaymentOutcome, expired: failureHoldExpired(draft.failureHold, draft.selection, now), seconds: remainingHoldSeconds(draft.failureHold, now) };
}
