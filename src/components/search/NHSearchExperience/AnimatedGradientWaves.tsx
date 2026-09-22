"use client";

import React, { useEffect, useRef } from "react";

interface AnimatedGradientWavesProps {
  /** Array of 3 CSS hex or rgb colors */
  colorStops?: [string, string, string];
  /** Wave amplitude height (default 1.25) */
  amplitude?: number;
  /** Blend softness (default 0.5) */
  blend?: number;
  /** Animation speed multiplier (default 0.8) */
  speed?: number;
  /** Height of the canvas container (default 100%) */
  height?: string;
  /** Opacity of the canvas (default 0.95 for rich visibility) */
  opacity?: number;
}

const VERT_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG_SHADER = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 getGradient(vec3 c0, vec3 c1, vec3 c2, float t) {
  float f = clamp(t, 0.0, 1.0);
  if (f < 0.5) {
    return mix(c0, c1, f * 2.0);
  } else {
    return mix(c1, c2, (f - 0.5) * 2.0);
  }
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 rampColor = getGradient(uColorStops[0], uColorStops[1], uColorStops[2], uv.x);
  
  // Dual-frequency organic wave noise mapped across upper fold & search viewport
  float n1 = snoise(vec2(uv.x * 2.2 + uTime * 0.14, uTime * 0.20)) * 0.30 * uAmplitude;
  float n2 = snoise(vec2(uv.x * 1.4 - uTime * 0.08, uv.y * 1.2 + uTime * 0.16)) * 0.22 * uAmplitude;
  float waveOffset = n1 + n2;
  
  // Wave boundary: crests reach down across upper fold and behind search viewport (down to uv.y ~ 0.3)
  float waveThreshold = 0.30 + waveOffset;
  float alpha = smoothstep(waveThreshold - uBlend * 0.55, waveThreshold + uBlend * 0.45, uv.y);
  
  fragColor = vec4(rampColor * alpha, alpha);
}
`;

function parseHexColor(color: string, defaultColor: [number, number, number] = [0.01, 0.3, 0.64]): [number, number, number] {
  if (!color) return defaultColor;
  const clean = color.trim();
  if (clean.startsWith("#")) {
    const hex = clean.length === 4
      ? "#" + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3]
      : clean;
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (match) {
      return [
        parseInt(match[1], 16) / 255,
        parseInt(match[2], 16) / 255,
        parseInt(match[3], 16) / 255,
      ];
    }
  }
  const rgbMatch = clean.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10) / 255,
      parseInt(rgbMatch[2], 10) / 255,
      parseInt(rgbMatch[3], 10) / 255,
    ];
  }
  return defaultColor;
}

export default function AnimatedGradientWaves({
  colorStops = ["#0A25C9", "#7C3AED", "#EC4899"], // Deep royal blue, purple, magenta pink
  amplitude = 1.3,
  blend = 0.5,
  speed = 0.85,
  height = "100%",
  opacity = 0.95, // Clearly visible across the screen
}: AnimatedGradientWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ── FALLBACK 2D CANVAS RENDERER ──
    const runCanvas2D = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const startTime = performance.now();
      const draw2D = (now: number) => {
        animFrameRef.current = requestAnimationFrame(draw2D);
        const t = (now - startTime) * 0.001 * speed;
        const w = (canvas.width = container.offsetWidth || window.innerWidth);
        const h = (canvas.height = container.offsetHeight || window.innerHeight);

        ctx.clearRect(0, 0, w, h);

        // Wave 1: Royal Blue (Left & Center)
        const g1 = ctx.createRadialGradient(
          w * 0.22 + Math.sin(t * 0.7) * 120,
          h * 0.28 + Math.cos(t * 0.5) * 60,
          40,
          w * 0.22,
          h * 0.35,
          w * 0.55
        );
        g1.addColorStop(0, colorStops[0] || "#0A25C9");
        g1.addColorStop(1, "transparent");

        // Wave 2: Purple Violet (Center & Upper Fold)
        const g2 = ctx.createRadialGradient(
          w * 0.52 + Math.cos(t * 0.6) * 100,
          h * 0.32 + Math.sin(t * 0.8) * 70,
          50,
          w * 0.52,
          h * 0.40,
          w * 0.50
        );
        g2.addColorStop(0, colorStops[1] || "#7C3AED");
        g2.addColorStop(1, "transparent");

        // Wave 3: Hot Magenta Pink (Right & Upper Fold)
        const g3 = ctx.createRadialGradient(
          w * 0.82 + Math.sin(t * 0.5) * 90,
          h * 0.30 + Math.cos(t * 0.7) * 50,
          40,
          w * 0.82,
          h * 0.36,
          w * 0.45
        );
        g3.addColorStop(0, colorStops[2] || "#EC4899");
        g3.addColorStop(1, "transparent");

        ctx.filter = "blur(64px)";
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = g3;
        ctx.fillRect(0, 0, w, h);
      };

      animFrameRef.current = requestAnimationFrame(draw2D);
    };

    // Attempt WebGL 2.0
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      runCanvas2D();
      return () => cancelAnimationFrame(animFrameRef.current);
    }

    // ── WEBGL 2.0 SHADER PIPELINE ──
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // 1. Vertex Shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) {
      runCanvas2D();
      return () => cancelAnimationFrame(animFrameRef.current);
    }
    gl.shaderSource(vs, VERT_SHADER);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      runCanvas2D();
      return () => cancelAnimationFrame(animFrameRef.current);
    }

    // 2. Fragment Shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) {
      runCanvas2D();
      return () => cancelAnimationFrame(animFrameRef.current);
    }
    gl.shaderSource(fs, FRAG_SHADER);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      runCanvas2D();
      return () => cancelAnimationFrame(animFrameRef.current);
    }

    // 3. Program Linking
    const program = gl.createProgram();
    if (!program) {
      runCanvas2D();
      return () => cancelAnimationFrame(animFrameRef.current);
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      runCanvas2D();
      return () => cancelAnimationFrame(animFrameRef.current);
    }

    gl.useProgram(program);

    // 4. Geometry Buffer
    const positions = new Float32Array([
      -1, -1,
       3, -1,
      -1,  3,
    ]);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // 5. Uniforms
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uAmplitudeLoc = gl.getUniformLocation(program, "uAmplitude");
    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    const uBlendLoc = gl.getUniformLocation(program, "uBlend");
    const uColorStopsLoc = gl.getUniformLocation(program, "uColorStops");

    const parsedColors = [
      ...parseHexColor(colorStops[0] || "#0A25C9"),
      ...parseHexColor(colorStops[1] || "#7C3AED"),
      ...parseHexColor(colorStops[2] || "#EC4899"),
    ];
    gl.uniform3fv(uColorStopsLoc, new Float32Array(parsedColors));
    gl.uniform1f(uBlendLoc, blend);

    // Resize Handler
    const handleResize = () => {
      if (!container || !canvas || !gl) return;
      const width = container.offsetWidth || window.innerWidth;
      const h = container.offsetHeight || window.innerHeight;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${h}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

      const baseHeight = 800 * dpr;
      const scaleFactor = baseHeight / Math.max(canvas.height, 1);
      gl.uniform1f(uAmplitudeLoc, amplitude * scaleFactor);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // 6. Animation Loop
    const startTime = performance.now();
    const renderLoop = (now: number) => {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      const elapsed = (now - startTime) * 0.001 * speed;

      gl.uniform1f(uTimeLoc, elapsed);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      if (vbo) gl.deleteBuffer(vbo);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (program) gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [colorStops, amplitude, blend, speed]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity,
        transition: "opacity 0.4s ease",
        background: "transparent",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
    </div>
  );
}
