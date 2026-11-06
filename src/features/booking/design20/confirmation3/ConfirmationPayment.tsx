"use client";

import { Check, ChevronDown } from "lucide-react";
import type { design20Pricing } from "../pricing";
import styles from "./AppointmentConfirmation3.module.css";

interface Props {
  pricing: ReturnType<typeof design20Pricing>;
  paid: boolean;
}

export default function ConfirmationPayment({ pricing, paid }: Props) {
  const covered = pricing.amounts.total === 0;
  return <section className={styles.payment} aria-label="Payment summary">
    <details className={styles.paymentDetails}>
      <summary>
        <span className={styles.paymentText}>
          <span className={styles.paymentLabel}>{covered ? "Amount due" : paid ? "Amount paid" : "Due at hospital"}</span>
          <span className={styles.paymentStatus} data-settled={covered || paid}>
            {(paid || covered) && <Check size={14} aria-hidden />}
            {covered ? "Covered by benefits" : paid ? "Paid online" : "Pay at reception before your consultation"}
          </span>
        </span>
        <span className={styles.paymentAmount}><strong>{pricing.total}</strong><span className={styles.breakdownLink}>Payment details<ChevronDown size={14} aria-hidden /></span></span>
      </summary>
      <dl className={styles.breakdown}>
        <div><dt>Consultation fee</dt><dd>{pricing.base}</dd></div>
        {pricing.hasSponsorship && <div><dt>Sponsorship applied</dt><dd className={styles.discount}>−{pricing.sponsorshipDiscount}</dd></div>}
        {pricing.hasCoupon && <div><dt>Coupon applied</dt><dd className={styles.discount}>−{pricing.couponDiscount}</dd></div>}
        {pricing.hasHealthCredits && <div><dt>Health credits applied</dt><dd className={styles.discount}>−{pricing.healthCreditsDiscount}</dd></div>}
      </dl>
    </details>
    {pricing.hasDiscount && <p className={styles.savings}><span>You saved <strong>{pricing.discount}</strong> on this booking</span><span className={styles.savingsSwipe} aria-hidden /></p>}
  </section>;
}
