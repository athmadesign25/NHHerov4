<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# NH Website Redesign — Agent Guidelines

## Project Overview

This is a **Narayana Health (NH) hospital website redesign** built with Next.js 16, React 19, Framer Motion, Lenis (smooth scroll), and Lucide icons. The goal is a **world-class, premium, responsive healthcare website** that feels modern, trustworthy, and alive.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Animation | Framer Motion | 12.x |
| Smooth Scroll | Lenis | 1.3.x |
| Icons | Lucide React | 1.14.x |
| Styling | CSS Modules (Vanilla CSS) | — |
| Typography | Google Fonts (Inter) | — |
| Language | TypeScript | 5.x |

## Node.js Runtime

Node.js is NOT installed globally on this machine. Use the portable installation:

```bash
export PATH="/Users/a374590/Desktop/NH website main/.node-portable/bin:$PATH"
```

Always prefix commands with this PATH export before running `npm`, `node`, or `npx`.

---

## Design Tokens & System

All design values live in `src/app/globals.css` as CSS custom properties. **Always use tokens, never hard-code values.**

- **Colors**: `--color-primary`, `--color-emergency`, `--color-text`, etc.
- **Spacing**: 8px scale — `--sp-1` (8px) through `--sp-16` (128px)
- **Typography**: `--font-size-xs` (12px) through `--font-size-7xl` (72px)
- **Radii**: `--radius-sm` through `--radius-full`
- **Shadows**: `--shadow-sm` through `--shadow-xl`
- **Transitions**: `--transition-fast` (150ms), `--transition-base` (250ms), `--transition-slow` (400ms)
- **Layout**: `--max-width: 1240px`, `--nav-height: 72px`

---

## ✅ DOs

### Architecture & Code
- **DO** use the App Router (`src/app/`) with `"use client"` directive for interactive components
- **DO** keep components modular — one component per file with co-located `.module.css`
- **DO** use TypeScript for all new files
- **DO** use CSS Modules for styling (`.module.css` files)
- **DO** use design tokens from `globals.css` — never hard-code colors, spacing, or font sizes
- **DO** use `clamp()` for fluid typography that scales between breakpoints
- **DO** use semantic HTML (`<section>`, `<nav>`, `<article>`, `<header>`, `<footer>`)
- **DO** add proper `id` attributes to sections for navigation anchoring
- **DO** use Next.js `<Image>` component with `sizes` and `priority` props for optimized images
- **DO** use Next.js `<Link>` component for internal navigation

### Responsive Design
- **DO** design mobile-first, then layer on tablet and desktop styles
- **DO** use these breakpoints consistently: `640px` (mobile), `768px` (tablet), `1024px` (laptop), `1100px` (desktop nav)
- **DO** use `clamp()` for fluid font sizes: e.g., `font-size: clamp(24px, 4.5vw, 38px)`
- **DO** use `minmax()` in grids for responsive columns without media queries where possible
- **DO** use `aspect-ratio` for maintaining image/video proportions
- **DO** test all layouts at 320px, 375px, 768px, 1024px, 1440px widths
- **DO** use `max-width: 100%` and `height: auto` on images by default
- **DO** use `padding` in `vw` or `clamp()` for responsive section spacing
- **DO** hide non-essential UI on mobile (e.g., phone links, desktop nav items)
- **DO** stack grid columns to `1fr` on mobile, `repeat(2, 1fr)` on tablet

### Animation & Interaction
- **DO** use Framer Motion for entrance animations, hover effects, and scroll-driven transitions
- **DO** use `whileInView` with `viewport={{ once: true }}` for reveal-on-scroll animations
- **DO** use smooth easing curves: `[0.22, 1, 0.36, 1]` (ease-out) or `[0.16, 1, 0.3, 1]` (spring)
- **DO** add hover micro-animations (translateY, scale, box-shadow transitions)
- **DO** use `will-change: transform` sparingly on animated elements
- **DO** respect `prefers-reduced-motion` media query

