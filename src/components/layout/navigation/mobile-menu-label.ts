/** Sentence case for mobile UI, preserving brands, names and medical acronyms. */
export function mobileMenuLabel(label: string) {
  let result = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  const preserved = ["Narayana One Health", "Narayana Health", "Narayana Aditi", "Medha Analytics", "Athma", "Sunday", ...(label.match(/\b[A-Z][A-Z\d]+\b/g) ?? [])];
  for (const term of preserved) result = result.replace(new RegExp(`\\b${term}\\b`, "gi"), term);
  return result;
}
