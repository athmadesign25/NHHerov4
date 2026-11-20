"use client";

import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import BenefitsDialog from "@/features/booking/design20/BenefitsDialog";
import BenefitIcon, { SponsorMark } from "@/features/booking/design20/BenefitIcon";
import { HEALTH_CREDIT_BALANCE, type SponsorshipId } from "@/features/booking/design20/pricing";
import HealthPaymentDetails, { type HealthPricing } from "./HealthPaymentDetails";
import shared from "@/features/booking/design20/previous/BookingSummary.module.css";
import styles from "./HealthCheckoutBenefits.module.css";

export interface HealthBenefitSelection {
  discountCode: string;
  sponsorshipId: SponsorshipId | null;
  useHealthCredits: boolean;
}
export interface HealthCheckoutBenefitsProps {
  pricing: HealthPricing;
  benefits: HealthBenefitSelection;
  memberName?: string;
  busy?: boolean;
  onBenefitsChange: (benefits: HealthBenefitSelection) => void;
}

export default function HealthCheckoutBenefits({ pricing, benefits, memberName, busy, onBenefitsChange }: HealthCheckoutBenefitsProps) {
  const id = useId();
  const [dialog, setDialog] = useState<"coupon" | "sponsorship" | null>(null);
  return <div className={`${styles.root} ${styles.typography}`}>
    <section aria-labelledby={id}>
      <h2 id={id}>Benefits &amp; savings</h2>
      <div className={shared.benefits}>
        <div className={`${shared.benefit} ${shared.coupon}`} data-applied={pricing.hasCoupon || undefined}>
          <button type="button" className={shared.benefitMain} disabled={busy} onClick={() => setDialog("coupon")} aria-haspopup="dialog">
            <span className={shared.couponIcon}><BenefitIcon kind="coupon" /></span><span><strong>{pricing.hasCoupon ? `${benefits.discountCode} applied` : "Apply coupon"}</strong></span><ChevronRight size={16} aria-hidden />
          </button>
        </div>
        <div className={`${shared.benefit} ${shared.sponsorship}`} data-applied={pricing.hasSponsorship || undefined}>
          <button type="button" className={shared.benefitMain} disabled={busy} onClick={() => setDialog("sponsorship")} aria-haspopup="dialog">
            {pricing.sponsorship ? <SponsorMark id={pricing.sponsorship.id} /> : <BenefitIcon kind="sponsorship" />}<span><strong>{pricing.sponsorship ? `${pricing.sponsorship.label} applied` : "Apply sponsorship benefit"}</strong></span><ChevronRight size={16} aria-hidden />
          </button>
        </div>
        <button type="button" role="switch" aria-checked={benefits.useHealthCredits} aria-label={`Use ${HEALTH_CREDIT_BALANCE} health credits`} className={`${shared.benefit} ${shared.credits}`} data-applied={pricing.hasHealthCredits || undefined} disabled={busy || (!benefits.useHealthCredits && pricing.amounts.total === 0)} onClick={() => onBenefitsChange({ ...benefits, useHealthCredits: !benefits.useHealthCredits })}>
          <BenefitIcon kind="credits" /><strong>{pricing.hasHealthCredits ? `${pricing.healthCreditsUsed} health credits applied` : `Use ${HEALTH_CREDIT_BALANCE} health credits`}</strong><span className={shared.switch} aria-hidden><span /></span>
        </button>
      </div>
    </section>
    <HealthPaymentDetails pricing={pricing} />
    {dialog && <BenefitsDialog kind={dialog} context="checkup" fee={String(pricing.amounts.base)} discountCode={benefits.discountCode} sponsorshipId={benefits.sponsorshipId} memberName={memberName} busy={busy} onClose={() => setDialog(null)} onCoupon={discountCode => { onBenefitsChange({ ...benefits, discountCode }); return true; }} onSponsorship={sponsorshipId => { onBenefitsChange({ ...benefits, sponsorshipId }); return true; }} />}
  </div>;
}
