import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Play, Pause } from "lucide-react";
import "./index.css";

const moods = {
  dawn: {
    label: "Dawn Gold",
    gradient: ["#1b1f3b", "#6f4f8f", "#f2b36d", "#fff3d0"],
    glow: "rgba(255, 210, 150,",
    line: "rgba(255, 238, 210,",
  },
  sunset: {
    label: "Rose Sunset",
    gradient: ["#15172f", "#51335d", "#d18472", "#f5d6bd"],
    glow: "rgba(255, 174, 160,",
    line: "rgba(255, 224, 216,",
  },
  celestial: {
    label: "Celestial Blue",
    gradient: ["#07152f", "#123a61", "#6ea4bf", "#e8f5ff"],
    glow: "rgba(155, 215, 255,",
    line: "rgba(224, 244, 255,",
  },
  temple: {
    label: "Temple Sage",
    gradient: ["#0e1f24", "#31524c", "#9daf8d", "#efe8cf"],
    glow: "rgba(208, 223, 176,",
    line: "rgba(238, 244, 219,",
  },
};

const particleAccentColor = "rgba(135, 225, 255,";

const layerTabs = [
  { key: "plasma", label: "Plasma" },
  { key: "geometry", label: "Geometry" },
  { key: "particles", label: "Particles" },
  { key: "atmosphere", label: "Atmosphere" },
  { key: "camera", label: "Camera" },
];

const hudStyles = `
.hud-topbar {
  max-width: 1480px;
  margin: 0 auto 18px;
  display: grid;
  grid-template-columns: 260px 1fr auto;
  align-items: center;
  gap: 16px;
}

.hud-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hud-logo {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.95), rgba(146,70,255,.85) 35%, rgba(37,26,92,.85));
  box-shadow: 0 0 32px rgba(144, 85, 255, .38);
}

.hud-title {
  margin: 0;
  color: rgba(255,255,255,.96);
  font-size: 15px;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.hud-subtitle {
  margin: 2px 0 0;
  color: rgba(174,132,255,.85);
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.hud-tabs {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 999px;
  background: rgba(4,8,24,.45);
  backdrop-filter: blur(18px);
}

.hud-tab {
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255,255,255,.66);
  padding: 10px 18px;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
}

.hud-tab.active {
  color: white;
  background: rgba(133,74,255,.34);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.10), 0 0 28px rgba(145,92,255,.18);
}

.hud-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.hud-icon-pill {
  height: 38px;
  min-width: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 999px;
  background: rgba(255,255,255,.045);
  color: rgba(255,255,255,.72);
}

.engine-layout.hud-layout {
  max-width: 1480px;
  grid-template-columns: 320px minmax(0, 1fr);
  align-items: start;
}

.hud-layout .control-card {
  order: 0;
  max-height: calc(100vh - 130px);
  overflow-y: auto;
  scrollbar-width: thin;
  background: rgba(9, 12, 32, .72);
  border: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(22px);
}

.hud-layout .visual-card {
  order: 1;
}

.hud-panel-intro {
  padding: 2px 2px 8px;
  color: rgba(255,255,255,.62);
  font-size: 12px;
  line-height: 1.55;
}

.hud-section {
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  background: rgba(255,255,255,.035);
  padding: 14px;
  margin-top: 12px;
}

.hud-section-title {
  margin: 0 0 12px;
  color: rgba(255,255,255,.84);
  font-size: 12px;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.preset-button {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 10px 9px;
  background: rgba(255,255,255,0.055);
  color: rgba(255,255,255,0.78);
  cursor: pointer;
  font-size: 12px;
  line-height: 1.2;
  text-align: left;
}

.preset-button.active {
  background: linear-gradient(135deg, rgba(130,75,255,.36), rgba(0,220,255,.12));
  color: white;
  border-color: rgba(190,160,255,.34);
}

.hud-upload-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.hud-microcopy {
  color: rgba(255,255,255,.46);
  font-size: 11px;
  line-height: 1.45;
}

.theater-mode .hud-topbar,
.theater-mode .control-card {
  display: none !important;
}

@media (max-width: 1100px) {
  .hud-topbar {
    grid-template-columns: 1fr;
  }

  .hud-tabs {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .engine-layout.hud-layout {
    grid-template-columns: 1fr;
  }

  .hud-layout .control-card {
    max-height: none;
  }
}
`;

