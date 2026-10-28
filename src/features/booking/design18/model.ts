import type { AppointmentSelection } from "../design7/model";
import { failureHoldExpired, parseDesign15Draft, type Design15Draft, type Design15Step } from "../design15/model";
import { design17Available, design17SafeStep } from "../design17/model";
import { design17ListingReturnTo } from "@/features/search/design17Navigation";

export type Design18Phase = "slots" | "auth" | "member";

/** Guest choices are kept in application memory; account details use the server draft store. */
export function parseDesign18Draft(value: Design15Draft): Design15Draft | null {
  if (value.identity) return parseDesign15Draft(value, value.doctorId);
  if (value.stage !== "patient" || value.patients.length || value.selectedPatientId || value.failureHold || value.receipt) return null;
  const time = value.selection.time;
  if (time && !/^(0[1-9]|1[0-2]):[0-5]\d [AP]M$/.test(time)) return null;
  const safe = parseDesign15Draft({ ...value, selection: { ...value.selection, time: "" } }, value.doctorId);
  return safe ? { ...safe, selection: { ...safe.selection, time } } : null;
}

export function design18ListingReturnTo(returnTo: string): string {
  const safe = new URL(design17ListingReturnTo(returnTo, "d17-lite"), "https://nh.local");
  safe.searchParams.set("design", "d18");
  safe.searchParams.delete("booking");
  safe.searchParams.delete("hospital");
  safe.searchParams.delete("date");
  safe.searchParams.delete("step");
  safe.searchParams.delete("ref");
  return `${safe.pathname}?${safe.searchParams}`;
}

export function design18InlineUrl(draft: Design15Draft, returnTo: string): string {
  const url = new URL(design18ListingReturnTo(returnTo), "https://nh.local");
  url.searchParams.set("booking", draft.doctorId);
  url.searchParams.set("mode", draft.selection.mode);
  url.searchParams.set("hospital", draft.selection.hospital);
  url.searchParams.set("date", draft.selection.date);
  return `${url.pathname}?${url.searchParams}`;
}

export function design18FlowUrl(draft: Design15Draft, returnTo: string): string {
  const params = new URLSearchParams({ design: "d18", returnTo: design18ListingReturnTo(returnTo),
    mode: draft.selection.mode, hospital: draft.selection.hospital, date: draft.selection.date });
  if (draft.receipt) {
    params.set("ref", draft.receipt.ref);
    return `/doctors/${encodeURIComponent(draft.doctorId)}/book/confirmation?${params}`;
  }
  params.set("step", draft.stage);
  return `/doctors/${encodeURIComponent(draft.doctorId)}/book?${params}`;
}

/** A time click never authenticates. Only the explicit continuation asks for sign-in. */
export function design18ContinuePhase(draft: Design15Draft, authenticated: boolean, now = Date.now()): Design18Phase {
  if (!design17Available(draft.selection, now) || failureHoldExpired(draft.failureHold, draft.selection, now)) return "slots";
  return authenticated ? "member" : "auth";
}

export function design18SafeStep(requested: string | null, draft: Design15Draft, authenticated: boolean, now = Date.now()): Design15Step {
  if (!authenticated) return "patient";
  return design17SafeStep(requested, draft, authenticated, now);
}

/** Context changes must not silently transfer a time between hospitals or consultation modes. */
export function design18ChangedSelection(current: AppointmentSelection, incoming: AppointmentSelection): AppointmentSelection {
  const contextChanged = current.doctorId !== incoming.doctorId || current.hospital !== incoming.hospital || current.mode !== incoming.mode || current.date !== incoming.date;
  return { ...incoming, time: contextChanged ? "" : incoming.time };
}
