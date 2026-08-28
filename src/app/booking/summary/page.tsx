"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, User, ChevronDown, Tag, BadgePercent, ShieldPlus, ChevronRight, ArrowLeft, Trash2, X, ArrowRight, Pencil, PhoneCall } from "lucide-react";
import styles from "./BookingSummary.module.css";
import { searchDoctorsData } from "../../search/mockDoctors";
import { Button } from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import AddPatientModal from "@/components/ui/AddPatientModal";

function BookingSummaryContent() {
  const router = useRouter();
  const [creditsApplied, setCreditsApplied] = React.useState(true);
  const [couponApplied, setCouponApplied] = React.useState(true);
  const [couponInput, setCouponInput] = React.useState("HEALTH ONE");
  const [isSponsorDropdownOpen, setIsSponsorDropdownOpen] = React.useState(false);
  const [selectedSponsor, setSelectedSponsor] = React.useState("None");
  const sponsors = ["None", "HDFC ERGO Health Insurance", "Star Health Insurance", "Aditya Birla Health Insurance"];
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId") || "dr-1";
  const date = searchParams.get("date") || "28th Aug";
  const time = searchParams.get("time") || "09:15 AM";
  const patientName = searchParams.get("patientName") || "";
  
  const needsPatientSelection = searchParams.get("needsPatientSelection") === "true";
  const [bookingStep, setBookingStep] = React.useState<"patient-selection" | "payment">(needsPatientSelection ? "patient-selection" : "payment");
  const [activePatientName, setActivePatientName] = React.useState(patientName);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = React.useState(false);

  const [familyMembers, setFamilyMembers] = React.useState([
    { id: 1, name: "Vikram", img: "https://i.pravatar.cc/150?img=11", age: 26, gender: "Male", mrn: "4151414263871" },
    { id: 2, name: "Aarav", img: "https://i.pravatar.cc/150?img=12", age: 10, gender: "Male", mrn: "8273619283746" },
    { id: 3, name: "Neha", img: "https://i.pravatar.cc/150?img=5", age: 24, gender: "Female", mrn: "9182736450192" },
    { id: 4, name: "Rahul", img: "https://i.pravatar.cc/150?img=8", age: 55, gender: "Male", mrn: "7364829102938" },
  ]);

  React.useEffect(() => {
    if (!patientName && typeof window !== 'undefined') {
      const activeId = localStorage.getItem('activeUserId');
      if (activeId) {
        const id = parseInt(activeId, 10);
        const member = familyMembers.find(m => m.id === id);
        if (member) {
          setActivePatientName(member.name);
        }
      } else if (familyMembers.length > 0) {
        setActivePatientName(familyMembers[0].name);
      }
    }
  }, [patientName, familyMembers]);

  // Find doctor data (fallback to mock data)
  const doc = searchDoctorsData.find((d: any) => d.id === doctorId) || {
    name: "Dr. Rajiv Menon",
    speciality: "Cardiology",
    img: "/assets/doctor_1.png",
    hospital: "Mazumdar Shaw Medical Centre",
    city: "Bangalore"
  };

  const consultationFee = 1300;
  const discount = couponApplied ? 100 : 0;
  const healthCreditsDiscount = creditsApplied ? 100 : 0;
  const sponsorDiscount = selectedSponsor !== "None" ? Math.floor(consultationFee * 0.75) : 0;
  const total = consultationFee - discount - healthCreditsDiscount - sponsorDiscount;

  return (
    <div className={styles.pageContainer}>
      <div className="container" style={{ paddingTop: "var(--sp-4)", paddingBottom: "var(--sp-4)" }}>
        <div style={{ marginBottom: "24px" }}>
          <Breadcrumbs 
            theme="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Doctors", href: "/search?q=Dr.&location=All" },
              { label: doc.name, href: `/doctors/${doctorId}` },
              { label: "Booking Summary" }
            ]}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px", marginBottom: "32px" }}>
          <button 
            onClick={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-text)", transition: "0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, color: "var(--color-text)", margin: 0, letterSpacing: "-0.01em" }}>
            Appointment details
          </h1>
        </div>

        <div className={styles.gridContainer}>
          {/* Left Column */}
          <div>
            {/* Doctor & Appointment Card */}
            <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)", padding: "18px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                    <Link href={`/doctors/${doctorId}`} style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", background: "var(--color-border)", display: "block" }}>
                      <div style={{ width: "100%", height: "100%", position: "relative" }}>
                        <Image alt={doc.name} src={doc.img || "/assets/doctor_1.png"} fill style={{ objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0, 0, 0, 0.5))", color: "#fff", fontSize: "9px", fontWeight: 600, padding: "20px 4px 4px", display: "flex", justifyContent: "center", alignItems: "center", opacity: 0, transform: "translateY(10px)" }}>
                          View profile <ChevronRight size={10} style={{ marginLeft: 2 }} />
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <Link href={`/doctors/${doctorId}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontSize: "var(--font-size-xl, 20px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--color-text)", marginBottom: "4px", cursor: "pointer", transition: "color 0.15s", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {doc.name}
                      </h3>
                    </Link>
                    <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {doc.speciality}
                    </p>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                      MBBS, MD (General Medicine)
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                      <span style={{ fontSize: "12px", background: "#fff", padding: "2px 8px", borderRadius: "12px", color: "rgb(71, 85, 105)", fontWeight: 500 }}>
                        22 Years
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.appointmentDetails} style={{ padding: "32px" }}>
                <div className={styles.detailRow}>
                  <MapPin size={16} className={styles.detailIcon} />
                  {doc.hospital}, {doc.city}
                </div>
                <div className={styles.detailRow} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} className={styles.detailIcon} />
                    {date} | {time}
                  </div>
                  <button 
                    onClick={() => router.push(`/doctors/${doctorId}`)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-primary)', marginLeft: 2, padding: 0 }}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                {bookingStep === "payment" && activePatientName && (
                  <div className={styles.detailRow} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <User size={16} className={styles.detailIcon} />
                      {activePatientName}
                    </div>
                    <button 
                      onClick={() => setBookingStep("patient-selection")} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-primary)', marginLeft: 2, padding: 0 }}
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.card} style={{ marginBottom: 0 }}>
            <AnimatePresence mode="wait">
              {bookingStep === "patient-selection" ? (
                <motion.div
                  key="patient-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className={styles.sectionTitle}>
                    Select Member
                  </h2>
                  <div className={styles.patientList}>
                    {familyMembers.map((member) => (
                      <button 
                        key={member.id} 
                        className={`${styles.patientItem} ${activePatientName === member.name ? styles.patientItemActive : ""}`}
                        onClick={() => {
                          setActivePatientName(member.name);
                        }}
                      >
                        <img src={member.img} alt={member.name} className={styles.patientAvatar} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span className={styles.patientName}>{member.name}</span>
                          <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{member.age} yrs | {member.gender}</span>
                        </div>
                        <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", border: activePatientName === member.name ? "6px solid var(--color-emergency)" : "1.5px solid var(--color-border)", background: "#fff", transition: "all 0.2s" }} />
                      </button>
                    ))}
                    <button className={styles.addPatientBtn} onClick={() => setIsAddPatientModalOpen(true)}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(3,78,162,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={24} style={{ color: "var(--color-primary)" }} />
                      </div>
                      <span className={styles.patientName} style={{ color: "var(--color-primary)" }}>Add new member</span>
                    </button>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <Button 
                      fullWidth 
                      size="lg" 
                      style={{ fontSize: "16px" }}
                      onClick={() => setBookingStep("payment")}
                      disabled={!activePatientName}
                    >
                      Proceed to payment
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Offers & Benefits */}
                  <h2 className={styles.sectionTitle}>Offers & Benefits</h2>
            <div className={styles.couponCard}>
              <div className={`${styles.couponRow} ${couponApplied ? styles.couponRowHighlighted : ""}`}>
                <AnimatePresence mode="wait">
                  {couponApplied ? (
                    <motion.div 
                      key="applied"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div className={styles.couponInfo}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Tag size={20} className={styles.couponIcon} />
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={`coupon-confetti-${i}`}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                              animate={{ 
                                x: Math.cos((i * 45) * Math.PI / 180) * 40, 
                                y: Math.sin((i * 45) * Math.PI / 180) * 40, 
                                opacity: 0,
                                scale: Math.random() * 0.5 + 0.5
                              }}
                              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#F59E0B",
                                pointerEvents: "none",
                                marginTop: "-3px",
                                marginLeft: "-3px",
                                zIndex: 10
                              }}
                            />
                          ))}
                        </div>
                        <div>
                          <div className={styles.couponTitle}>{couponInput.toUpperCase() || "COUPON"}</div>
                          <div className={styles.couponSubtext}>Saved ₹100</div>
                        </div>
                      </div>
                      <button className={styles.deleteButton} onClick={() => setCouponApplied(false)}>
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="input"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className={styles.couponInputContainer}
                    >
                      <Tag size={20} color="var(--color-text-secondary)" />
                      <input 
                        type="text" 
                        placeholder="Enter coupon code" 
                        className={styles.couponInput}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                      <AnimatePresence>
                        {couponInput.length > 0 && (
                          <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className={styles.clearInputButton} 
                            onClick={() => setCouponInput("")}
                            aria-label="Clear input"
                          >
                            <X size={16} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <button 
                        className={styles.applyButton} 
                        onClick={() => setCouponApplied(true)}
                      >
                        Apply
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className={styles.couponRow}>
                <div className={styles.couponInfo}>
                  <BadgePercent size={20} className={styles.couponIcon} style={{ color: "#10B981" }} />
                  <div className={styles.couponTitle} style={{ fontWeight: 500 }}>View all coupons</div>
                </div>
                <ChevronRight size={18} color="var(--color-text-secondary)" />
              </div>
            </div>

            <div className={styles.couponCard}>
              <div 
                className={styles.couponRow} 
                style={{ padding: "16px", cursor: "pointer" }}
                onClick={() => setIsSponsorDropdownOpen(!isSponsorDropdownOpen)}
              >
                <div className={styles.couponInfo}>
                  <ShieldPlus size={20} className={styles.couponIcon} />
                  <div>
                    <div className={styles.couponTitle} style={{ fontWeight: 500 }}>Apply sponsorship benefits</div>
                    <AnimatePresence>
                      {selectedSponsor !== "None" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className={styles.couponSubtext} style={{ color: "var(--color-primary)", marginTop: 2 }}>{selectedSponsor}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isSponsorDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ChevronDown size={18} color="var(--color-text-secondary)" />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {isSponsorDropdownOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                    className={styles.dropdownList}
                  >
                    {sponsors.map((sponsor) => (
                      <div 
                        key={sponsor}
                        className={`${styles.dropdownItem} ${selectedSponsor === sponsor ? styles.dropdownItemSelected : ""}`}
                        onClick={() => {
                          setSelectedSponsor(sponsor);
                          setIsSponsorDropdownOpen(false);
                        }}
                      >
                        {sponsor}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Health Credits Toggle */}
            <div 
              className={creditsApplied ? styles.toggleCardOn : styles.toggleCardOff}
              onClick={() => setCreditsApplied(!creditsApplied)}
            >
              <div className={styles.toggleLabel}>
                <div style={{ position: "relative", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {creditsApplied ? (
                    <motion.div
                      key="coin-on"
                      initial={{ y: 0, opacity: 0, scale: 0.5, rotateY: 180 }}
                      animate={{ y: 0, opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
                      className={styles.rupeeIconOn}
                    >
                      ₹
                    </motion.div>
                  ) : (
                    <div className={styles.rupeeIconOff}>₹</div>
                  )}

                  <AnimatePresence>
                    {creditsApplied && (
                      <>
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={`confetti-${i}`}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                            animate={{ 
                              x: Math.cos((i * 45) * Math.PI / 180) * 30, 
                              y: Math.sin((i * 45) * Math.PI / 180) * 30, 
                              opacity: 0,
                              scale: [0, 1, 0]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: "absolute",
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "#F59E0B",
                              zIndex: 10
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </div>
                100 Health Credits {creditsApplied ? "applied" : "available"}
              </div>
              <div className={`${styles.toggleSwitch} ${creditsApplied ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}>
                <div className={`${styles.toggleThumb} ${creditsApplied ? styles.toggleThumbOn : styles.toggleThumbOff}`}></div>
              </div>
            </div>

            {/* Payment Details */}
            <h2 className={styles.sectionTitle}>Payment details</h2>
            <div style={{ marginTop: 16 }}>
              <div className={styles.paymentRow}>
                <span>Consultation Fee</span>
                <span style={{ fontWeight: 600, color: "var(--color-text)" }}>₹{consultationFee.toLocaleString()}</span>
              </div>
              <AnimatePresence initial={false}>
                {couponApplied && (
                  <motion.div 
                    key="coupon"
                    initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.paymentRow}>
                      <span>Coupon Discount Applied ({couponInput.toUpperCase() || "COUPON"})</span>
                      <span style={{ fontWeight: 600, color: "#10B981" }}>-₹{discount.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}
                {creditsApplied && (
                  <motion.div 
                    key="credits"
                    initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.paymentRow}>
                      <span>Health Credits Applied</span>
                      <span style={{ fontWeight: 600, color: "#10B981" }}>-₹{healthCreditsDiscount.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}
                {selectedSponsor !== "None" && (
                  <motion.div 
                    key="sponsor"
                    initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.paymentRow}>
                      <span>Sponsor Discount Applied (75% Off)</span>
                      <span style={{ fontWeight: 600, color: "#10B981" }}>-₹{sponsorDiscount.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className={styles.paymentRowTotal}>
                <span>Total Payable</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            
            <div style={{ position: "sticky", bottom: "-1px", background: "var(--color-bg-card)", zIndex: 10, paddingTop: "16px", paddingBottom: "12px", marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ position: "absolute", top: "-32px", left: "0px", right: "0px", height: "32px", background: "linear-gradient(to top, var(--color-bg-card), transparent)", pointerEvents: "none" }}></div>
              <Button 
                fullWidth 
                size="lg" 
                style={{ fontSize: "16px" }}
              >
                Pay ₹{total.toLocaleString()}
              </Button>
              <Button 
                fullWidth 
                size="lg" 
                variant="outline"
                style={{ fontSize: "16px", background: "var(--color-bg-card)" }}
              >
                Pay at hospital
              </Button>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
      
  <AddPatientModal 
        isOpen={isAddPatientModalOpen} 
        onClose={() => setIsAddPatientModalOpen(false)} 
        onAddPatient={(name) => {
          const newMember = {
            id: familyMembers.length + 1,
            name,
            img: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            age: 30,
            gender: "Male",
            mrn: `1000${Math.floor(Math.random() * 1000000)}`
          };
          setFamilyMembers(prev => [...prev, newMember]);
          setActivePatientName(newMember.name);
        }}
      />
    </div>
  );
}

export default function BookingSummaryPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading summary...</div>}>
      <BookingSummaryContent />
    </Suspense>
  );
}