### Performance
- **DO** lazy-load images below the fold with `loading="lazy"`
- **DO** set `priority` on above-the-fold hero images
- **DO** use `sizes` attribute on all `<Image>` components for responsive loading
- **DO** keep bundle size small — import only needed icons from Lucide
- **DO** use CSS transforms for animations (GPU-accelerated) over layout properties

### Accessibility
- **DO** add `aria-label` to icon-only buttons and interactive elements
- **DO** use proper heading hierarchy (`h1` → `h2` → `h3`)
- **DO** ensure color contrast ratios meet WCAG AA (4.5:1 for text, 3:1 for large text)
- **DO** add `alt` text to all images
- **DO** make all interactive elements keyboard-focusable with visible focus rings

---

## ❌ DON'Ts

### Architecture & Code
- **DON'T** use TailwindCSS — this project uses vanilla CSS Modules exclusively
- **DON'T** install new packages without explicit user approval
- **DON'T** use inline styles for repeatable patterns — use CSS classes instead
- **DON'T** mix `pages/` router with `app/` router
- **DON'T** use `any` type in TypeScript — define proper interfaces
- **DON'T** create monolithic components — break them into focused, reusable pieces
- **DON'T** import the entire icon library — use named imports: `import { Search } from "lucide-react"`

### Responsive Design
- **DON'T** use fixed pixel widths for containers — use `max-width` with `%` or `vw`
- **DON'T** use `overflow: hidden` on body/html without considering mobile scroll behavior
- **DON'T** forget to test the mobile hamburger menu and search overlay on small screens
- **DON'T** use `100vh` without accounting for mobile browser chrome (use `dvh` or JS fallback)
- **DON'T** leave horizontal scroll on mobile — always check for overflow
- **DON'T** use absolute positioning with fixed pixel values for responsive layouts
- **DON'T** forget `@media` queries in every `.module.css` that defines multi-column layouts

### Animation & Interaction
- **DON'T** animate layout properties (`width`, `height`, `top`, `left`) — use `transform` and `opacity`
- **DON'T** use animation delays longer than 1 second — users will think the page is broken
- **DON'T** create animations that block user interaction
- **DON'T** use `transition: all` — explicitly list properties to transition
- **DON'T** add parallax or scroll-driven animations to mobile — they cause jank

### Performance
- **DON'T** use unoptimized images — always compress and serve via Next.js `<Image>`
- **DON'T** load web fonts synchronously — use `display=swap`
- **DON'T** create layout shifts (CLS) — set explicit dimensions on images and embeds
- **DON'T** use `position: fixed` elements that overlap scrollable content without `z-index` management

### Design
- **DON'T** use generic colors (plain red, green, blue) — use the curated NH color palette
- **DON'T** use browser-default fonts — always use Inter from the design system
- **DON'T** use placeholder images — generate real assets with the image generation tool
- **DON'T** create simple/basic looking UIs — every component should feel premium
- **DON'T** ignore spacing consistency — always use the 8px spacing scale tokens

---

## World-Class Website Fundamentals

### 1. Visual Hierarchy & Typography
- Use a clear type scale with strong contrast between headings and body
- Section eyebrows (small uppercase labels) establish context before titles
- Line heights: headings at `1.1–1.2`, body text at `1.5–1.6`
- Letter-spacing: negative on large headings (`-0.025em`), positive on eyebrows (`0.08–0.1em`)

### 2. Premium Design Patterns
- **Glassmorphism**: `backdrop-filter: blur(12px)` with semi-transparent backgrounds
- **Gradient overlays**: Multi-layered gradients on hero images for text readability
- **Card elevation**: Subtle shadows on rest, pronounced shadows + lift on hover
- **Micro-animations**: 2–4px translateY on hover, smooth scale transitions
- **Parallax**: Vertical image parallax driven by scroll position (desktop only)
- **Sticky sections**: Pin sections to navbar on scroll for immersive storytelling

### 3. Layout Principles
- Max content width: 1240px, centered with auto margins
- Consistent section padding: 80–96px vertical on desktop, scaling down on mobile
- Grid-based layouts with explicit gap values from the spacing scale
- White space is a feature — generous padding creates a premium feel

