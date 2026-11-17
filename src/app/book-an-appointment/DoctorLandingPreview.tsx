"use client";

import type { SearchCatalogs } from "@/features/search/design3Data";
import Design21SearchResults from "@/app/search/designs/d21/Design21SearchResults";

export default function DoctorLandingPreview({ catalogs }: { catalogs: SearchCatalogs }) {
  return <Design21SearchResults catalogs={catalogs} />;
}
