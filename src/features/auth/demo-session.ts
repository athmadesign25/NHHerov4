// Start each fresh page load at Login; explicit sign-in survives client routing.
// Storage flags remain compatible with the combined booking/search previews.
// No phone numbers, OTPs, identities or patient details are persisted here.
let signedIn = false;

function storedSession(): boolean | null {
  let value = false;
  let readable = false;
  for (const key of ["localStorage", "sessionStorage"] as const) {
    try { value ||= window[key].getItem("isLoggedIn") === "true"; readable = true; }
    catch { /* Keep the preview usable with site storage disabled. */ }
  }
  return readable ? value : null;
}

export function getDemoSession() { return signedIn; }

export function setDemoSession(next: boolean) {
  signedIn = next;
  for (const key of ["localStorage", "sessionStorage"] as const) {
    try {
      if (next) window[key].setItem("isLoggedIn", "true");
      else { window[key].removeItem("isLoggedIn"); window[key].removeItem("userName"); }
    } catch { /* The current tab's in-memory sign-in remains available. */ }
  }
  window.dispatchEvent(new CustomEvent("login-state-changed", { detail: { signedIn: next } }));
}

export function subscribeDemoSession(listener: () => void) {
  const changed = (event: Event) => {
    if (event instanceof CustomEvent && typeof event.detail?.signedIn === "boolean") signedIn = event.detail.signedIn;
    else signedIn = storedSession() ?? signedIn;
    listener();
  };
  const storageChanged = (event: StorageEvent) => {
    if (event.key !== "isLoggedIn" && event.key !== null) return;
    if (event.newValue !== "true") {
      signedIn = false;
      try { sessionStorage.removeItem("isLoggedIn"); } catch { /* Already signed out in memory. */ }
    } else signedIn = true;
    listener();
  };
  window.addEventListener("login-state-changed", changed);
  window.addEventListener("storage", storageChanged);
  return () => { window.removeEventListener("login-state-changed", changed); window.removeEventListener("storage", storageChanged); };
}
