import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FooterRevealWrapper from "@/components/layout/FooterRevealWrapper";
import SmoothScroll from "@/components/ui/SmoothScroll";
import ScrollProgress from "@/components/ui/ScrollProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Best Multispeciality Private Hospital in India | Narayana Health",
  description:
    "India's most trusted hospital network with 3,000+ specialists across 30+ specialities. Book appointments, find doctors, and access world-class healthcare.",
  keywords: "Narayana Health, hospital, doctors, cardiology, oncology, book appointment",
  openGraph: {
    title: "Narayana Health",
    description: "World-Class Care, Close to Home",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Narayana Health",
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
        <FooterRevealWrapper>{children}</FooterRevealWrapper>
      </body>
    </html>
  );
}
