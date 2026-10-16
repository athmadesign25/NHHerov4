import { useState, useEffect } from "react";

export function useAuthState() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("isLoggedIn") === "true";
        const session = sessionStorage.getItem("isLoggedIn") === "true";
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
