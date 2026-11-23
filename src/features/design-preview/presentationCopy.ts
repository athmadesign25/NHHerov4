/** Presentation copy only: keep shared directory fixtures and other designs intact. */
export function presentationDoctorName(name: string): string {
  return name.replace(/\s*\(preview\)\s*$/i, "");
}
