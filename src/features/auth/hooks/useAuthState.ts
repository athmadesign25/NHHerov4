import { useState, useEffect } from "react";

export function useAuthState() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      if (typeof window !== "undefined") {
        let local = false;
        let session = false;
        try { local = localStorage.getItem("isLoggedIn") === "true"; } catch { /* Persistent storage may be blocked. */ }
        try { session = sessionStorage.getItem("isLoggedIn") === "true"; } catch { /* Treat an unavailable store as signed out. */ }
        setIsUserLoggedIn(local || session);
      }
    };

    checkStatus();

    window.addEventListener("login-state-changed", checkStatus);
    window.addEventListener("storage", checkStatus);
    return () => {
      window.removeEventListener("login-state-changed", checkStatus);
      window.removeEventListener("storage", checkStatus);
    };
  }, []);

  return { isUserLoggedIn, setIsUserLoggedIn };
}
