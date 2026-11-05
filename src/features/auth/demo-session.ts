// The booking preview's sign-in flag is not an authentication token.
// Identities, OTPs and member details stay out of browser storage.
let memoryFallback: boolean | null = null;

export function getDemoSession() {
  let signedIn = false;
  let readable = false;
  for (const key of ["localStorage", "sessionStorage"] as const) {
    try {
      signedIn ||= window[key].getItem("isLoggedIn") === "true";
      readable = true;
    } catch { /* Site storage may be unavailable. */ }
  }
  return memoryFallback ?? (readable && signedIn);
}

export function setDemoSession(signedIn: boolean) {
  let saved = false;
  for (const key of ["localStorage", "sessionStorage"] as const) {
    try {
      if (signedIn) window[key].setItem("isLoggedIn", "true");
      else {
        window[key].removeItem("isLoggedIn");
        window[key].removeItem("userName");
      }
      saved = true;
    } catch { /* Keep the current preview usable without persistent storage. */ }
  }
  memoryFallback = saved ? null : signedIn;
  window.dispatchEvent(new Event("login-state-changed"));
}

export function subscribeDemoSession(listener: () => void) {
  const storageChange = (event: StorageEvent) => {
    if ((event.key === "isLoggedIn" || event.key === null) && event.newValue !== "true") {
      // A sign-out in another tab also clears this tab's fallback session flag.
      memoryFallback = null;
      try { sessionStorage.removeItem("isLoggedIn"); } catch { memoryFallback = false; }
    } else if (event.key === "isLoggedIn" && event.newValue === "true") memoryFallback = null;
    listener();
  };
  window.addEventListener("login-state-changed", listener);
  window.addEventListener("storage", storageChange);
  return () => {
    window.removeEventListener("login-state-changed", listener);
    window.removeEventListener("storage", storageChange);
  };
}
