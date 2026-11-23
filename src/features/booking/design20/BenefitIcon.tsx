import Image from "next/image";
import { BadgePercent, IndianRupee, ShieldPlus } from "lucide-react";
import styles from "./BenefitIcon.module.css";

export function SponsorMark({ id }: { id: string }) {
  const oneHealth = id === "one-health-lite";
  return <span className={styles.brand} aria-hidden><Image src={`/icons/benefits/${oneHealth ? "one-health" : "nh"}.svg`} alt="" width={oneHealth ? 104 : 44} height={44} className={oneHealth ? styles.oneHealth : styles.nh} /></span>;
}

export default function BenefitIcon({ kind }: { kind: "coupon" | "sponsorship" | "credits" }) {
  return <span className={styles.slot} aria-hidden>
    {kind === "credits" ? <span className={styles.coin}><IndianRupee size={14} strokeWidth={1.8} /></span>
      : kind === "coupon" ? <BadgePercent className={styles.filled} size={20} strokeWidth={1.6} />
      : <ShieldPlus className={styles.filled} size={20} strokeWidth={1.6} />}
  </span>;
}
