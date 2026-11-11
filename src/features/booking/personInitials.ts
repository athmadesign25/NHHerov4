/** First and last name initials, without a professional or courtesy title. */
export function personInitials(name?: string): string {
  const parts = (name?.trim().normalize("NFC").split(/\s+/) ?? [])
    .filter(part => /[\p{L}\p{N}]/u.test(part));
  while (parts.length && /^(dr|doctor|mr|mrs|ms|miss|prof|professor)\.?$/i.test(parts[0])) parts.shift();
  const names = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return names.map(part => part.match(/[\p{L}\p{N}]\p{M}*/u)?.[0] ?? "").join("").toUpperCase();
}