const visualPresets = {
  livingOrb: {
    label: "Living Orb",
    mood: "dawn",
    intensity: 0.62,
    geometrySize: 0.62,
    glowAmount: 0.72,
    bassSensitivity: 1.35,
    midSensitivity: 1.0,
    highSensitivity: 0.82,
    smoothness: 0.9,
    orbStrength: 1.0,
    plasmaStrength: 0.95,
    geometryStrength: 0.45,
    particleStrength: 0.9,
    causticStrength: 1.0,
    lightFlowStrength: 0.85,
  },
  celestialBlue: {
    label: "Celestial Blue",
    mood: "celestial",
    intensity: 0.58,
    geometrySize: 0.58,
    glowAmount: 0.82,
    bassSensitivity: 1.25,
    midSensitivity: 0.95,
    highSensitivity: 1.05,
    smoothness: 0.92,
    orbStrength: 0.95,
    plasmaStrength: 1.0,
    geometryStrength: 0.38,
    particleStrength: 1.0,
    causticStrength: 0.9,
    lightFlowStrength: 1.0,
  },
  plasmaTemple: {
    label: "Plasma Temple",
    mood: "temple",
    intensity: 0.7,
    geometrySize: 0.64,
    glowAmount: 0.68,
    bassSensitivity: 1.55,
    midSensitivity: 1.1,
    highSensitivity: 0.72,
    smoothness: 0.88,
    orbStrength: 0.72,
    plasmaStrength: 1.25,
    geometryStrength: 0.72,
    particleStrength: 0.78,
    causticStrength: 0.72,
    lightFlowStrength: 0.55,
  },
  harmonicLight: {
    label: "Harmonic Light",
    mood: "sunset",
    intensity: 0.68,
    geometrySize: 0.6,
    glowAmount: 0.9,
    bassSensitivity: 1.42,
    midSensitivity: 1.2,
    highSensitivity: 1.25,
    smoothness: 0.86,
    orbStrength: 1.0,
    plasmaStrength: 0.75,
    geometryStrength: 0.5,
    particleStrength: 1.15,
    causticStrength: 1.15,
    lightFlowStrength: 1.25,
  },
  deepMeditation: {
    label: "Deep Meditation",
    mood: "dawn",
    intensity: 0.42,
    geometrySize: 0.56,
    glowAmount: 0.55,
    bassSensitivity: 1.1,
    midSensitivity: 0.85,
    highSensitivity: 0.55,
    smoothness: 0.96,
    orbStrength: 0.72,
    plasmaStrength: 0.72,
    geometryStrength: 0.34,
    particleStrength: 0.55,
    causticStrength: 0.45,
    lightFlowStrength: 0.34,
  },
  sacredGeometry: {
    label: "Sacred Geometry",
    mood: "celestial",
    intensity: 0.55,
    geometrySize: 0.72,
    glowAmount: 0.62,
    bassSensitivity: 1.25,
    midSensitivity: 1.0,
    highSensitivity: 0.7,
    smoothness: 0.91,
    orbStrength: 0.35,
    plasmaStrength: 0.45,
    geometryStrength: 1.0,
    particleStrength: 0.72,
    causticStrength: 0.32,
    lightFlowStrength: 0.42,
  },
};

function getEmbedParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    embed: params.get("embed") === "1",
    mood: params.get("mood") || "dawn",
    intensity: Number(params.get("intensity") || 0.55),
    geometry: Number(params.get("geometry") || 0.62),
    glow: Number(params.get("glow") || 0.55),
    controls: params.get("controls") !== "0",
  };
}

function clamp(value, min = 0.1, max = 1) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function averageRange(dataArray, start, end) {
  let sum = 0;
  const safeEnd = Math.min(end, dataArray.length);
  for (let i = start; i < safeEnd; i++) sum += dataArray[i];
  return sum / Math.max(1, safeEnd - start) / 255;
}

function createParticles(count, width, height) {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.6 + Math.random() * 1.8,
    speed: 0.08 + Math.random() * 0.22,
    phase: Math.random() * Math.PI * 2,
    depth: 0.35 + Math.random() * 0.65,
    accent: Math.random() > 0.92,
    accentPhase: Math.random() * Math.PI * 2,
  }));
}

function drawBassRipples(ctx, cx, cy, radius, mood, time, bass, intensity) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "screen";

  const strength = Math.min(1, bass * 1.8);

  for (let i = 0; i < 5; i++) {
    const phase = (time * 0.00032 + i * 0.18) % 1;
    const rippleRadius = radius * (1.75 + phase * 4.2 + strength * 0.9);
    const alpha = Math.max(0.025, (1 - phase) * strength * 0.34 * intensity);

    ctx.beginPath();
    ctx.lineWidth = 1.25 + strength * 1.15;
    ctx.shadowBlur = 36 + strength * 56;
    ctx.shadowColor = `${mood.glow} ${alpha * 1.4})`;
    ctx.strokeStyle = `${mood.line} ${alpha})`;
    ctx.arc(0, 0, rippleRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBackground(ctx, width, height, mood, time) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, mood.gradient[0]);
  gradient.addColorStop(0.35, mood.gradient[1]);
  gradient.addColorStop(0.72, mood.gradient[2]);
  gradient.addColorStop(1, mood.gradient[3]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * (0.52 + Math.sin(time * 0.00004) * 0.03);
  const sunY = height * 0.58;
  const radial = ctx.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    width * 0.5
  );

  radial.addColorStop(0, "rgba(255, 238, 188, 0.24)");
  radial.addColorStop(0.45, "rgba(255, 220, 180, 0.09)");
  radial.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);
}

