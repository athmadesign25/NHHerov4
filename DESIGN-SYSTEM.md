# Design system — how to work with it

For developers and designers building new pages on this codebase.
If you are adding a Specialities page, a booking step, or anything else
new, read this first. It takes five minutes and will save you a review.

---

## The one rule

**Never write a raw value in a component.** No hex, no `rgba()`, no `16px`,
no `0.3s`, no `cubic-bezier(...)`.

Reach for a token, in this order:

1. **A semantic token** — `--color-text-secondary`, `--color-border`,
   `--color-surface`. Says what it is *for*. Prefer these.
2. **A primitive** — `--slate-500`, `--blue-brand`, `--font-size-sm`. Says
   what it *is*. Use when no semantic token fits.
3. **Nothing else.** If neither fits, see "Adding a token" below — but read
   "When not to add one" first, because usually one does fit.

Why it matters: the brand blue was wrong in the CSS for months (`#034EA2`
instead of the `#034EA1` in our actual logo artwork). Fixing it touched 143
places. Had those been literals, it would still be wrong.

---

## What exists

Open **`/ds-lab`** in the running app. It lists every token with its real
value, rendered. It reads them from the stylesheet at runtime, so it cannot
be out of date.

Short version:

| Group | Tokens | Notes |
|---|---|---|
| Colour | ~62 | Slate ramp 50–900, brand blue, emergency red, accents |
| Alpha | 20 steps | `rgba(var(--white-rgb), 0.08)` — compose, don't hardcode |
| Type | 12 sizes, 6 leading | `--font-size-*`, `--leading-*` |
| Spacing | `--sp-1`…`--sp-16` | 8px scale |
| Radius | 5 | `--radius-sm` … `--radius-full` |
| Elevation | 5 + focus + inset | `--elevation-1` … `--elevation-5` |
| Motion | 8 durations, 3 easings | `--duration-*`, `--ease-*` |

---

## Patterns you will need

### Colour at an opacity

Do **not** write `rgba(255, 255, 255, 0.08)`. Compose from the channel var:

```css
background: rgba(var(--white-rgb), 0.08);
border-color: rgba(var(--blue-brand-rgb), 0.2);
```

Alphas come from the scale: `0.03 0.05 0.08 0.1 0.12 0.16 0.2 0.25 0.3 0.35
0.4 0.5 0.6 0.7 0.8 0.85 0.9 0.95`. Snap to the nearest — do not invent
`0.07`.

### Shadows

Use the elevation ramp. For a **brand-coloured** shadow, retint it rather
than writing a coloured shadow by hand:

```css
.bookButton {
  --shadow-rgb: var(--red-emergency-rgb);
  box-shadow: var(--elevation-1);
}
.bookButton:hover {
  box-shadow: var(--elevation-2);   /* hover steps the ramp */
}
```

Hover should **step the ramp**, not brighten a glow.

### Type

Size and leading travel together. Pick the leading for the size:

```css
.cardTitle { font-size: var(--font-size-xl);  line-height: var(--leading-snug); }
.cardBody  { font-size: var(--font-size-sm);  line-height: var(--leading-body); }
```

Rough guide: under 20px → `normal`/`body`/`relaxed`; 20–30px → `snug`;
30px+ → `tight`.

### Section spacing

Every major section uses one of three steps for its vertical padding. Pick
one — do not invent a fourth number.

```css
.specialitySection { padding: var(--section-y) 0; }
```

| Token | Desktop | Use for |
|---|---|---|
| `--section-y-lg` | 160px | A section that should feel like a moment — hero-adjacent, full-bleed feature |
| `--section-y` | 120px | **The default.** Reach for this unless there is a reason not to |
| `--section-y-sm` | 60px | Dense or secondary bands — a stats strip, related links, a compact CTA |

They step down together at 1024px and 768px, so the relationship between
them holds at every width. You do not need to write a media query for it.

For spacing *inside* a section — between cards, rows, labels — use the
`--space-*` ramp instead.

### Motion

```css
transition: opacity var(--duration-base) var(--ease-out);
```

