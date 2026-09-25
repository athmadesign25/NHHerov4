"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Navigation, Search, Check, Loader2 } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import {
  NH_LOCAL_HUBS,
  NH_ALL_CITIES,
  findClosestNHHub,
} from "./searchData";

interface LocationSelectorProps {
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  className?: string;
}

export default function LocationSelector({
  selectedLocation,
  onSelectLocation,
  className = "",
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check available viewport space to open upward if near screen bottom
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Close dropdown on page scroll
  useEffect(() => {
    function handleScroll() {
      if (isOpen) {
        setIsOpen(false);
        setSearchTerm("");
        setStatusMessage(null);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setStatusMessage(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation();
        setIsOpen(false);
        setSearchTerm("");
        setStatusMessage(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle "Use current location" via Browser Geolocation API
  const handleUseCurrentLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusMessage(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatusMessage("Geolocation not supported by your browser");
      searchInputRef.current?.focus();
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        const { latitude, longitude } = pos.coords;
        const closest = findClosestNHHub(latitude, longitude);

        let detectedLocation = "Bangalore";
        if (closest.distanceKm <= 35) {
          // Direct Hub (State A)
          detectedLocation = closest.hub;
        } else if (closest.distanceKm <= 100) {
          // Within 100 km radius (State B)
          detectedLocation = "Hosur";
        } else {
          // Remote / Video consultation tier (State C)
          detectedLocation = "Pune";
        }

        onSelectLocation(detectedLocation);
        setIsOpen(false);
        setSearchTerm("");
        setStatusMessage(null);
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setStatusMessage("Location permission denied. Select a city below.");
        } else {
          setStatusMessage("Unable to retrieve location. Select a city below.");
        }
        searchInputRef.current?.focus();
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  // Filter cities based on search term
  const filteredCities = searchTerm.trim()
    ? NH_ALL_CITIES.filter((city) =>
        city.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
    : [];

  const handleSelectCity = (city: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onSelectLocation(city);
    setIsOpen(false);
    setSearchTerm("");
    setStatusMessage(null);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCities.length > 0) {
        handleSelectCity(filteredCities[0]);
      } else if (searchTerm.trim()) {
        // Allow custom city entry
        handleSelectCity(searchTerm.trim());
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`${styles.locationPillWrapper} ${className}`} 
      style={{ position: "relative", zIndex: isOpen ? 200 : "auto" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Location Chip */}
      <button
        type="button"
        className={styles.locationPill}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setStatusMessage(null);
        }}
        aria-expanded={isOpen}
        aria-label={`Current location: ${selectedLocation}. Click to change location.`}
      >
        <MapPin size={13} className={styles.locationPinIcon} />
        <span>{selectedLocation}</span>
        <ChevronDown
          size={12}
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* Compact Glass Dropdown */}
      {isOpen && (
        <div 
          className={`${styles.locationMenu} ${openUpward ? styles.locationMenuUpward : ""}`} 
          role="dialog" 
          aria-label="Location selector"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Option 1: Use Current Location */}
          <button
            type="button"
            className={`${styles.locationMenuItem} ${styles.locationCurrentAction}`}
            onClick={handleUseCurrentLocation}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <Loader2 size={13} className={styles.locationDetectingSpinner} />
            ) : (
              <Navigation size={13} className={styles.locationNavIcon} />
            )}
            <span style={{ flex: 1 }}>
              {isDetecting ? "Detecting location..." : "Use current location"}
            </span>
          </button>

          {statusMessage && (
            <div className={styles.locationStatusNote}>
              {statusMessage}
            </div>
          )}

          <div className={styles.locationDivider} />

          {/* Option 2: Search another city input */}
          <div className={styles.locationSearchWrapper}>
            <Search size={13} className={styles.locationSearchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.locationSearchInput}
              placeholder="Search another city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus={false}
              spellCheck="false"
              autoComplete="off"
            />
          </div>

          {/* Filtered cities if user is typing in search */}
          {searchTerm.trim().length > 0 ? (
            <div className={styles.locationScrollList}>
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={`${styles.locationMenuItem} ${
                      city.toLowerCase() === selectedLocation.toLowerCase()
                        ? styles.locationMenuItemSelected
                        : ""
                    }`}
                    onClick={(e) => handleSelectCity(city, e)}
                  >
                    <span>{city}</span>
                    {city.toLowerCase() === selectedLocation.toLowerCase() && (
                      <Check size={13} style={{ marginLeft: "auto", color: "#034EA2" }} />
                    )}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  className={styles.locationMenuItem}
                  onClick={(e) => handleSelectCity(searchTerm.trim(), e)}
                >
                  <span>Select &ldquo;{searchTerm.trim()}&rdquo;</span>
                </button>
              )}
            </div>
          ) : (
            /* Standard Hub Cities List + Proximity State Demos */
            <div className={styles.locationScrollList}>
              <div className={styles.locationMenuHeader}>POPULAR HUBS</div>
              {NH_LOCAL_HUBS.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`${styles.locationMenuItem} ${
                    city.toLowerCase() === selectedLocation.toLowerCase()
                      ? styles.locationMenuItemSelected
                      : ""
                  }`}
                  onClick={(e) => handleSelectCity(city, e)}
                >
                  <span>{city}</span>
                  {city.toLowerCase() === selectedLocation.toLowerCase() && (
                    <Check size={13} style={{ marginLeft: "auto", color: "#034EA2" }} />
                  )}
                </button>
              ))}

              <div className={styles.locationMenuHeader}>PROXIMITY STATES</div>
              <button
                type="button"
                className={`${styles.locationMenuItem} ${
                  selectedLocation === "Hosur" ? styles.locationMenuItemSelected : ""
                }`}
                onClick={(e) => handleSelectCity("Hosur", e)}
                title="State B: Within 100 km"
              >
                <span>Hosur</span>
                <span className={styles.locationSubTag}>within 100 km</span>
              </button>
              <button
                type="button"
                className={`${styles.locationMenuItem} ${
                  selectedLocation === "Pune" ? styles.locationMenuItemSelected : ""
                }`}
                onClick={(e) => handleSelectCity("Pune", e)}
                title="State C: Video only"
              >
                <span>Pune</span>
                <span className={styles.locationSubTag}>video only</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
