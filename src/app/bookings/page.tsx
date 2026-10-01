"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, MapPin, Video, Search, Filter } from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";

// Mock data
const MOCK_BOOKINGS = [
  {
    id: "NH-B84920",
    doctor: "Dr. Rajiv Menon",
    speciality: "Cardiology",
    date: "27 Feb 2026",
    time: "09:15 AM",
    hospital: "NH Bangalore — Mazumdar Shaw",
    status: "Upcoming",
    mode: "Hospital Visit",
    patient: "Aditya",
  },
  {
    id: "NH-B73211",
    doctor: "Dr. Priya Sharma",
    speciality: "Neurology",
    date: "14 Jan 2026",
    time: "02:30 PM",
    hospital: "NH Kolkata",
    status: "Completed",
    mode: "Video Consultation",
    patient: "Aditya",
  }
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Completed">("Upcoming");

  const displayedBookings = MOCK_BOOKINGS.filter(b => b.status === activeTab);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className="container" style={{ maxWidth: 1024, padding: "var(--sp-4)" }}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>My Appointments</h1>
            <div className={styles.headerActions}>
              <button className={styles.actionBtn}>
                <Search size={16} />
              </button>
              <button className={styles.actionBtn}>
                <Filter size={16} />
              </button>
            </div>
          </div>
          
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === "Upcoming" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("Upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "Completed" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("Completed")}
            >
              Past Appointments
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1024, padding: "var(--sp-4)" }}>
        {displayedBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Calendar size={32} />
            </div>
            <h2>No {activeTab.toLowerCase()} appointments</h2>
            <p>You don't have any {activeTab.toLowerCase()} appointments right now.</p>
            <Link href="/search?q=Doctor&location=All" className={styles.bookNewBtn}>
              Book an Appointment
            </Link>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {displayedBookings.map((booking, index) => (
              <motion.div 
                key={booking.id}
                className={styles.bookingCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.badgeWrap}>
                    <span className={`${styles.statusBadge} ${booking.status === "Upcoming" ? styles.statusUpcoming : styles.statusCompleted}`}>
                      {booking.status}
                    </span>
                    <span className={styles.bookingId}>{booking.id}</span>
                  </div>
                  {booking.status === "Upcoming" && (
                    <button className={styles.manageBtn}>Manage</button>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.doctorInfo}>
                    <div className={styles.docAvatar}>
                      {booking.doctor.charAt(4)}
                    </div>
                    <div>
                      <h3 className={styles.docName}>{booking.doctor}</h3>
                      <p className={styles.docSpec}>{booking.speciality}</p>
                    </div>
                  </div>

                  <div className={styles.appointmentDetails}>
                    <div className={styles.detailItem}>
                      <Calendar size={16} className={styles.detailIcon} />
                      <div>
                        <div className={styles.detailLabel}>Date</div>
                        <div className={styles.detailValue}>{booking.date}</div>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <Clock size={16} className={styles.detailIcon} />
                      <div>
                        <div className={styles.detailLabel}>Time</div>
                        <div className={styles.detailValue}>{booking.time}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.locationWrap}>
                    {booking.mode === "Video Consultation" ? (
                      <div className={styles.locationBox}>
                        <Video size={18} className={styles.locationIcon} />
                        <div>
                          <div className={styles.locationType}>Video Consultation</div>
                          <div className={styles.locationLink}>Link will be shared 15 mins before</div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.locationBox}>
                        <MapPin size={18} className={styles.locationIcon} />
                        <div>
                          <div className={styles.locationType}>Hospital Visit</div>
                          <div className={styles.locationLink}>{booking.hospital}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
