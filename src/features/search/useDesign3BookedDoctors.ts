"use client";

import { useEffect, useState } from "react";
import { parseBooking } from "@/features/booking/bookingStore";

type BookingStorage = Pick<Storage, "length" | "key" | "getItem">;

const BOOKING_PREFIX = "nh:booking:";
const EMPTY_DOCTORS: ReadonlySet<string> = new Set<string>();

/**
 * Read only the doctor IDs from bookings saved in this preview tab. These
 * records are not account-owned history; the badge must say so accessibly.
 * Never copy patient details into component state or create a second store.
 */
export function readDesign3BookedDoctors(storage: BookingStorage, now = Date.now()): ReadonlySet<string> {
  if (!Number.isFinite(now)) return EMPTY_DOCTORS;
  const doctors = new Set<string>();
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(BOOKING_PREFIX)) continue;
      const booking = parseBooking(storage.getItem(key));
      if (!booking || key !== `${BOOKING_PREFIX}${booking.ref}`) continue;
      const createdAt = Date.parse(booking.createdAt);
      // saveBooking writes canonical ISO timestamps. Reject invalid calendar
      // dates that Date.parse would otherwise silently roll into another day.
      if (!Number.isFinite(createdAt) || createdAt > now || new Date(createdAt).toISOString() !== booking.createdAt) continue;
      if (!booking.doctorSlug || booking.doctorSlug.trim() !== booking.doctorSlug) continue;
      doctors.add(booking.doctorSlug);
    }
  } catch {
    // A blocked store must not leave partially read history on screen.
    return EMPTY_DOCTORS;
  }
  return doctors.size ? doctors : EMPTY_DOCTORS;
}

/** One session-storage read per listing, rather than one read per doctor card. */
export function useDesign3BookedDoctors(enabled: boolean): ReadonlySet<string> {
  const [doctors, setDoctors] = useState(EMPTY_DOCTORS);

  useEffect(() => {
    if (!enabled) {
      setDoctors(EMPTY_DOCTORS);
      return;
    }
    const refresh = () => {
      let next = EMPTY_DOCTORS;
      try { next = readDesign3BookedDoctors(window.sessionStorage); } catch { /* Storage access itself can be blocked. */ }
      setDoctors((previous) => previous.size === next.size && [...previous].every((id) => next.has(id)) ? previous : next);
    };
    const resume = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [enabled]);

  return enabled ? doctors : EMPTY_DOCTORS;
}
