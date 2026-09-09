# Narayana Health Redesign (NHHerov4) Design System

This document outlines the core design tokens, typography, colors, and layout principles used throughout the Narayana Health website redesign. These values are mapped to CSS Custom Properties (Variables) defined in `src/app/globals.css`.

---

## 1. Color Palette

The project strictly follows a customized color palette tailored for trust, health, and a premium aesthetic.

### Brand Colors
- **Primary Blue** (`--color-primary`): `#034EA2` — Core brand color used for navigation, CTAs, and active states.
- **Primary Dark** (`--color-primary-dark`): `#023070` — Used for hover states and gradient depths.
- **Primary Light** (`--color-primary-light`): `#EEF3FA` — Used for subtle tags, active backgrounds, and cards.
- **Primary Mid** (`--color-primary-mid`): `#1565C0` — Vibrant accent for gradients.
- **Primary Tint** (`--color-primary-tint`): `rgba(3, 78, 162, 0.08)` — Very subtle interactive background.

### Action Colors
- **Emergency / Urgent** (`--color-emergency`): `#ED1C24` — Used for critical CTAs (e.g., "Book Appointment", "Emergency").
- **Emergency Light** (`--color-emergency-light`): `#FFF0F0` — Background for emergency tags.
- **Success** (`--color-success`): `#22C55E`
- **Warning** (`--color-warning`): `#F59E0B`

### Text & Neutrals
- **Text Main** (`--color-text`): `#1A1A2E` — Primary text color for maximum readability.
- **Text Secondary** (`--color-text-secondary`): `#4A5568` — Subtitles and descriptions.
- **Text Muted** (`--color-text-muted`): `#718096` — Placeholder text and minor labels.
- **Text Inverse** (`--color-text-inverse`): `#FFFFFF` — Text placed on dark backgrounds or primary colored elements.

### Backgrounds & Surfaces
- **App Background** (`--color-bg`): `#fafcfc` — Very light gray/blue tint for the main application background.
- **Alternate Background** (`--color-bg-alt`): `#F3F5F9` — For section contrast.
- **Card Surface** (`--color-bg-card`): `#FFFFFF` — White surfaces for elevated elements.
- **Border Default** (`--color-border`): `#E2E8F0`
- **Border Light** (`--color-border-light`): `#EEF2F7`

---

## 2. Typography

We exclusively use the **Inter** typeface (loaded via Google Fonts) for a modern, clean, and highly legible appearance. 
*Note: Fluid typography using `clamp()` should be used for responsive headings.*

### Type Scale (Static Fallbacks)
- `var(--font-size-xs)`: 12px
- `var(--font-size-sm)`: 14px
- `var(--font-size-base)`: 16px
- `var(--font-size-lg)`: 18px
- `var(--font-size-xl)`: 20px
- `var(--font-size-2xl)`: 24px
- `var(--font-size-3xl)`: 30px
- `var(--font-size-4xl)`: 36px
- `var(--font-size-5xl)`: 48px
- `var(--font-size-6xl)`: 60px
- `var(--font-size-7xl)`: 72px

### Font Weights
- `400` (Regular): Body text.
- `500` (Medium): Subtitles, standard buttons.
- `600` (Semi-bold): Labels, primary buttons, small headings.
- `700` (Bold): Section titles, highlight stats.
- `800` (Extra Bold): Main Hero Headlines (`<h1>`).

---

## 3. Spacing System (8px Scale)

All margins, paddings, and gaps must follow the 8-point grid scale to ensure consistent rhythm.

- `--sp-1`: 8px
- `--sp-2`: 16px
- `--sp-3`: 24px
- `--sp-4`: 32px
- `--sp-5`: 40px
- `--sp-6`: 48px
- `--sp-8`: 64px
- `--sp-10`: 80px
- `--sp-12`: 96px
- `--sp-16`: 128px

---

## 4. Layout & Grid

### Max Width & Container
- **Container Max Width**: `1240px` max content width, though `.container` allows for 100% width with extreme paddings (`0 250px` on very large screens) scaling down gracefully on smaller viewports.
- **Navigation Height**: `--nav-height: 72px`
- **Standard Grid**: 12-column grid system via `.grid-12` class with `--sp-3` (24px) gap.

### Container Breakpoints
- **Desktop (Default)**: Horizontal padding of `250px` (or `var(--sp-3)` / dynamic margins depending on the specific wrapper constraints).
- **Tablet (`<1024px`)**: Horizontal padding of `var(--sp-2)` (16px).
- **Mobile (`<768px`)**: Horizontal padding of `16px`.

---

## 5. UI Elements & Primitives

### Border Radius
- `--radius-sm`: 6px
- `--radius-md`: 10px
- `--radius-lg`: 14px
- `--radius-xl`: 20px
- `--radius-full`: 9999px (Pills, circular buttons)

### Shadows & Elevation
- `--shadow-sm`: Rest state for subtle cards / buttons.
- `--shadow-md`: Hover state for primary buttons.
- `--shadow-lg`: Dropdowns, popovers, and elevated modal headers.
- `--shadow-xl`: Primary modals and the floating Pulse AI entry point.
- `--shadow-card-hover`: Special hover elevation for interactive grids (Specialities, Packages).

### Animation & Transitions
- `--transition-fast`: `150ms ease-out` (Color changes, opacity).
- `--transition-base`: `250ms ease-out` (Transformations, scaling).
- `--transition-slow`: `400ms ease-out` (Complex layout shifts).

Framer Motion is primarily used for complex micro-interactions, utilizing spring physics `ease: [0.16, 1, 0.3, 1]` for natural motion.

---

## 6. CSS Architecture Rules
1. **Vanilla CSS Modules**: Exclusively use `.module.css` for component styling. Do not use Tailwind or inline styles for static layout values.
2. **CSS Variables**: Never hardcode colors or spacing. Always use `var(--color-...)` or `var(--sp-...)`.
3. **Glassmorphism**: When implementing glass layers (like the Pulse AI overlay), use `backdrop-filter: blur(12px)` with a semi-transparent `rgba()` background.
4. **Scrollbars**: Native scrollbars are hidden across the application globally (`::-webkit-scrollbar { display: none }`) to rely on Lenis smooth scroll and custom visual implementations.
