"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SpecialityDesign2 from "@/components/speciality/SpecialityDesign2";

function SpecialityPageContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const coeParam = searchParams.get("coe");
  const isCoE = coeParam !== null ? coeParam === "true" : false;

  return <SpecialityDesign2 slug={slug} isCoE={isCoE} />;
}

export default function SpecialityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  return (
    <Suspense fallback={<SpecialityDesign2 slug={slug} isCoE={false} />}>
      <SpecialityPageContent slug={slug} />
    </Suspense>
  );
}
