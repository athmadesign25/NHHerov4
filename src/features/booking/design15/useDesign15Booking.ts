"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Design15Variant } from "@/features/design-preview/journeyDesigns";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection, PatientDraft, PaymentChoice } from "../design7/model";
import { HOLD_DURATION_MS, holdIsActive, remainingHoldSeconds, sameSelection } from "../design7/model";
import { availableSelection, quickStepUrl, requestedSelection } from "../design13/selection";
import type { AuthIdentity } from "./auth";
import { confirmDesign15, failureHoldExpired, holdAfterPaymentFailure, patientErrors, patientsForIdentity, type Design15Draft, type Design15Step } from "./model";
import { loadDesign15Draft, saveDesign15Draft } from "./draft";

function stepUrl(current: string, draft: Design15Draft, variant: Design15Variant): string {
  const url = new URL(quickStepUrl(current, draft.selection, "appointment", draft.receipt?.ref, variant), new URL(current).origin);
  url.searchParams.set("step", draft.stage);
  return `${url.pathname}${url.search}`;
}
function safeStep(step: string | null, draft: Design15Draft): Design15Step {
  if (!draft.identity || !draft.selectedPatientId) return "patient";
  if (draft.receipt) return "confirmation";
  if (step === "patient") return "patient";
  if (!draft.selection.time || step === "appointment") return "appointment";
  if (step === "payment" && draft.payment === "online" && !failureHoldExpired(draft.failureHold, draft.selection)) return "payment";
  return "review";
}

