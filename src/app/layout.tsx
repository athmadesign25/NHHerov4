import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import ScrollProgress from "@/components/ui/ScrollProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Landing Page V1",
  description:
    "India's most trusted hospital network with 3,000+ specialists across 30+ specialities. Book appointments, find doctors, and access world-class healthcare.",
  keywords: "Narayana Health, hospital, doctors, cardiology, oncology, book appointment",
  openGraph: {
    title: "Narayana Health",
    description: "World-Class Care, Close to Home",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Global UI interactions */}
        <SmoothScroll />
        <ScrollProgress />

        {/* Layout */}
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
