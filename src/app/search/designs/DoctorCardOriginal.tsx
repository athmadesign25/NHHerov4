"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, PhoneCall, ChevronRight } from "lucide-react";

export interface OriginalDoctorData {
  id: string;
  name: string;
  speciality: string;
  degrees: string;
  hospital: string;
  hospitalCount?: string;
  experience: string;
  rating?: number;
  reviews?: number;
  availability?: { hospital?: string; video?: string } | null;
  img: string;
  fee: string;
  isExecutive?: boolean;
}

interface DoctorCardOriginalProps {
  doc: OriginalDoctorData;
  showHospitalSlot: boolean;
  hospitalUrl: string;
  videoUrl: string;
  bookUrl: string;
  onBookingClick: (e: React.MouseEvent, url: string) => void;
}

export default function DoctorCardOriginal({
  doc,
  showHospitalSlot,
  hospitalUrl,
  videoUrl,
  bookUrl,
  onBookingClick,
}: DoctorCardOriginalProps) {
  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        overflow: "visible",
        boxShadow: "var(--shadow-sm)",
        position: "relative",
      }}
    >
      {doc.isExecutive && (
        <div style={{ position: "absolute", top: -4, right: 20, zIndex: 10, width: 88, height: 24 }}>
          <Image src="/Appointment/Executive tag.svg" alt="Executive" width={88} height={24} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              WebkitMaskImage: "url('/Appointment/Executive tag.svg')",
              maskImage: "url('/Appointment/Executive tag.svg')",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          >
            <motion.div
              initial={{ x: "-150%" }}
              animate={{ x: "250%" }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
                repeatDelay: 2,
              }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "40%",
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          </div>
        </div>
      )}

      {/* Top Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)",
          padding: 18,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <Link
              href={`/doctors/${doc.id}`}
              style={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: 12,
                overflow: "hidden",
                background: "var(--color-border)",
                display: "block",
              }}
            >
              <motion.div whileHover="hover" initial="initial" style={{ width: "100%", height: "100%", position: "relative" }}>
                <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                <motion.div
                  variants={{
                    initial: { opacity: 0, y: 10 },
                    hover: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(transparent, rgba(0, 0, 0, 0.5))",
                    color: "#ffffff",
                    fontSize: 9,
                    fontWeight: 600,
                    padding: "20px 4px 4px 4px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  View profile <ChevronRight size={10} style={{ marginLeft: 2 }} />
                </motion.div>
              </motion.div>
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Link href={`/doctors/${doc.id}`} style={{ textDecoration: "none" }}>
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  marginBottom: 4,
                  cursor: "pointer",
                  transition: "color 0.15s",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {doc.name}
              </h3>
            </Link>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {doc.speciality}
            </p>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                display: "-webkit-box",
                WebkitLineClamp: doc.name.length > 22 ? 1 : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {doc.degrees}
            </p>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginTop: 2, fontWeight: 500 }}>
              {doc.experience}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 10, background: "#FFFFFF", padding: "2px 8px", borderRadius: 12, color: "#475569", fontWeight: 400 }}>
                English
              </span>
              <span style={{ fontSize: 10, background: "#FFFFFF", padding: "2px 8px", borderRadius: 12, color: "#475569", fontWeight: 400 }}>
                Hindi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
          <MapPin size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0, marginTop: 2 }} />
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {doc.hospital} {doc.hospitalCount && <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{doc.hospitalCount}</span>}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Clock size={16} style={{ color: "var(--color-text-secondary)" }} />
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>Next available at</p>
        </div>

        <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none", gap: 12, marginBottom: 16 }}>
          {showHospitalSlot && (
            <a
              href={hospitalUrl}
              onClick={(e) => onBookingClick(e, hospitalUrl)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)",
                color: "var(--color-text)",
                padding: "6px 10px",
                borderRadius: 20,
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textDecoration: "none",
                transition: "transform 0.15s ease",
                cursor: "pointer",
              }}
              title={`Book Hospital Visit with ${doc.name}`}
            >
              <Image src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={16} height={16} />
              {doc.availability?.hospital || "Available"}
            </a>
          )}
          <a
            href={videoUrl}
            onClick={(e) => onBookingClick(e, videoUrl)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)",
              color: "var(--color-text)",
              padding: "6px 10px",
              borderRadius: 20,
              fontSize: "var(--font-size-xs)",
              fontWeight: 600,
              whiteSpace: "nowrap",
              textDecoration: "none",
              transition: "transform 0.15s ease",
              cursor: "pointer",
            }}
            title={`Book Video Consultation with ${doc.name}`}
          >
            <Image src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={16} height={16} />
            {doc.availability?.video || "Available"}
          </a>
        </div>

        <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{doc.fee}</span>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 4, lineHeight: 1 }}>onwards</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href="tel:+919876543210"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 22,
                border: "1px solid var(--color-border)",
                color: "var(--color-primary)",
                textDecoration: "none",
                transition: "var(--transition-fast)",
                flexShrink: 0,
              }}
              aria-label={`Call ${doc.name}`}
            >
              <PhoneCall size={18} />
            </a>
            <a
              href={bookUrl}
              onClick={(e) => onBookingClick(e, bookUrl)}
              style={{
                height: 44,
                padding: "0 24px",
                background: "var(--color-primary)",
                color: "var(--color-text-inverse)",
                borderRadius: 22,
                fontSize: "var(--font-size-sm)",
                fontWeight: 700,
                textDecoration: "none",
                transition: "var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Book now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