export default function useDesign15Booking(doctor: BookingDoctorSummary, variant: Design15Variant) {
  const params = useSearchParams();
  const initial = useRef({ doctor, query: params.toString() });
  const currentVariant = useRef(variant);
  const route = useRef("");
  const [draft, setDraft] = useState<Design15Draft>({ version: 1, doctorId: doctor.id, identity: null, patients: [], selectedPatientId: null,
    selection: { doctorId: doctor.id, mode: "hospital", hospital: doctor.hospital, date: "", time: "" }, payment: "online", failureHold: null, receipt: null, stage: "patient" });
  const latest = useRef(draft);
  const [loaded, setLoaded] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const committing = useRef(false);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [recoveryUnavailable, setRecoveryUnavailable] = useState(false);
  const [paymentOutcome, setPaymentOutcome] = useState<"success" | "failure">("success");

  const update = (next: Design15Draft) => { latest.current = next; setDraft(next); };
  const sync = (next: Design15Draft, replace = false) => window.history[replace ? "replaceState" : "pushState"](null, "", stepUrl(window.location.href, next, currentVariant.current));
  const go = (stage: Design15Step, changes: Partial<Design15Draft> = {}, replace = false) => {
    const next = { ...latest.current, ...changes, stage }; update(next); sync(next, replace);
  };
  useEffect(() => { currentVariant.current = variant; }, [variant]);
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const { doctor, query: raw } = initial.current;
      const query = new URLSearchParams(raw);
      const time = Date.now();
      route.current = window.location.pathname;
      const requested = { ...requestedSelection(doctor, query, time), time: "" };
      let saved: Design15Draft | null = null;
      try { saved = await loadDesign15Draft(doctor.id, requested); } catch { if (!cancelled) setRecoveryUnavailable(true); }
      if (cancelled) return;
      let next: Design15Draft = { ...latest.current, selection: requested };
      if (saved) {
        next = saved;
        const receiptRequested = saved.receipt && query.get("receipt") === saved.receipt.ref;
        const cityKey = (value: string) => value.toLowerCase().replace("bengaluru", "bangalore").replace("gurugram", "gurgaon");
        const requestedCity = query.get("city");
        const savedCity = doctor.locations?.find(location => location.name === saved.selection.hospital)?.city;
        const contextChanged = (query.has("mode") && requested.mode !== saved.selection.mode) ||
          (query.has("hospital") && requested.hospital !== saved.selection.hospital) ||
          Boolean(requestedCity && savedCity && cityKey(requestedCity) !== cityKey(savedCity));
        if ((saved.receipt && !receiptRequested) || contextChanged) {
          next = { ...saved, selection: requested, receipt: null, failureHold: null, payment: "online", stage: saved.selectedPatientId ? "appointment" : "patient" };
        } else if (!saved.receipt && saved.selection.time && !availableSelection(saved.selection, time)) {
          next = { ...saved, selection: { ...requested, time: "" }, failureHold: null, stage: saved.selectedPatientId ? "appointment" : "patient" };
          setNotice("That appointment time is no longer available. Choose another time; your patient details are ready.");
        } else next = { ...saved, stage: safeStep(query.get("step") ?? saved.stage, saved) };
      }
      update(next); sync(next, true); setNow(time); setLoaded(true); setLoginOpen(!next.identity);
    };
    void restore();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    void saveDesign15Draft(draft).then(saved => { if (!saved) setRecoveryUnavailable(true); });
  }, [loaded, draft]);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  useEffect(() => {
    const pop = () => {
      if (window.location.pathname !== route.current) return;
      const current = latest.current;
      const next = { ...current, stage: safeStep(new URL(window.location.href).searchParams.get("step"), current) };
      update(next); sync(next, true);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);

  const login = (identity: AuthIdentity) => {
    const current = latest.current;
    const unchanged = current.identity?.method === identity.method && current.identity.value.toLowerCase() === identity.value.toLowerCase();
    if (unchanged) update({ ...current, identity });
    else go("patient", { identity, patients: patientsForIdentity(identity), selectedPatientId: null,
      selection: { ...current.selection, time: "" }, failureHold: null, receipt: null });
    setLoginOpen(false); setNotice("");
  };
  const selectPatient = (id: string) => {
    if (latest.current.patients.some(entry => entry.id === id)) update({ ...latest.current, selectedPatientId: id });
  };
  const addPatient = (patient: PatientDraft) => {
    const current = latest.current;
    if (!current.identity || current.patients.length >= 10 || Object.keys(patientErrors(patient, current.identity)).length) return;
    const entry = { id: crypto.randomUUID(), patient };
    update({ ...current, patients: [...current.patients, entry], selectedPatientId: entry.id });
  };
  const continuePatient = () => {
    if (!latest.current.identity || !latest.current.selectedPatientId) return;
    go(latest.current.selection.time ? "review" : "appointment"); setNotice("");
  };
  const selectTime = (selection: AppointmentSelection) => {
    if (!latest.current.identity || !latest.current.selectedPatientId) { go("patient"); return; }
    if (!availableSelection(selection)) { setNotice("That time is no longer available. Please choose another."); return; }
    // An explicit time selection starts a fresh checkout, without a reservation.
    const previous = latest.current.failureHold;
    const failureHold = previous && sameSelection(previous.selection, selection) && holdIsActive(previous, selection) ? previous : null;
    go("review", { selection, failureHold, receipt: null, payment: selection.mode === "video" ? "online" : latest.current.payment });
    setNotice(""); committing.current = false;
  };
  const ensureReady = () => {
    const current = latest.current;
    const patient = current.patients.find(entry => entry.id === current.selectedPatientId)?.patient;
    if (!current.identity || !patient || Object.keys(patientErrors(patient, current.identity)).length) { go("patient"); return false; }
    if (failureHoldExpired(current.failureHold, current.selection) || !availableSelection(current.selection)) {
      setNotice("Choose another appointment time to continue. Your patient details are kept."); go("appointment"); return false;
    }
    return true;
  };
  const finish = async (paid: boolean) => {
    if (committing.current || busy || !ensureReady()) return;
    const current = latest.current;
    const receipt = confirmDesign15(current, paid, availableSelection(current.selection));
    if (!receipt) return;
    committing.current = true; setBusy(true);
    const next: Design15Draft = { ...current, receipt, failureHold: null, stage: "confirmation" };
    if (!await saveDesign15Draft(next)) setRecoveryUnavailable(true);
    update(next); sync(next, true); setBusy(false); setNotice("");
  };
  const submitReview = async () => {
    if (busy || committing.current || !ensureReady()) return;
    if (latest.current.payment === "hospital") { await finish(false); return; }
    go("payment"); setNotice("");
  };
  const pay = async () => {
    if (busy || committing.current || !ensureReady()) return;
    if (paymentOutcome === "failure") {
      const current = latest.current;
      go("review", { failureHold: holdAfterPaymentFailure(current.failureHold, current.selection) });
      setNow(Date.now()); setNotice("Your payment wasn’t completed. You can retry while your appointment time is reserved.");
      return;
    }
    await finish(true);
  };
  const setPayment = (payment: PaymentChoice) => {
    if (payment === "hospital" && latest.current.selection.mode !== "hospital") return;
    update({ ...latest.current, payment });
  };
  const flush = async () => { if (!await saveDesign15Draft(latest.current)) setRecoveryUnavailable(true); };
  const cancelReceipt = () => {
    const current = latest.current;
    if (current.receipt) update({ ...current, receipt: { ...current.receipt, status: "cancelled" } });
  };
  const newAppointment = () => {
    committing.current = false;
    go("appointment", { selection: { ...latest.current.selection, time: "" }, failureHold: null, receipt: null });
  };
  const expired = failureHoldExpired(draft.failureHold, draft.selection, now);
  const expireFailureHold = () => {
    const current = latest.current;
    if (!current.failureHold) return;
    const time = Date.now();
    update({ ...current, failureHold: { ...current.failureHold, createdAt: time - HOLD_DURATION_MS - 1, expiresAt: time - 1 } }); setNow(time);
  };
  return { draft, loaded, busy, now, notice, recoveryUnavailable, loginOpen, setLoginOpen, login,
    selectPatient, addPatient, continuePatient, selectTime, setPayment, submitReview, pay, flush, cancelReceipt, newAppointment,
    go, expired, seconds: remainingHoldSeconds(draft.failureHold, now), paymentOutcome, setPaymentOutcome, expireFailureHold };
}
