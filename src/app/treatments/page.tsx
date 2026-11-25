"use client";

import React, { Suspense } from "react";
import TreatmentsV2Library from "@/components/treatments/TreatmentsV2Library";

export default function TreatmentsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "80vh", paddingTop: "140px", textAlign: "center", color: "#64748B" }}>
          Loading procedures &amp; treatments...
        </div>
      }
    >
      <TreatmentsV2Library />
    </Suspense>
  );
}
