import { getDoctorLandingContext } from "./doctorLandingPages";

export type Design17Variant = "d17" | "d17-lite" | "d18" | "d19";

/** Restore only a local doctor directory, retaining its refinements and current preview. */
export function design17ListingReturnTo(returnTo: string | null | undefined, design: Design17Variant): string {
  const fallback = `/search/doctors?design=${design}&location=All`;
  if (!returnTo?.startsWith("/") || returnTo.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(returnTo)) return fallback;

  try {
    const url = new URL(returnTo, "https://nh.local");
    const pathname = url.pathname.replace(/\/$/, "");
    if (url.origin !== "https://nh.local" || !(["/search", "/search/doctors"].includes(pathname) || getDoctorLandingContext(pathname))) return fallback;
    url.searchParams.set("design", design);
    // A listing has no return destination of its own. Avoid recursive context URLs.
    url.searchParams.delete("returnTo");
    if (design === "d18" || design === "d19") {
      // The inline workspace lives on the directory route. A directory link
      // closes that workspace while retaining discovery refinements.
      for (const key of ["booking", "hospital", "date", "time", "step", "ref"]) url.searchParams.delete(key);
      if (design === "d19") url.searchParams.delete("bookingMode");
    }
    return `${pathname}?${url.searchParams}`;
  } catch {
    return fallback;
  }
}

/** Keep global doctor-navigation links inside the explicitly selected directory preview. */
export function design17DoctorNavigationHref(href: string, pathname: string, params: URLSearchParams): string {
  const design = pathname === "/" ? "d17-lite" : params.get("design");
  if (design !== "d17" && design !== "d17-lite" && design !== "d18" && design !== "d19") return href;
  if (href === "/book-an-appointment") {
    const onListing = ["/search", "/search/doctors"].includes(pathname) || Boolean(getDoctorLandingContext(pathname));
    return design17ListingReturnTo(onListing ? `${pathname}?${params}` : params.get("returnTo"), design);
  }
  const destination = new URL(href, "https://nh.local");
  if (destination.origin !== "https://nh.local" || !(destination.pathname.startsWith("/book-an-appointment/") || destination.pathname === "/search/doctors")) return href;
  destination.searchParams.set("design", design);
  const listing = new URL(design17ListingReturnTo(params.get("returnTo"), design), "https://nh.local");
  for (const key of ["location", "mode"]) {
    const value = design === "d19" && key === "mode" && params.get("returnTo")
      ? listing.searchParams.get(key) ?? params.get(key)
      : params.get(key) ?? listing.searchParams.get(key);
    if (value) destination.searchParams.set(key, value);
  }
  return `${destination.pathname}?${destination.searchParams}`;
}
