import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Book an appointment | Narayana Health",
  description: "Choose your consultation, appointment time and payment preference with Narayana Health.",
  robots: { index: false, follow: true },
};

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children;
}
