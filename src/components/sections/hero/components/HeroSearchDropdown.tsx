"use client";

import React, { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, ChevronRight, Activity, FileText, Video, Building2 } from "lucide-react";
import Lottie from "lottie-react";
import styles from "@/components/sections/hero/Hero.module.css";
import pulseAnimation from "../../../../../public/assets/pulse animation.json";
import searchAnimation from "../../../../../public/assets/AI Searching 2.json";
import starAnimation from "../../../../../public/assets/AI Searching 2.json";

import DoctorCard from "@/components/ui/DoctorCard";
import SpecialityResultCard from "@/components/ui/SpecialityResultCard";
import HighlightMatch from "@/components/ui/HighlightMatch";
import QuickTags from "@/components/sections/hero/components/QuickTags";
import { popularTags } from "@/data/specialities";
import { useHeroSearch } from "@/components/sections/hero/hooks/useHeroSearch";

interface HeroSearchDropdownProps {
  searchProps: ReturnType<typeof useHeroSearch>;
  isPulseActive: boolean;
  setIsPulseActive: Dispatch<SetStateAction<boolean>>;
  hasOpened: boolean;
  isUserLoggedIn: boolean;
}

export default function HeroSearchDropdown({
  searchProps,
  isPulseActive,
  setIsPulseActive,
  hasOpened,
  isUserLoggedIn
}: HeroSearchDropdownProps) {
  const {
    searchQuery,
    setSearchQuery,
    activeDropdownTab,
    setActiveDropdownTab,
    selectedLocation,
    setSelectedLocation,
    isOpen,
    setIsOpen,
    lastSearch,
    isApiLoading,
    useApiData,
    loading,
    tabCounts,
    handleSearch,
    handleSelectSuggestion,
    showDefaults,
    isDoctorQuery,
    hasSuggestions,
    displayDoctors,
    displaySpecs,
    displaySubSpecs,
    filteredHealthCheckups,
    filteredLabTests,
    displayProcedureItems,
    displayTreatmentItems,
    displayArticles,
    filteredSpecs,
    filteredDoctors,
    filteredTreatments,
    filteredOnlyTreatments
  } = searchProps;

  return (
    <AnimatePresence>
      {isOpen && !isPulseActive && (
        <motion.div
          key="hero-search-dropdown"
          className={styles.dropdown}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          data-lenis-prevent
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Row: Location, Divider, Tabs */}
          <div className={styles.searchDropdownHeader}>
            <div className={styles.locationSelector}>
              <MapPin size={16} className={styles.locationIcon} />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className={styles.locationSelect}
              >
                <option value="All Locations">All Locations</option>
                <option value="Bengaluru">Bengaluru, Karnataka</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Mumbai">Mumbai, Maharashtra</option>
                <option value="Kolkata">Kolkata, West Bengal</option>
              </select>
            </div>
            
            <div className={styles.dropdownHeaderDivider} />
            
            <div className={styles.searchTabs}>
              {(["doctors", "specialties", "treatments_tests", "articles"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.searchTab} ${activeDropdownTab === tab ? styles.searchTabActive : ""}`}
                  onClick={() => setActiveDropdownTab(tab)}
                >
                  {tab === "doctors" && "Doctors"}
                  {tab === "specialties" && "Specialties"}
                  {tab === "treatments_tests" && "Procedures & Treatments"}
                  {tab === "articles" && "Health Articles"}
                  <span className={styles.tabCountBadge}>
                    {tabCounts[tab === "treatments_tests" ? "treatments" : tab] === -1 ? "..." : tabCounts[tab === "treatments_tests" ? "treatments" : tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.searchDropdownContent}>
            {loading ? (
              <div className={styles.loadingState}>
                <Lottie animationData={searchAnimation} style={{ width: 60, height: 60 }} />
                <p>Searching NH network...</p>
              </div>
            ) : !hasSuggestions && !showDefaults ? (
              <div className={styles.noResultsState}>
                <Search className={styles.noResultsIcon} />
                <p>No exact matches found for &quot;{searchQuery}&quot;</p>
                <button type="button" className={styles.pulseFallbackBtn} onClick={() => setIsPulseActive(true)}>
                  <Lottie animationData={pulseAnimation} style={{ width: 24, height: 24 }} />
                  Ask Pulse AI to find specialists for &quot;{searchQuery}&quot;
                </button>
              </div>
            ) : (
              <div className={styles.searchResultsLayout}>
                {/* 1. Top Section: Standard Matches */}
                <div className={styles.standardMatchesRow}>
                  {activeDropdownTab === "specialties" && (
                    <div className={styles.resultGroup}>
                      <h4 className={styles.groupTitle}>
                        {showDefaults ? "Popular Specialties" : "Matching Specialties"}
                      </h4>
                      <div className={styles.cardsGrid}>
                        {displaySpecs.length > 0 ? (
                          displaySpecs.map((spec) => (
                            <SpecialityResultCard key={spec.name} spec={spec as any} searchQuery={searchQuery} onClick={handleSelectSuggestion} />
                          ))
                        ) : (
                          <div className={styles.emptyState}>No specialties found</div>
                        )}
                      </div>

                      {displaySubSpecs.length > 0 && (
                        <>
                          <h4 className={styles.groupTitle} style={{ marginTop: "24px" }}>
                            Matching Sub-Specialties
                          </h4>
                          <div className={styles.cardsGrid}>
                            {displaySubSpecs.map((sub) => (
                              <SpecialityResultCard key={sub.name} spec={sub as any} searchQuery={searchQuery} onClick={handleSelectSuggestion} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeDropdownTab === "doctors" && (
                    <div className={styles.resultGroup}>
                      <div className={styles.groupHeaderRow}>
                        <h4 className={styles.groupTitle}>
                          {showDefaults ? "Top Specialists" : "Matching Doctors"}
                        </h4>
                        {!showDefaults && displayDoctors.length > 0 && (
                          <button type="button" className={styles.viewAllBtn} onClick={handleSearch}>
                            View all doctors <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                      <div className={styles.cardsGrid}>
                        {displayDoctors.length > 0 ? (
                          displayDoctors.map((doc) => (
                            <DoctorCard key={doc.name} doc={doc as any} searchQuery={searchQuery} onClick={handleSelectSuggestion} />
                          ))
                        ) : (
                          <div className={styles.emptyState}>No doctors found in {selectedLocation}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Treatments & Articles Tabs Logic... */}
                  {activeDropdownTab === "treatments_tests" && (
                    <div className={styles.resultGroup}>
                      <div className={styles.cardsGrid}>
                        {displayProcedureItems.map((t) => (
                          <button key={t.name} type="button" className={styles.listItemBtn} onClick={() => handleSelectSuggestion(t.name)}>
                            <div className={styles.listItemIcon}><Activity size={16} /></div>
                            <div className={styles.listItemContent}>
                              <div className={styles.listItemName}>
                                <HighlightMatch text={t.name} query={searchQuery} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeDropdownTab === "articles" && (
                    <div className={styles.resultGroup}>
                      <div className={styles.cardsGrid}>
                        {displayArticles.map((a) => (
                          <button key={a.name} type="button" className={styles.listItemBtn} onClick={() => handleSelectSuggestion(a.name)}>
                            <div className={styles.listItemIcon}><FileText size={16} /></div>
                            <div className={styles.listItemContent}>
                              <div className={styles.listItemName}>
                                <HighlightMatch text={a.name} query={searchQuery} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pulse AI Preview Block - Shown if there is a query */}
                {!showDefaults && hasSuggestions && (
                  <div className={styles.pulsePreviewWrapper}>
                    <button type="button" className={styles.pulseAIPreviewBox} onClick={() => setIsPulseActive(true)}>
                      <div className={styles.pulsePreviewHeaderRow}>
                        <div className={styles.pulsePreviewBadge}>
                          <Lottie animationData={starAnimation} className={styles.pulsePreviewLottie} loop={true} />
                          {isUserLoggedIn ? (
                            <span className={styles.pulseAnalyzedBadgeTitle}>🔥 PULSE AI CURATED MATCH</span>
                          ) : (
                            <span className={styles.pulseAnalyzedBadgeTitle} style={{ color: "#0891b2" }}>✨ PULSE AI SPECIALIST RECOMMENDATIONS</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.pulsePreviewContent}>
                        <p><strong>Pulse AI has analyzed your query.</strong> Click here to see conversational recommendations, nearest slots, and empathy-driven results.</p>
                      </div>
                      <div className={styles.pulsePreviewFooter}>
                        <span>Open Pulse AI Workspace</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  </div>
                )}
                
                {/* Secondary Alternate Options */}
                {/* Fallback logic... */}
              </div>
            )}
          </div>
          
          <QuickTags 
            tags={popularTags}
            onSelectTag={(tag) => {
              setSearchQuery(tag);
              setIsOpen(true);
            }} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
