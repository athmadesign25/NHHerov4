"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, PhoneCall, X } from "lucide-react";
import styles from "./DoctorProfileCallback.module.css";

function CallbackDialog({ doctorName, tone, onClose }: { doctorName?: string; tone: "light" | "dark"; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const doneButton = useRef<HTMLButtonElement>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [previewed, setPreviewed] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    phoneInput.current?.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (previewed) doneButton.current?.focus();
  }, [previewed]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a 10-digit mobile number.");
      phoneInput.current?.focus();
      return;
    }
    // This stakeholder preview has no callback service. Never persist the number
    // or imply that a care-team request was sent when there is no integration.
    setPhone("");
    setPreviewed(true);
  }

  return <dialog
    ref={dialog}
    className={`${styles.dialog} ${tone === "dark" ? styles.dark : ""}`}
    aria-labelledby="callback-dialog-title"
    aria-describedby="callback-dialog-description"
    data-lenis-prevent
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}
  >
    <button type="button" className={styles.close} onClick={onClose} aria-label="Close callback form"><X aria-hidden /></button>
    <span className={styles.dialogIcon} aria-hidden>{previewed ? <Check /> : <PhoneCall />}</span>
    <h2 id="callback-dialog-title">{previewed ? "Callback preview complete" : "Request a Callback"}</h2>
    {previewed ? <div className={styles.confirmation}>
      <p id="callback-dialog-description" role="status">This is a demo. No callback request was sent and your number hasn’t been saved.</p>
      <button ref={doneButton} type="button" className={styles.primaryButton} onClick={onClose}>Done</button>
    </div> : <>
      <p id="callback-dialog-description">{doctorName ? `Get help with your appointment with ${doctorName}.` : "Get help with your appointment."}</p>
      <form onSubmit={submit} noValidate className={styles.form}>
        <label htmlFor="callback-mobile">Mobile number</label>
        <div className={styles.phoneField} data-invalid={!!error}>
          <span aria-hidden>+91</span>
          <input
            ref={phoneInput}
            id="callback-mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phone}
            maxLength={10}
            required
            placeholder="Enter mobile number"
            aria-invalid={!!error}
            aria-describedby={error ? "callback-error callback-preview-note" : "callback-preview-note"}
            onChange={event => { setPhone(event.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
          />
        </div>
        {error && <p id="callback-error" className={styles.error} role="alert">{error}</p>}
        <p id="callback-preview-note" className={styles.note}>Preview only. No callback request will be sent.</p>
        <button type="submit" className={styles.primaryButton}>Request a Callback</button>
      </form>
    </>}
  </dialog>;
}

export default function DoctorProfileCallback({ doctorName, tone = "light", presentation = "default" }: { doctorName?: string; tone?: "light" | "dark"; presentation?: "default" | "editorial" | "inline" }) {
  const [open, setOpen] = useState(false);
  if (presentation === "inline") return <>
    <button type="button" className={styles.inlineRequest} onClick={() => setOpen(true)} aria-haspopup="dialog">Request a Callback<ArrowUpRight size={16} aria-hidden /></button>
    {open && <CallbackDialog doctorName={doctorName} tone={tone} onClose={() => setOpen(false)} />}
  </>;
  return <>
    <section id="profile-callback" className={`${styles.section} ${tone === "dark" ? styles.dark : ""} ${presentation === "editorial" ? styles.editorial : ""}`} aria-labelledby="profile-callback-heading">
      <div className={styles.copy}>
        <span className={styles.icon} aria-hidden><PhoneCall /></span>
        <div><h2 id="profile-callback-heading">Need help with your appointment?</h2><p>Get support choosing a location or planning your visit.</p></div>
      </div>
      <button type="button" className={styles.requestButton} onClick={() => setOpen(true)} aria-haspopup="dialog">Request a Callback{(tone === "dark" || presentation === "editorial") && <ArrowUpRight size={18} aria-hidden />}</button>
    </section>
    {open && <CallbackDialog doctorName={doctorName} tone={tone} onClose={() => setOpen(false)} />}
  </>;
}
