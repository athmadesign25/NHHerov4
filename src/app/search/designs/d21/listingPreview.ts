/** Listing interaction previews share the latest directory and booking context. */
export const LISTING_PREVIEWS = [
  { value: "a", label: "Design A" },
] as const;

export type ListingPreview = typeof LISTING_PREVIEWS[number]["value"];

export function resolveListingPreview(value: string | null | undefined): ListingPreview {
  return LISTING_PREVIEWS.find(preview => preview.value === value)?.value ?? "a";
}
