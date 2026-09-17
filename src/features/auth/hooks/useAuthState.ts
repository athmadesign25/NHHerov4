import { useState, useEffect } from "react";

export function useAuthState() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    }
    
    const handleLoginChange = () => {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    };
    
    window.addEventListener("login-state-changed", handleLoginChange);
    return () => window.removeEventListener("login-state-changed", handleLoginChange);
  }, []);

  return { isUserLoggedIn, setIsUserLoggedIn };
}
