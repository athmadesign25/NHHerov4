"use client";

import { useSyncExternalStore } from "react";
import { getDemoSession, setDemoSession, subscribeDemoSession } from "../demo-session";

export function useAuthState() {
  const isUserLoggedIn = useSyncExternalStore(subscribeDemoSession, getDemoSession, () => false);
  return { isUserLoggedIn, setIsUserLoggedIn: setDemoSession };
}
