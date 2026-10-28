"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import type Lenis from "lenis";
import { ArrowRight, Mail, ShieldCheck, Smartphone, X } from "lucide-react";
import { authContactError, isValidVerificationCode, normalizeAuthIdentity, type AuthIdentity } from "./auth";
import styles from "./LoginDialog.module.css";

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (identity: AuthIdentity) => void;
};

export default function LoginDialog({ open, onClose, onSuccess }: LoginDialogProps) {
  // A new opening starts a fresh session; contact details never leave memory.
  return open ? <LoginSession onClose={onClose} onSuccess={onSuccess} /> : null;
}

function LoginSession({ onClose, onSuccess }: Omit<LoginDialogProps, "open">) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const backdropPress = useRef(false);
  const completed = useRef(false);
  const [method, setMethod] = useState<AuthIdentity["method"]>("mobile");
  const [contacts, setContacts] = useState({ mobile: "", email: "" });
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resends, setResends] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    if (!dialog.open) dialog.showModal();
    if (scrollbar > 0) body.style.paddingRight = `${Number.parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    contactRef.current?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      if (!wasStopped) lenis?.start();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (identity) codeRef.current?.focus({ preventScroll: true });
    else contactRef.current?.focus({ preventScroll: true });
  }, [identity]);

  function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextIdentity = normalizeAuthIdentity(method, contacts[method]);
    if (!nextIdentity) {
      setError(authContactError(method, contacts[method]) ?? "Check your contact details.");
      contactRef.current?.focus();
      return;
    }
    setError("");
    setCode("");
    setResends(0);
    setIdentity(nextIdentity);
  }

  function verifyCode(value: string) {
    if (!identity || completed.current) return;
    if (!isValidVerificationCode(value)) {
      setError(value.length < 6 ? "Enter all 6 digits of the verification code." : "That code isn’t correct. Check it and try again.");
      codeRef.current?.focus();
      codeRef.current?.select();
      return;
    }
    completed.current = true;
    setError("");
    onSuccess({ ...identity });
  }

  function changeContact() {
    setIdentity(null);
    setCode("");
    setError("");
    setResends(0);
  }

  const contactLabel = identity?.method === "mobile" ? `+91 ${identity.value}` : identity?.value;

  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} data-lenis-prevent
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onPointerDown={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      backdropPress.current = event.target === event.currentTarget &&
        (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
    }}
    onClick={(event) => {
      if (event.target === event.currentTarget && backdropPress.current) onClose();
      backdropPress.current = false;
    }}>
    <div className={styles.content}>
      <header className={styles.header}>
        <span className={styles.mark}><ShieldCheck size={24} aria-hidden /></span>
        <button className={styles.close} type="button" onClick={onClose} aria-label="Close sign in"><X size={20} aria-hidden /></button>
      </header>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Your care, connected</p>
        <h2 id={`${id}-title`}>{identity ? "Enter verification code" : "Sign in to book"}</h2>
        <p id={`${id}-description`}>{identity ? "Enter the 6-digit code to continue with your account." : "Use your mobile number or email to continue."}</p>
      </div>

      {!identity ? <form className={styles.form} noValidate onSubmit={requestCode}>
        <fieldset className={styles.method}>
          <legend className={styles.srOnly}>Sign in with</legend>
          {(["mobile", "email"] as const).map((option) => <label key={option} className={styles.methodChoice} data-selected={method === option || undefined}>
            <input type="radio" name={`${id}-method`} value={option} checked={method === option} onChange={() => { setMethod(option); setError(""); }} />
            {option === "mobile" ? <Smartphone size={17} aria-hidden /> : <Mail size={17} aria-hidden />}
            <span>{option === "mobile" ? "Mobile" : "Email"}</span>
          </label>)}
        </fieldset>
        <div className={styles.field}>
          <label htmlFor={`${id}-contact`}>{method === "mobile" ? "Mobile number" : "Email address"}</label>
          <div className={styles.contactControl} data-invalid={Boolean(error) || undefined}>
            {method === "mobile" && <span className={styles.prefix}>+91</span>}
            <input ref={contactRef} id={`${id}-contact`} type={method === "mobile" ? "tel" : "email"} inputMode={method === "mobile" ? "tel" : "email"}
              autoComplete={method === "mobile" ? "tel-national" : "email"} autoCapitalize="none" spellCheck={false} required
              maxLength={method === "mobile" ? 24 : 160} placeholder={method === "mobile" ? "10-digit mobile number" : "name@example.com"}
              value={contacts[method]} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => { setContacts((previous) => ({ ...previous, [method]: event.target.value })); setError(""); }} />
          </div>
        </div>
        {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
        <button className={styles.primary} type="submit">Send OTP<ArrowRight size={18} aria-hidden /></button>
      </form> : <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); verifyCode(code); }}>
        <div className={styles.contactSummary}>
          <div><span>{identity.method === "mobile" ? "Mobile number" : "Email address"}</span><strong>{contactLabel}</strong></div>
          <button className={styles.textButton} type="button" onClick={changeContact} aria-label={`Change ${identity.method === "mobile" ? "mobile number" : "email address"}`}>Change</button>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-code`}>Verification code</label>
          <input ref={codeRef} id={`${id}-code`} className={styles.code} type="text" inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6}" maxLength={6} required value={code} aria-invalid={Boolean(error)} aria-describedby={`${id}-code-hint${error ? ` ${id}-error` : ""}`}
            onChange={(event) => {
              const nextCode = event.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(nextCode);
              setError("");
              if (nextCode.length === 6) verifyCode(nextCode);
            }} />
          <p id={`${id}-code-hint`} className={styles.hint}>Verification continues automatically after 6 digits.</p>
        </div>
        {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
        <button className={styles.primary} type="submit">Verify &amp; continue<ArrowRight size={18} aria-hidden /></button>
        <div className={styles.resend}>
          <span>Need another code?</span>
          <button className={styles.textButton} type="button" onClick={() => { setCode(""); setError(""); setResends((count) => count + 1); codeRef.current?.focus(); }}>Resend OTP</button>
        </div>
        <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{resends > 0 ? `Code entry reset. Enter your latest 6-digit verification code. Request ${resends}.` : ""}</p>
      </form>}
    </div>
  </dialog>;
}
