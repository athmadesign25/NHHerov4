"use client";

import type { HealthItem } from "./catalog";
import HealthDialog from "./HealthDialog";
import HealthTestGroups from "./HealthTestGroups";
import { healthCardContent } from "./healthCardContent";
import styles from "./HealthIncludedTests.module.css";

export default function HealthIncludedTests({ item, onClose, onDetails }: { item: HealthItem; onClose: () => void; onDetails: () => void }) {
  const { groups, testCount } = healthCardContent(item);
  return <HealthDialog title={testCount ? `Includes ${testCount} ${testCount === 1 ? "test" : "tests"}` : "Included tests"} onClose={onClose}>
    <p className={styles.name}>{item.name}</p>
    {groups.length ? <HealthTestGroups groups={groups} idPrefix="included-health-test" /> : <p className={styles.unavailable}>The full test list isn’t available for this package yet.</p>}
    <footer className={styles.footer}><button type="button" onClick={onDetails}>View {item.kind === "package" ? "package" : "test"} details</button></footer>
  </HealthDialog>;
}