function drawFlowerOfLife(
  ctx,
  cx,
  cy,
  radius,
  rings,
  mood,
  opacity,
  glowAmount,
  scale,
  drift
) {
  ctx.save();
  ctx.translate(cx + drift.x, cy + drift.y);
  ctx.scale(scale, scale);
  ctx.lineWidth = Math.max(0.8, radius * 0.012);
  ctx.shadowBlur = 22 * glowAmount;
  ctx.shadowColor = `${mood.glow} 0.72)`;

  const spacing = radius;
  const circles = [];

  for (let q = -rings; q <= rings; q++) {
    for (let r = -rings; r <= rings; r++) {
      const s = -q - r;
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= rings) {
        circles.push({
          x: spacing * (q + r / 2),
          y: spacing * (Math.sqrt(3) / 2) * r,
        });
      }
    }
  }

  circles.forEach((circle, index) => {
    const alpha =
      opacity * (index === Math.floor(circles.length / 2) ? 0.78 : 0.5);

    ctx.strokeStyle = `${mood.line} ${alpha})`;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.shadowBlur = 34 * glowAmount;
  ctx.strokeStyle = `${mood.glow} ${0.18 * opacity})`;

  for (let i = 1; i <= 4; i++) {
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * (rings + i * 0.58), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles(ctx, particles, width, height, highs, mood, time, intensity) {
  particles.forEach((particle) => {
    const wave = Math.sin(time * 0.0015 + particle.phase) * (8 + highs * 24);
    const drift = Math.cos(time * 0.0008 + particle.phase) * (0.4 + highs * 2.2);

    particle.y -=
      particle.speed * particle.depth * (0.22 + intensity * 0.2 + highs * 0.35);

    particle.x += drift;
    particle.x +=
      Math.sin(time * 0.00025 + particle.phase) * (0.12 + highs * 1.6);

    const pulse =
      1 + highs * 2.8 + Math.sin(time * 0.008 + particle.phase) * (0.3 + highs);

    if (particle.y < -20) {
      particle.y = height + 20;
      particle.x = Math.random() * width;
    }

    const twinkle =
      0.12 + highs * 0.65 + Math.sin(time * 0.003 + particle.phase) * 0.12;

    ctx.beginPath();
    ctx.shadowBlur = 14 + highs * 30;
    const accentPulse = Math.sin(time * 0.004 + particle.accentPhase) * 0.5 + 0.5;
    const isSoftAccent = particle.accent && highs > 0.22 && accentPulse > 0.45;
    const particleColor = isSoftAccent ? particleAccentColor : mood.line;
    const particleAlpha = isSoftAccent
      ? Math.max(0.012, twinkle * 0.18)
      : Math.max(0.014, twinkle * 0.24);

    ctx.shadowColor = `${particleColor} ${isSoftAccent ? 0.22 + highs * 0.18 : 0.38 + highs * 0.28})`;
    ctx.fillStyle = `${particleColor} ${particleAlpha})`;

    ctx.arc(
      particle.x + wave * 0.08,
      particle.y,
      particle.size * Math.max(0.6, pulse),
      0,
      Math.PI * 2
    );

    ctx.fill();
  });

  ctx.shadowBlur = 0;
}

function drawLivingGeometry(ctx, cx, cy, radius, mood, time, bass, mids, highs, intensity) {
  ctx.save();

  const rotation = time * 0.00008 + mids * 0.45;
  const pulse = 1 + bass * 0.18 * intensity;
  const shimmer = 0.08 + highs * 0.22;

  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(pulse, pulse);

  ctx.lineWidth = 1.1;
  ctx.shadowBlur = 28 + highs * 42;
  ctx.shadowColor = `${mood.glow} ${0.55 + highs * 0.25})`;

  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const x = Math.cos(angle) * radius * 1.65;
    const y = Math.sin(angle) * radius * 1.65;

    ctx.beginPath();
    ctx.strokeStyle = `${mood.line} ${0.08 + shimmer})`;
    ctx.arc(x, y, radius * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.rotate(-rotation * 0.45);

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `${mood.line} ${0.11 + highs * 0.10})`;
    ctx.arc(0, 0, radius * (2.15 + i * 0.34 + bass * 0.25), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
function drawPlasmaField(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const layers = [
    {
      count: 5,
      scale: 0.42,
      speed: 0.000035,
      alpha: 0.055,
      drift: 0.04,
    },
    {
      count: 7,
      scale: 0.28,
      speed: 0.00007,
      alpha: 0.085,
      drift: 0.075,
    },
    {
      count: 4,
      scale: 0.18,
      speed: 0.00012,
      alpha: 0.06,
      drift: 0.11,
    },
  ];

  const bassBreath = bass * 0.24 * intensity;
  const midWarmth = mids * 0.12;
  const highShimmer = highs * 0.16;

  layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      const phase = i * 1.9 + layerIndex * 2.4;
      const angle = time * layer.speed + phase;

      const centerX =
        width *
        (0.5 +
          Math.sin(time * layer.speed * 0.7 + phase) *
            (layer.drift + bass * 0.025));

      const centerY =
        height *
        (0.52 +
          Math.cos(time * layer.speed * 0.6 + phase) *
            (layer.drift * 0.75 + mids * 0.018));

      const x =
        centerX +
        Math.cos(angle) *
          width *
          (0.12 + layerIndex * 0.035 + i * 0.006);

      const y =
        centerY +
        Math.sin(angle * 0.82) *
          height *
          (0.09 + layerIndex * 0.025 + i * 0.005);

      const radius =
        Math.min(width, height) *
        (layer.scale + i * 0.018 + bassBreath + layerIndex * 0.03);

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      gradient.addColorStop(
        0,
        `${mood.glow} ${layer.alpha + bassBreath * 0.25 + highShimmer})`
      );
      gradient.addColorStop(
        0.32,
        `${mood.line} ${layer.alpha * 0.7 + midWarmth})`
      );
      gradient.addColorStop(
        0.68,
        `${mood.glow} ${layer.alpha * 0.22 + highs * 0.035})`
      );
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
}


function drawMembraneCaustics(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const cx = width * (0.5 + Math.sin(time * 0.000045) * 0.012);
  const cy = height * (0.5 + Math.cos(time * 0.00004) * 0.01);
  const base = Math.min(width, height);
  const radius = base * (0.34 + bass * 0.035 * intensity);

  const palette = [
    "rgba(80, 230, 255,",
    "rgba(255, 125, 230,",
    "rgba(255, 220, 145,",
    "rgba(135, 115, 255,"
  ];

  // Soft translucent orb-like membrane body.
  const membrane = ctx.createRadialGradient(
    cx - radius * 0.18,
    cy - radius * 0.22,
    radius * 0.05,
    cx,
    cy,
    radius * 1.1
  );

  membrane.addColorStop(0, `rgba(255, 210, 255, ${0.035 + mids * 0.04})`);
  membrane.addColorStop(0.38, `rgba(90, 210, 255, ${0.055 + bass * 0.045})`);
  membrane.addColorStop(0.74, `rgba(40, 95, 220, ${0.045 + highs * 0.035})`);
  membrane.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = membrane;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
  ctx.fill();

  // Clip subtle caustics inside the living field so it feels like light moving through glass.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
  ctx.clip();

  for (let strand = 0; strand < 7; strand++) {
    const color = palette[strand % palette.length];
    const phase = strand * 1.33;
    const speed = time * (0.00011 + strand * 0.000018);
    const energy = Math.min(1, bass * 0.55 + mids * 0.5 + highs * 0.95);

    ctx.beginPath();

    for (let i = 0; i <= 150; i++) {
      const t = i / 150;
      const angle =
        t * Math.PI * 2.0 +
        speed +
        phase +
        Math.sin(time * 0.00055 + t * 7 + phase) * (0.18 + mids * 0.24);

      const wave =
        Math.sin(t * Math.PI * 4.5 + time * 0.001 + phase) *
        radius *
        (0.035 + highs * 0.035);

      const r =
        radius *
          (0.22 + strand * 0.055 + Math.sin(t * Math.PI * 2 + phase) * 0.07) +
        wave +
        bass * radius * 0.035;

      const x =
        cx +
        Math.cos(angle) * r +
        Math.sin(time * 0.00018 + phase) * radius * 0.12;

      const y =
        cy +
        Math.sin(angle * 0.86) * r +
        Math.cos(time * 0.00016 + phase) * radius * 0.10;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineWidth = 0.9 + highs * 1.4 + energy * 0.55;
    ctx.shadowBlur = 18 + energy * 42;
    ctx.shadowColor = `${color} ${0.35 + highs * 0.32})`;
    ctx.strokeStyle = `${color} ${0.045 + energy * 0.18 * intensity})`;
    ctx.stroke();
  }

  // Fine inner glitter/surface dust, very subtle and musical.
  for (let i = 0; i < 85; i++) {
    const a = i * 2.399 + time * (0.00016 + highs * 0.00008);
    const rr = radius * Math.sqrt(((i * 41) % 100) / 100) * 0.94;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a * 0.91) * rr;
    const twinkle = 0.012 + highs * 0.07 + Math.sin(time * 0.004 + i) * 0.014;

    ctx.fillStyle = `rgba(220, 248, 255, ${Math.max(0.006, twinkle)})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.35 + highs * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // A soft moving rim, present but not too technical.
  const rimDrift =
    Math.sin(time * 0.00031) * 0.42 +
    Math.cos(time * 0.00017 + bass * 1.5) * 0.18;

  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.lineWidth = 1.05 + bass * 0.85;
  ctx.shadowBlur = 22 + highs * 34;
  ctx.shadowColor = `rgba(90, 225, 255, ${0.35 + highs * 0.22})`;
  ctx.strokeStyle = `rgba(120, 235, 255, ${0.12 + highs * 0.11})`;
  ctx.arc(
    cx,
    cy,
    radius * (1.02 + bass * 0.025),
    Math.PI * 0.52 + rimDrift,
    Math.PI * 1.78 + rimDrift
  );
  ctx.stroke();

  ctx.restore();
}


function drawSplineRibbonSystem(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const cx = width / 2;
  const cy = height / 2;
  const base = Math.min(width, height);
  const colors = [
    "rgba(90, 230, 255,",
    "rgba(255, 90, 220,",
    "rgba(255, 220, 145,",
    "rgba(130, 95, 255,"
  ];

  const energy = Math.min(1, bass * 0.8 + mids * 0.65 + highs * 0.9);

  for (let ribbon = 0; ribbon < 8; ribbon++) {
    const color = colors[ribbon % colors.length];
    const phase = ribbon * 0.82;
    const orbit = base * (0.18 + ribbon * 0.027 + bass * 0.035);
    const rotation = time * (0.0001 + ribbon * 0.000018) + phase;

    ctx.beginPath();

    for (let i = 0; i <= 180; i++) {
      const t = i / 180;
      const angle =
        t * Math.PI * 2 +
        rotation +
        Math.sin(t * 7 + time * 0.0005 + phase) * (0.18 + mids * 0.4);

      const harmonic =
        Math.sin(t * Math.PI * (3 + (ribbon % 3)) + time * 0.001 + phase) *
        base *
        (0.016 + highs * 0.022);

      const x =
        cx +
        Math.cos(angle) * (orbit + harmonic) +
        Math.sin(time * 0.00017 + phase) * base * 0.07;

      const y =
        cy +
        Math.sin(angle * 0.84) * (orbit + harmonic) +
        Math.cos(time * 0.00013 + phase) * base * 0.045;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineWidth = 0.75 + highs * 1.8 + energy * 0.6;
    ctx.shadowBlur = 18 + energy * 42;
    ctx.shadowColor = `${color} ${0.42 + highs * 0.36})`;
    ctx.strokeStyle = `${color} ${0.055 + energy * 0.19 * intensity})`;
    ctx.stroke();
  }

  ctx.restore();
}


function drawPlasmaMembraneOrb(ctx, width, height, mood, time, bass, mids, highs, intensity, geometryStrength, glowAmount) {
  const cx = width * (0.5 + Math.sin(time * 0.000032) * 0.012);
  const cy = height * (0.51 + Math.cos(time * 0.000027) * 0.01);
  const base = Math.min(width, height);
  const radius = base * (0.36 + bass * 0.045) * Math.max(0.78, intensity);

  ctx.save();

  // Deep cosmic field — darker, less white.
  ctx.globalCompositeOperation = "screen";
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius * 1.95);
  aura.addColorStop(0, `rgba(45, 170, 255, ${0.07 * intensity + bass * 0.025})`);
  aura.addColorStop(0.45, `rgba(18, 68, 190, ${0.055 * intensity})`);
  aura.addColorStop(0.82, `rgba(7, 22, 85, ${0.035 * intensity})`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Transparent glass orb body.
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const glass = ctx.createRadialGradient(
    cx - radius * 0.28,
    cy - radius * 0.34,
    radius * 0.03,
    cx,
    cy,
    radius * 1.08
  );
  glass.addColorStop(0, `rgba(210,245,255, ${0.05 * intensity})`);
  glass.addColorStop(0.38, `rgba(52,175,255, ${0.045 * intensity})`);
  glass.addColorStop(0.73, `rgba(13,65,185, ${0.045 * intensity})`);
  glass.addColorStop(1, `rgba(3,12,58, ${0.035 * intensity})`);
  ctx.fillStyle = glass;
  ctx.fill();

  // Almost-hidden sacred geometry UNDER the plasma, not on top.
  if (geometryStrength > 0.01) {
    ctx.save();
    ctx.globalAlpha = 0.08 * geometryStrength * intensity;
    ctx.globalCompositeOperation = "screen";
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.000035 + mids * 0.1);
    ctx.lineWidth = 0.65;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(120,225,255, ${0.12 * geometryStrength})`;
    ctx.strokeStyle = `rgba(160,230,255, ${0.12 * geometryStrength})`;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.38 + i * 0.16), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Clip all living matter inside the membrane.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.985, 0, Math.PI * 2);
  ctx.clip();

  // Dark center creates depth and keeps the orb from becoming pale/white.
  ctx.globalCompositeOperation = "source-over";
  const depth = ctx.createRadialGradient(cx, cy, radius * 0.04, cx, cy, radius * 0.98);
  depth.addColorStop(0, `rgba(0,12,44, ${0.13 * intensity})`);
  depth.addColorStop(0.6, `rgba(0,18,60, ${0.055 * intensity})`);
  depth.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = depth;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.globalCompositeOperation = "screen";

  // Large, soft, asymmetrical plasma bodies.
  const blobs = [
    { color: "rgba(255,105,230,", phase: 0.0, sx: 0.52, sy: 0.34, alpha: 0.22 },
    { color: "rgba(65,225,255,", phase: 2.1, sx: 0.58, sy: 0.32, alpha: 0.18 },
    { color: "rgba(130,105,255,", phase: 4.2, sx: 0.43, sy: 0.28, alpha: 0.11 },
    { color: "rgba(255,220,155,", phase: 5.3, sx: 0.28, sy: 0.18, alpha: 0.08 },
  ];

  blobs.forEach((blob, bi) => {
    const a = time * (0.000045 + bi * 0.000012) + blob.phase + mids * 0.22;
    const x = cx + Math.cos(a) * radius * (0.16 + bass * 0.05);
    const y = cy + Math.sin(a * 0.78) * radius * (0.14 + mids * 0.04);
    const rx = radius * (blob.sx + bass * 0.09);
    const ry = radius * (blob.sy + mids * 0.06);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(a * 0.7) * 0.8);
    ctx.scale(1.35, 0.78);

    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `${blob.color} ${(blob.alpha + highs * 0.055) * intensity})`);
    g.addColorStop(0.34, `${blob.color} ${(blob.alpha * 0.58 + mids * 0.025) * intensity})`);
    g.addColorStop(0.72, `${blob.color} ${(blob.alpha * 0.18) * intensity})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;

    ctx.beginPath();
    const points = 72;
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2;
      const wobble =
        1 +
        Math.sin(t * 3 + time * 0.00042 + blob.phase) * (0.09 + mids * 0.04) +
        Math.sin(t * 5 - time * 0.00036 + blob.phase) * (0.045 + highs * 0.018);
      const px = Math.cos(t) * rx * wobble;
      const py = Math.sin(t) * ry * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.shadowBlur = 64 + bass * 80 + highs * 35;
    ctx.shadowColor = `${blob.color} ${0.22 * intensity})`;
    ctx.fill();
    ctx.restore();
  });

  // Soft liquid seams and turning lights across the inner matter.
  for (let strand = 0; strand < 4; strand++) {
    const phase = strand * 1.7;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const angle =
        t * Math.PI * (1.25 + strand * 0.16) +
        time * (0.00006 + strand * 0.000012) +
        phase;
      const r = radius * (0.12 + t * 0.48 + Math.sin(t * Math.PI * 3 + time * 0.00044 + phase) * 0.055);
      const x = cx + Math.cos(angle) * r * (1.0 + mids * 0.1);
      const y = cy + Math.sin(angle * 0.85) * r * 0.55 + Math.sin(t * Math.PI * 2 + time * 0.0003) * radius * 0.08;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 1.0 + highs * 2.4;
    ctx.shadowBlur = 24 + highs * 60;
    ctx.shadowColor = strand % 2 ? `rgba(255,175,245, ${0.24 + highs * 0.2})` : `rgba(110,240,255, ${0.25 + highs * 0.2})`;
    ctx.strokeStyle = strand % 2 ? `rgba(255,205,250, ${0.06 * intensity + highs * 0.06})` : `rgba(150,250,255, ${0.065 * intensity + highs * 0.06})`;
    ctx.stroke();
  }

  // Interior dust only, almost invisible.
  for (let i = 0; i < 45; i++) {
    const seed = i * 19.137;
    const a = ((Math.sin(seed) * 43758.5453) % 1) * Math.PI * 2 + time * 0.000022;
    const rr = Math.sqrt(Math.abs((Math.sin(seed + 4.4) * 24634.6345) % 1)) * radius * 0.82;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr * 0.82;
    const pulse = Math.sin(time * 0.0014 + i) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.shadowBlur = 5 + highs * 14;
    ctx.shadowColor = `rgba(150,235,255, ${0.08 + highs * 0.08})`;
    ctx.fillStyle = `rgba(185,245,255, ${(0.005 + pulse * 0.012 + highs * 0.01) * intensity})`;
    ctx.arc(x, y, 0.28 + pulse * 0.48, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Cinematic cyan and magenta rim arcs — this replaces the heavy full geometry.
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  const rimDrift = Math.sin(time * 0.00016) * 0.24;

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.006, Math.PI * (1.03 + rimDrift), Math.PI * (1.72 + rimDrift * 0.7));
  ctx.lineWidth = 3.4 + bass * 4.0;
  ctx.shadowBlur = 45 + highs * 55;
  ctx.shadowColor = `rgba(65,235,255, ${0.42 * intensity})`;
  ctx.strokeStyle = `rgba(90,238,255, ${0.26 * intensity + highs * 0.08})`;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.995, Math.PI * (0.04 + rimDrift * 0.38), Math.PI * (0.29 + rimDrift * 0.48));
  ctx.lineWidth = 1.6 + highs * 2.2;
  ctx.shadowBlur = 26 + highs * 64;
  ctx.shadowColor = `rgba(255,170,245, ${0.32 * intensity})`;
  ctx.strokeStyle = `rgba(255,185,248, ${0.12 * intensity + highs * 0.08})`;
  ctx.stroke();

  // Edge glints when the highs arrive.
  const glints = 2 + Math.floor(highs * 4);
  for (let i = 0; i < glints; i++) {
    const angle = time * (0.00023 + i * 0.000028) + i * 2.2 + highs * 0.5;
    const x = cx + Math.cos(angle) * radius * 1.006;
    const y = cy + Math.sin(angle) * radius * 1.006;
    const pulse = Math.sin(time * 0.004 + i * 2.9) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.shadowBlur = 34 + pulse * 50 + highs * 55;
    ctx.shadowColor = i % 2 ? `rgba(255,185,248, ${0.5 + highs * 0.32})` : `rgba(125,245,255, ${0.55 + highs * 0.35})`;
    ctx.fillStyle = `rgba(248,255,255, ${(0.045 + pulse * 0.1 + highs * 0.11) * intensity})`;
    ctx.arc(x, y, 1.1 + pulse * 2.4 + highs * 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}



export default function App() {
  const embedParams = useMemo(() => getEmbedParams(), []);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  const [audioName, setAudioName] = useState("No audio selected");
  const [isPlaying, setIsPlaying] = useState(false);
  const [intensity, setIntensity] = useState(clamp(embedParams.intensity));
  const [geometrySize, setGeometrySize] = useState(clamp(embedParams.geometry));
  const [glowAmount, setGlowAmount] = useState(clamp(embedParams.glow));
  const [moodKey, setMoodKey] = useState(
    moods[embedParams.mood] ? embedParams.mood : "dawn"
  );

  const [levels, setLevels] = useState({ bass: 0, mids: 0, highs: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [bassSensitivity, setBassSensitivity] = useState(1.35);
  const [midSensitivity, setMidSensitivity] = useState(1.0);
  const [highSensitivity, setHighSensitivity] = useState(0.75);
  const [smoothness, setSmoothness] = useState(0.9);
  const [theaterMode, setTheaterMode] = useState(false);
  const [orbStrength, setOrbStrength] = useState(1.0);
  const [plasmaStrength, setPlasmaStrength] = useState(1.0);
  const [geometryStrength, setGeometryStrength] = useState(0.65);
  const [particleStrength, setParticleStrength] = useState(1.0);
  const [showParticles, setShowParticles] = useState(true);
  const [causticStrength, setCausticStrength] = useState(1.0);
  const [lightFlowStrength, setLightFlowStrength] = useState(1.0);
  const [activePreset, setActivePreset] = useState("livingOrb");
  const [activeTab, setActiveTab] = useState("plasma");


  const applyPreset = (presetKey) => {
    const preset = visualPresets[presetKey];
    if (!preset) return;

    setActivePreset(presetKey);
    setMoodKey(preset.mood);
    setIntensity(preset.intensity);
    setGeometrySize(preset.geometrySize);
    setGlowAmount(preset.glowAmount);
    setBassSensitivity(preset.bassSensitivity);
    setMidSensitivity(preset.midSensitivity);
    setHighSensitivity(preset.highSensitivity);
    setSmoothness(preset.smoothness);
    setOrbStrength(preset.orbStrength);
    setPlasmaStrength(preset.plasmaStrength);
    setGeometryStrength(preset.geometryStrength);
    setParticleStrength(preset.particleStrength);
    setCausticStrength(preset.causticStrength);
    setLightFlowStrength(preset.lightFlowStrength);
  };

  const toggleTheaterMode = async () => {
    const root = document.documentElement;

    if (!document.fullscreenElement) {
      await root.requestFullscreen();
      setTheaterMode(true);
    } else {
      await document.exitFullscreen();
      setTheaterMode(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particlesRef.current = createParticles(140, rect.width, rect.height);
    };

    resize();

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setTheaterMode(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const render = (time) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mood = moods[moodKey];

      let bass = 0;
      let mids = 0;
      let highs = 0;

      if (analyserRef.current && dataRef.current) {
        analyserRef.current.getByteFrequencyData(dataRef.current);

        bass = averageRange(dataRef.current, 2, 18) * bassSensitivity;
        mids = averageRange(dataRef.current, 18, 86) * midSensitivity;
        highs = averageRange(dataRef.current, 86, 180) * highSensitivity;

        bass = Math.min(1, bass);
        mids = Math.min(1, mids);
        highs = Math.min(1, highs);
      }

      const smoothingAmount = 1 - smoothness;

      setLevels((previous) => ({
        bass: previous.bass + (bass - previous.bass) * smoothingAmount,
        mids: previous.mids + (mids - previous.mids) * smoothingAmount,
        highs: previous.highs + (highs - previous.highs) * smoothingAmount,
      }));

      const softBass = Math.min(1, bass * 2.4);
      const softMids = Math.min(1, mids * 2.0);
      const softHighs = Math.min(1, highs * 2.6);

      drawBackground(ctx, width, height, mood, time);

      // Phase 2.7 — Plasma Membrane Orb.
      // The old geometry is no longer drawn over the plasma; it is now only a faint underlay inside the sphere.
      if (orbStrength > 0.01 || plasmaStrength > 0.01 || lightFlowStrength > 0.01) {
        drawPlasmaMembraneOrb(
          ctx,
          width,
          height,
          mood,
          time,
          softBass * orbStrength,
          softMids * plasmaStrength,
          softHighs,
          intensity * Math.max(orbStrength, plasmaStrength, lightFlowStrength),
          geometryStrength,
          glowAmount
        );
      }

      const musicWarmth = (softHighs * 0.018 + softBass * 0.012) * lightFlowStrength;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `${mood.glow} ${musicWarmth})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      if (showParticles && particleStrength > 0.01) {
        drawParticles(
          ctx,
          particlesRef.current,
          width,
          height,
          softHighs,
          mood,
          time,
          intensity * particleStrength * 0.28
        );
      }

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const halo = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.min(width, height) * 0.52
      );

      halo.addColorStop(0, `${mood.glow} ${0.018 + softBass * 0.018})`);
      halo.addColorStop(0.55, `${mood.glow} ${0.035 + softHighs * 0.04})`);
      halo.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationRef.current);
  }, [
    intensity,
    geometrySize,
    glowAmount,
    moodKey,
    bassSensitivity,
    midSensitivity,
    highSensitivity,
    smoothness,
    orbStrength,
    plasmaStrength,
    geometryStrength,
    particleStrength,
    showParticles,
    causticStrength,
    lightFlowStrength,
  ]);

  const handleFile = (file) => {
    if (!file) return;

    const isAudio =
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name);

    if (!isAudio) {
      alert("Please upload an audio file such as MP3, WAV, M4A, AAC, OGG, or FLAC.");
      return;
    }

    setupAudio(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const setupAudio = async (file) => {
    const audio = audioRef.current;
    const url = URL.createObjectURL(file);

    audio.src = url;
    setAudioName(file.name);
    setIsPlaying(false);

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.88;

      dataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    if (!sourceRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio.src) return;

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <main
      className={`${embedParams.embed ? "engine-shell embed" : "engine-shell"} ${
        theaterMode ? "theater-mode" : ""
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <style>{hudStyles}</style>

      {!embedParams.embed && (
        <header className="hud-topbar">
          <div className="hud-brand">
            <div className="hud-logo">✦</div>
            <div>
              <h1 className="hud-title">Living Light Engine</h1>
              <p className="hud-subtitle">Cinematic Visualizer</p>
            </div>
          </div>

          <nav className="hud-tabs" aria-label="Layer navigation">
            {layerTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={activeTab === tab.key ? "hud-tab active" : "hud-tab"}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hud-actions">
            <div className="hud-icon-pill">〰</div>
            <div className="hud-icon-pill">◌</div>
            <div className="hud-icon-pill">⚙</div>
            <button className="theater-button" onClick={toggleTheaterMode}>
              Fullscreen
            </button>
          </div>
        </header>
      )}

      <div className={embedParams.embed ? "engine-layout embed" : "engine-layout hud-layout"}>
        <div className={isDragging ? "visual-card dragging" : "visual-card"}>
          <div className="canvas-wrap">
            <canvas ref={canvasRef} />

            <div className="loaded-pill">
              <span>Now loaded</span>
              <strong>{audioName}</strong>
            </div>
          </div>
        </div>

        {embedParams.controls && (
          <aside className="control-card">
            <div className="hud-panel-intro">
              Direct the visual like a cinematic instrument. Controls stay on the left so the canvas remains visible while tuning.
            </div>

            <HudSection title="Audio">
              <div className="hud-upload-row">
                <label className="upload-box">
                  <Upload size={18} /> Upload or drop audio file
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                </label>

                <button className="play-button" onClick={togglePlayback}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>

              <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
              <p className="hud-microcopy">Drag an MP3 directly onto the canvas or use the upload field.</p>
            </HudSection>

            {activeTab === "plasma" && (
              <>
                <HudSection title="Visual Presets">
                  <div className="preset-grid">
                    {Object.entries(visualPresets).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyPreset(key)}
                        className={activePreset === key ? "preset-button active" : "preset-button"}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </HudSection>

                <HudSection title="Flow Controls">
                  <Control label="Intensity" value={intensity} onChange={setIntensity} />
                  <Control label="Glow Amount" value={glowAmount} onChange={setGlowAmount} />
                  <Control label="Orb Strength" value={orbStrength} onChange={setOrbStrength} />
                  <Control label="Plasma Strength" value={plasmaStrength} onChange={setPlasmaStrength} />
                  <Control label="Light Flow Strength" value={lightFlowStrength} onChange={setLightFlowStrength} />
                  <Control label="Caustic Strength" value={causticStrength} onChange={setCausticStrength} />
                </HudSection>
              </>
            )}

            {activeTab === "geometry" && (
              <HudSection title="Geometry">
                <Control label="Geometry Size" value={geometrySize} onChange={setGeometrySize} />
                <Control label="Geometry Strength" value={geometryStrength} onChange={setGeometryStrength} />
                <Control label="Bass Sensitivity" value={bassSensitivity} onChange={setBassSensitivity} />
                <Control label="Motion Smoothness" value={smoothness} onChange={setSmoothness} />
              </HudSection>
            )}

            {activeTab === "particles" && (
              <HudSection title="Particles">
                <button className="theater-button" onClick={() => setShowParticles((value) => !value)}>
                  {showParticles ? "Hide Particles" : "Show Particles"}
                </button>
                <Control label="Particle Strength" value={particleStrength} onChange={setParticleStrength} />
                <Control label="High Sensitivity" value={highSensitivity} onChange={setHighSensitivity} />
                <div className="meters">
                  <Meter label="Bass" value={levels.bass} />
                  <Meter label="Mids" value={levels.mids} />
                  <Meter label="Highs" value={levels.highs} />
                </div>
                <p className="note">
                  Particles can be hidden, softened, or kept as faint light dust. Only occasional particles now glow with a very soft cyan accent.
                </p>
              </HudSection>
            )}

            {activeTab === "atmosphere" && (
              <HudSection title="Atmosphere">
                <div className="field-group">
                  <label>Background Mood</label>
                  <select
                    value={moodKey}
                    onChange={(event) => setMoodKey(event.target.value)}
                  >
                    {Object.entries(moods).map(([key, mood]) => (
                      <option key={key} value={key}>
                        {mood.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Control label="Mid Sensitivity" value={midSensitivity} onChange={setMidSensitivity} />
                <Control label="Plasma Strength" value={plasmaStrength} onChange={setPlasmaStrength} />
                <Control label="Caustic Strength" value={causticStrength} onChange={setCausticStrength} />
              </HudSection>
            )}

            {activeTab === "camera" && (
              <HudSection title="Performance">
                <button className="theater-button" onClick={toggleTheaterMode}>
                  {theaterMode ? "Exit Theater Mode" : "Fullscreen Theater Mode"}
                </button>
                <p className="note">
                  Theater mode keeps the visual clean and immersive. Press ESC to exit fullscreen.
                </p>
              </HudSection>
            )}
          </aside>
        )}
      </div>
    </main>
  );
}

function HudSection({ title, children }) {
  return (
    <section className="hud-section">
      <h2 className="hud-section-title">{title}</h2>
      {children}
    </section>
  );
}

function Control({ label, value, onChange }) {
  return (
    <div className="field-group">
      <div className="label-row">
        <label>{label}</label>
        <span>{Math.round(value * 100)}%</span>
      </div>

    <input
  type="range"
  min="0.1"
  max={label.includes("Sensitivity") ? "2" : label.includes("Strength") ? "1.5" : "1"}
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function Meter({ label, value }) {
  return (
    <div className="meter">
      <span>{label}</span>
      <div>
        <i style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}
