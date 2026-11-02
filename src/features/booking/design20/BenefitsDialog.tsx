"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import type Lenis from "lenis";
import { COUPONS, SPONSORSHIP_PLANS, design20Pricing, isDesign20CouponEligible, type SponsorshipId } from "./pricing";
import BenefitIcon, { SponsorMark } from "./BenefitIcon";
import styles from "./BenefitsDialog.module.css";

interface BenefitsDialogProps {
  kind: "coupon" | "sponsorship";
  fee: string;
  discountCode?: string;
  sponsorshipId?: SponsorshipId | null;
  memberName?: string;
  onCoupon: (code: string) => boolean;
  onSponsorship: (id: SponsorshipId | null) => boolean;
  onClose: () => void;
  busy?: boolean;
}

export default function BenefitsDialog({ kind, fee, discountCode, sponsorshipId, memberName, onCoupon, onSponsorship, onClose, busy = false }: BenefitsDialogProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const startedOnBackdrop = useRef(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const coupons = kind === "coupon";
  const pricing = design20Pricing(fee, discountCode, sponsorshipId);

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

  const applyCoupon = (value: string) => {
    const normalized = value.trim().toUpperCase();
    if (normalized && !COUPONS.some(coupon => coupon.code === normalized)) {
      setError("Enter a valid coupon code from the offers below.");
      return;
    }
    if (normalized && !isDesign20CouponEligible(fee, normalized, sponsorshipId)) {
      setError("This coupon does not meet the minimum payable amount.");
      return;
    }
    if (onCoupon(normalized)) onClose();
    else setError("Your booking changed. Close this panel and try again.");
  };

  const applySponsorship = (value: SponsorshipId | null) => {
    if (onSponsorship(value)) onClose();
    else setError("Your booking changed. Close this panel and try again.");
  };

  return <dialog
    ref={dialog}
    className={styles.dialog}
    data-benefit={kind}
    aria-labelledby={`${id}-heading`}
    aria-describedby={`${id}-description`}
    data-lenis-prevent
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onPointerDown={event => { startedOnBackdrop.current = event.target === event.currentTarget; }}
    onClick={event => { if (!busy && startedOnBackdrop.current && event.target === event.currentTarget) onClose(); }}
  >
    <div className={styles.surface}>
      <span className={styles.handle} aria-hidden />
      <header className={styles.header}>
        <span className={styles.headingIcon} aria-hidden><BenefitIcon kind={coupons ? "coupon" : "sponsorship"} /></span>
        <div><h2 id={`${id}-heading`}>{coupons ? "Coupons for you" : "Sponsorship benefits"}</h2><p id={`${id}-description`}>{coupons ? "Savings for your appointment" : memberName ? `Available for ${memberName}` : "Available for your appointment"}</p></div>
        <button type="button" className={styles.close} aria-label="Close benefits" disabled={busy} onClick={onClose}><X size={20} aria-hidden /></button>
      </header>

      {coupons ? <>
        <form className={styles.codeForm} onSubmit={event => { event.preventDefault(); applyCoupon(code); }}>
          <label htmlFor={`${id}-code`}>Have a coupon code?</label>
          <div><input id={`${id}-code`} value={code} placeholder="Enter code" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={24} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={event => { setCode(event.target.value.toUpperCase()); setError(""); }} /><button type="submit" className={styles.apply} aria-label="Apply entered coupon code" disabled={busy || !code.trim()}>Apply</button></div>
        </form>
        {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
        <ul className={styles.offers} aria-label="Available coupons">
          {COUPONS.map(coupon => {
            const eligible = isDesign20CouponEligible(fee, coupon.code, sponsorshipId);
            const selected = pricing.coupon?.code === coupon.code && pricing.hasCoupon;
            const saving = design20Pricing(fee, coupon.code, sponsorshipId).couponDiscount;
            return <li key={coupon.code} className={`${styles.offer} ${selected ? styles.selected : ""}`}>
              <div className={styles.offerCopy}><span className={styles.code}>{coupon.code}</span><h3>{eligible ? `Save ${saving}` : coupon.title}</h3><p>{coupon.description}</p>{!eligible && <small>Not eligible for this payable amount</small>}</div>
              <div className={styles.offerAction}>{selected ? <span className={styles.applied}><Check className={styles.check} size={16} strokeWidth={2.5} aria-hidden />Applied</span> : <button className={styles.apply} type="button" disabled={busy || !eligible} aria-label={`Apply ${coupon.code}`} onClick={() => applyCoupon(coupon.code)}>Apply</button>}</div>
            </li>;
          })}
        </ul>
        {pricing.hasCoupon && <footer className={styles.footer}><button className={styles.remove} type="button" disabled={busy} onClick={() => applyCoupon("")}>Remove coupon</button></footer>}
      </> : <>
        <ul className={styles.offers} aria-label="Available sponsorship benefits">
          {SPONSORSHIP_PLANS.map(plan => {
            const selected = plan.id === sponsorshipId;
            const saving = design20Pricing(fee, undefined, plan.id).sponsorshipDiscount;
            return <li className={`${styles.offer} ${styles.planOffer} ${selected ? styles.selected : ""}`} key={plan.id}>
              <SponsorMark id={plan.id} />
              <div className={styles.offerCopy}><strong className={styles.planName}>{plan.label}</strong><h3>Save {saving}</h3><p>{plan.description}</p></div>
              <div className={styles.offerAction}>{selected ? <span className={styles.applied}><Check className={styles.check} size={16} strokeWidth={2.5} aria-hidden />Applied</span> : <button className={styles.apply} type="button" disabled={busy} aria-label={`Apply ${plan.label}`} onClick={() => applySponsorship(plan.id)}>Apply</button>}</div>
            </li>;
          })}
        </ul>
        {pricing.hasSponsorship && <footer className={styles.footer}><button className={styles.remove} type="button" disabled={busy} onClick={() => applySponsorship(null)}>Remove sponsorship benefit</button></footer>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </>}
    </div>
  </dialog>;
}
