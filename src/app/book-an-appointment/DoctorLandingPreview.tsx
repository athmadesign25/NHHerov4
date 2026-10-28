"use client";

import { useDesignVariant } from "@/features/design-preview/useDesignVariant";
import type { SearchCatalogs } from "@/features/search/design3Data";
import Design3SearchResults from "@/app/search/designs/d3/Design3SearchResults";
import Design4SearchResults from "@/app/search/designs/d4/Design4SearchResults";

import Design5SearchResults from "@/app/search/designs/d5/Design5SearchResults";
import Design6SearchResults from "@/app/search/designs/d6/Design6SearchResults";
import Design16SearchResults from "@/app/search/designs/d16/Design16SearchResults";
import Design17SearchResults from "@/app/search/designs/d17/Design17SearchResults";
import Design18SearchResults from "@/app/search/designs/d18/Design18SearchResults";
import Design19SearchResults from "@/app/search/designs/d19/Design19SearchResults";
import Design7SearchResults from "@/app/search/designs/d7/Design7SearchResults";
import Design15SearchResults from "@/app/search/designs/d15/Design15SearchResults";
import { isDesign15Variant, isJourneyDesign } from "@/features/design-preview/journeyDesigns";

export default function DoctorLandingPreview({ catalogs }: { catalogs: SearchCatalogs }) {
  const variant = useDesignVariant("search-top");
  if (variant === null) return <p role="status">Loading doctors…</p>;
  if (isDesign15Variant(variant)) return <Design15SearchResults design={variant} catalogs={catalogs} />;
  if (isJourneyDesign(variant)) return <Design7SearchResults design={variant} catalogs={catalogs} />;
  if (variant === "d16") return <Design16SearchResults catalogs={catalogs} />;
  if (variant === "d17" || variant === "d17-lite") return <Design17SearchResults variant={variant} catalogs={catalogs} />;
  if (variant === "d18") return <Design18SearchResults catalogs={catalogs} />;
  if (variant === "d19") return <Design19SearchResults catalogs={catalogs} />;
  if (variant === "d6") return <Design6SearchResults catalogs={catalogs} />;
  if (variant === "d5") return <Design5SearchResults catalogs={catalogs} />;
  return variant === "d4" ? <Design4SearchResults catalogs={catalogs} /> : <Design3SearchResults catalogs={catalogs} />;
}
