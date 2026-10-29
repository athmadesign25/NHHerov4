import type { SavedPatient } from "../design14/patients";

/** Stakeholder-demo fixtures only; these are not verified plan entitlements or live offers. */
export const SPONSORSHIP_PLANS = [
  { id: "one-health-lite", label: "One Health Lite", description: "5% consultation benefit", percent: 5 },
  { id: "nh-staff", label: "NH Staff", description: "20% consultation benefit", percent: 20 },
  { id: "nhcare", label: "NHcare", description: "15% consultation benefit", percent: 15 },
] as const;
export type SponsorshipId = typeof SPONSORSHIP_PLANS[number]["id"];

/** Demo account balance; one health credit offsets one rupee. */
export const HEALTH_CREDIT_BALANCE = 290;

export const COUPONS = [
  { code: "NHCARE10", title: "Save 10%", description: "Up to ₹150 off your consultation", percent: 10, amount: 0, maximum: 150, minimum: 0 },
  { code: "WELCOME100", title: "Save ₹100", description: "On a payable amount of ₹500 or more", percent: 0, amount: 100, maximum: 100, minimum: 500 },
  { code: "CARE50", title: "Save ₹50", description: "On a payable amount of ₹300 or more", percent: 0, amount: 50, maximum: 50, minimum: 300 },
] as const;

export function isSponsorshipId(value: unknown): value is SponsorshipId {
  return SPONSORSHIP_PLANS.some(plan => plan.id === value);
}

export function normalizeDesign20Coupon(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find(coupon => coupon.code === normalized)?.code ?? null;
}

/** Only fixture members have demo-linked benefits; newly added people have none by default. */
export function defaultSponsorshipForPatient(entry: SavedPatient | undefined): SponsorshipId | null {
  if (entry?.id === "existing-self") return "one-health-lite";
  if (entry?.id === "existing-spouse") return "nhcare";
  if (entry?.id === "existing-parent") return "nh-staff";
  return null;
}

function toMinorUnits(fee: string): number {
  const numeric = fee.trim().replace(/^₹\s*/, "").replace(/,/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(numeric)) return 0;
  const [rupees, paise = ""] = numeric.split(".");
  const amount = Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? amount : 0;
}

const format = (minor: number): string => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(minor / 100).replace(/\.00$/, "");

/** Sponsorship, then one eligible coupon, then opted-in account credits. All arithmetic uses paise. */
export function design20Pricing(fee: string, discountCode?: string, sponsorshipId?: SponsorshipId | null, useHealthCredits = false) {
  const base = toMinorUnits(fee);
  const sponsorship = SPONSORSHIP_PLANS.find(plan => plan.id === sponsorshipId) ?? null;
  const sponsorshipDiscount = sponsorship ? Math.min(base, Math.round(base * sponsorship.percent / 100)) : 0;
  const subtotal = base - sponsorshipDiscount;
  const coupon = COUPONS.find(offer => offer.code === normalizeDesign20Coupon(discountCode ?? "")) ?? null;
  const couponEligible = Boolean(coupon && subtotal >= coupon.minimum * 100 && subtotal > 0);
  const couponDiscount = coupon && couponEligible
    ? Math.min(subtotal, coupon.maximum * 100, coupon.percent ? Math.round(subtotal * coupon.percent / 100) : coupon.amount * 100)
    : 0;
  const healthCreditsDiscount = useHealthCredits ? Math.min(HEALTH_CREDIT_BALANCE * 100, subtotal - couponDiscount) : 0;
  const discount = sponsorshipDiscount + couponDiscount + healthCreditsDiscount;
  const total = base - discount;
  return {
    base: format(base), sponsorshipDiscount: format(sponsorshipDiscount), couponDiscount: format(couponDiscount),
    healthCreditsDiscount: format(healthCreditsDiscount), healthCreditsUsed: healthCreditsDiscount / 100,
    discount: format(discount), subtotal: format(subtotal), total: format(total),
    hasSponsorship: sponsorshipDiscount > 0, hasCoupon: couponDiscount > 0, hasHealthCredits: healthCreditsDiscount > 0, hasDiscount: discount > 0,
    sponsorship, coupon, couponEligible,
    amounts: { base: base / 100, sponsorshipDiscount: sponsorshipDiscount / 100, couponDiscount: couponDiscount / 100, healthCreditsDiscount: healthCreditsDiscount / 100, discount: discount / 100, subtotal: subtotal / 100, total: total / 100 },
    minorUnits: { base, sponsorshipDiscount, couponDiscount, healthCreditsDiscount, discount, subtotal, total },
  };
}

export function isDesign20CouponEligible(fee: string, code: string, sponsorshipId?: SponsorshipId | null): boolean {
  return design20Pricing(fee, code, sponsorshipId).couponEligible;
}
