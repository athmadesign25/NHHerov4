/**
 * Marketing banner configuration.
 *
 * This shape is the contract. The control panel writes it locally today;
 * a headless CMS writes the same shape later, so the component does not
 * change when the source does.
 *
 * The set of choices keeps shrinking on purpose. Position, scrim shade,
 * headline size, line breaks and button style were all controls once.
 * Each was a way for two banners to stop looking like the same brand, and
 * none of them was a decision marketing actually needed to make.
 */

/** The banner's shape. It is always centred; only the proportion varies. */
export type Orientation = "horizontal" | "vertical";

/**
 * Where the banner goes when it is closed. "island" is what used to be
 * "fab": the floating action bar is gone, and the search experience's
 * bottom dock inherited the slot.
 */
export type CollapseMode = "none" | "toast" | "island";

export type ColorOption = {
  id: string;
  label: string;
  /** Always a var() so the palette stays the single source. */
  value: string;
};

/**
 * A headline is a LIST of parts, not a string, so one headline can carry
 * more than one colour. Each part is its own line; parts can be added,
 * removed and reordered.
 */
export type HeadlinePart = {
  id: string;
  text: string;
  colorId: string;
};

/**
 * A form field. `kind` chooses the input's behaviour — its type, its
 * autofill hint, its keyboard and its length cap — while `label` stays
 * free text, so "Phone" can become "WhatsApp number" without the field
 * stopping being a phone number as far as the browser is concerned.
 */
export type FieldKind = "name" | "phone" | "custom";

export type FormField = {
  id: string;
  kind: FieldKind;
  label: string;
};

export type CtaConfig = {
  enabled: boolean;
  label: string;
  href: string;
};

export type BannerConfig = {
  orientation: Orientation;
  /**
   * One image per shape. A single asset cannot serve both proportions —
   * forcing it to is what made the wide version soft, because a near-square
   * image had to stretch across a letterbox.
   */
  image: {
    vertical: { src: string; alt: string };
    horizontal: { src: string; alt: string };
  };
  /**
   * The headline can be switched off entirely, for artwork that carries
   * its own typography. See `needsScrim` for what that does to the panel.
   */
  headline: { enabled: boolean; parts: HeadlinePart[] };
  description: { enabled: boolean; text: string };
  /** At most MAX_FIELDS. A banner is not a registration page. */
  form: { enabled: boolean; fields: FormField[] };
  /**
   * Two at most, and the second is always the quieter one. A pair of
   * equally loud buttons is a pair of buttons nobody presses.
   */
  cta: { primary: CtaConfig; secondary: CtaConfig };
  collapse: CollapseMode;
};

/**
 * Whether the panel paints its readability scrim over the image.
 *
 * Derived, not configured. The scrim exists so type can sit on artwork;
 * with no type there is nothing to make readable, and an image that was
 * composed with its own text baked in gets covered up by one. A CTA does
 * not count — a filled button carries its own ground.
 */
export const needsScrim = (c: BannerConfig) =>
  c.headline.enabled || c.description.enabled || c.form.enabled;

/* ─── The closed sets ──────────────────────────────────────────────────── */

/**
 * The scrim is always light — a cool off-white rather than pure #FFF, so
 * it sits in the same family as the rest of the UI. No dark variant, no
 * shade picker.
 */
export const OVERLAY_RGB = "var(--slate-50-rgb)";

/**
 * Headline colours: ink for the copy, red for the accent, nothing else.
 * Blue was offered and removed — against a blue brand, a blue accent on a
 * light panel reads as a link rather than emphasis.
 */
export const TEXT_COLORS: ColorOption[] = [
  { id: "black", label: "Black", value: "var(--navy-ink)" },
  { id: "red", label: "Red", value: "var(--red-emergency)" },
];

/** Body copy takes the readable neutral. Not a choice. */
export const DESCRIPTION_COLOR = "var(--slate-600)";

/** Two is the ceiling. Past that it stops being a banner. */
export const MAX_FIELDS = 2;

/**
 * What each field kind means to the browser. The label is editable; none
 * of this is — a field labelled "Mobile" still has to autofill as a
 * phone number and still has to open a numeric keypad.
 */
export const FIELD_PRESETS: Record<
  FieldKind,
  {
    label: string;
    type: string;
    autoComplete: string;
    inputMode?: "text" | "numeric" | "tel";
    maxLength?: number;
    pattern?: string;
  }
> = {
  name: { label: "Name", type: "text", autoComplete: "name", inputMode: "text", maxLength: 60 },
  phone: {
    label: "Phone",
    type: "tel",
    autoComplete: "tel",
    inputMode: "numeric",
    // Ten digits, which is what an Indian mobile number is.
    maxLength: 10,
    pattern: "[0-9]{10}",
  },
  custom: { label: "Label", type: "text", autoComplete: "off", inputMode: "text", maxLength: 60 },
};

export const resolve = (id: string) =>
  (TEXT_COLORS.find((c) => c.id === id) ?? TEXT_COLORS[0]).value;

/**
 * What the FAB tile says. Generic on purpose: a tile is about 56px wide,
 * so any campaign-specific line either wraps to three rows or gets cut.
 * The toast has room for the real headline and uses that instead.
 */
export const COLLAPSED_LABEL = "News!";

export const DEFAULT_CONFIG: BannerConfig = {
  orientation: "vertical",
  image: {
    vertical: {
      src: "/marketing-tall.jpg",
      alt: "A woman playing hopscotch in her apartment courtyard as neighbours watch",
    },
    horizontal: {
      src: "/marketing-wide.jpg",
      alt: "Narayana Health hospital exterior at sunset",
    },
  },
  headline: {
    enabled: true,
    parts: [
      { id: "h1", text: "Advanced Healthcare", colorId: "black" },
      { id: "h2", text: "Coming Soon to", colorId: "red" },
      { id: "h3", text: "Banashankari", colorId: "black" },
    ],
  },
  description: {
    enabled: false,
    text: "Multi-speciality care, 24x7 emergency and diagnostics — opening shortly.",
  },
  form: {
    enabled: false,
    fields: [
      { id: "f1", kind: "name", label: "Name" },
      { id: "f2", kind: "phone", label: "Phone" },
    ],
  },
  cta: {
    primary: { enabled: true, label: "Book Appointment", href: "/appointment" },
    secondary: { enabled: false, label: "Know more", href: "/specialities" },
  },
  collapse: "toast",
};
