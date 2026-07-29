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
        <div style={{ background: "linear-gradient(135deg, #f5eff2 0%, #cbe1fc 100%)" }}>
          <CentreOfExcellence />
        </div>
        <HealthPackages />
        <PatientStories />
        <WhyChooseNH />
        <ChairmanQuote />
        <AppDownloadBanner />
      </div>
    </>
  );
}