### 4. Color Strategy
- Primary blue (`#034EA2`) for trust, professionalism, and CTAs
- Emergency red (`#ED1C24`) for urgent actions and highlights (Book Appointment)
- Neutral grays for text hierarchy and borders
- Accent colors used sparingly and consistently (success green, warning amber)

### 5. Interaction Design
- Every clickable element must have a hover state with visual feedback
- Search dropdowns should feel instant — no loading spinners for local data
- Form inputs need focus rings and placeholder styling
- Buttons: primary (filled), secondary (outlined), and ghost (transparent) variants
- Smooth scroll between sections using Lenis

### 6. Responsive Strategy
- **Mobile (< 640px)**: Single column, stacked layouts, hamburger nav, full-width cards
- **Tablet (768–1024px)**: 2-column grids, visible navigation starts to appear
- **Desktop (> 1024px)**: Full multi-column layouts, hover effects active, parallax enabled
- Touch targets: minimum 44×44px on mobile
- Font sizes scale with viewport using `clamp()` — never fixed sizes for headings

### 7. Performance Targets
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Interaction to Next Paint (INP): < 200ms
- Total page weight: < 2MB (compressed)
- Above-the-fold content painted in first render

### 8. SEO & Metadata
- Unique `<title>` and `<meta description>` per page
- Single `<h1>` per page with proper heading hierarchy
- Semantic HTML5 elements throughout
- Structured data for healthcare-specific content (doctors, hospitals)
- Internal linking between related pages (specialities, doctors, treatments)

---

## File Structure Reference

```
src/
├── app/
│   ├── globals.css          # Design tokens & global resets
│   ├── layout.tsx           # Root layout with Navbar + Lenis
│   ├── page.tsx             # Homepage composition
│   ├── doctors/             # Doctor listing & detail pages
│   ├── specialities/        # Speciality detail pages
│   └── search/              # Search results page
├── components/
│   ├── home/                # Homepage section components
│   │   ├── HeroSection.tsx/.module.css
│   │   ├── CentreOfExcellence.tsx/.module.css
│   │   ├── SpecialitiesGrid.tsx/.module.css
│   │   ├── HealthPackages.tsx/.module.css
│   │   ├── WhyChooseNH.tsx/.module.css
│   │   └── ...
│   ├── layout/              # Navbar, Footer
│   └── ui/                  # Reusable UI primitives
└── public/                  # Static assets (images, videos)
```

---

## 🏛️ Narayana Health Universal Page Anatomy & Component Design Tokens (Mandatory Rulebook)

All pages in this repository (Clinical Specialities, Treatments, Procedures, CSR, Articles/Blogs, Hospitals, Diagnostics) **MUST** strictly adhere to these architectural standards and visual tokens. Never improvise or create inconsistent one-off variants.

### 1. Mandatory Page Structure & Anatomy Contract

Every detail and landing page follows this universal hierarchy from top to bottom:

| Order | Page Region | Standard Component / Pattern | Rules & Constraints |
|:---:|:---|:---|:---|
| **1** | **Global Navigation** | `<Navbar />` (in `layout.tsx`) | 72px fixed height (`--nav-height: 72px`). Supports `data-nav-theme="dark"` or `"light"`. |
| **2** | **Hero / Header Section** | Page-specific Hero (e.g. `CsrHero`, `ArticleHero`, `SpecialityHero`) | **Balanced vertical placement**: Content must NEVER hug the navbar. `padding-top: calc(var(--nav-height, 72px) + clamp(64px, 10vh, 120px))`. Includes breadcrumbs at top, H1 title, subtitle, CTA button, and stats row below. **Photographic Sweet Spot**: Follows the balanced scrim rules in Section 1.B below. |
| **3** | **Interactive Editorial Content** | BENTO grids, 3-column editorial cards, or clinical tabs | High-contrast photography, fluid typography (`clamp()`), clean semantic markup. |
| **4** | **Flagship Programs / Flow** | Pinned folder card stack or alternating features | Follows the **Folder Stacking Contract** (see Section 3 below). |
| **5** | **Pre-Footer CTA Card Banner** | `<BlogCtaBanner />` | **MANDATORY UNIVERSAL BANNER**: Dark blue gradient card (`linear-gradient(135deg, #0b1a33 0%, #034EA2 55%, #022d61 100%)`). *"Connect with a Narayana Health Specialist Today"*. Buttons: Book Doctor Appointment, Explore Health Packages, Call 24×7 (`1800 309 0309`). Never use custom light/gray banners above the footer. |
| **6** | **Global Footer** | `<Footer />` (in `layout.tsx`) | Global dark footer with 4-column directory, helpline, accreditations. |
| **Overlay** | **Clinical Floating Actions** | `<ClinicalFloatingSideActions />` | Fixed right on desktop. Quick Book OPD, Call Support, Ask Pulse AI. |

