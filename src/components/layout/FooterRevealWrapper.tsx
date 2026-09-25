"use client";

import Footer from "./Footer";

export default function FooterRevealWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main-content" style={{ position: "relative" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
