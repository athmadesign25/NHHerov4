/** Listing interaction previews share the latest directory and booking context. */
export const LISTING_PREVIEWS = [
  { value: "a", label: "Design A" },
  { value: "1", label: "With dim" },
  { value: "2", label: "Without dim" },
] as const;

export type ListingPreview = typeof LISTING_PREVIEWS[number]["value"];

export function resolveListingPreview(value: string | null | undefined): ListingPreview {
  return value === "1" || value === "2" ? value : "a";
}
