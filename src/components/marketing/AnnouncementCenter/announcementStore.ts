export type Announcement = {
  id: string;
  title: string;
  image: string;
  href: string;
  onSelect?: () => void;
};

const sources = new Map<string, Announcement[]>();
const listeners = new Set<() => void>();
const empty: Announcement[] = [];
let snapshot = empty;

function publish() {
  snapshot = Array.from(sources.values()).flat();
  listeners.forEach(listener => listener());
}

/** Sources register only on marketing routes; the plain homepage stays empty. */
export const announcementStore = {
  register(source: string, entries: Announcement[]) {
    sources.set(source, entries);
    publish();
    return () => {
      if (sources.get(source) !== entries) return;
      sources.delete(source);
      publish();
    };
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  get: () => snapshot,
  getServerSnapshot: () => empty,
};

// Demonstration entries use existing destinations and campaign assets.
export const SUPPORTING_ANNOUNCEMENTS: Announcement[] = [
  { id: "health-checkups", title: "Find a health checkup that suits you", image: "/health-checkup-consultation.jpg", href: "/#health-packages" },
  { id: "find-specialist", title: "Find the right specialist for your care", image: "/nav-doctor-speciality.png", href: "/doctors" },
];
