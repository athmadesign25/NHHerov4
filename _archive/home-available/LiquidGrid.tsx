"use client";

import React, { useRef, useEffect } from "react";
import { motion, MotionValue } from "framer-motion";

interface LiquidGridProps {
  yTransform?: MotionValue<string>;
}

export default function LiquidGrid({ yTransform }: LiquidGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let dots: { x: number; y: number; baseX: number; baseY: number; vx: number; vy: number }[] = [];

    const SPACING = 36;
    const RADIUS = 1.5;
    const MOUSE_RADIUS = 150;
    const REPULSION = 0.5;
    const RETURN_SPEED = 0.1;
    const FRICTION = 0.8;

    let mouse = { x: -1000, y: -1000 };
    let rect = canvas.getBoundingClientRect();

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(canvas.width / SPACING) + 2;
      const rows = Math.ceil(canvas.height / SPACING) + 2;

      const gridWidth = (cols - 1) * SPACING;
      const gridHeight = (rows - 1) * SPACING;
      const offsetX = (canvas.width - gridWidth) / 2;
      const offsetY = (canvas.height - gridHeight) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offsetX + i * SPACING;
          const y = offsetY + j * SPACING;
          dots.push({ x, y, baseX: x, baseY: y, vx: 0, vy: 0 });
        }
      }
    };

    const resize = () => {
      rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      initDots();
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let isHovered = false;
        let force = 0;

        if (dist < MOUSE_RADIUS) {
          force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          
          dot.vx -= Math.cos(angle) * force * REPULSION;
          dot.vy -= Math.sin(angle) * force * REPULSION;
          isHovered = true;
        }

        dot.vx += (dot.baseX - dot.x) * RETURN_SPEED;
        dot.vy += (dot.baseY - dot.y) * RETURN_SPEED;

        dot.vx *= FRICTION;
        dot.vy *= FRICTION;

        dot.x += dot.vx;
        dot.y += dot.vy;

        if (isHovered) {
          // NH Emergency Red: 237, 28, 36
          const r = Math.round(255 - force * (255 - 237));
          const g = Math.round(255 - force * (255 - 28));
          const b = Math.round(255 - force * (255 - 36));
          const a = 0.15 + force * 0.85; // Becomes fully opaque at the center of the cursor
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "-20%",
        left: "-10%",
        width: "120%",
        height: "140%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.5,
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, transparent 20%, black 35%)",
        y: yTransform,
      }}
    />
  );
}
