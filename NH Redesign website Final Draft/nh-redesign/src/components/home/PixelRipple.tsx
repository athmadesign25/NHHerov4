"use client";

import React, { useEffect, useRef } from "react";

interface PixelRippleProps {
  trigger: boolean;
}

export default function PixelRipple({ trigger }: PixelRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full window size for the overlay
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const PIXEL_SIZE = 4;
    const GAP = 1;
    const TOTAL_SIZE = PIXEL_SIZE + GAP;
    
    const cols = Math.ceil(canvas.width / TOTAL_SIZE);
    const rows = Math.ceil(canvas.height / TOTAL_SIZE);

    const cx = cols / 2;
    const cy = rows / 2;

    const COLORS = [
      "rgba(59, 130, 246,",  // Blue
      "rgba(239, 68, 68,"    // Red
    ];

    interface Cell {
      x: number;
      y: number;
      dist: number;
      active: boolean;
      opacity: number;
      targetOpacity: number;
      colorBase: string;
      fadeSpeed: number;
      isOutline: boolean;
    }

    const cells: Cell[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Calculate distance from center
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 5% chance for a pixel to have intense "glow" opacity, otherwise normal higher opacity
        const isGlow = Math.random() > 0.95;
        const targetOp = isGlow ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5 + 0.3;

        cells.push({
          x,
          y,
          dist,
          active: false,
          opacity: 0,
          targetOpacity: targetOp,
          colorBase: COLORS[Math.floor(Math.random() * COLORS.length)],
          fadeSpeed: Math.random() * 0.04 + 0.02, // Much faster fade
          isOutline: Math.random() > 0.6 // 40% chance to be an outline box instead of filled
        });
      }
    }

    // Animation state
    let rippleRadius = 0;
    const MAX_RADIUS = Math.sqrt(cx * cx + cy * cy) + 10;
    const SPEED = 8.0; // Much faster expansion

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let allDead = true;

      for (const cell of cells) {
        // Light up if the ripple has reached it
        if (!cell.active && rippleRadius >= cell.dist) {
          // Increase empty pixels: only 15% chance to light up (Math.random() > 0.85)
          if (Math.random() > 0.85) {
            cell.active = true;
            cell.opacity = cell.targetOpacity; // Use uneven target opacity for depth
          } else {
            // Mark active so it doesn't try to light up again, but keep opacity 0
            cell.active = true;
            cell.opacity = 0;
          }
        }

        // Fade out active cells
        if (cell.active && cell.opacity > 0) {
          cell.opacity -= cell.fadeSpeed;
          if (cell.opacity < 0) cell.opacity = 0;
        }

        if (cell.opacity > 0) {
          allDead = false;
          
          if (cell.isOutline) {
            ctx.strokeStyle = `${cell.colorBase}${cell.opacity})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(
              cell.x * TOTAL_SIZE,
              cell.y * TOTAL_SIZE,
              PIXEL_SIZE,
              PIXEL_SIZE
            );
          } else {
            ctx.fillStyle = `${cell.colorBase}${cell.opacity})`;
            ctx.fillRect(
              cell.x * TOTAL_SIZE,
              cell.y * TOTAL_SIZE,
              PIXEL_SIZE,
              PIXEL_SIZE
            );
          }
        }
      }

      rippleRadius += SPEED;

      if (rippleRadius > MAX_RADIUS && allDead) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2, // Behind the search bar
      }}
    />
  );
}
