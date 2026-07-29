<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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
export PATH="/Users/a919418/Downloads/NH Website Redesign Concept 2/nh-website/node-v20.18.0-darwin-x64/bin:$PATH"
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