---

### 1.B Hero Scrim & Photographic Visibility Standard (The Sweet Spot)
Across all dark mode heroes (Diagnostics, Symptoms, Diseases, Treatments, Hospitals, Articles, Procedures), hero photography must feel alive, warm, and clearly visible rather than murkily blacked out:
- **Base Image Filter**: `filter: brightness(0.88) saturate(1.10) contrast(1.03);`. ❌ **NEVER** crush brightness down to `0.65–0.70`.
- **Directional Gradient Scrim (`90deg`)**:
  - `0%–34%`: Deep dark (`rgba(6, 14, 27, 0.96) 0%, rgba(6, 14, 27, 0.92) 34%`) to guarantee 100% WCAG AAA contrast for titles, subtitles, breadcrumbs, and search inputs.
  - `34%–66%`: Soft, smooth feather (`rgba(6, 14, 27, 0.65) 50%, rgba(6, 14, 27, 0.20) 66%`).
  - `66%–100%`: Crystal-clear photo visibility (`rgba(6, 14, 27, 0.04) 82%, transparent 100%`).
- **Bottom Anchor Blend (`0deg`)**: Only a subtle 28% blend (`#060e1b 0%, rgba(6, 14, 27, 0.72) 6%, rgba(6, 14, 27, 0.18) 16%, transparent 28%`). ❌ **NEVER** allow dark bottom gradients to climb 60% up the hero and submerge the subjects in black.
- **Top Edge Scrim (`180deg`)**: Gentle 24% navbar feathering (`rgba(6, 14, 27, 0.65) 0%, rgba(6, 14, 27, 0.15) 12%, transparent 24%`).
- **Right Credential Stats Floating Style**: Right stat columns float cleanly and naturally over the atmospheric hero scrim with a subtle vertical line divider (`border-left: 1px solid rgba(255, 255, 255, 0.10);`). ❌ **NEVER** place a frosted glass backplate, background mat, or box behind the numbers that covers patient/doctor faces. Numbers use clean translucent white (`color: rgba(255, 255, 255, 0.85); font-weight: 500;`) and labels use muted white (`color: rgba(255, 255, 255, 0.52); font-weight: 400;`).

---

### 2. Card Design Tokens & Typographic Rules

#### A. Full Photography Editorial Cards (CSR, Articles, Impact Bulletins)
- **Background**: Image with `object-fit: cover` and smooth hover zoom (`transform: scale(1.05)`).
- **Dual-Scrim System**:
  - **Bottom Scrim**: `linear-gradient(to top, rgba(6, 12, 24, 0.98) 0%, rgba(6, 12, 24, 0.70) 50%, transparent 100%)`.
  - **Top Scrim**: `linear-gradient(180deg, rgba(6, 12, 24, 0.70) 0%, transparent 100%)` for 70–80px height.
- **Category Tag Rules**:
  - Category must be **clean uppercase text** (`font-size: 11.5px`, `font-weight: 700`, `letter-spacing: 0.08em`, `#ffffff`, text-shadow) positioned at top-left (`.cardTopCategoryText`).
  - ❌ **STRICTLY FORBIDDEN**: Bulky dark pill containers, button-like badges, or thick borders around category tags.
