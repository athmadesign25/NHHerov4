"use client";

import React, { Suspense } from "react";
import SpecialityDesign2 from "@/components/speciality/SpecialityDesign2";

function CentreOfExcellenceContent({ slug }: { slug: string }) {
  return <SpecialityDesign2 slug={slug} isCoE={true} />;
}

export default function CentreOfExcellencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  return (
    <Suspense fallback={<SpecialityDesign2 slug={slug} isCoE={true} />}>
      <CentreOfExcellenceContent slug={slug} />
    </Suspense>
  );
}
