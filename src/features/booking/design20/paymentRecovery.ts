import type { Design20Draft } from "./model";
import { holdAfterPaymentFailure } from "../design15/model";

/** A cancelled or unsuccessful attempt holds the same slot once, without extending a retry. */
export function interruptDesign20Payment(draft: Design20Draft, status: "cancelled" | "failed", now = Date.now()): Design20Draft {
  if (draft.stage !== "payment" || draft.receipt || !draft.identity || !draft.selectedPatientId || !draft.selection.time) return draft;
  return { ...draft, stage: "review", payment: "online", paymentRecovery: status, reservationSkipped: undefined,
    failureHold: holdAfterPaymentFailure(draft.failureHold, draft.selection, now) };
}

/** Skipping defers payment; it never confirms a booking or starts another hold. */
export function skipDesign20Payment(draft: Design20Draft): Design20Draft {
  if ((draft.stage !== "review" && draft.stage !== "appointment") || draft.receipt || !draft.paymentRecovery || !draft.failureHold || !draft.identity || !draft.selectedPatientId) return draft;
  return { ...draft, stage: "review", reservationSkipped: true };
}
