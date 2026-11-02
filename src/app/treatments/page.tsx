"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TreatmentsV1SpecialityStyle from "@/components/treatments/TreatmentsV1SpecialityStyle";
import TreatmentsV2Library from "@/components/treatments/TreatmentsV2Library";
import type { TreatmentsVersionId } from "@/components/treatments/TreatmentsVersionController";

function TreatmentsPageContent() {
  const searchParams = useSearchParams();
  const queryVersion = searchParams?.get("v") || searchParams?.get("version") || searchParams?.get("design");

  const initialVersion: TreatmentsVersionId = queryVersion === "2" ? 2 : 1;
  const [activeVersion, setActiveVersion] = useState<TreatmentsVersionId>(initialVersion);

  useEffect(() => {
    if (queryVersion === "2") {
      setActiveVersion(2);
      return;
    } else if (queryVersion === "1") {
      setActiveVersion(1);
      return;
    }

    try {
      const saved = localStorage.getItem("nh_treatments_version");
      if (saved === "2") setActiveVersion(2);
      else if (saved === "1") setActiveVersion(1);
    } catch {
      // Ignore in private mode
    }
  }, [searchParams, queryVersion]);

  const handleVersionChange = (id: TreatmentsVersionId) => {
    setActiveVersion(id);
    try {
      localStorage.setItem("nh_treatments_version", String(id));
    } catch {
      // Ignore
    }

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("v", String(id));
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Global hotkeys 1 and 2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "1") {
        handleVersionChange(1);
      } else if (e.key === "2") {
        handleVersionChange(2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`version-${activeVersion}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {activeVersion === 1 ? (
          <TreatmentsV1SpecialityStyle
            activeVersion={activeVersion}
            onVersionChange={handleVersionChange}
          />
        ) : (
          <TreatmentsV2Library
            activeVersion={activeVersion}
            onVersionChange={handleVersionChange}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function TreatmentsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "80vh", paddingTop: "140px", textAlign: "center", color: "#64748B" }}>
          Loading procedures &amp; treatments...
        </div>
      }
    >
      <TreatmentsPageContent />
    </Suspense>
  );
}
