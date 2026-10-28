"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Mail, Smartphone } from "lucide-react";
import { authContactError, isValidVerificationCode, normalizeAuthIdentity, type AuthIdentity } from "../design15/auth";
import styles from "./InlineSignIn.module.css";

interface InlineSignInProps {
  onSuccess: () => void;
  onBack: () => void;
}

function maskedContact(identity: AuthIdentity): string {
  if (identity.method === "mobile") return `+91 ••••••${identity.value.slice(-4)}`;
  const [local, domain] = identity.value.split("@");
  return `${local.slice(0, 1)}•••@${domain}`;
}

/** Inline authentication for the local Design 18 journey; contacts remain in memory. */
export default function InlineSignIn({ onSuccess, onBack }: InlineSignInProps) {
  const id = useId();
  const [method, setMethod] = useState<AuthIdentity["method"]>("mobile");
  const [contact, setContact] = useState("");
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const contactRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const verified = useRef(false);

  useEffect(() => {
    (identity ? codeRef : contactRef).current?.focus({ preventScroll: true });
  }, [identity, method]);

  function changeMethod(next: AuthIdentity["method"]) {
    if (next === method) return;
    setMethod(next);
    setContact("");
    setError("");
    setStatus("");
  }

  function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contactError = authContactError(method, contact);
    const nextIdentity = normalizeAuthIdentity(method, contact);
    if (contactError || !nextIdentity) {
      setError(contactError ?? "Check your contact details and try again.");
      contactRef.current?.focus();
      return;
    }
    setError("");
    setStatus("");
    setCode("");
    setIdentity(nextIdentity);
  }

  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (verified.current) return;
    if (!isValidVerificationCode(code)) {
      setError(code.length < 6 ? "Enter all 6 digits of your verification code." : "That code isn’t correct. Check it and try again.");
      codeRef.current?.focus();
      return;
    }
    try {
      sessionStorage.setItem("isLoggedIn", "true");
    } catch {
      setError("Sign in couldn’t be completed. Check your browser’s site storage settings and try again.");
      return;
    }
    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", "Aditya");
    } catch { /* The current tab stays signed in if persistent storage is unavailable. */ }
    verified.current = true;
    window.dispatchEvent(new Event("login-state-changed"));
    onSuccess();
  }

  function changeContact() {
    setIdentity(null);
    setCode("");
    setError("");
    setStatus("");
  }

  function resendCode() {
    setCode("");
    setError("");
    setStatus("A new verification code has been sent.");
    codeRef.current?.focus();
  }

  return (
    <section className={styles.signIn} aria-labelledby={`${id}-heading`}>
      <button className={styles.back} type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" /> Back to appointment
      </button>
      <header className={styles.heading}>
        <h3 id={`${id}-heading`}>{identity ? "Verify your details" : "Sign in to continue"}</h3>
        <p>{identity ? `Enter the 6-digit code sent to ${maskedContact(identity)}.` : "Your appointment choices stay with you. Sign in to select a member."}</p>
      </header>

      {!identity ? (
        <form className={styles.form} onSubmit={requestCode} noValidate>
          <div className={styles.methods} role="group" aria-label="Sign-in method">
            <button type="button" aria-pressed={method === "mobile"} onClick={() => changeMethod("mobile")}>
              <Smartphone aria-hidden="true" /> Mobile number
            </button>
            <button type="button" aria-pressed={method === "email"} onClick={() => changeMethod("email")}>
              <Mail aria-hidden="true" /> Email address
            </button>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-contact`}>{method === "mobile" ? "Mobile number" : "Email address"}</label>
            <input
              ref={contactRef}
              id={`${id}-contact`}
              type={method === "mobile" ? "tel" : "email"}
              inputMode={method === "mobile" ? "tel" : "email"}
              autoComplete={method === "mobile" ? "tel-national" : "email"}
              autoCapitalize="none"
              spellCheck={false}
              maxLength={method === "mobile" ? 20 : 160}
              value={contact}
              placeholder={method === "mobile" ? "10-digit mobile number" : "name@example.com"}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => { setContact(event.target.value); setError(""); }}
            />
          </div>
          {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary}>Send verification code <ArrowRight aria-hidden="true" /></button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={verifyCode} noValidate>
          <div className={styles.field}>
            <label htmlFor={`${id}-code`}>Verification code</label>
            <input
              ref={codeRef}
              id={`${id}-code`}
              className={styles.code}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              placeholder="6-digit code"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              onPaste={(event) => {
                event.preventDefault();
                setCode(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
            />
          </div>
          {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary}>Verify & continue <ArrowRight aria-hidden="true" /></button>
          <div className={styles.recovery}>
            <button type="button" onClick={resendCode}>Resend code</button>
            <button type="button" onClick={changeContact}>Change {method === "mobile" ? "mobile number" : "email address"}</button>
          </div>
          <p className={styles.status} role="status">{status}</p>
        </form>
      )}
    </section>
  );
}
