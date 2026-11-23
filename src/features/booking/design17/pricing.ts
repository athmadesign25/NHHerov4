/** Configurable offer fixture for the local stakeholder booking flow. */
export const DISCOUNT_CODE = "NHCARE10";
export function normalizeDiscountCode(code: string): string | null {
  return code.trim().toUpperCase() === DISCOUNT_CODE ? DISCOUNT_CODE : null;
}
export function appointmentPricing(fee: string, code?: string) {
  const amount = Number(fee.replace(/[^\d.]/g, ""));
  const base = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const discount = normalizeDiscountCode(code ?? "") ? Math.round(base * 10) / 100 : 0;
  const format = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value).replace(/\.00$/, "");
  return { base: format(base), discount: format(discount), total: format(Math.max(0, base - discount)), hasDiscount: discount > 0 };
}
