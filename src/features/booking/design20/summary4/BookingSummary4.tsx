"use client";

import type { ComponentProps } from "react";
import BookingSummary from "../previous/BookingSummary";
import styles from "./BookingSummary4.module.css";

type Props = Pick<ComponentProps<typeof BookingSummary>, "doctor" | "flow" | "onEditingChange">;

/** Shares booking behavior with Design 3 while keeping its visual preview intact. */
export default function BookingSummary4(props: Props) {
  return <BookingSummary {...props} doctorPlacement="appointment" consistentDetails className={styles.summary} />;
}
