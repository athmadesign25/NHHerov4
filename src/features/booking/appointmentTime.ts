/** NH appointment calendars use India time, irrespective of the viewer's zone. */
const INDIA_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
export const DESIGN16_BOOKING_DAYS = 21;

export function indiaDate(now: number | Date, daysFromNow = 0): string {
  const timestamp = now instanceof Date ? now.getTime() : now;
  return new Date(timestamp + INDIA_OFFSET_MS + daysFromNow * DAY_MS).toISOString().slice(0, 10);
}

export function indiaClock(now: number | Date): string {
  const timestamp = now instanceof Date ? now.getTime() : now;
  const value = new Date(timestamp + INDIA_OFFSET_MS);
  const hour = value.getUTCHours();
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export function appointmentDates(now: number, windowDays = 15): string[] {
  return Array.from({ length: windowDays }, (_, index) => indiaDate(now, index));
}

export function indiaAppointmentTimestamp(date: string, time: string): number | null {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const clock = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time);
  if (!day || !clock) return null;
  const [, year, month, dateOfMonth] = day.map(Number);
  const value = new Date(Date.UTC(year, month - 1, dateOfMonth));
  if (value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== dateOfMonth) return null;
  const hour = Number(clock[1]);
  const minute = Number(clock[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return value.getTime() + ((hour % 12 + (clock[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + minute) * 60_000 - INDIA_OFFSET_MS;
}

export function advertisedAppointmentTimestamp(text: string, now: number | Date): number | null {
  const clock = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)?.[0];
  if (!clock) return null;
  const date = /^today\b/i.test(text) ? indiaDate(now)
    : /^tomorrow\b/i.test(text) ? indiaDate(now, 1)
      : text.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return date ? indiaAppointmentTimestamp(date, clock) : null;
}
