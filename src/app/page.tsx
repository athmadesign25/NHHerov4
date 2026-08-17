import HeroSearchFirst from "@/components/home/HeroSearchFirst";
import CentreOfExcellence from "@/components/home/CentreOfExcellence";
import WhyChooseNH from "@/components/home/WhyChooseNH";
import HealthPackages from "@/components/home/HealthPackages";

import PatientStories from "@/components/home/PatientStories";
import ChairmanQuote from "@/components/home/ChairmanQuote";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import FloatingQuickActions from "@/components/ui/FloatingQuickActions";
import PulseAIFloatingEntry from "@/components/pulse-ai/PulseAIFloatingEntry";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <FloatingQuickActions />
      <PulseAIFloatingEntry />
      
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
        <CentreOfExcellence />
        <WhyChooseNH />
        <PatientStories />
        <HealthPackages />
        <ChairmanQuote />
        <AppDownloadBanner />
      </div>
    </>
  );
}

