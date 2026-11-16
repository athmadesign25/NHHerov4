import type { ComponentProps, ReactNode } from "react";
import ExecutiveSlotTag from "./ExecutiveSlotTag";
import styles from "./SlotSelectionValue.module.css";

interface Props {
  selection: ComponentProps<typeof ExecutiveSlotTag>["selection"];
  children: ReactNode;
}

/** Keep the selected date/time and its tier together across booking surfaces. */
export default function SlotSelectionValue({ selection, children }: Props) {
  return (
    <div className={styles.value}>
      {children}
      <ExecutiveSlotTag selection={selection} />
    </div>
  );
}
