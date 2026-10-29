"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowRight, Banknote, Building2, Check, ChevronRight, CreditCard, DoorOpen, Landmark, LockKeyhole, ShieldCheck, Smartphone, Sparkles, UserRound, Wallet, X } from "lucide-react";
import type Lenis from "lenis";
import styles from "./RazorpayDemo.module.css";

type PaymentMethod = "upi" | "cards" | "emi" | "netbanking" | "wallet";
type CheckoutView = "contact" | "payment" | "exit";
type Props = {
  fee: string;
  busy: boolean;
  expired: boolean;
  mobile?: string;
  email?: string;
  onPay: () => void;
  onClose: () => void;
};

const METHODS = [
  { id: "upi", label: "UPI", hint: "Pay with any UPI app", Icon: Smartphone },
  { id: "cards", label: "Cards", hint: "Credit & debit cards", Icon: CreditCard },
  { id: "emi", label: "EMI", hint: "Easy instalments", Icon: Banknote },
  { id: "netbanking", label: "Netbanking", hint: "Choose your bank", Icon: Landmark },
  { id: "wallet", label: "Wallet", hint: "Pay with your wallet", Icon: Wallet },
] as const;

const OPTIONS: Record<Exclude<PaymentMethod, "upi">, string[]> = {
  cards: ["Visa ···· 4242", "Mastercard ···· 5556"],
  emi: ["3 monthly instalments", "6 monthly instalments"],
  netbanking: ["HDFC Bank", "ICICI Bank", "State Bank of India"],
  wallet: ["Amazon Pay", "Paytm", "PhonePe"],
};

