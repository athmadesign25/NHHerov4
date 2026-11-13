// Session-only history. Never persist member identifiers or test selections in browser storage.
let history: Readonly<Record<string, readonly string[]>> = {};
const listeners = new Set<() => void>();
const empty: Readonly<Record<string, readonly string[]>> = {};
export const getHealthBookingHistory = () => history;
export const getServerHealthBookingHistory = () => empty;
export function subscribeHealthBookingHistory(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function rememberHealthBooking(memberId: string, itemIds: string[]) {
  history = { ...history, [memberId]: [...new Set([...(history[memberId] ?? []), ...itemIds])] };
  listeners.forEach(listener => listener());
}
export function clearHealthBookingHistory() {
  history = {};
  listeners.forEach(listener => listener());
}
