"use client";

import { ChevronDown } from "lucide-react";
import type { design20Pricing } from "../pricing";
import styles from "./ConfirmationPayment.module.css";

interface Props {
  pricing: ReturnType<typeof design20Pricing>;
  paid: boolean;
}

const formatAmount = (minorUnits: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(minorUnits / 100).replace(/\.00$/, "");

export default function ConfirmationPayment({ pricing, paid }: Props) {
  const covered = pricing.minorUnits.total === 0;
  const appliedSources = [
    pricing.hasSponsorship ? pricing.sponsorship?.label ?? "sponsorship benefit" : null,
    pricing.hasCoupon ? "coupon" : null,
    pricing.hasHealthCredits ? "health credits" : null,
  ].filter((source): source is string => source !== null);
  const coverage = new Intl.ListFormat("en-IN", { style: "long", type: "conjunction" }).format(appliedSources);
  // Existing credits offset the amount due; they are not a new discount.
  const savings = pricing.minorUnits.sponsorshipDiscount + pricing.minorUnits.couponDiscount;

  return <section className={styles.payment} aria-label="Payment summary">
    <details className={styles.details}>
      <summary className={styles.summary}>
        <span className={styles.state}>
          <span className={styles.label} data-settled={covered || paid}>{covered ? "No payment due" : paid ? "Paid online" : "Due at hospital"}</span>
          <strong className={styles.amount}>{pricing.total}</strong>
          {covered && coverage && <span className={styles.coverage}>Covered by {coverage}</span>}
        </span>
        <span className={styles.disclosure}>Payment details<span className={styles.chevron}><ChevronDown size={14} aria-hidden /></span></span>
      </summary>
      <dl className={styles.breakdown}>
        <div className={styles.breakdownRow}><dt>Consultation fee</dt><dd>{pricing.base}</dd></div>
        {pricing.hasSponsorship && <div className={styles.breakdownRow}><dt>{pricing.sponsorship?.label ?? "Sponsorship"} benefit</dt><dd className={styles.discount}>−{pricing.sponsorshipDiscount}</dd></div>}
        {pricing.hasCoupon && <div className={styles.breakdownRow}><dt>Coupon{pricing.coupon ? ` · ${pricing.coupon.code}` : ""}</dt><dd className={styles.discount}>−{pricing.couponDiscount}</dd></div>}
        {pricing.hasHealthCredits && <div className={styles.breakdownRow}><dt>Health credits used</dt><dd>−{pricing.healthCreditsDiscount}</dd></div>}
      </dl>
    </details>
    {savings > 0 && <p className={styles.savings}><span>You saved <strong>{formatAmount(savings)}</strong> on this booking</span><span key={savings} className={styles.swipe} aria-hidden /></p>}
  </section>;
}
