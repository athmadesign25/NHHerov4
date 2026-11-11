"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import SuccessMark from "@/features/booking/design20/confirmation3/SuccessMark";
import styles from "./DoctorProfileEnquiry.module.css";

type Field = "fullName" | "email" | "mobile" | "query" | "consent";
type Errors = Partial<Record<Field, string>>;

interface Props {
  doctorName: string;
  policyUrls?: { terms: string; privacy: string };
  embedded?: boolean;
  presentation?: "default" | "banner";
}

/** Local stakeholder form: no external request and no persistent personal data. */
export default function DoctorProfileEnquiry({ doctorName, embedded = false, presentation = "default", policyUrls = {
  terms: "https://www.narayanahealth.org/terms-of-use",
  privacy: "https://www.narayanahealth.org/privacy-policy",
} }: Props) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [complete, setComplete] = useState(false);
  const fieldId = (name: string) => `${id}-${name}`;
  const isBanner = presentation === "banner";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    const nextErrors: Errors = {};
    if (!value("fullName")) nextErrors.fullName = "Enter your full name.";
    if (!/^\d{10}$/.test(value("mobile").replace(/[\s()-]/g, ""))) nextErrors.mobile = "Enter a 10-digit mobile number.";
    if (value("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) nextErrors.email = "Enter a valid email address.";
    if (fields.get("consent") !== "on") nextErrors.consent = "Please agree to the terms and privacy policy to continue.";
    setErrors(nextErrors);
    const firstError = (Object.keys(nextErrors) as Field[])[0];
    if (firstError) {
      requestAnimationFrame(() => {
        const input = form.current?.elements.namedItem(firstError);
        if (input instanceof HTMLElement) input.focus();
      });
      return;
    }
    event.currentTarget.reset();
    setComplete(true);
    requestAnimationFrame(() => confirmation.current?.focus());
  }

  const error = (name: Field) => errors[name] ? <p className={styles.error} id={fieldId(`${name}-error`)}>{errors[name]}</p> : null;
  const describedBy = (name: Field) => errors[name] ? fieldId(`${name}-error`) : undefined;

  return <section id="profile-enquiry" className={`${styles.section} ${embedded ? styles.embedded : ""} ${isBanner ? styles.bannerForm : ""}`} aria-labelledby={embedded ? undefined : fieldId("heading")} aria-label={embedded ? "Request a callback" : undefined}>
    {!embedded && <header className={styles.heading}>
      <h2 id={fieldId("heading")}>Need help with your appointment?</h2>
      <p>Leave your number and our team will call you to help.</p>
    </header>}
    {complete ? <div ref={confirmation} className={styles.confirmation} tabIndex={-1} role="status">
      <SuccessMark />
      <h3>Callback requested</h3>
      <p>Our team will contact you on the number provided.</p>
      <button type="button" className={styles.secondaryButton} onClick={() => {
        setComplete(false);
        requestAnimationFrame(() => {
          const input = form.current?.elements.namedItem("fullName");
          if (input instanceof HTMLElement) input.focus();
        });
      }}>Request another callback</button>
    </div> : <form ref={form} className={styles.form} onSubmit={submit} noValidate onChange={event => {
      const input = event.target;
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        const name = input.name as Field;
        if (errors[name]) setErrors(previous => ({ ...previous, [name]: undefined }));
      }
    }}>
      <div className={styles.field}>
        <label htmlFor={fieldId("fullName")}>Full name</label>
        <input id={fieldId("fullName")} name="fullName" autoComplete="name" required maxLength={120} aria-invalid={!!errors.fullName} aria-describedby={describedBy("fullName")} />
        {error("fullName")}
      </div>
      <div className={styles.field}>
        <label htmlFor={fieldId("mobile")}>Mobile number</label>
        <div className={styles.phoneField} data-invalid={!!errors.mobile}>
          <span aria-hidden>+91</span>
          <input id={fieldId("mobile")} name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" required maxLength={15} aria-invalid={!!errors.mobile} aria-describedby={describedBy("mobile")} />
        </div>
        {error("mobile")}
      </div>
      <div className={styles.field}>
        <label htmlFor={fieldId("email")}>Email address <span className={styles.optional}>(optional)</span></label>
        <input id={fieldId("email")} name="email" type="email" autoComplete="email" maxLength={254} aria-invalid={!!errors.email} aria-describedby={describedBy("email")} />
        {error("email")}
      </div>
      {isBanner ? <input type="hidden" name="doctor" value={doctorName} /> : <div className={styles.field}>
        <label htmlFor={fieldId("doctor")}>Doctor</label>
        <input id={fieldId("doctor")} name="doctor" value={doctorName} readOnly autoComplete="off" />
      </div>}
      <div className={`${styles.field} ${styles.fullWidth}`}>
        <label htmlFor={fieldId("query")}>How can we help? <span className={styles.optional}>(optional)</span></label>
        <textarea id={fieldId("query")} name="query" rows={isBanner ? 2 : 4} maxLength={2000} aria-invalid={!!errors.query} aria-describedby={describedBy("query")} />
        {error("query")}
      </div>
      <div className={`${styles.fullWidth} ${styles.formFooter}`}>
        <div className={styles.consentGroup}>
          <div className={styles.consent}>
            <input id={fieldId("consent")} name="consent" type="checkbox" required aria-invalid={!!errors.consent} aria-describedby={describedBy("consent")} />
            <label htmlFor={fieldId("consent")}>I agree to the <a href={policyUrls.terms} target="_blank" rel="noopener noreferrer">Terms of use<span className={styles.srOnly}> (opens in a new tab)</span></a> and <a href={policyUrls.privacy} target="_blank" rel="noopener noreferrer">Privacy policy<span className={styles.srOnly}> (opens in a new tab)</span></a>.</label>
          </div>
          {error("consent")}
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton}>Request a callback</button>
        </div>
      </div>
    </form>}
  </section>;
}
