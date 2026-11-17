import styles from "./HealthCatalogueTabs.module.css";
type HealthType = "package" | "test";
interface Props { value: HealthType | null; id: string; panelId: string; onChange: (value: HealthType) => void }
/** Browse shortcuts; text search always spans both service types. */
export default function HealthCatalogueTabs({ value, id, panelId, onChange }: Props) {
  return <div className={styles.tabs} role="group" aria-label="Browse health services">
    {(["package", "test"] as const).map(kind => <button key={kind} type="button" id={`${id}-${kind}`} aria-pressed={value === kind}
      aria-controls={panelId} onClick={() => onChange(kind)}>{kind === "package" ? "Health packages" : "Lab tests"}</button>)}
  </div>;
}
