"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import { design20Pricing } from "@/features/booking/design20/pricing";
import shared from "@/features/booking/design20/previous/BookingSummary.module.css";
import styles from "./HealthCheckoutBenefits.module.css";

export type HealthPricing = ReturnType<typeof design20Pricing>;

export default function HealthPaymentDetails({ pricing }: { pricing: HealthPricing }) {
  const id = useId();
  const reduced = useReducedMotion();
  const transition = { duration: reduced ? 0 : duration.emphasis, ease: ease.out };
  const rows = [
    { key: "base", label: "Packages & tests", value: pricing.base, saving: false },
    ...(pricing.hasSponsorship ? [{ key: "sponsor", label: "Sponsorship applied", value: `−${pricing.sponsorshipDiscount}`, saving: true }] : []),
    ...(pricing.hasCoupon ? [{ key: "coupon", label: "Coupon applied", value: `−${pricing.couponDiscount}`, saving: true }] : []),
    ...(pricing.hasHealthCredits ? [{ key: "credits", label: "Health credits applied", value: `−${pricing.healthCreditsDiscount}`, saving: true }] : []),
  ];
  return <section className={`${styles.payment} ${styles.typography}`} aria-labelledby={id}>
    <h2 id={id}>Payment details</h2>
    <dl className={shared.breakdown}>
      <AnimatePresence initial={false} mode="popLayout">
        {rows.map(row => <motion.div key={row.key} layout={reduced ? false : "position"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className={row.saving ? shared.saving : undefined}><dt>{row.label}</dt><dd>{row.value}</dd></motion.div>)}
        <motion.div key="total" layout={reduced ? false : "position"} transition={transition} className={shared.total}><dt>Total payable</dt><dd>{pricing.total}</dd></motion.div>
      </AnimatePresence>
    </dl>
    <span className={shared.srOnly} role="status" aria-atomic="true">{pricing.hasDiscount ? `You save ${pricing.discount}. ` : ""}Total payable {pricing.total}.</span>
    <AnimatePresence initial={false}>
      {pricing.hasDiscount && <motion.div layout={reduced ? false : "position"} className={shared.savingsStrip} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition}>
        <span>You save <strong>{pricing.discount}</strong> on this booking</span>
        {!reduced && <span key={pricing.discount} className={shared.savingsShimmer} aria-hidden />}
      </motion.div>}
    </AnimatePresence>
  </section>;
}
