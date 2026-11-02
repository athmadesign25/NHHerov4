"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SpecialityDesign1 from "@/components/speciality/SpecialityDesign1";
import SpecialityDesign2 from "@/components/speciality/SpecialityDesign2";
import SpecialityDesignController, { SpecialityDesignId } from "@/components/speciality/SpecialityDesignController";
import { ALL_SPECIALITIES } from "@/data/specialities";

function SpecialityPageContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const queryDesign = searchParams.get("design");
  const coeParam = searchParams.get("coe");
  const currentSpec = ALL_SPECIALITIES.find((s) => s.slug === slug);
  const isCoE = coeParam !== null ? coeParam === "true" : Boolean(currentSpec?.isCoE);

  const initialDesign: SpecialityDesignId = queryDesign === "2" ? 2 : 1;
  const [activeDesign, setActiveDesign] = useState<SpecialityDesignId>(initialDesign);

  useEffect(() => {
    // 1. Read URL query param ?design=1 or ?design=2
    if (queryDesign === "2") {
      setActiveDesign(2);
      return;
    } else if (queryDesign === "1") {
      setActiveDesign(1);
      return;
    }

    // 2. Fall back to localStorage if available
    try {
      const saved = localStorage.getItem("nh_speciality_design");
      if (saved === "2") {
        setActiveDesign(2);
      } else if (saved === "1") {
        setActiveDesign(1);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [searchParams]);

  const handleDesignChange = (id: SpecialityDesignId) => {
    setActiveDesign(id);
    try {
      localStorage.setItem("nh_speciality_design", String(id));
    } catch {
      // Ignore
    }

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("design", String(id));
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <>
      <SpecialityDesignController
        activeDesign={activeDesign}
        onDesignChange={handleDesignChange}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={`design-${activeDesign}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {activeDesign === 1 ? (
            <SpecialityDesign1 slug={slug} isCoE={isCoE} />
          ) : (
            <SpecialityDesign2 slug={slug} isCoE={isCoE} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function SpecialityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  return (
    <Suspense fallback={<SpecialityDesign1 slug={slug} />}>
      <SpecialityPageContent slug={slug} />
    </Suspense>
  );
}
