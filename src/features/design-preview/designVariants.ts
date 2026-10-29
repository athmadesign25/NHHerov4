/**
 * Design Iteration Registry — DEVELOPMENT / STAKEHOLDER PREVIEW ONLY.
 *
 * Each "scope" is one redesignable area of the site. Every scope lists its
 * design iterations; the switcher renders exactly this list.
 *
 *  - Add an iteration    → append an entry to `variants`.
 *  - Rename an iteration → change `label` (keep `id` stable so saved
 *                          selections and shared `?design=` links still work).
 *  - Remove an iteration → delete the entry and its render branch.
 *  - Promote a winner    → set `defaultVariant` to its id, then delete the
 *                          losing branches (including "original") when ready.
 *
 * `original` is the untouched pre-redesign UI. It is kept verbatim in the
 * page component itself — never in Git history — so it is always available.
 */

export interface DesignVariant {
  /** Stable id — used in localStorage and `?design=` links. */
  id: string;
  /** Short label shown in the switcher. */
  label: string;
  /** One-line description shown under the label. */
  note?: string;
  /** Listed but not selectable (placeholder for upcoming concepts). */
  disabled?: boolean;
}

export interface DesignScope {
  /** Variant shown when preview is disabled or nothing is selected. */
  defaultVariant: string;
  variants: DesignVariant[];
}

/** Current public doctor discovery and appointment journey. */
export const DEFAULT_DOCTOR_DESIGN = "d20";

export const DESIGN_SCOPES = {
  "search-top": {
    defaultVariant: DEFAULT_DOCTOR_DESIGN,
    variants: [
      { id: "original", label: "Original", note: "Pre-redesign UI" },
      { id: "d1", label: "Design 1", note: "Compact sticky search · mobile filters" },
      { id: "d2", label: "Design 2", note: "Pure Booking Engine · Unified capsule" },
      { id: "d2c", label: "Design 2 · Compact card", note: "Design 2 with compact doctor card" },
      { id: "d3", label: "Design 3", note: "Six-category search · refined controls · compact cards", disabled: false },
      { id: "d4", label: "Design 4", note: "More doctors at a glance · compact comparison cards" },
      { id: "d5", label: "Design 5", note: "Minimal cards · clear credentials · compact booking" },
      { id: "d6", label: "Design 6", note: "Full portrait · dark gradient · glass details" },
      { id: "d7", label: "Design 7", note: "Midnight glass · complete booking · payment preview" },
      { id: "d8", label: "Design 8", note: "Pearl · light glass · portrait gallery" },
      { id: "d9", label: "Design 9", note: "Contrast · dark introduction · light workspace" },
      { id: "d10", label: "Design 10", note: "Daybreak · dark to light · editorial directory" },
      { id: "d11", label: "Design 11", note: "Clarity · scan credentials · compare doctors side by side" },
      { id: "d12", label: "Design 12", note: "Midnight clarity · dark canvas · readable light doctor cards" },
      { id: "d13", label: "Design 13", note: "Care, without the wait · direct slots · simpler checkout" },
      { id: "d14", label: "Design 14", note: "Care, in focus · focused filters · direct slots · simpler checkout" },
      { id: "d15-light", label: "Design 15 · Light", note: "Compact cards · smart availability · login before slots" },
      { id: "d15-dark", label: "Design 15 · Dark", note: "Midnight glass · smart availability · login before slots" },
      { id: "d16", label: "Design 16", note: "Design 6 · location-first compact search" },
      { id: "d17", label: "Design 17", note: "Refined glass cards · clear credentials · easier comparison" },
      { id: "d17-lite", label: "Design 17 – Lite", note: "Pearl glass cards · same layout and booking experience" },
      { id: "d18", label: "Design 18", note: "Pearl glass · appointment workspace · connected booking" },
      { id: "d19", label: "Design 19", note: "Pearl glass · book inside the doctor card" },
      { id: "d20", label: "Design 20", note: "Design 19 baseline · doctor card refinements" },
    ],
  },
} satisfies Record<string, DesignScope>;

export type DesignScopeKey = keyof typeof DESIGN_SCOPES;

/**
 * The switcher is visible in local development, and on preview deployments
 * that explicitly opt in with NEXT_PUBLIC_DESIGN_PREVIEW=true.
 * In production builds without that flag, every scope is locked to its
 * `defaultVariant` and the switcher renders nothing.
 */
export const DESIGN_PREVIEW_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true";