function DemoQr() {
  const cells = Array.from({ length: 29 * 29 }, (_, index) => {
    const x = index % 29;
    const y = Math.floor(index / 29);
    const inFinder = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
    return !inFinder && ((x * 13 + y * 7 + x * y * 3) % 11 < 5) ? <rect key={index} x={x + 2} y={y + 2} width="1" height="1" /> : null;
  });
  return <div className={styles.qr}>
    <svg viewBox="0 0 33 33" aria-hidden="true" shapeRendering="crispEdges">
      {cells}
      {[[2, 2], [24, 2], [2, 24]].map(([x, y]) => <g key={`${x}-${y}`}><path d={`M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>)}
    </svg>
    <span>Demo QR · not payable</span>
  </div>;
}

export default function RazorpayDemo({ fee, busy, expired, mobile = "", email = "", onPay, onClose }: Props) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const focusTarget = useRef<HTMLInputElement>(null);
  const paymentHeading = useRef<HTMLHeadingElement>(null);
  const exitHeading = useRef<HTMLHeadingElement>(null);
  const returnView = useRef<CheckoutView>("payment");
  const [view, setView] = useState<CheckoutView>("contact");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [option, setOption] = useState(0);
  const [contact, setContact] = useState(() => ({ mobile: mobile.replace(/\D/g, "").slice(-10), email }));
  const [contactError, setContactError] = useState("");
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    element.showModal();
    document.body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (!wasStopped) lenis?.start();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const target = view === "contact" ? focusTarget.current : view === "exit" ? exitHeading.current : paymentHeading.current;
    target?.focus({ preventScroll: true });
  }, [view]);

  function requestExit() {
    if (busy) return;
    returnView.current = view === "exit" ? returnView.current : view;
    setView("exit");
  }

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{10}$/.test(contact.mobile)) {
      setContactError("Enter a 10-digit mobile number.");
      focusTarget.current?.focus();
      return;
    }
    setContactError("");
    setView("payment");
  }

  function selectMethod(next: PaymentMethod) {
    setMethod(next);
    setOption(0);
  }

  return <dialog ref={dialog} className={styles.dialog} data-lenis-prevent aria-labelledby={`${id}-${view}-heading`} onCancel={event => {
    event.preventDefault();
    if (view === "exit") setView(returnView.current); else requestExit();
  }}>
    <div className={styles.shell} inert={view !== "payment"}>
      <aside className={styles.merchant} aria-label="Payment summary">
        <div className={styles.brand}>
          <div className={styles.logo}><Image src="/NH-logo.svg" alt="Narayana Health" width={64} height={38} sizes="64px" /></div>
          <div><h2>Narayana Health</h2><span className={styles.trusted}><ShieldCheck size={16} aria-hidden /> Razorpay checkout preview</span></div>
        </div>
        <div className={styles.price}><span>Price Summary</span><strong>{fee}</strong></div>
        <button className={styles.merchantRow} type="button" onClick={() => setView("contact")} disabled={busy}><UserRound size={20} aria-hidden /><span>{contact.mobile ? `Using as +91 ${contact.mobile.slice(0, 5)} ${contact.mobile.slice(5)}` : "Add contact details"}</span><ChevronRight size={18} aria-hidden /></button>
        <button className={`${styles.merchantRow} ${styles.merchantOffer}`} type="button" onClick={() => setShowOffers(value => !value)} aria-expanded={showOffers} disabled={busy}><Sparkles size={20} aria-hidden /><span>Offers on UPI & wallets</span><ChevronRight size={18} aria-hidden /></button>
        <div className={styles.merchantArt} aria-hidden><div className={styles.artCircle} /><div className={styles.artCard}><CreditCard size={76} strokeWidth={1.1} /></div><div className={styles.artShield}><ShieldCheck size={56} strokeWidth={1.2} /></div></div>
        <div className={styles.merchantFooter}><LockKeyhole size={14} aria-hidden /> <span>Powered by <strong>Razorpay</strong><small>Demo checkout</small></span></div>
      </aside>

      <div className={styles.paymentShell}>
        <header className={styles.paymentHeader}><h2 ref={paymentHeading} tabIndex={-1} id={`${id}-payment-heading`}>Payment Options</h2><button className={styles.close} type="button" aria-label="Close payment" onClick={requestExit} disabled={busy}><X size={22} aria-hidden /></button></header>
        <div className={styles.paymentBody}>
          <div className={styles.methods} role="tablist" aria-label="Payment methods" aria-orientation="vertical">
            {METHODS.map(({ id: methodId, label, hint, Icon }, index) => <button type="button" role="tab" key={methodId} id={`${id}-${methodId}-tab`} aria-controls={`${id}-payment-panel`} aria-selected={method === methodId} tabIndex={method === methodId ? 0 : -1} disabled={busy} className={styles.method} onClick={() => selectMethod(methodId)} onKeyDown={event => {
              const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
              if (!delta) return;
              event.preventDefault();
              const next = METHODS[(index + delta + METHODS.length) % METHODS.length].id;
              selectMethod(next);
              document.getElementById(`${id}-${next}-tab`)?.focus();
            }}><Icon size={21} aria-hidden /><span><strong>{label}</strong><small>{hint}</small></span><ChevronRight size={16} aria-hidden /></button>)}
          </div>

          <div className={styles.paymentContent} role="tabpanel" id={`${id}-payment-panel`} aria-labelledby={`${id}-${method}-tab`}>
            <div className={styles.offersHeading}><h3>Available Offers</h3><span>Demo</span></div>
            <button className={styles.offerChip} type="button" onClick={() => setShowOffers(value => !value)} aria-expanded={showOffers}><Sparkles size={18} aria-hidden /><span>Explore UPI & wallet offers</span><ChevronRight size={16} aria-hidden /></button>
            {showOffers && <div className={styles.offerPreview}><strong>Bank & app offers appear here</strong><p>Your selected coupon and sponsorship savings are already included in {fee}.</p></div>}
            {method === "upi" ? <div className={styles.methodContent}>
              <h3>UPI QR</h3>
              <div className={styles.qrPanel}><DemoQr /><div className={styles.qrInfo}><p>Pay using any UPI app</p><div className={styles.appBadges} aria-label="Google Pay, PhonePe, Paytm"><span>G Pay</span><span>PhonePe</span><span>paytm</span></div><span className={styles.secureHint}><ShieldCheck size={15} aria-hidden /> Quick and secure</span></div></div>
            </div> : <div className={styles.methodContent}>
              <h3>{method === "cards" ? "Saved demo cards" : method === "emi" ? "Choose an instalment plan" : method === "netbanking" ? "Select your bank" : "Select your wallet"}</h3>
              <fieldset className={styles.paymentOptions}><legend className={styles.srOnly}>Choose a {METHODS.find(item => item.id === method)?.label} option</legend>{OPTIONS[method].map((label, index) => <label key={label} className={styles.paymentOption}><input type="radio" name={`${id}-payment-option`} checked={option === index} disabled={busy} onChange={() => setOption(index)} /><span className={styles.optionIcon}>{method === "cards" ? <CreditCard size={22} aria-hidden /> : method === "wallet" ? <Wallet size={22} aria-hidden /> : <Building2 size={22} aria-hidden />}</span><span>{label}<small>{method === "cards" ? "Demo card · no card details needed" : "Preview option"}</small></span><span className={styles.radio}>{option === index && <Check size={12} aria-hidden />}</span></label>)}</fieldset>
            </div>}
            <div className={styles.payArea}>
              {expired && <p className={styles.error} role="alert">Your slot hold has expired. Return to booking to select a time.</p>}
              <button type="button" className={styles.primary} disabled={busy || expired} onClick={onPay}>{busy ? "Processing…" : `Pay ${fee}`}<ArrowRight size={18} aria-hidden /></button>
              <p className={styles.demoNote}><LockKeyhole size={13} aria-hidden /> Demo payment · No money will be deducted</p>
            </div>
          </div>
        </div>
        <footer className={styles.paymentFooter}>Your payment details stay within this preview.</footer>
      </div>
    </div>

    {view !== "payment" && <div className={styles.overlay}>
      <section className={styles.sheet} aria-labelledby={`${id}-${view}-heading`}>
        <button type="button" className={styles.sheetClose} aria-label={view === "exit" ? "Continue to payment" : "Close payment"} onClick={view === "exit" ? () => setView(returnView.current) : requestExit}><X size={22} aria-hidden /></button>
        {view === "contact" ? <form className={styles.contactForm} onSubmit={submitContact}>
          <header><h2 id={`${id}-contact-heading`}>Contact details</h2><p>Enter mobile & email to continue</p></header>
          <label htmlFor={`${id}-mobile`} className={styles.srOnly}>Mobile number</label>
          <div className={styles.mobileField}><span>🇮🇳 +91</span><input ref={focusTarget} id={`${id}-mobile`} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Mobile number" maxLength={10} value={contact.mobile} aria-invalid={!!contactError} aria-describedby={contactError ? `${id}-contact-error` : undefined} onChange={event => { setContact(value => ({ ...value, mobile: event.target.value.replace(/\D/g, "").slice(0, 10) })); setContactError(""); }} /></div>
          <label className={styles.srOnly} htmlFor={`${id}-email`}>Email address (optional)</label><input className={styles.emailField} type="email" id={`${id}-email`} autoComplete="email" placeholder="Email address (optional)" value={contact.email} onChange={event => setContact(value => ({ ...value, email: event.target.value }))} />
          {contactError && <p id={`${id}-contact-error`} className={styles.error} role="alert">{contactError}</p>}
          <button type="submit" className={styles.primary}>Continue<ArrowRight size={18} aria-hidden /></button>
          <p className={styles.demoNote}>Demo checkout · No money will be deducted</p>
        </form> : <div className={styles.exitContent}>
          <div className={styles.exitArt}><DoorOpen size={68} strokeWidth={1.3} aria-hidden /></div>
          <h2 ref={exitHeading} tabIndex={-1} id={`${id}-exit-heading`}>Are you sure you want to exit?</h2>
          <p>You will be taken back to Narayana Health.</p>
          <div className={styles.exitActions}><button type="button" className={styles.secondary} onClick={() => setView(returnView.current)}>Continue to payment</button><button type="button" className={styles.primary} onClick={onClose}>Yes, exit</button></div>
        </div>}
      </section>
    </div>}
  </dialog>;
}
