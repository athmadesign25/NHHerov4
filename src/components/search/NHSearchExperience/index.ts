/**
 * ═════════════════════════════════════════════════════════════════════════════════════
 * NARAYANA HEALTH REUSABLE SEARCH EXPERIENCE COMPONENT
 * ═════════════════════════════════════════════════════════════════════════════════════
 *
 * DEVELOPER HANDOFF & INTEGRATION GUIDE:
 *
 * 1. THE THREE SEARCH STATES:
 *    - 'landing': Compact, neutral dark-glass prompt floating in the homepage hero.
 *                 Matches visual reference: 01 — Neutral default landing.png.
 *    - 'active':  Expanded search canvas with focused input, red horizon divider,
 *                 live query suggestions, match highlighting, and Pulse AI status.
 *                 Matches visual reference: 02 — Active search canvas.png.
 *    - 'results': Full result canvas showcasing primary compact doctor cards, Pulse AI
 *                 recommendation pill, related specialties, secondary treatments,
 *                 and related clinical articles.
 *                 Matches visual reference: 03 — Active search result.png.
 *
 * 2. HOW STATE TRANSITIONS HAPPEN:
 *    - Landing → Active: Triggered when user clicks/focuses the landing prompt or an action pill.
 *      Notifies parent container via `onOpenChange(true)` so the hero video overlay darkens
 *      and the headline slides up gracefully.
 *    - Active → Results: Triggered when user presses Enter, clicks a live suggestion, or
 *      hits the submit arrow button. The same container smoothly expands to the result canvas.
 *    - Results → Active: Clicking "EDIT SEARCH" returns to the active input canvas with the query
 *      intact and ready for refinement.
 *    - Any state → Landing: Pressing Escape, clicking the '✕' close button, or clicking the
 *      blurred background overlay closes search and restores the neutral landing state.
 *
 * 3. WHERE SEARCH DATA CURRENTLY COMES FROM:
 *    - Mock suggestion banks and structured clinical data (doctors, procedures, articles,
 *      locations) are defined in `./searchData.ts`.
 *
 * 4. WHERE REAL API / SEARCH RESULTS SHOULD BE CONNECTED:
 *    - For live autocomplete: Connect your search endpoint inside `getLiveSuggestions()` in `./searchData.ts`.
 *    - For search result fetching: Connect your healthcare query endpoint inside `getSearchResults()` in `./searchData.ts`.
 *
 * 5. MAIN REUSABLE COMPONENT:
 *    - Import `NHSearchExperience` from this directory and place it in any hero or page.
 *    - Props:
 *      - `onOpenChange?: (isOpen: boolean) => void`
 *      - `initialState?: 'landing' | 'active' | 'results'`
 *      - `initialLocation?: string`
 *      - `onOpenPulseAI?: (query: string) => void`
 * ═════════════════════════════════════════════════════════════════════════════════════
 */

export { default as NHSearchExperience } from "./NHSearchExperience";
export type { SearchState, NHSearchExperienceProps } from "./NHSearchExperience";
export * from "./searchData";
export { default as DefaultSearchPrompt } from "./DefaultSearchPrompt";
export { default as ActiveSearchCanvas } from "./ActiveSearchCanvas";
export { default as SearchResultsCanvas } from "./SearchResultsCanvas";
export { default as PulseAIAvatar } from "./PulseAIAvatar";

