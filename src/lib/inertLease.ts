interface InertTarget { inert: boolean }
interface InertLease { owners: number; originallyInert: boolean }

const leases = new WeakMap<InertTarget, InertLease>();

/** Nested dialogs share ownership, so either cleanup order restores the original state. */
export function acquireInertLease(targets: Iterable<InertTarget>): () => void {
  const elements = [...new Set(targets)];
  for (const element of elements) {
    const existing = leases.get(element);
    if (existing) existing.owners += 1;
    else leases.set(element, { owners: 1, originallyInert: element.inert });
    element.inert = true;
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const element of elements) {
      const lease = leases.get(element);
      if (!lease) continue;
      lease.owners -= 1;
      if (lease.owners > 0) continue;
      element.inert = lease.originallyInert;
      leases.delete(element);
    }
  };
}
