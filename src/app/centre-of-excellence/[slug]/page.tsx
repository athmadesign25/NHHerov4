"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SpecialityDesign1 from "@/components/speciality/SpecialityDesign1";
import SpecialityDesign2 from "@/components/speciality/SpecialityDesign2";
import SpecialityDesignController, { SpecialityDesignId } from "@/components/speciality/SpecialityDesignController";

function CentreOfExcellenceContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const queryDesign = searchParams.get("design");

  // Default oncology to design 2 unless explicit query param design=1
  const initialDesign: SpecialityDesignId = 
    queryDesign === "2" ? 2 : queryDesign === "1" ? 1 : slug === "oncology" ? 2 : 1;
  const [activeDesign, setActiveDesign] = useState<SpecialityDesignId>(initialDesign);

  useEffect(() => {
    if (queryDesign === "2") {
      setActiveDesign(2);
      return;
    } else if (queryDesign === "1") {
      setActiveDesign(1);
      return;
    }

    try {
      const saved = localStorage.getItem("nh_coe_design");
      if (saved === "2") {
        setActiveDesign(2);
      } else if (saved === "1") {
        setActiveDesign(1);
      }
    } catch {
      // Ignore
    }
  }, [searchParams]);

  const handleDesignChange = (id: SpecialityDesignId) => {
    setActiveDesign(id);
    try {
      localStorage.setItem("nh_coe_design", String(id));
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
          key={`coe-design-${activeDesign}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {activeDesign === 1 ? (
            <SpecialityDesign1 slug={slug} isCoE={true} />
          ) : (
            <SpecialityDesign2 slug={slug} isCoE={true} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function CentreOfExcellencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  return (
    <Suspense fallback={<SpecialityDesign1 slug={slug} isCoE={true} />}>
      <CentreOfExcellenceContent slug={slug} />
    </Suspense>
  );
}

