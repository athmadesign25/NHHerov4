@AGENTS.md

---

# CLAUDE.md — NH Website Redesign Agent Instructions

> This file complements `AGENTS.md` with additional context specific to Claude/AI coding assistants working on this project.

## Quick Start

```bash
# Set Node.js PATH (required — no global install)
export PATH="/Users/a919418/Downloads/NH Website Redesign Concept 2/nh-website/node-v20.18.0-darwin-x64/bin:$PATH"

# Start dev server
cd "/Users/a919418/Downloads/NH Website Redesign 2/NH Redesign website/nh-redesign"
npm run dev
# → http://localhost:3000
```

---

## Critical Context

### This is a Healthcare Website
- **Trust is paramount.** Every pixel must communicate professionalism and reliability.
- The audience includes patients, families, and referring physicians.
- Medical terminology must be accurate — never fabricate doctor names, procedures, or clinical data for production.
- The current data (doctors, treatments, etc.) uses mock/demo data for development purposes.

### Styling Approach
- **CSS Modules only** — no Tailwind, no styled-components, no CSS-in-JS libraries.
- Each component has a co-located `.module.css` file.
- All reusable values (colors, spacing, fonts, shadows) are CSS custom properties in `globals.css`.
- When asked to adjust a value, **change the CSS**, not inline styles.

---

## ✅ DOs — Extended for Claude

### Before Writing Code
- **DO** read the existing component file before modifying it
- **DO** check `globals.css` for existing design tokens before introducing new values
- **DO** look at neighboring component patterns to maintain consistency
- **DO** verify which breakpoints other components use before adding media queries

### Responsive Design (Critical)
- **DO** add `@media` queries to every new grid/multi-column layout
- **DO** use `grid-template-columns: 1fr` for mobile, scaling up for larger screens
- **DO** use `clamp()` for any font size on headings: e.g., `clamp(28px, 3.2vw, 44px)`
- **DO** test search dropdowns and overlays work on mobile viewport widths
- **DO** collapse horizontal card layouts to vertical stacks on mobile
- **DO** ensure touch targets are at least 44×44px
- **DO** use `min-width: 0` on flex children to prevent overflow on small screens
- **DO** set `max-width: 100vw` and `overflow-x: hidden` where needed to prevent horizontal scroll

### Component Patterns in This Project
- **DO** use `"use client"` at the top of any component with state, effects, or event handlers
- **DO** use `motion.div` from Framer Motion with `whileInView={{ once: true }}` for scroll reveals
- **DO** use `SplitText` component for animated heading text
- **DO** use `MagneticButton` wrapper for interactive CTA buttons
- **DO** use Lenis-compatible scroll attributes (`data-lenis-prevent` on overflow containers)

### When Making Changes
- **DO** preserve all existing comments and docstrings unrelated to the change
- **DO** match the existing code style (indentation, naming conventions, etc.)
- **DO** update the component's CSS module alongside its TSX when adding new elements
- **DO** verify the dev server is running after making changes

---

## ❌ DON'Ts — Extended for Claude

### Common Mistakes to Avoid
- **DON'T** use `px` for font sizes on headings — always use `clamp()` or CSS variables
- **DON'T** create grid layouts without mobile breakpoints — every grid must collapse
- **DON'T** use `position: absolute` with fixed pixel values for responsive elements
- **DON'T** add inline `style={{}}` for things that should be CSS classes
- **DON'T** modify `globals.css` to add component-specific styles — use CSS Modules
- **DON'T** forget to handle the `isOpen` search overlay state on mobile
- **DON'T** remove or rename existing CSS classes without checking all references
- **DON'T** use `window` or `document` without checking `typeof window !== "undefined"` (SSR safety)
- **DON'T** add new npm packages without user approval
- **DON'T** create components without co-located `.module.css` files

### Responsive Pitfalls
- **DON'T** use `aspect-ratio: 18/9` on mobile for large sections — it makes them too short; use different ratios per breakpoint
- **DON'T** use `100vh` without considering mobile URL bar — prefer `dvh` or explicit `min-height`
- **DON'T** leave fixed-width elements (buttons, cards) that overflow on 320px screens
- **DON'T** apply parallax or scroll-driven animations on mobile — they cause jank
- **DON'T** forget to test the sticky navbar + section stacking behavior on mobile

---

## Responsive Breakpoint Reference

```css
/* Mobile-first base: 0 – 640px */
/* Everything stacks, single column, full width */

@media (max-width: 640px) {
  /* Small mobile overrides */
}

@media (max-width: 768px) {
  /* Tablet portrait & below */
  /* 2-column grids collapse to 1 column */
}

@media (max-width: 1024px) {
  /* Tablet landscape & below */
  /* Desktop nav hides, mobile menu appears */
  /* 3-column grids → 2 columns */
}

@media (max-width: 1100px) {
  /* Phone link hides in navbar */
}
```

## Component Hierarchy (Homepage)

```
<HomePage>
  <FloatingQuickActions />       ← Fixed FAB
  <HeroSection />                ← Full-screen video bg + search
  <div wrapper z:10 mt:100vh>    ← Scrolls over the hero
    <CentreOfExcellence />       ← Sticky carousel
    <SpecialitiesGrid />         ← Grid of speciality cards
    <HealthPackages />           ← Pricing cards
    <WhyChooseNH />              ← Stats & trust signals
    <ChairmanQuote />            ← Testimonial
    <PatientStories />           ← Video testimonials
    <AppDownloadBanner />        ← App CTA
    <Footer />                   ← Site footer
  </div>
</HomePage>
```

## Design Quality Checklist

Before considering any component "done", verify:

- [ ] Typography uses design tokens and `clamp()` for fluid sizing
- [ ] Colors come from CSS custom properties, not hard-coded hex values
- [ ] Spacing uses the 8px scale tokens (`--sp-1` through `--sp-16`)
- [ ] Hover states exist on all interactive elements with smooth transitions
- [ ] Component has entrance animation via Framer Motion `whileInView`
- [ ] Layout is responsive at 320px, 768px, 1024px, and 1440px
- [ ] Images use Next.js `<Image>` with `sizes` and `alt` attributes
- [ ] Accessibility: proper headings, aria-labels, focus states
- [ ] No horizontal scrollbar at any viewport width
- [ ] Card shadows and border-radius are consistent with the design system

## Security & VAPT Compliance Requirements

- **SAST (Static Application Security Testing)**:
  - Do not use `dangerouslySetInnerHTML` unless explicitly sanitized.
  - Do not use `eval()` or dynamic execution logic.
  - Ensure linter runs clean with zero errors before checking in code.
- **SCA (Software Composition Analysis)**:
  - Run `npm audit` periodically to catch vulnerable packages.
  - Force resolve vulnerable nested dependencies using npm `overrides` in `package.json`.
- **DAST / VAPT (Dynamic Testing & Pen-Testing)**:
  - Sanitize and encode all search queries and input fields (`encodeURIComponent` when passing query parameters).
  - All external anchor tags (`target="_blank"`) MUST use `rel="noopener noreferrer"` to prevent reverse tabnabbing.
  - Never store plain sensitive information in cookies or local storage.

