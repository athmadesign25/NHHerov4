"use client";

import React, { Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, Clock3, Video, HeartPulse, Stethoscope, ChevronRight } from "lucide-react";
import styles from "./page.module.css";
import ListingSlotPreview from "@/components/seo-marketing/ListingSlotPreview/ListingSlotPreview";

// We reuse the mock data for demonstration purposes
import { searchDoctorsData } from "@/app/search/mockDoctors";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// In a real app, this would be an API call to get doctors by speciality
function getDoctorsBySpeciality(speciality: string) {
  const normalizedSpeciality = speciality.toLowerCase().replace(/-/g, " ");
  // Match exact or partial (e.g. "cardiologist" matches "Cardiologist")
  return searchDoctorsData.filter(d => d.speciality.toLowerCase().includes(normalizedSpeciality));
}

// Map slugs to display names
const SPECIALITY_MAP: Record<string, string> = {
  "cardiologist": "Cardiologist",
  "neurologist": "Neurologist",
  "oncologist": "Oncologist",
  "orthopaedician": "Orthopaedician",
};

export default function SpecialityListingPage({ params }: { params: Promise<{ speciality: string }> }) {
  const { speciality } = React.use(params);
  
  // 1. URL Pattern matching
  const displaySpeciality = SPECIALITY_MAP[speciality.toLowerCase()] || 
                            speciality.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const doctors = useMemo(() => getDoctorsBySpeciality(speciality), [speciality]);

  // 2. Empty State / Index Only When Populated
  // If no doctors exist for this URL, throw a 404 to prevent Google from indexing a thin/empty page
  if (doctors.length === 0) {
    notFound(); 
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Breadcrumbs for SEO interlinking */}
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumbs 
            theme="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Book an Appointment", href: "/search" },
              { label: displaySpeciality },
            ]}
          />
        </div>

        {/* 3. H1 Heading and Page Summary */}
        <header className={styles.seoHeader}>
          <h1 className={styles.h1}>Best {displaySpeciality}s for Appointment</h1>
          <p className={styles.summary}>
            Book an appointment with top-rated {displaySpeciality.toLowerCase()}s at Narayana Health. 
            View live availability, consultation fees, and patient reviews. Both hospital visits and 
            video consultations are available.
          </p>
        </header>

        {/* Doctor Listing Grid */}
        <div className={styles.grid}>
          {/* Main Content: Doctor Cards */}
          <main className={styles.mainCol}>
            <div className={styles.resultsCount}>
              Showing <strong>{doctors.length}</strong> {displaySpeciality}s
            </div>

            <div className={styles.list}>
              {doctors.map((doc) => (
                <article key={doc.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.docImageWrap}>
                      <Image 
                        src={doc.img || "/assets/doctor_1.png"} 
                        alt={doc.name} 
                        width={100} 
                        height={100} 
                        className={styles.docImage}
                      />
                    </div>
                    
                    <div className={styles.docInfo}>
                      <Link href={`/doctors/${doc.id.replace('dr-1', 'dr-rajiv-menon')}`} className={styles.docNameLink}>
                        <h2 className={styles.docName}>{doc.name}</h2>
                      </Link>
                      <p className={styles.docSpec}>{doc.speciality}</p>
                      <p className={styles.docDegrees}>{doc.degrees}</p>
                      
                      <div className={styles.metaData}>
                        <span className={styles.metaItem}>
                          <MapPin size={13} aria-hidden />
                          {doc.hospital}, {doc.city}
                        </span>
                        <span className={styles.metaItem}>
                          <Clock3 size={13} aria-hidden />
                          {doc.experience} Exp.
                        </span>
                        <span className={styles.metaItem}>
                          <Star size={13} className={styles.starIcon} aria-hidden />
                          {doc.rating} ({doc.reviews})
                        </span>
                      </div>
                    </div>

                    <div className={styles.docPricing}>
                      <div className={styles.feeLabel}>Consultation Fee</div>
                      <div className={styles.feeAmount}>{doc.fee}</div>
                    </div>
                  </div>

                  {/* 4. Live Appointment Slot Display (Marketing Requirement) */}
                  <div className={styles.slotPreviewWrapper}>
                    <ListingSlotPreview 
                      doctorId={doc.id.replace('dr-1', 'dr-rajiv-menon')} 
                      doctorName={doc.name} 
                    />
                  </div>
                </article>
              ))}
            </div>

            {/* 5. SEO FAQ Section at the bottom */}
            <section className={styles.faqSection}>
              <h2 className={styles.faqTitle}>Frequently Asked Questions about {displaySpeciality}s</h2>
              <div className={styles.faqList}>
                <details className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>When should I consult a {displaySpeciality.toLowerCase()}?</summary>
                  <div className={styles.faqAnswer}>
                    You should consult a {displaySpeciality.toLowerCase()} if you experience persistent symptoms related to their specialty, have been referred by a general physician, or require specialized care for a diagnosed condition.
                  </div>
                </details>
                <details className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>Do these {displaySpeciality.toLowerCase()}s offer video consultations?</summary>
                  <div className={styles.faqAnswer}>
                    Yes, many of our specialists at Narayana Health offer secure video consultations. You can book a video slot directly through the appointment booking flow by selecting the "Video Consult" option.
                  </div>
                </details>
                <details className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>How do I book an appointment?</summary>
                  <div className={styles.faqAnswer}>
                    You can easily book an appointment by selecting an available time slot directly from the doctor's card above, or by visiting their detailed profile page.
                  </div>
                </details>
              </div>
            </section>
          </main>

          {/* Right Sidebar: Trust / AEO badges */}
          <aside className={styles.sidebarCol}>
            <div className={styles.trustWidget}>
              <h3 className={styles.trustTitle}>Why choose Narayana Health?</h3>
              <ul className={styles.trustList}>
                <li>
                  <Stethoscope size={18} className={styles.trustIcon} />
                  <span>India's leading specialists</span>
                </li>
                <li>
                  <HeartPulse size={18} className={styles.trustIcon} />
                  <span>State-of-the-art facilities</span>
                </li>
                <li>
                  <Video size={18} className={styles.trustIcon} />
                  <span>Instant video consultations</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
        
      </div>
    </div>
  );
}