- **Card Borders & Contrast Rules**:
  - **On White / Light Background**: ❌ **NO outlines or borders**. Use subtle elevation (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06)`), 16px–24px rounded corners (`--radius-xl`), and hover lift (`translateY(-4px)`).
  - **On Dark Background**: Subtle translucent border (`1px solid rgba(255, 255, 255, 0.12)`).

#### B. Doctor & Specialist Cards (Clinical Consultations)
- **Desktop**: Grid of doctor cards showing portrait, name, clinical speciality, years of experience, hospital location, and a clean "Book" action button.
- **Mobile Web (MV / MWeb) Rules**:
  - ❌ **Do NOT squeeze 2 tiny cards per row on mobile screens.**
  - Show **1 card + peeking next card** (`1.2–1.5 cards` in a horizontal snap track: `flex: 0 0 78vw; scroll-snap-align: start;`).
  - Below the cards, the CTA must be a **clean clickable text link** (*"View All Specialities →"* or *"View All Doctors →"*), ❌ **NOT an oversized button**.

#### C. Universal CTA Buttons & Action Controls (Strict Shape Standard)
- **Mandatory Geometry**: All CTA buttons across the website (card action buttons, pre-footer banner buttons, modal action buttons, filter buttons) **MUST be crisp rounded rectangles (square with rounded edges: `border-radius: 8px` to `10px`)**.
- ❌ **STRICTLY FORBIDDEN**: Pill / capsule shapes (`border-radius: 9999px` or `var(--radius-full)`) on primary or secondary CTA buttons. All CTAs must maintain visual consistency with the Doctor Card "Book" CTA button in the search interaction (`.refBookBtnWhite`: `border-radius: 8px;`, `.refBookBtn`: `border-radius: 10px;`).
- **Radius Guidelines**:
  - Card Action CTAs (Opd Book, Read More, Test Book, Download PDF): `border-radius: 8px`.
  - Banner & Modal CTAs (`BlogCtaBanner`, Hero CTAs, Drawer Buttons): `border-radius: 8px` or `10px`.
  - Micro-interactions: Subtle hover lift (`transform: translateY(-1px)` to `translateY(-2px)`) with crisp typography and high contrast.

---

### 3. Motion & Animation Design Tokens

#### A. Card Stacking Pattern (Folder / Wallet Tab Interaction)
When a section features sequential card stacking as the user scrolls (e.g. `CsrProgramsFlow`):
- **Container Architecture**: Must use a **pinned scroll container** (`.stackingTrack` with `height: 250vh–280vh` + `.stickyViewport` with `position: sticky; top: calc(var(--nav-height) + 20px)`).
- **Sequential Docking**:
  - Card 0 starts at base (`top: 0px`).
  - Card 1 zooms in and docks cleanly at `top: 22px`.
  - Card 2 zooms in and docks cleanly at `top: 44px`.
  - Card 3 (the final card) **docks 100% completely** at `top: 66px`, showing all folder tabs.
- **Eyeball Distraction Rule**:
  - Subsequent cards **MUST remain completely hidden** (`opacity: 0`, `pointerEvents: "none"`) while the currently active card is settling. Users must never see half-visible moving objects below.
- **Section Exit & Gap Rule**:
  - As soon as the final card docks, the track ends naturally and the entire 4-card stack scrolls away together into the pre-footer CTA banner with a **standard 40px–60px section gap**.
  - ❌ **NEVER leave an empty 500px void below the last card.**
- **Mobile Fallback**:
  - On mobile screens (`< 768px`), automatically degrade to a clean vertical stacked list or horizontal swipeable cards with 60fps native scrolling.

#### B. Signature NH Gradient Shimmer Titles
Section titles across major editorial sections use the signature animated gradient shimmer:
```css
.sectionTitle {
  font-family: Inter, var(--font-sans), sans-serif;
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.18;
  display: inline-block;
  background: linear-gradient(
    90deg,
    #034EA2 0%,
    #0284c7 25%,
    #ED1C24 50%,
    #0284c7 75%,
    #034EA2 100%
  );
  background-size: 250% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGradientShimmer 4.5s ease infinite;
}

