"use client";

import type { SearchCatalogs } from "@/features/search/design3Data";
import Design20SearchResults from "@/app/search/designs/d20/Design20SearchResults";

export default function DoctorLandingPreview({ catalogs }: { catalogs: SearchCatalogs }) {
  return <Design20SearchResults catalogs={catalogs} />;
}
