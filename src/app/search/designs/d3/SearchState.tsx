import { SearchX, WifiOff } from "lucide-react";
import styles from "./SearchState.module.css";

interface Props { error?: boolean; filtered?: boolean; onReset: () => void; onRetry: () => void }

export default function SearchState({ error, filtered, onReset, onRetry }: Props) {
  const Icon = error ? WifiOff : SearchX;
  return <div className={styles.state} role={error ? "alert" : undefined} data-d3-ui>
    <span className={styles.icon}><Icon size={28} aria-hidden /></span>
    <h2>{error ? "We couldn’t load these results" : filtered ? "No matches with these filters" : "No results found"}</h2>
    <p>{error ? "Your search has been kept. Please try again." : filtered ? "Try removing a filter or choosing another appointment date." : "Try another name or speciality, or broaden your location."}</p>
    <button type="button" onClick={error ? onRetry : onReset}>{error ? "Try again" : filtered ? "Clear filters" : "Clear search"}</button>
  </div>;
}

export function ResultSkeletons({ doctors }: { doctors: boolean }) {
  return <>{Array.from({ length: 6 }, (_, index) => <div key={index} className={styles.skeleton} aria-hidden>
    <div className={doctors ? styles.portrait : styles.picture} /><div className={styles.lines}><span /><span /><div /><span /></div>
  </div>)}</>;
}
