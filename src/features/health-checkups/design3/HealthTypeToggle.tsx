import Image from "next/image";
import styles from "./HealthTypeToggle.module.css";

type HealthType = "package" | "test";
interface Props {
  value: HealthType;
  searching: boolean;
  onChange: (value: HealthType) => void;
}

const options = [
  { value: "package", label: "Health packages", icon: "package" },
  { value: "test", label: "Lab tests", icon: "lab" },
] as const;

export default function HealthTypeToggle({ value, searching, onChange }: Props) {
  return <div className={styles.toggle} role="group" aria-label="Browse by type">
    <div className={styles.track} data-value={value} data-searching={searching || undefined}>
      {options.map(option => <button key={option.value} type="button"
        aria-pressed={!searching && value === option.value} onClick={() => onChange(option.value)}>
        <span className={styles.icon} aria-hidden="true">
          <Image src={`/health-checkups/icons/${option.icon}-default.svg`} alt="" width={24} height={24} sizes="24px" />
          <Image className={styles.activeIcon} src={`/health-checkups/icons/${option.icon}-active.svg`} alt="" width={24} height={24} sizes="24px" />
        </span>
        <span>{option.label}</span>
      </button>)}
    </div>
  </div>;
}
