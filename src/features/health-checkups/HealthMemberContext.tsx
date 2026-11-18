"use client";

import { createContext, useContext } from "react";

export const HealthMemberContext = createContext<{ ready: boolean; confirmMember: () => void }>({
  ready: false,
  confirmMember: () => {},
});

export function useHealthMember() { return useContext(HealthMemberContext); }
