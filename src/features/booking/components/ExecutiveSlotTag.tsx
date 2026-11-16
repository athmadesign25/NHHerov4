"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { getExecutiveSlot } from "@/features/booking/executiveSlots";
import ExecutiveIcon from "./ExecutiveIcon";
import ExecutiveBenefitsDialog from "./ExecutiveBenefitsDialog";
import styles from "./ExecutiveSlotTag.module.css";

/** Selected slots use a compact label; only the picker discovery link opens benefits. */
export default function ExecutiveSlotTag({ selection, discovery = false }: { selection: AppointmentSelection; discovery?: boolean }) {
  const [open, setOpen] = useState(false);
  const executive = getExecutiveSlot(selection);
  if (!executive) return null;
  if (!discovery) return <span className={styles.tag}><ExecutiveIcon /><span>Executive</span></span>;
  return <>
    <button type="button" className={`${styles.tag} ${styles.discovery}`} aria-haspopup="dialog" aria-expanded={open} aria-label="View executive slot benefits" onClick={() => setOpen(true)}>
      <ExecutiveIcon /><span>Executive slots</span><Info className={styles.info} aria-hidden />
    </button>
    {open && createPortal(<ExecutiveBenefitsDialog onClose={() => setOpen(false)} />, document.body)}
  </>;
}
