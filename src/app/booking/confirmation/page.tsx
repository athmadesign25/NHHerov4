"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Calendar, MapPin, User, ArrowRight, QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { searchDoctorsData } from "../../search/mockDoctors";
import styles from "./Confirmation.module.css";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const doctorId = searchParams.get("doctorId") || "1";
  const date = searchParams.get("date") || "28th Aug";
  const time = searchParams.get("time") || "09:15 AM";
  const patientName = searchParams.get("patientName") || "Vikram";

  const doc = searchDoctorsData.find((d: any) => d.id === doctorId) || searchDoctorsData[0];

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.contentWrapper}
        initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
      >
        <motion.div 
          className={styles.successIconWrapper}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 10, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
          whileTap={{ scale: 0.9, rotate: -10 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ cursor: "pointer" }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, type: "spring", stiffness: 200 }}
            style={{ display: "flex" }}
          >
            <Check size={48} strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Booking Confirmed!
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your appointment has been successfully scheduled. We have sent the confirmation details to your registered email and mobile number.
        </motion.p>

        <motion.div 
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.cardHeader}>
            <Image 
              src={doc.img} 
              alt={doc.name} 
              width={64} 
              height={64} 
              className={styles.doctorImage}
            />
            <div className={styles.doctorInfo}>
              <h2 className={styles.doctorName}>{doc.name}</h2>
              <span className={styles.doctorSpeciality}>{doc.speciality}</span>
            </div>
          </div>

          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><User size={20} /></div>
              <div>
                <div className={styles.detailLabel}>Patient</div>
                <div className={styles.detailValue}>{patientName}</div>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><Calendar size={20} /></div>
              <div>
                <div className={styles.detailLabel}>Date & Time</div>
                <div className={styles.detailValue}>{date} | {time}</div>
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><MapPin size={20} /></div>
              <div>
                <div className={styles.detailLabel}>Hospital</div>
                <div className={styles.detailValue}>Mazumdar Shaw Medical Centre, Bangalore</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={styles.buttonGroup}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => router.push("/")}
            style={{ fontSize: "16px" }}
          >
            Back to Home
          </Button>
          <Button 
            size="lg" 
            onClick={() => router.push("/")} // Assuming a bookings page doesn't exist yet
            icon={<ArrowRight size={18} />}
            iconPosition="right"
            style={{ fontSize: "16px", whiteSpace: "nowrap" }}
          >
            View My Bookings
          </Button>
        </motion.div>

        <motion.div
          className={styles.appPromoCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className={styles.appPromoContent}>
            <h3 className={styles.appPromoTitle}>Download NH Care App</h3>
            <p className={styles.appPromoText}>Manage your appointments, access health records, and more.</p>
            <div className={styles.storeButtons}>
              <button className={styles.storeImageButton}>
                <img alt="Download on the App Store" src="/App%20store.svg" />
              </button>
              <button className={styles.storeImageButton}>
                <img alt="Get it on Google Play" src="/Google%20play.svg" />
              </button>
            </div>
          </div>
          <div className={styles.qrCodeWrapper}>
            <div className={styles.qrCodeBox}>
              <img src="/qr.svg" alt="QR Code" width={64} height={64} style={{ borderRadius: 8, filter: "invert(1)" }} />
            </div>
            <span className={styles.qrCodeText}>Scan to download</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
