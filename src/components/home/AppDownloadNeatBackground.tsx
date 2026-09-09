"use client";

import { useRef, useEffect } from "react";
import { NeatGradient } from "@firecms/neat";

/**
 * Animated dark gradient, scoped to just the App Download section. Sits
 * behind AppDownloadBanner's own content, fading in via the parent's
 * darkOpacity so it takes over from the flat WhyNH->Footer handoff plate
 * exactly where that plate finishes turning dark.
 */
export default function AppDownloadNeatBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<NeatGradient | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config = {
      colors: [
        { color: "#000000", enabled: true },
        { color: "#001129", enabled: true },
        { color: "#0F0025", enabled: true },
        { color: "#290D11", enabled: true },
        { color: "#001129", enabled: true },
      ],
      speed: 2,
      horizontalPressure: 4,
      verticalPressure: 4,
      waveFrequencyX: 3,
      waveFrequencyY: 2,
      waveAmplitude: 1,
      secondaryWaveEnabled: false,
      secondaryWaveFrequencyX: 3,
      secondaryWaveFrequencyY: 3,
      secondaryWaveAmplitude: 5,
      secondaryWaveSpeed: 0.6,
      secondaryWaveAngle: 1,
      shadows: 2,
      highlights: 2,
      colorBrightness: 1,
      colorSaturation: -1,
      wireframe: false,
      antialias: false,
      colorBlending: 7,
      backgroundColor: "#010101",
      backgroundAlpha: 1,
      grainScale: 2,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 1,
      resolution: 0.75,
      yOffset: 0,
      yOffsetWaveMultiplier: 2.2,
      yOffsetColorMultiplier: 2.5,
      yOffsetFlowMultiplier: 2.8,
      flowDistortionA: 0.6,
      flowDistortionB: 1.2,
      flowScale: 1.2,
      flowEase: 0.15,
      flowEnabled: false,
      enableProceduralTexture: false,
      transparentTextureVoid: false,
      textureMode: "bitmap",
      bakeEdgeSoftness: 1,
      textureVoidLikelihood: 0.45,
      textureVoidWidthMin: 200,
      textureVoidWidthMax: 486,
      textureBandDensity: 2.15,
      textureColorBlending: 0.01,
      textureSeed: 333,
      textureEase: 0.68,
      proceduralBackgroundColor: "#000000",
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
      fresnelColor: "#FFFFFF",
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
      shapeType: "plane",
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
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