@keyframes titleGradientShimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

#### C. Universal Page-to-Detail Transition & Hero Entrance Contract
Every route navigation across the site—and specifically from any library or listing page to a clinical detail page—**MUST** execute a seamless, immersive, cinematic expansion:
1. **Expanding Canvas Immersion**:
   - The hero canvas expands into full-page view (`scale: 1.12 -> 1, opacity: 0.5 -> 1`, `duration: 0.70s`, `ease: [0.16, 1, 0.3, 1]`), creating an optical illusion of the clicked card/carousel expanding into the full screen.
   - ❌ **NEVER** place a CSS `transform` on the root route or reading sheet wrapper, as CSS transforms disable `position: fixed` (stationary canvas) and `position: sticky` (Table of Contents sidebar).
2. **Coordinated Detail Hero Entrance**:
   - **Scroll Reset**: Always scroll to `top: 0` on detail page mount.
   - **Left Hero Column**: Breadcrumbs, eyebrow, H1 title, subtitle, and CTA expand up smoothly (`opacity: 0, scale: 0.97, y: 14` -> `opacity: 1, scale: 1, y: 0`, `delay: 0.08s–0.12s`).
   - **Right Metrics Column**: Floats in with subtle scale (`opacity: 0, scale: 0.97, x: 14` -> `opacity: 1, scale: 1, x: 0`, `delay: 0.16s–0.18s`).
   - **Reading Sheet Body**: Uses safe pure `opacity` fade-in, keeping sticky navigation 100% operational.
3. **Hero Carousel Controls (Glassmorphism Standard)**:
   - When interactive navigation controls (arrows, indicator dots) sit over photography or hero backgrounds, **MUST** use signature glassmorphism (`background: rgba(255, 255, 255, 0.14–0.16); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.22–0.28);`). ❌ **NEVER** use stark solid white buttons that feel disconnected from the image.

---

### 4. Mobile Web (MV / MWeb) First Principles
- **Touch Targets**: Minimum 44×44px for all buttons and interactive elements.
- **Horizontal Overflow**: `overflow-x: hidden` on page roots. Never allow accidental horizontal scrolling.
- **Nav Anchor Offsets**: Use `scroll-margin-top: calc(var(--nav-height, 72px) + 20px)` on all anchored sections so titles are never obscured by the fixed navbar.
- **Text Link CTAs**: Prefer subtle, clickable text links with icons over heavy filled buttons when presenting secondary navigation (e.g. *"View All Specialities →"*).

---

---

## Security & VAPT Compliance Requirements

### 1. Static Application Security Testing (SAST)
- **Sanitisation**: Never use `dangerouslySetInnerHTML` unless input is thoroughly sanitized.
- **Dynamic Execution**: Do not use `eval()` or construct functions dynamically.
- **Build Quality**: Keep the codebase clean of syntax errors and unhandled imports. The lint check must run clean with `npm run lint`.

### 2. Software Composition Analysis (SCA)
- **Dependency Audit**: Routinely run `npm audit` to check for security vulnerabilities.
- **Dependency Pinning**: If nested dependencies contain vulnerabilities (like `postcss` or `next` dependencies), use NPM `"overrides"` in `package.json` to force resolve to secure versions.

### 3. Dynamic Application Security Testing (DAST) & VAPT
- **XSS & Injection Protection**: Sanitize all URL query variables, search params, and text inputs. Always use `encodeURIComponent` when passing query inputs to pages or API endpoints.
- **Tabnabbing Protection**: Ensure any anchor tags opening a link in a new tab (`target="_blank"`) explicitly specify `rel="noopener noreferrer"`.
- **Sensitive Data Storage**: Do not store private sensitive healthcare or patient information in plain local storage or cookies.

