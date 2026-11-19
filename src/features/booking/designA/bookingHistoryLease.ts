let owners = 0;
let original: ScrollRestoration = "auto";
const policyKey = "__nhBookingScrollRestoration";

function savedPolicy(): ScrollRestoration | undefined {
  const state: unknown = window.history.state;
  if (!state || typeof state !== "object" || !(policyKey in state)) return;
  const policy = (state as Record<string, unknown>)[policyKey];
  return policy === "auto" || policy === "manual" ? policy : undefined;
}

/** Carry only our policy into the booking entry. Next copies its own history
 * state; passing its __NA flag ourselves would bypass URL synchronization. */
export function bookingHistoryEntryState(): Record<string, ScrollRestoration> | null {
  return owners ? { [policyKey]: original } : null;
}

/** Acquire before pushState: the source entry must also opt out of native
 * restoration, otherwise Back moves it while the return morph is running. */
export function acquireBookingHistoryLease(): () => void {
  // Forward can revisit a booking entry that inherited our temporary manual
  // setting. Recover its true policy instead of treating manual as user-owned.
  if (owners === 0) original = savedPolicy() ?? window.history.scrollRestoration;
  owners += 1;
  window.history.scrollRestoration = "manual";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    owners -= 1;
    if (owners === 0) {
      if (savedPolicy() !== undefined) {
        const state = { ...window.history.state };
        delete state[policyKey];
        window.history.replaceState(state, "");
      }
      if (window.history.scrollRestoration === "manual") {
        window.history.scrollRestoration = original;
      }
    }
  };
}
