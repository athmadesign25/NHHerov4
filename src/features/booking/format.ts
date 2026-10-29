// ─── BOOKING — FORMATTING HELPERS ────────────────────────────────────────────

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses a "YYYY-MM-DD" string as a LOCAL calendar date (never UTC, so the
 * day can't shift across time zones). Returns null for anything invalid.
 */
function parseFullDate(fullDate: string): Date | null {
  const match = ISO_DATE.exec(fullDate);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const isRealDate =
    date.getFullYear() === Number(y) &&
    date.getMonth() === Number(m) - 1 &&
    date.getDate() === Number(d);
  return isRealDate ? date : null;
}

/**
 * Formats a booking date for display.
 *  - "long"  → "Tue, 14 Oct 2025"
 *  - "short" → "Tue, 14 Oct"
 * Falls back to the raw input if it isn't a valid "YYYY-MM-DD".
 */
export function formatBookingDate(fullDate: string, style: "long" | "short" = "long"): string {
  const date = parseFullDate(fullDate);
  if (!date) return fullDate;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(style === "long" ? { year: "numeric" } : {}),
  }).format(date);
}
