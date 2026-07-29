"use client";

import { motion } from "framer-motion";
import { Smartphone, QrCode } from "lucide-react";
import Image from "next/image";
import mockupImg from "../../../public/Mockups.png";
import styles from "./AppDownloadBanner.module.css";

export default function AppDownloadBanner() {
  return (
    <section className={styles.section} id="app-download-banner">
      <div className={styles.bannerContainer}>
        <motion.div
          className={styles.inner}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className={styles.bannerGrid}>
            <div>
              <div>
                <div className="section-eyebrow" style={{ color: "rgba(255, 255, 255, 0.9)", marginBottom: "var(--sp-4, 16px)" }}>NH Care App</div>
                <div className={styles.headingWrapper}>
                  <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, color: "rgb(255, 255, 255)", lineHeight: 1.15, marginBottom: "var(--sp-4, 16px)", fontFamily: "var(--font-stack)" }}>Your Health,<br /><span style={{ color: "var(--color-emergency, red)" }}>Always With You.</span></h2>
                  <div className={styles.headerQrContainer}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" width="64" height="64" x="0" y="0" viewBox="0 0 65 65" style={{ flexShrink: 0 }} xmlSpace="preserve"><g><path d="M24.816 0h12.408v3.102H31.02v3.102h-3.102V3.102h-3.102zM0 0v21.714h21.714V0zm18.612 18.612H3.102V3.102h15.51zM43.429 0v21.714h21.714V0zm18.61 18.612h-15.51V3.102h15.51z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M6.204 6.204h9.306v9.306H6.204zM24.816 6.204h3.102v3.102h-3.102zM31.02 6.204h6.204v6.204h-3.103V9.306H31.02zM49.633 6.204h9.306v9.306h-9.306zM24.816 12.408h9.305v3.102H31.02v3.102h-3.102V15.51h-3.102zM37.224 15.51h3.102v6.204h-3.102zM24.816 18.612h3.102v6.205h-3.102zM31.02 18.612h3.102v3.103H31.02z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M34.121 21.714h3.103v3.102h3.101v6.204h3.104v6.204h3.1V31.02h-3.1v-6.204h3.1v3.102h3.104v-3.102h3.101v6.204h-3.101v6.204h3.101V31.02h3.101v3.102h3.103V31.02h-3.103v-6.204h3.103v3.102h3.101v-3.102h3.104v6.204h-3.104v6.204h-3.101v3.102h3.101v9.307h-3.101v3.101h-3.103V46.53h-6.202v-3.101h6.202v-3.103h-15.51v3.103h-6.204v-6.205h3.103v-3.102h-3.103V31.02h3.103v-3.102h-3.103zM15.51 24.816h6.204v3.102H15.51zM27.918 24.816h3.102v3.102h3.101v3.102h-6.203zM15.51 31.02h9.306v3.103H15.51zM6.204 27.918v3.102H3.102v-3.102H0v12.408h12.408v-3.103H9.306v-3.102h3.102V31.02h3.102v-3.102zm0 9.306H3.102v-3.102h3.102z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M31.02 34.122h3.102v3.102H31.02zM15.51 37.224h6.204v3.103H15.51zM24.816 37.224h6.204v3.102h-3.102v3.103h-3.102zM62.039 37.224h3.104v3.103h-3.104zM27.918 43.429h3.102v9.305h-3.102v-3.101h-3.102V46.53h3.102zM40.325 43.429h6.204v3.101h-3.1v3.103h-3.104v3.101h3.104v-3.101h3.1v3.101h3.104v3.102h3.101v-3.102h3.101v9.306h-3.101v-3.102h-3.101v6.205h-3.104V62.04h-3.1v-3.102h3.1v-3.102h-9.305v-3.102h-3.103v-3.101h3.103V46.53h3.101zM0 43.429v21.714h21.714V43.429zM18.612 62.04H3.102V46.53h15.51z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M6.204 49.633h9.306v9.306H6.204zM49.633 49.633h3.102v3.102h-3.102zM31.02 52.734h3.101v6.204H31.02v3.102h3.101v3.103h-6.203v-9.307h3.102zM58.938 55.836h6.204v3.103h-6.204zM34.121 58.938h6.204v6.205h-3.101V62.04h-3.103zM55.835 62.04h6.204v3.103h-6.204z" fill="#ffffff" opacity="1" data-original="#000000"></path></g></svg>
                  </div>
                </div>
                <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.72)", lineHeight: 1.7, marginBottom: "var(--sp-6, 24px)", maxWidth: "460px" }}>India's most trusted hospital app. Millions of patients use NH Care to manage their health journey end-to-end — from booking to recovery.</p>
              </div>
              <div className={styles.qrWrapperMobile}>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" width="64" height="64" x="0" y="0" viewBox="0 0 65 65" style={{ flexShrink: 0 }} xmlSpace="preserve"><g><path d="M24.816 0h12.408v3.102H31.02v3.102h-3.102V3.102h-3.102zM0 0v21.714h21.714V0zm18.612 18.612H3.102V3.102h15.51zM43.429 0v21.714h21.714V0zm18.61 18.612h-15.51V3.102h15.51z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M6.204 6.204h9.306v9.306H6.204zM24.816 6.204h3.102v3.102h-3.102zM31.02 6.204h6.204v6.204h-3.103V9.306H31.02zM49.633 6.204h9.306v9.306h-9.306zM24.816 12.408h9.305v3.102H31.02v3.102h-3.102V15.51h-3.102zM37.224 15.51h3.102v6.204h-3.102zM24.816 18.612h3.102v6.205h-3.102zM31.02 18.612h3.102v3.103H31.02z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M34.121 21.714h3.103v3.102h3.101v6.204h3.104v6.204h3.1V31.02h-3.1v-6.204h3.1v3.102h3.104v-3.102h3.101v6.204h-3.101v6.204h3.101V31.02h3.101v3.102h3.103V31.02h-3.103v-6.204h3.103v3.102h3.101v-3.102h3.104v6.204h-3.104v6.204h-3.101v3.102h3.101v9.307h-3.101v3.101h-3.103V46.53h-6.202v-3.101h6.202v-3.103h-15.51v3.103h-6.204v-6.205h3.103v-3.102h-3.103V31.02h3.103v-3.102h-3.103zM15.51 24.816h6.204v3.102H15.51zM27.918 24.816h3.102v3.102h3.101v3.102h-6.203zM15.51 31.02h9.306v3.103H15.51zM6.204 27.918v3.102H3.102v-3.102H0v12.408h12.408v-3.103H9.306v-3.102h3.102V31.02h3.102v-3.102zm0 9.306H3.102v-3.102h3.102z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M31.02 34.122h3.102v3.102H31.02zM15.51 37.224h6.204v3.103H15.51zM24.816 37.224h6.204v3.102h-3.102v3.103h-3.102zM62.039 37.224h3.104v3.103h-3.104zM27.918 43.429h3.102v9.305h-3.102v-3.101h-3.102V46.53h3.102zM40.325 43.429h6.204v3.101h-3.1v3.103h-3.104v3.101h3.104v-3.101h3.1v3.101h3.104v3.102h3.101v-3.102h3.101v9.306h-3.101v-3.102h-3.101v6.205h-3.104V62.04h-3.1v-3.102h3.1v-3.102h-9.305v-3.102h-3.103v-3.101h3.103V46.53h3.101zM0 43.429v21.714h21.714V43.429zM18.612 62.04H3.102V46.53h15.51z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M6.204 49.633h9.306v9.306H6.204zM49.633 49.633h3.102v3.102h-3.102zM31.02 52.734h3.101v6.204H31.02v3.102h3.101v3.103h-6.203v-9.307h3.102zM58.938 55.836h6.204v3.103h-6.204zM34.121 58.938h6.204v6.205h-3.101V62.04h-3.103zM55.835 62.04h6.204v3.103h-6.204z" fill="#ffffff" opacity="1" data-original="#000000"></path></g></svg>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(255, 255, 255, 0.1)", borderRadius: "999px", padding: "6px 12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}><span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.9)", fontWeight: 600, letterSpacing: "0.02em" }}>Book appointments in 60 seconds</span></div>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(255, 255, 255, 0.1)", borderRadius: "999px", padding: "6px 12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}><span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.9)", fontWeight: 600, letterSpacing: "0.02em" }}>Video consultations from home</span></div>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(255, 255, 255, 0.1)", borderRadius: "999px", padding: "6px 12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}><span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.9)", fontWeight: 600, letterSpacing: "0.02em" }}>Access your health records anytime</span></div>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(255, 255, 255, 0.1)", borderRadius: "999px", padding: "6px 12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}><span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.9)", fontWeight: 600, letterSpacing: "0.02em" }}>Track vitals &amp; wellness reports</span></div>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(255, 255, 255, 0.1)", borderRadius: "999px", padding: "6px 12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}><span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.9)", fontWeight: 600, letterSpacing: "0.02em" }}>Manage your entire family</span></div>
                </div>
              </div>
              <div className={styles.downloadButtons}>
                <a href="#" tabIndex={0}><img alt="Download on the App Store" src="/App%20store.svg" /></a>
                <a href="#" tabIndex={0}><img alt="Get it on Google Play" src="/Google%20play.svg" /></a>
              </div>
            </div>
            <div className={styles.mockupContainer}>
              <Image alt="NH Care App Mockups" src={mockupImg} style={{ width: "100%", maxWidth: "425px", height: "auto", objectFit: "contain" }} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
