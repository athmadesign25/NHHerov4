"use client";

import React, { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PulseAIWorkspace from "@/features/pulse-ai/PulseAIWorkspace";

interface HeroPulseEntryProps {
  isPulseActive: boolean;
  setIsPulseActive: Dispatch<SetStateAction<boolean>>;
  isPulseAnalyzed: boolean;
  hasSubmittedQuery: boolean;
  setHasSubmittedQuery: Dispatch<SetStateAction<boolean>>;
  pulseInitialAction: string | null;
  pulseInitialActionData: any;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  isUserLoggedIn: boolean;
}

export default function HeroPulseEntry({
  isPulseActive,
  setIsPulseActive,
  isPulseAnalyzed,
  hasSubmittedQuery,
  setHasSubmittedQuery,
  pulseInitialAction,
  pulseInitialActionData,
  searchQuery,
  setSearchQuery,
  isUserLoggedIn
}: HeroPulseEntryProps) {
  return (
    <AnimatePresence>
      {isPulseActive && (
        <motion.div
          key="pulse-workspace-overlay"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            backgroundColor: "#fcfcfc",
            overflow: "hidden"
          }}
        >
          <PulseAIWorkspace 
            onClose={() => setIsPulseActive(false)}
            initialQuery={pulseInitialAction ? "" : searchQuery}
            initialAction={pulseInitialAction}
            initialActionData={pulseInitialActionData}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
