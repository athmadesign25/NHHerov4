# NHHerov4 Architecture

## 1. Project Overview
This is a Next.js 16 (App Router) project serving as a Narayana Health hospital website redesign. It features a modern, premium frontend relying on React 19, Framer Motion, Lenis (smooth scroll), and Vanilla CSS Modules. The architecture prioritizes clarity, feature ownership, and maintainability, ensuring that designers and developers can immediately understand where code belongs and how it is structured without over-engineering.

## 2. Final Folder Structure
```
src/
├── app/
│   ├── (routes...)
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   ├── app-download/
│   ├── auth/
│   ├── centre-of-excellence/
│   ├── health-packages/
│   ├── hero/
│   ├── patient-stories/
│   ├── pulse-ai/
│   └── why-choose-nh/
├── hooks/
├── data/
├── lib/
└── archive/
    └── home-available/
```

## 3. What Each Folder Means

- **app/**: Next.js routing. Controls the URL structure and route-level composition (`page.tsx`, `layout.tsx`). Pages here orchestrate features but do not contain large UI implementations.
- **components/**: Pure, globally shared React components. Split into `layout/` (Navbar, Footer) and `ui/` (DoctorCard, SpecialityResultCard, etc).
- **features/**: The core of the product. Groups logic, UI, hooks, and styles by their business or product function (e.g. `hero`, `pulse-ai`).
│   ├── layout/           # Global wrappers (Navbar, Footer, SmoothScroll)
│   ├── ui/               # Reusable primitives (Buttons, Cards, SpliText)
│   └── sections/         # Homepage building blocks (Hero, PatientStories, etc.)
├── features/             # Complex standalone apps (PulseAI, Auth)
├── data/                 # Shared domain data (doctors, specialities)
└── lib/                  # Shared utilities and services (searchService)

_archive/                 # Historical/experimental code (outside active src)
```

## 3. Features vs Sections vs UI
- **Sections (`src/components/sections/`)**: Large, specific blocks of a page (e.g., `Hero`, `CentreOfExcellence`). They own their own components, hooks, and local data, but they aren't complex standalone domain apps.
- **Features (`src/features/`)**: Reserved ONLY for highly complex, standalone logical units (e.g., `pulse-ai`, `auth`). If a piece of UI feels like an "app within the app," it's a feature.
- **UI Components (`src/components/ui/`)**: Stupid, reusable visual blocks (e.g., `DoctorCard`, `HighlightMatch`). They have no idea what page they are on.

## 4. Where do I put my code?
- **New Homepage Section?** -> `src/components/sections/[name]/`
- **New UI Button/Card?** -> `src/components/ui/`
- **Global Auth Logic?** -> `src/features/auth/`
- **New Chatbot feature?** -> `src/features/[feature-name]/`
- **New Utility Function?** -> `src/lib/`

## 5. CSS Modules
Every component or section must own its own CSS file. 
- Example: `Hero.tsx` imports from `Hero.module.css`.
- **CRITICAL RULE**: Do not import a section's CSS (like `Hero.module.css`) into a shared UI component (like `DoctorCard.tsx`). Shared UI components must have their own styles.

## 6. Shared Components
Located in `src/components/ui/` and `src/components/layout/`.
They are genuinely reused across *independent* features.
- `DoctorCard`, `SpecialityResultCard`, `HighlightMatch`: Used by both the Hero search and the Pulse AI workspace.
- `SplitText`, `Reveal`: Shared animation primitives used by various homepage sections.
- `Navbar`, `Footer`, `FloatingQuickActions`: Site-wide layout wrappers and global overlays.

## 7. Hooks
- **Section-Specific Hooks**: E.g., `useHeroSearch.ts` lives in `src/components/sections/hero/hooks/` because it is only used by the Hero section. 
- **Feature-Specific Hooks**: E.g., `useAuthState.ts` tracks global authentication and lives in `src/features/auth/hooks/`.
- **Shared Hooks**: Only create a `src/hooks/` folder if you have a hook that is genuinely shared across completely unrelated parts of the app (e.g., a generic `useWindowSize`).

## 8. Data
- **Domain Data**: Lives in `src/data/` (e.g., `doctors.ts`, `specialities.ts`). This is domain data shared across features (used in search, AI recommendations, and listing pages).
- **Local Data**: Lives directly inside the section/feature that consumes it (e.g., `hero-stats.data.ts` in the Hero section, `patient-stories.data.ts` in Patient Stories).

## 9. Styling
- **Global CSS**: `src/app/globals.css` contains design tokens, CSS variables, and global resets.
- **CSS Modules**: Collocated with the component they style (e.g., `Hero.tsx` + `Hero.module.css`). Feature-specific CSS never lives in global styling.

## 10. Dependency Rules
1. `app/` can import from anywhere.
2. `features/` can import from `components/`, `data/`, `lib/`, `hooks/`.
3. **Features should not import from other features directly** unless explicitly designed as a shared subsystem.
4. `components/ui/` should be pure and import only other UI components, `lib/`, or global styles.
5. **No active code** is allowed to import from `archive/`.

## 11. Naming Conventions
- **Folders**: `kebab-case` (e.g., `centre-of-excellence`, `health-packages`).
- **React Components**: `PascalCase.tsx` (e.g., `PatientStories.tsx`).
- **Hooks**: `useCamelCase.ts` (e.g., `useHeroSearch.ts`).
- **CSS Modules**: `ComponentName.module.css` (e.g., `Hero.module.css`).
- **Data/Utils**: `camelCase.ts` or `lowercase.ts` (e.g., `doctors.ts`, `searchService.ts`).

## 12. Where Do I Put New Code?

- **"If I create a new homepage section →"**
  Create a new folder in `src/features/home/` (e.g., `src/features/home/chairman-message/`). Place the `.tsx` and `.module.css` inside it.

- **"If I create a Hero-only component →"**
  Place it in `src/features/home/hero/components/`.

- **"If I create a reusable UI component →"**
  Place it in `src/components/ui/`. Only do this if you know at least two independent features will use it.

- **"If I create a shared hook →"**
  Place it in `src/hooks/`.

- **"If I create a feature-specific hook →"**
  Place it inside the feature (e.g., `src/features/home/hero/hooks/`).

- **"If I create doctor data →"**
  Add or edit `src/data/doctors.ts`.

- **"If I create an API helper →"**
  Place it in `src/lib/`.

- **"If I create a new page/route →"**
  Create a folder in `src/app/` (e.g., `src/app/about/page.tsx`). Compose your existing features and UI components inside that page.
