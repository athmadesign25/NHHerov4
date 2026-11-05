"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Mail, Smartphone, X } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import styles from "./NavbarLoginModal.module.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"mobile" | "email">("mobile");
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("+91");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const fields = useRef<(HTMLInputElement | null)[]>([]);
  const verified = useRef(false);
  const closeRef = useRef(onClose);
  const id = useId();
  const reduced = useReducedMotion();
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    setTab("mobile"); setStep("identity"); setPhone(""); setEmail(""); setCountry("+91");
    setOtp(Array(6).fill("")); setError(""); setNotice(""); verified.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mounted || !dialog.current) return;
    const panel = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    const background = [...document.body.children].filter((node): node is HTMLElement => node instanceof HTMLElement && !node.contains(panel));
    const previousInert = background.map(node => node.inert);
    const playing = [...document.querySelectorAll<HTMLVideoElement>("#hero-section-search-first video")].filter(video => !video.paused);
    background.forEach(node => { node.inert = true; });
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    playing.forEach(video => video.pause());
    panel.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    const focusable = () => [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, a[href], [tabindex="0"]')].filter(node => node.getClientRects().length > 0);
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const items = focusable(), first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown, true);
    return () => {
      document.removeEventListener("keydown", keydown, true);
      background.forEach((node, index) => { node.inert = previousInert[index]; });
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      playing.forEach(video => video.play().catch(() => {}));
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      else document.querySelector<HTMLButtonElement>(window.innerWidth >= 1100 ? '[data-account-trigger]' : '[aria-controls="mobile-navigation-menu"]')?.focus({ preventScroll: true });
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen) return;
    if (step === "otp") fields.current[0]?.focus();
    else dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [step, tab, isOpen]);

  const continueLogin = (event: FormEvent) => {
    event.preventDefault();
    if (tab === "mobile" ? !/^\d{10}$/.test(phone) : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(tab === "mobile" ? "Enter a valid 10-digit mobile number." : "Enter a valid email address.");
      return;
    }
    setError(""); setNotice(""); setStep("otp");
  };
  const verify = (code = otp.join("")) => {
    if (!/^\d{6}$/.test(code)) { setError("Enter all 6 digits of your verification code."); return; }
    if (verified.current) return;
    // Match the booking demo: a complete code previews sign-in, with no OTP service.
    verified.current = true;
    onLoginSuccess?.();
    onClose();
  };
  const changeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[index] = digit; setOtp(next); setError("");
    if (digit && index < 5) fields.current[index + 1]?.focus();
    if (digit && next.every(Boolean)) verify(next.join(""));
  };
  const pasteCode = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const code = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!code) return;
    setOtp(Array.from({ length: 6 }, (_, index) => code[index] ?? "")); setError("");
    fields.current[Math.min(code.length, 5)]?.focus();
    if (code.length === 6) verify(code);
  };
  const otpKey = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) fields.current[index - 1]?.focus();
  };

  if (!mounted) return null;
  return createPortal(<AnimatePresence>{isOpen && <motion.div className={styles.layer} data-lenis-prevent
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}>
    <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
    <motion.div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} data-login-dialog className={styles.modalContainer}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }} transition={{ duration: reduced ? 0 : duration.emphasis, ease: ease.out }}>
      <div className={styles.imageColumn}>
        <Image src="/assets/doctor_team.png" alt="Narayana Health care team" fill sizes="(min-width: 768px) 440px, 1px" preload className={styles.image} />
        <div className={styles.imageCopy}><h3>World-Class Care, Close to Home.</h3><p>Manage your health and stay connected with your care team.</p></div>
      </div>
      <div className={styles.formColumn}>
        <div className={styles.header}><button type="button" className={styles.close} onClick={onClose} aria-label="Close login"><X aria-hidden="true" /></button></div>
        <div className={styles.body}>
          <div className={styles.intro}><h2 id={`${id}-title`}>Login / Register</h2><p id={`${id}-description`}>Manage appointments, access reports, and stay connected with your doctors.</p></div>
          {step === "identity" ? <form onSubmit={continueLogin} noValidate className={styles.form}>
            <div className={styles.tabs} role="group" aria-label="Sign-in method">
              <button type="button" aria-pressed={tab === "mobile"} onClick={() => { setTab("mobile"); setError(""); }}><Smartphone aria-hidden="true" />Mobile</button>
              <button type="button" aria-pressed={tab === "email"} onClick={() => { setTab("email"); setError(""); }}><Mail aria-hidden="true" />Email</button>
            </div>
            {tab === "mobile" ? <div className={styles.field}>
              <label htmlFor={`${id}-phone`}>Mobile Number</label><div className={styles.phoneRow}>
                <div className={styles.country}><select aria-label="Country code" value={country} onChange={event => setCountry(event.target.value)}><option value="+91">+91</option><option value="+880">+880</option></select><ChevronDown aria-hidden="true" /></div>
                <input id={`${id}-phone`} type="tel" autoComplete="tel-national" inputMode="numeric" maxLength={10} placeholder="Mobile number" value={phone} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => { setPhone(event.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }} />
              </div></div> : <div className={styles.field}><label htmlFor={`${id}-email`}>Email ID</label><input id={`${id}-email`} type="email" autoComplete="email" placeholder="Enter your email address" value={email} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => { setEmail(event.target.value); setError(""); }} /></div>}
            {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
            <button type="submit" className={styles.primary}>Get OTP</button>
            <div className={styles.divider}><span>OR</span></div>
            <button type="button" className={styles.secondary} onClick={() => setNotice("Google sign-in isn’t connected in this preview. Continue with mobile or email.")}><span aria-hidden="true" className={styles.google}>G</span>Sign in with Google</button>
            {notice && <p className={styles.note} role="status">{notice}</p>}
            <p className={styles.note}>By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
          </form> : <form className={styles.form} onSubmit={event => { event.preventDefault(); verify(); }}>
            <p className={styles.destination}>Enter the 6-digit OTP for<br /><strong>{tab === "mobile" ? `${country} ${phone}` : email}</strong> <button type="button" className={styles.edit} onClick={() => { setStep("identity"); setOtp(Array(6).fill("")); setError(""); }}>Edit</button></p>
            <div className={styles.otp} role="group" aria-label="Six-digit verification code">{otp.map((digit, index) => <input key={index} ref={node => { fields.current[index] = node; }} type="text" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} value={digit} aria-label={`Verification code digit ${index + 1}`} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => changeDigit(index, event.target.value)} onKeyDown={event => otpKey(event, index)} onPaste={pasteCode} />)}</div>
            {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
            <p className={styles.note}>Demo preview: enter any 6 digits. No OTP is sent.</p>
            <button type="submit" className={styles.primary}>Verify &amp; Proceed</button>
          </form>}
        </div>
      </div>
    </motion.div>
  </motion.div>}</AnimatePresence>, document.body);
}
