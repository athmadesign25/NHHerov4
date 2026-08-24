"use client";

import React, { useRef, useEffect } from "react";
import { NeatGradient } from "@firecms/neat";
import HeroSearchFirst from "@/components/home/HeroSearchFirst";
import CentreOfExcellence from "@/components/home/CentreOfExcellence";
import WhyChooseNH from "@/components/home/WhyChooseNH";
import HealthPackages from "@/components/home/HealthPackages";
import PatientStories from "@/components/home/PatientStories";
import ChairmanQuote from "@/components/home/ChairmanQuote";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import FloatingQuickActions from "@/components/ui/FloatingQuickActions";

function GlobalNeatBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<NeatGradient | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config = {
      colors: [
        { color: '#F7F6F2', enabled: true },
        { color: '#F7F6F2', enabled: true },
        { color: '#FFFDF3', enabled: true },
        { color: '#F7F6F2', enabled: true },
        { color: '#196AD8', enabled: true },
        { color: '#FF9191', enabled: true },
      ],
      speed: 2.5,
      horizontalPressure: 3,
      verticalPressure: 4,
      waveFrequencyX: 2,
      waveFrequencyY: 3,
      waveAmplitude: 5,
      secondaryWaveEnabled: false,
      secondaryWaveFrequencyX: 3,
      secondaryWaveFrequencyY: 3,
      secondaryWaveAmplitude: 5,
      secondaryWaveSpeed: 0.6,
      secondaryWaveAngle: 1,
      shadows: 1,
      highlights: 5,
      colorBrightness: 1,
      colorSaturation: 7,
      wireframe: false,
      antialias: false,
      colorBlending: 8,
      backgroundColor: '#003FFF',
      backgroundAlpha: 1,
      grainScale: 0,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 1,
      resolution: 1,
      yOffset: 0,
      yOffsetWaveMultiplier: 4,
      yOffsetColorMultiplier: 4,
      yOffsetFlowMultiplier: 4,
      flowDistortionA: 0,
      flowDistortionB: 0,
      flowScale: 1,
      flowEase: 0,
      flowEnabled: true,
      enableProceduralTexture: false,
      transparentTextureVoid: false,
      textureMode: 'bitmap',
      bakeEdgeSoftness: 1,
      textureVoidLikelihood: 0.45,
      textureVoidWidthMin: 200,
      textureVoidWidthMax: 486,
      textureBandDensity: 2.15,
      textureColorBlending: 0.01,
      textureSeed: 333,
      textureEase: 0.5,
      proceduralBackgroundColor: '#000000',
      textureShapeTriangles: 20,
      textureShapeCircles: 15,
      textureShapeBars: 15,
      textureShapeSquiggles: 10,
      domainWarpEnabled: false,
      domainWarpIntensity: 0,
      domainWarpScale: 3,
      vignetteIntensity: 0,
      vignetteRadius: 0.8,
      fresnelEnabled: false,
      fresnelPower: 2,
      fresnelIntensity: 0.5,
      fresnelColor: '#FFFFFF',
      iridescenceEnabled: false,
      iridescenceIntensity: 0.5,
      iridescenceSpeed: 1,
      prismEdgeEnabled: false,
      prismEdgeIntensity: 0.5,
      prismEdgeThinness: 3,
      prismEdgeSpread: 1,
      prismEdgeSpeed: 0.5,
      prismEdgeRipple: 1,
      bloomIntensity: 0,
      bloomThreshold: 0.7,
      chromaticAberration: 0,
      shapeType: 'plane',
      shapeRotationX: 0,
      shapeRotationY: 0,
      shapeRotationZ: 0,
      shapeAutoRotateSpeedX: 0,
      shapeAutoRotateSpeedY: 0,
      sphereRadius: 15,
      torusRadius: 15,
      torusTube: 5,
      cylinderRadius: 10,
      cylinderHeight: 40,
      planeBend: 0,
      planeTwist: 0,
      silhouetteFade: 0.25,
      cylinderFade: 0.08,
      ribbonFade: 0.05,
      flatShading: true,
      cameraLock: true,
      cameraX: 0,
      cameraY: 0,
      cameraZ: 0,
      cameraRotationX: 0,
      cameraRotationY: 0,
      cameraRotationZ: 0,
      cameraZoom: 1,
    };

    gradientRef.current = new NeatGradient({
      ref: canvasRef.current,
      ...(config as any),
    });

    const handleScroll = () => {
      if (gradientRef.current) {
        gradientRef.current.yOffset = window.scrollY;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      gradientRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 25%, rgba(247, 246, 242, 0.7) 0%, rgba(247, 246, 242, 0.25) 55%, transparent 90%)", pointerEvents: "none" }} />
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ position: "relative", width: "100%", overflowX: "clip", background: "transparent" }}>
      <FloatingQuickActions />
      
      {/* Master container with seamless NeatGradient background extending behind Hero AND CentreOfExcellence */}
      <div style={{ position: "relative", width: "100%", background: "transparent" }}>
        <GlobalNeatBackground />
        
        {/* Hero section with floating scaled card */}
        <HeroSearchFirst />

        {/* CentreOfExcellence section with pinned title sequence & animated grid reveal */}
        <CentreOfExcellence />
      </div>

      <PatientStories />
      <HealthPackages />
      <WhyChooseNH />

      {/* ChairmanQuote section pinned sticky so AppDownloadBanner overlays on top of it during scroll */}
      <div style={{ position: "sticky", top: 0, zIndex: 15 }}>
        <ChairmanQuote />
      </div>

      {/* AppDownloadBanner Section overlays on top of ChairmanQuote */}
      <div style={{ position: "relative", zIndex: 25 }}>
        <AppDownloadBanner />
      </div>
    </div>
  );
}