Duration scales with distance travelled: small/local is fast, large/entrance
is slow.

---

## Traps specific to this codebase

These have each caused a real bug here. Please read them.

**1. Framer Motion cannot read CSS variables.** It interpolates values
numerically in JS, so `var(--duration-base)` arrives as an uninterpolatable
string and the animation breaks. Import from `src/lib/motion.ts` instead:

```ts
import { duration, ease } from "@/lib/motion";
<motion.div transition={{ duration: duration.base, ease: ease.out }} />
```

The CSS tokens and that file hold the same values. Change one, change both.

**2. The `*` rule in `globals.css` that defines `--elevation-*` is
load-bearing.** Do not "tidy" it onto `:root`. A custom property substitutes
its own `var()` references on the element where it is *declared* — on
`:root`, the elevation tokens would bake in the default shadow colour and
every per-component retint would silently stop working. Nothing would error;
the shadows would just all go navy.

**3. `var()` does not work everywhere.** It resolves in CSS only. It will
**not** work in:
- WebGL shader props (`NeatGradient`, `LiquidMetalEdge` `colorBack`/`colorTint`)
- SVG presentation attributes (`stroke="..."`, `stopColor="..."`)
- Framer `animate` / `initial` / `whileHover` props

In those places a literal is correct. Leave them.

**4. Inline `style={{ }}` is fine for tokens**, since it is plain CSS:
`style={{ color: "var(--color-text-secondary)" }}`.

**5. `src/features/pulse-ai/` is outside the system** by decision. Do not
use it as a reference for how to write styles.

---

## Adding a token

### When not to add one

Most of the time you do not need one. Before adding, check:

- Is there a token within ~2px / one shade? **Use it.** Visual drift starts
  as "just slightly different".
- Is it used once? **Not a token.** A one-off belongs in the component.
- Is it a brand effect rather than a system value — a glow, a gradient, a
  bespoke animation? **Not a token.** Keep it local.

A token earns its place when it is used in **three or more places** across
**two or more components**.

### When to add one

Add it if it is a genuine new *role* the system has no answer for. Likely
candidates right now (see "Known gaps"):

- a disabled state colour
- a focus colour that works on dark surfaces

### How

1. Add it to `globals.css` in the right block — primitive or semantic.
2. Name it for **purpose** if semantic (`--color-border-strong`), for
   **value** if primitive (`--slate-350`).
3. If it will be used at an opacity, add the channel form too:
   `--x-rgb: 1, 2, 3;` and `--x: rgb(var(--x-rgb));`
4. Comment *why*, not what. The value is visible; the reasoning is not.
5. Check `/ds-lab` — it should appear automatically.

---

## Known gaps (as of this branch)

Things the system does **not** answer yet. If you hit one, raise it rather
than inventing a local fix:

| Gap | Impact |
|---|---|
| **No disabled token** | Every disabled control is a local opacity fudge |
| **No on-dark focus colour** | The focus ring is invisible on dark sections |
| **Spacing mostly literal** | ~700 literal `gap`/`padding` values; the 8px scale is barely adopted |
| **No components** | Buttons, inputs, cards are bespoke per file. 156 button class names exist |
| **~61 shadows still literal** | Mostly Pulse AI identity effects |
| **Undefined font vars** | `--font-sans` and `--font-inter` are referenced ~103 times but never defined; they work only via fallback |
| **Weights 450 / 550** | Used but not loaded from Google Fonts, so the browser approximates them |

---

## Before you open a PR

- [ ] No raw hex, `rgba()`, px font sizes or durations in your CSS
- [ ] Size and leading set together
- [ ] Hover steps the elevation ramp
- [ ] Checked at 375 / 768 / 1024 / 1440
- [ ] No horizontal scroll at 375
- [ ] Focus visible on every interactive element, on light **and** dark
- [ ] Any new token appears correctly in `/ds-lab`

---

## Questions

If a value does not fit the system, that is useful information — it usually
means the system has a gap. Raise it rather than working around it quietly,
because a workaround copied three times becomes the next thing someone has
to clean up.
