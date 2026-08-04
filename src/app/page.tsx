import HeroSearchFirst from "@/components/home/HeroSearchFirst";
import CentreOfExcellence from "@/components/home/CentreOfExcellence";
import WhyChooseNH from "@/components/home/WhyChooseNH";
import HealthPackages from "@/components/home/HealthPackages";

import PatientStories from "@/components/home/PatientStories";
import ChairmanQuote from "@/components/home/ChairmanQuote";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import FloatingQuickActions from "@/components/ui/FloatingQuickActions";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <FloatingQuickActions />
      
      {/* Hero section will be positioned fixed behind the document flow */}
      <HeroSearchFirst />
      
      {/* Wrapper for the rest of the content */}
      <div 
        style={{ 
          position: "relative", 
          zIndex: 10, 
          background: "#ffffff"
        }}
      >
        {/* Dark theme section block with smooth fade transition from the fixed Hero background */}
        <div style={{ background: "#090d16", position: "relative", zIndex: 11 }}>
          {/* Transparent feathered fade mask at the top of the scroll list */}
          <div style={{
            position: "absolute",
            top: "-150px",
            left: 0,
            right: 0,
            height: "150px",
            background: "linear-gradient(to bottom, transparent, #090d16)",
            pointerEvents: "none",
            zIndex: 12
          }} />
          <CentreOfExcellence />
          <HealthPackages />
        </div>

        <PatientStories />
        <WhyChooseNH />
        <ChairmanQuote />
        <AppDownloadBanner />
      </div>
    </>
  );
}

