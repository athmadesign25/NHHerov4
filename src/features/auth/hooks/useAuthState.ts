"use client";

import { useSyncExternalStore } from "react";
import { getDemoSession, setDemoSession, subscribeDemoSession } from "../demo-session";

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function useAuthState() {
  const isUserLoggedIn = useSyncExternalStore(subscribeDemoSession, getDemoSession, () => false);
  const isAuthReady = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  return { isAuthReady, isUserLoggedIn, setIsUserLoggedIn: setDemoSession };
}
