"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BookingDoctorSummary } from "../types";
import type { QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";
import {
  EMPTY_PATIENT, HOLD_DURATION_MS, createPreviewReceipt, getOrCreateHold, holdIsActive, remainingHoldSeconds,
  sameSelection, validatePatient, type AppointmentSelection, type PatientDraft, type PaymentChoice,
  type PreviewReceipt, type SlotHold,
} from "../design7/model";
import { loadDraft, saveDraft, type PreviewDraft } from "./draft";
import type { SavedPatient } from "../design14/patients";
import { availableSelection, quickStepUrl, readQuickStep, requestedSelection, reusableHold, shouldResumeSelection, type QuickBookingStep } from "./selection";

export default function useQuickBooking(doctor: BookingDoctorSummary, variant: QuickJourneyDesign = "d13") {
  const params = useSearchParams();
  const initialParams = useRef(params.toString());
  const initialDoctor = useRef(doctor);
  const bookingPath = useRef("");
  const currentVariant = useRef(variant);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState<QuickBookingStep>("appointment");
  const [selection, setSelection] = useState<AppointmentSelection>({ doctorId: doctor.id, mode: "hospital", hospital: doctor.hospital, date: "", time: "" });
  const [patient, setPatient] = useState<PatientDraft>({ ...EMPTY_PATIENT });
  const [savedPatients, setSavedPatients] = useState<SavedPatient[]>([]);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [payment, setPayment] = useState<PaymentChoice>("online");
  const [hold, setHold] = useState<SlotHold | null>(null);
  const [receipt, setReceipt] = useState<PreviewReceipt | null>(null);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [recoveryUnavailable, setRecoveryUnavailable] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const committing = useRef(false);
  const latest = useRef<PreviewDraft | null>(null);

  const patientProfiles = variant === "d14" ? { savedPatients: savedPatients.filter(entry => entry.patient.phone === verifiedPhone) } : {};
  const snapshot: PreviewDraft = { version: 1, selection, patient, verifiedPhone, payment, hold, receipt, ...patientProfiles };
  useEffect(() => { latest.current = snapshot; currentVariant.current = variant; });
  const syncUrl = (next: QuickBookingStep, selected: AppointmentSelection, reference?: string, replace = false) => {
    const href = quickStepUrl(window.location.href, selected, next, reference, currentVariant.current);
    window.history[replace ? "replaceState" : "pushState"](null, "", href);
  };
  const navigate = (next: QuickBookingStep, selected = selection, reference?: string, replace = false) => {
    setStage(next);
    syncUrl(next, selected, reference, replace);
  };

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const doctor = initialDoctor.current;
      const query = new URLSearchParams(initialParams.current);
      bookingPath.current = window.location.pathname;
      let saved: PreviewDraft | null = null;
      try { saved = await loadDraft(doctor.id); }
      catch { if (!cancelled) setRecoveryUnavailable(true); }
      if (cancelled) return;
      const time = Date.now();
      const requested = requestedSelection(doctor, query, time);
      const resume = !saved?.receipt && shouldResumeSelection(query.get("intent"), requested, saved?.selection);
      let selected = resume && saved ? saved.selection : requested;
      let restoredReceipt: PreviewReceipt | null = null;
      let restoredHold: SlotHold | null = null;
      let next: QuickBookingStep = "appointment";
      if (saved) {
        setPatient(saved.patient);
        setVerifiedPhone(saved.verifiedPhone);
        setSavedPatients(saved.savedPatients ?? []);
        setPayment(selected.mode === "video" ? "online" : saved.payment);
      }
      if (saved?.receipt && query.get("receipt") === saved.receipt.ref) {
        selected = saved.selection;
        restoredReceipt = saved.receipt;
        next = "confirmation";
      } else if (selected.time) {
        restoredHold = saved && !saved.receipt ? reusableHold(saved.hold, selected) : null;
        if (availableSelection(selected, time)) {
          if (!restoredHold && query.get("intent") === "slot") restoredHold = getOrCreateHold(null, selected, time);
          next = !restoredHold || query.get("intent") === "choose" || query.get("step") === "appointment" ? "appointment" : "checkout";
          if (query.get("step") === "payment" && saved && !Object.keys(validatePatient(saved.patient, saved.verifiedPhone)).length &&
            holdIsActive(restoredHold, selected, time)) next = "payment";
          if (!restoredHold && query.get("intent") !== "choose") {
            setNotice("Your previous hold could not be recovered. Your details are kept when available; select a time to start a new hold.");
          } else if (restoredHold && !holdIsActive(restoredHold, selected, time)) {
            setNotice("Your previous hold has ended. Your details are ready; choose an available time to continue.");
          }
        } else {
          setNotice("That appointment time is no longer available. Choose another time; any recovered patient details are kept.");
          selected = { ...selected, time: "" };
          restoredHold = null;
        }
      } else if (query.get("intent") === "slot" && query.has("time")) {
        setNotice("That time is no longer available. Choose another appointment below.");
      }
      if (saved && !resume && query.get("intent") === "slot" && selected.time && !sameSelection(saved.selection, selected)) {
        setNotice("Your new appointment selection is ready. Your patient details have been kept.");
      }
      setSelection(selected);
      setHold(restoredHold);
      setReceipt(restoredReceipt);
      setNow(time);
      setStage(next);
      setLoaded(true);
      syncUrl(next, selected, restoredReceipt?.ref, true);
    };
    void restore();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  useEffect(() => {
    if (!loaded || !selection.time) return;
    const draft: PreviewDraft = { version: 1, selection, patient, verifiedPhone, payment, hold, receipt,
      ...(variant === "d14" ? { savedPatients: savedPatients.filter(entry => entry.patient.phone === verifiedPhone) } : {}),
    };
    void saveDraft(draft).then(saved => { if (!saved) setRecoveryUnavailable(true); });
  }, [loaded, selection, patient, verifiedPhone, payment, hold, receipt, savedPatients, variant]);

  useEffect(() => {
    const backOrForward = () => {
      if (window.location.pathname !== bookingPath.current) return;
      const saved = latest.current;
      if (!saved) return;
      const requested = readQuickStep(new URL(window.location.href).searchParams.get("step"));
      let next = requested;
      if (requested === "confirmation" && !saved.receipt) next = saved.selection.time ? "checkout" : "appointment";
      if (requested === "payment" && (!saved.hold || !holdIsActive(saved.hold, saved.selection) ||
        Object.keys(validatePatient(saved.patient, saved.verifiedPhone)).length)) next = "checkout";
      if ((next === "checkout" || next === "payment") && !saved.selection.time) next = "appointment";
      if (saved.receipt) next = "confirmation";
      setStage(next);
      setFailed(false);
      syncUrl(next, saved.selection, saved.receipt?.ref, true);
    };
    window.addEventListener("popstate", backOrForward);
    return () => window.removeEventListener("popstate", backOrForward);
  }, []);

  const selectTime = (selected: AppointmentSelection) => {
    const time = Date.now();
    if (!availableSelection(selected, time)) {
      setNotice("That time is no longer available. Please choose another.");
      return;
    }
    // Only this explicit user action can renew an expired hold.
    const previous = hold && holdIsActive(hold, selected, time) ? hold : null;
    const nextHold = getOrCreateHold(previous, selected, time);
    setSelection(selected);
    setHold(nextHold);
    setReceipt(null);
    setFailed(false);
    setNotice("");
    setNow(time);
    committing.current = false;
    if (selected.mode === "video") setPayment("online");
    navigate("checkout", selected, undefined);
  };
  const editTime = () => { setNotice(""); setFailed(false); navigate("appointment"); };
  const keepTime = () => navigate("checkout");
  const ensureCurrentHold = () => {
    const time = Date.now();
    setNow(time);
    if (!holdIsActive(hold, selection, time) || !availableSelection(selection, time)) {
      setNotice("Your hold or appointment time has ended. Choose another time; your patient details are kept.");
      navigate("appointment");
      return false;
    }
    return true;
  };
  const finish = async (gatewaySucceeded: boolean) => {
    if (committing.current || receipt) return;
    if (Object.keys(validatePatient(patient, verifiedPhone)).length) {
      setNotice("Please check the patient details and verify the mobile number.");
      navigate("checkout");
      return;
    }
    if (!ensureCurrentHold()) return;
    const created = createPreviewReceipt(hold, selection, payment, gatewaySucceeded, availableSelection(selection), Date.now());
    if (!created) return;
    committing.current = true;
    setBusy(true);
    const saved = await saveDraft({ version: 1, selection, patient, verifiedPhone, payment, hold: null, receipt: created, ...patientProfiles });
    if (!saved) setRecoveryUnavailable(true);
    setReceipt(created);
    setHold(null);
    setFailed(false);
    setNotice("");
    setBusy(false);
    navigate("confirmation", selection, created.ref, true);
  };
  const submit = async () => {
    if (busy || committing.current || Object.keys(validatePatient(patient, verifiedPhone)).length || !ensureCurrentHold()) return;
    if (payment === "hospital") { await finish(false); return; }
    setBusy(true);
    const saved = await saveDraft({ version: 1, selection, patient, verifiedPhone, payment, hold, receipt: null, ...patientProfiles });
    if (!saved) setRecoveryUnavailable(true);
    setBusy(false);
    setFailed(false);
    setNotice("");
    navigate("payment");
  };
  const cancelPayment = () => {
    setFailed(false);
    setNotice(holdIsActive(hold, selection) ? "Payment was cancelled. Nothing was charged; your original hold continues."
      : "Payment was cancelled. Nothing was charged; choose another time because your hold has ended.");
    navigate("checkout");
  };
  const retryPayment = () => { if (ensureCurrentHold()) setFailed(false); };
  const expire = () => {
    const time = Date.now();
    setHold(value => value ? { ...value, createdAt: time - HOLD_DURATION_MS - 1, expiresAt: time - 1 } : value);
    setNow(time);
  };
  const cancelReceipt = () => {
    if (receipt) setReceipt({ ...receipt, status: "cancelled" });
  };
  const startNew = () => {
    committing.current = false;
    setReceipt(null); setHold(null); setFailed(false); setNotice("");
    const next = { ...selection, time: "" };
    setSelection(next);
    navigate("appointment", next, undefined);
  };
  const addPatient = (value: PatientDraft) => {
    if (!verifiedPhone || Object.keys(validatePatient(value, verifiedPhone)).length) return;
    setSavedPatients(profiles => {
      const ownProfiles = profiles.filter(entry => entry.patient.phone === verifiedPhone);
      return ownProfiles.length < 10 ? [...ownProfiles, { id: crypto.randomUUID(), patient: { ...value } }] : ownProfiles;
    });
  };
  const expired = Boolean(hold && !receipt && !holdIsActive(hold, selection, now));
  return {
    loaded, stage, selection, patient, verifiedPhone, payment, hold, receipt, now, notice,
    savedPatients: savedPatients.filter(entry => entry.patient.phone === verifiedPhone), addPatient,
    recoveryUnavailable, failed, busy, expired, seconds: remainingHoldSeconds(hold, now),
    setPatient, setVerifiedPhone, setPayment, selectTime, editTime, keepTime,
    submit, finish, cancelPayment, retryPayment, expire, cancelReceipt, startNew, setFailed,
  };
}
