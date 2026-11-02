/** Design 20 is the sole doctor discovery and booking flow in this handoff. */
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
      { id: "d20", label: "Design 20", note: "Doctor discovery and appointment booking" },
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
