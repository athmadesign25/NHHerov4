interface HistoryContext {
  variant: string;
  live: boolean;
  authenticated: boolean;
}

/** Sample directory IDs for the signed-in Design 17 stakeholder walkthrough.
 * No patient data or appointment records are created or persisted.
 * API search results and other designs keep their existing session history.
 */
export function design17ConsultationHistory(sessionHistory: ReadonlySet<string>, context: HistoryContext): ReadonlySet<string> {
  if (!["d17", "d17-lite", "d18", "d19", "d20"].includes(context.variant) || context.live || !context.authenticated) return sessionHistory;
  if (context.variant === "d20") return new Set([...sessionHistory, "d20-dr-abhinandan-s-punit", "d20-dr-akhila-vasanth-hassan"]);
  return new Set([...sessionHistory, "dr-1", "dr-3"]);
}
