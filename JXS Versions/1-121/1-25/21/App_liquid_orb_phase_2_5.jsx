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
    mood: "celestial",
    intensity: 0.52,
    geometrySize: 0.62,
    glowAmount: 0.62,
    bassSensitivity: 1.35,
    midSensitivity: 1.0,
    highSensitivity: 0.82,
    smoothness: 0.9,
    orbStrength: 1.0,
    plasmaStrength: 0.95,
    geometryStrength: 0.18,
    particleStrength: 0.18,
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
    geometryStrength: 0.16,
    particleStrength: 0.14,
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
    geometryStrength: 0.26,
    particleStrength: 0.12,
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
    geometryStrength: 0.18,
    particleStrength: 0.16,
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
    geometryStrength: 0.14,
    particleStrength: 0.08,
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
    geometryStrength: 0.38,
    particleStrength: 0.10,
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
  gradient.addColorStop(0, "#00030b");
  gradient.addColorStop(0.28, "#010817");
  gradient.addColorStop(0.62, "#03152f");
  gradient.addColorStop(1, "#00040d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const coreX = width * (0.5 + Math.sin(time * 0.000025) * 0.018);
  const coreY = height * (0.52 + Math.cos(time * 0.00002) * 0.014);
  const radial = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, width * 0.64);

  radial.addColorStop(0, "rgba(70, 185, 255, 0.055)");
  radial.addColorStop(0.42, "rgba(18, 58, 135, 0.05)");
  radial.addColorStop(0.74, "rgba(7, 18, 45, 0.045)");
  radial.addColorStop(1, "rgba(0, 0, 0, 0)");
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
      0.018 + highs * 0.05 + Math.sin(time * 0.003 + particle.phase) * 0.018;

    ctx.beginPath();
    ctx.shadowBlur = 14 + highs * 30;
    const accentPulse = Math.sin(time * 0.004 + particle.accentPhase) * 0.5 + 0.5;
    const isSoftAccent = particle.accent && highs > 0.22 && accentPulse > 0.45;
    const particleColor = isSoftAccent ? particleAccentColor : mood.line;
    const particleAlpha = isSoftAccent
      ? Math.max(0.035, twinkle * 0.38)
      : Math.max(0.06, twinkle * 0.82);

    ctx.shadowColor = `${particleColor} ${isSoftAccent ? 0.22 + highs * 0.18 : 0.38 + highs * 0.28})`;
    ctx.fillStyle = `${particleColor} ${particleAlpha})`;

    ctx.arc(
      particle.x + wave * 0.08,
      particle.y,
      particle.size * 0.46 * Math.max(0.45, pulse),
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
  ctx.shadowBlur = 22 + bass * 26;
  ctx.shadowColor = `rgba(90, 225, 255, ${0.32 + bass * 0.18})`;
  ctx.strokeStyle = `rgba(120, 235, 255, ${0.10 + bass * 0.10})`;
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



function buildClosedOrganicPath(ctx, points) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const midX = (current.x + next.x) * 0.5;
    const midY = (current.y + next.y) * 0.5;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  ctx.closePath();
}

function liquidMembranePoints(cx, cy, radius, time, bass, mids, highs, variant = 0) {
  const points = [];
  const count = 72;
  const rotation = time * (0.00018 + variant * 0.000035) + variant * 1.7;
  const lift = Math.sin(time * 0.00021 + variant) * radius * 0.055;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2 + rotation;
    const waveA = Math.sin(angle * 2.0 + time * 0.00052 + variant * 1.4);
    const waveB = Math.cos(angle * 3.0 - time * 0.00038 + variant * 2.1);
    const waveC = Math.sin(angle * 5.0 + time * 0.00078 + highs * 2.2);
    const audioPush = bass * 0.13 + mids * waveA * 0.065 + highs * waveC * 0.028;
    const r = radius * (0.47 + waveA * 0.10 + waveB * 0.055 + waveC * 0.018 + audioPush);
    const squash = 0.68 + Math.sin(time * 0.00016 + variant) * 0.055;
    points.push({
      x: cx + Math.cos(angle) * r * (1.05 + mids * 0.05),
      y: cy + Math.sin(angle) * r * squash + lift + Math.cos(angle * 1.4 + time * 0.00029) * radius * 0.055,
    });
  }

  return points;
}

function drawLiquidMembrane(ctx, cx, cy, radius, time, bass, mids, highs, intensity) {
  const main = liquidMembranePoints(cx, cy, radius, time, bass, mids, highs, 0);
  const secondary = liquidMembranePoints(cx, cy + radius * 0.03, radius * 0.82, time + 2200, bass * 0.7, mids, highs, 1);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  let fill = ctx.createRadialGradient(cx - radius * 0.18, cy - radius * 0.2, radius * 0.04, cx, cy, radius * 0.78);
  fill.addColorStop(0, `rgba(255, 242, 255, ${0.13 * intensity + highs * 0.08})`);
  fill.addColorStop(0.28, `rgba(255, 99, 226, ${0.22 * intensity + mids * 0.08})`);
  fill.addColorStop(0.62, `rgba(72, 224, 255, ${0.16 * intensity + bass * 0.04})`);
  fill.addColorStop(1, `rgba(32, 65, 255, ${0.02 * intensity})`);

  buildClosedOrganicPath(ctx, main);
  ctx.shadowBlur = 80 + bass * 90;
  ctx.shadowColor = `rgba(80, 220, 255, ${0.24 * intensity})`;
  ctx.fillStyle = fill;
  ctx.fill();

  buildClosedOrganicPath(ctx, secondary);
  ctx.shadowBlur = 54 + highs * 72;
  ctx.shadowColor = `rgba(255, 115, 230, ${0.18 * intensity})`;
  ctx.fillStyle = `rgba(255, 105, 230, ${0.045 * intensity + mids * 0.026})`;
  ctx.fill();

  // luminous elastic seams moving across the membrane
  [0.08, 0.37, 0.68].forEach((offset, index) => {
    ctx.beginPath();
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = (t * 1.28 + offset + time * (0.000035 + index * 0.000012)) * Math.PI * 2;
      const r = radius * (0.18 + t * 0.44 + Math.sin(t * Math.PI * 3 + time * 0.0007) * 0.055);
      const x = cx + Math.cos(angle) * r * (1.0 + mids * 0.08);
      const y = cy + Math.sin(angle) * r * 0.58 + Math.sin(t * Math.PI * 2 + time * 0.00042) * radius * 0.12;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 1.4 + highs * 3.0 + index * 0.45;
    ctx.shadowBlur = 30 + highs * 70;
    ctx.shadowColor = index === 1 ? `rgba(255, 165, 245, ${0.32 + highs * 0.24})` : `rgba(90, 235, 255, ${0.28 + highs * 0.22})`;
    ctx.strokeStyle = index === 1 ? `rgba(255, 190, 245, ${0.14 * intensity + highs * 0.08})` : `rgba(150, 245, 255, ${0.12 * intensity + highs * 0.08})`;
    ctx.stroke();
  });

  // bright moving points that feel like light turning within the liquid
  const sparkCount = 5 + Math.floor(highs * 8);
  for (let i = 0; i < sparkCount; i++) {
    const t = (i / sparkCount + time * (0.000045 + i * 0.000003)) % 1;
    const angle = t * Math.PI * 2 + Math.sin(time * 0.00025 + i) * 0.7;
    const r = radius * (0.18 + 0.34 * (Math.sin(time * 0.00037 + i * 1.7) * 0.5 + 0.5));
    const x = cx + Math.cos(angle) * r * 0.95;
    const y = cy + Math.sin(angle) * r * 0.58;
    const pulse = Math.sin(time * 0.004 + i * 2.1) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.shadowBlur = 24 + pulse * 54 + highs * 80;
    ctx.shadowColor = i % 2 ? `rgba(255, 190, 250, ${0.35 + highs * 0.35})` : `rgba(130, 245, 255, ${0.35 + highs * 0.35})`;
    ctx.fillStyle = `rgba(250, 255, 255, ${(0.05 + pulse * 0.13 + highs * 0.13) * intensity})`;
    ctx.arc(x, y, 1.0 + pulse * 2.1 + highs * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawLivingLiquidSphere(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  const cx = width * 0.5;
  const cy = height * 0.51;
  const base = Math.min(width, height);
  const radius = base * (0.315 + bass * 0.035) * Math.max(0.72, intensity);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // large blue aura behind the glass sphere
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius * 1.75);
  aura.addColorStop(0, `rgba(68, 190, 255, ${0.13 * intensity + bass * 0.03})`);
  aura.addColorStop(0.45, `rgba(31, 89, 255, ${0.075 * intensity})`);
  aura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // transparent orb body
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const sphere = ctx.createRadialGradient(cx - radius * 0.28, cy - radius * 0.34, radius * 0.08, cx, cy, radius * 1.02);
  sphere.addColorStop(0, `rgba(210, 245, 255, ${0.09 * intensity})`);
  sphere.addColorStop(0.42, `rgba(60, 170, 255, ${0.055 * intensity})`);
  sphere.addColorStop(0.82, `rgba(12, 55, 160, ${0.035 * intensity})`);
  sphere.addColorStop(1, `rgba(8, 18, 70, ${0.01 * intensity})`);
  ctx.fillStyle = sphere;
  ctx.fill();

  // clip all internal liquid motion inside the sphere
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.985, 0, Math.PI * 2);
  ctx.clip();

  drawLiquidMembrane(ctx, cx, cy, radius, time, bass, mids, highs, intensity);

  // fine shimmering interior dust, very subtle
  for (let i = 0; i < 95; i++) {
    const seed = i * 12.9898;
    const a = (Math.sin(seed) * 43758.5453) % 1;
    const b = (Math.sin(seed + 7.1) * 24634.6345) % 1;
    const angle = (a * Math.PI * 2 + time * 0.000045) % (Math.PI * 2);
    const rr = Math.sqrt(Math.abs(b)) * radius * 0.83;
    const x = cx + Math.cos(angle) * rr;
    const y = cy + Math.sin(angle) * rr * 0.82;
    const flicker = Math.sin(time * 0.002 + i) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.shadowBlur = 8 + highs * 18;
    ctx.shadowColor = `rgba(140, 230, 255, ${0.12 + flicker * 0.12})`;
    ctx.fillStyle = `rgba(180, 245, 255, ${(0.012 + flicker * 0.025 + highs * 0.025) * intensity})`;
    ctx.arc(x, y, 0.35 + flicker * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // crescent/rim highlight, so it reads like a glass orb and not a flat blob
  const rimShift = Math.sin(time * 0.00024) * 0.36;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.005, Math.PI * (0.58 + rimShift * 0.1), Math.PI * (1.55 + rimShift * 0.12));
  ctx.lineWidth = 2.2 + bass * 3.0;
  ctx.shadowBlur = 34 + highs * 45;
  ctx.shadowColor = `rgba(75, 230, 255, ${0.36 * intensity})`;
  ctx.strokeStyle = `rgba(105, 235, 255, ${0.20 * intensity + highs * 0.08})`;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.99, Math.PI * (1.1 + rimShift * 0.08), Math.PI * (1.92 + rimShift * 0.12));
  ctx.lineWidth = 1.2 + highs * 1.6;
  ctx.shadowBlur = 24 + highs * 52;
  ctx.shadowColor = `rgba(255, 170, 245, ${0.28 * intensity})`;
  ctx.strokeStyle = `rgba(255, 178, 245, ${0.10 * intensity + highs * 0.06})`;
  ctx.stroke();

  ctx.restore();
}

function drawAtmosphericOrbitals(ctx, width, height, time, bass, mids, highs, intensity) {
  const cx = width * 0.5;
  const cy = height * 0.51;
  const radius = Math.min(width, height) * 0.36;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    const segments = 140;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const angle = t * Math.PI * 2 + time * (0.000045 + i * 0.000012) + i * 1.9;
      const r = radius * (1.04 + Math.sin(t * Math.PI * 4 + time * 0.00033 + i) * 0.05);
      const x = cx + Math.cos(angle) * r * (1.24 - i * 0.14);
      const y = cy + Math.sin(angle + Math.sin(time * 0.0001 + i)) * r * (0.42 + i * 0.08);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 1.2 + i * 1.1 + bass * 2.0;
    ctx.shadowBlur = 18 + highs * 24;
    ctx.shadowColor = i === 1 ? `rgba(255, 130, 235, ${0.16 * intensity})` : `rgba(90, 220, 255, ${0.16 * intensity})`;
    ctx.strokeStyle = i === 1 ? `rgba(255, 140, 235, ${0.025 * intensity})` : `rgba(105, 225, 255, ${0.035 * intensity})`;
    ctx.stroke();
  });
  ctx.restore();
}

function ribbonPoint(width, height, base, time, stream, t, layerIndex, bass, mids, highs) {
  const cx = width * (0.5 + Math.sin(time * 0.000018 + stream.phase) * 0.025);
  const cy = height * (0.52 + Math.cos(time * 0.000016 + stream.phase) * 0.018);

  const flow = time * stream.speed + stream.phase;
  const sweep = (t - 0.5) * Math.PI * (1.08 + stream.length);
  const directionalDrift = (t - 0.5) * width * stream.direction;
  const midBend =
    Math.sin(t * Math.PI * 2.2 + flow * 1.8) * base * mids * (0.055 + stream.bend);
  const highRipple =
    Math.sin(t * Math.PI * 18 + flow * 5.5) * base * highs * 0.006;

  const x =
    cx +
    Math.cos(sweep + flow + midBend / base) *
      base *
      (stream.xRadius + bass * 0.055) +
    directionalDrift +
    Math.sin(flow * 0.55 + t * Math.PI) * base * 0.08;

  const y =
    cy +
    Math.sin(sweep * stream.ySkew + flow * 0.62) *
      base *
      (stream.yRadius + bass * 0.04) +
    midBend +
    highRipple +
    Math.sin(t * Math.PI * 1.4 + flow) * base * stream.lift;

  return { x, y };
}

function strokeLiquidRibbon(ctx, points, color, width, alpha, blur, intensity, energy) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const drawPath = () => {
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else {
        const previous = points[index - 1];
        const midX = (previous.x + point.x) / 2;
        const midY = (previous.y + point.y) / 2;
        ctx.quadraticCurveTo(previous.x, previous.y, midX, midY);
      }
    });
  };

  drawPath();
  ctx.lineWidth = width * 2.55;
  ctx.shadowBlur = blur * (1.2 + energy);
  ctx.shadowColor = `${color} ${0.22 + energy * 0.18})`;
  ctx.strokeStyle = `${color} ${alpha * 0.22 * intensity})`;
  ctx.stroke();

  drawPath();
  ctx.lineWidth = width;
  ctx.shadowBlur = blur * (0.75 + energy * 0.65);
  ctx.shadowColor = `${color} ${0.34 + energy * 0.28})`;
  ctx.strokeStyle = `${color} ${alpha * intensity})`;
  ctx.stroke();

  drawPath();
  ctx.lineWidth = Math.max(1.2, width * 0.13);
  ctx.shadowBlur = blur * 0.36;
  ctx.shadowColor = `rgba(240, 255, 255, ${0.36 + energy * 0.26})`;
  ctx.strokeStyle = `rgba(245, 255, 255, ${alpha * 0.55 * intensity})`;
  ctx.stroke();
}

function drawSplineRibbonSystem(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const base = Math.min(width, height);
  const colors = [
    "rgba(74, 235, 255,",
    "rgba(255, 92, 226,",
    "rgba(255, 218, 130,",
    "rgba(130, 145, 255,"
  ];

  const streams = [
    { phase: 0.2, speed: 0.000050, xRadius: 0.76, yRadius: 0.26, ySkew: 0.78, direction: 0.42, length: 1.1, bend: 0.026, lift: -0.055 },
    { phase: 1.8, speed: 0.000043, xRadius: 0.68, yRadius: 0.33, ySkew: 0.72, direction: -0.34, length: 1.0, bend: 0.035, lift: 0.025 },
    { phase: 3.2, speed: 0.000060, xRadius: 0.58, yRadius: 0.22, ySkew: 0.86, direction: 0.28, length: 0.92, bend: 0.043, lift: -0.015 },
    { phase: 4.5, speed: 0.000052, xRadius: 0.48, yRadius: 0.30, ySkew: 0.68, direction: -0.24, length: 0.84, bend: 0.04, lift: 0.05 },
  ];

  const layers = [
    { offset: 0.0, width: 76, alpha: 0.072, blur: 86, pointCount: 86, colorShift: 0 },
    { offset: 0.9, width: 42, alpha: 0.13, blur: 58, pointCount: 92, colorShift: 1 },
    { offset: 1.7, width: 16, alpha: 0.20, blur: 34, pointCount: 78, colorShift: 2 },
  ];

  const energy = Math.min(1, bass * 0.72 + mids * 0.78 + highs * 0.95);

  layers.forEach((layer, layerIndex) => {
    streams.forEach((stream, streamIndex) => {
      const shiftedStream = { ...stream, phase: stream.phase + layer.offset + streamIndex * 0.08 };
      const color = colors[(streamIndex + layer.colorShift) % colors.length];
      const points = [];

      for (let i = 0; i <= layer.pointCount; i++) {
        const t = i / layer.pointCount;
        points.push(
          ribbonPoint(
            width,
            height,
            base,
            time,
            shiftedStream,
            t,
            layerIndex,
            bass,
            mids,
            highs
          )
        );
      }

      const audioWidth = 1 + bass * (0.42 + layerIndex * 0.14) + highs * 0.08;
      strokeLiquidRibbon(
        ctx,
        points,
        color,
        layer.width * audioWidth * Math.max(0.45, intensity),
        layer.alpha + energy * (0.025 + layerIndex * 0.018),
        layer.blur,
        intensity,
        energy
      );

      if (layerIndex === 2 && highs > 0.075) {
        for (let spark = 0; spark < 3; spark++) {
          const sparkT =
            (spark * 0.31 + streamIndex * 0.17 + time * 0.00016 + shiftedStream.phase * 0.03) % 1;
          const point = ribbonPoint(
            width,
            height,
            base,
            time,
            shiftedStream,
            sparkT,
            layerIndex,
            bass,
            mids,
            highs
          );

          ctx.beginPath();
          ctx.shadowBlur = 18 + highs * 54;
          ctx.shadowColor = `rgba(235, 255, 255, ${0.45 + highs * 0.38})`;
          ctx.fillStyle = `rgba(235, 255, 255, ${(0.035 + highs * 0.25) * intensity})`;
          ctx.arc(point.x, point.y, 0.65 + highs * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  });

  ctx.restore();
}


// -----------------------------------------------------------------------------
// Phase 2.5 — Liquid Orb / Plasma Membrane Engine
// These override the earlier line/ribbon behavior with a softer living glass sphere.
// The visual language is now: transparent orb, morphing inner plasma, traveling
// highlights, subtle dust, and faint geometry underneath.
// -----------------------------------------------------------------------------
function organicBlobPoints(cx, cy, radius, time, bass, mids, highs, variant = 0, count = 96) {
  const points = [];
  const rotation = time * (0.00009 + variant * 0.000018) + variant * 1.734;
  const breathe = 1 + bass * 0.12 + Math.sin(time * 0.00032 + variant) * 0.035;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const a = t * Math.PI * 2 + rotation;
    const wave1 = Math.sin(a * 1.0 + time * 0.00042 + variant * 2.1);
    const wave2 = Math.cos(a * 2.0 - time * 0.00033 + variant * 1.4);
    const wave3 = Math.sin(a * 3.0 + time * 0.00057 + mids * 1.9 + variant);
    const edgeTremor = Math.sin(a * 7.0 + time * 0.0011 + highs * 2.4) * highs * 0.018;
    const r = radius * breathe * (0.68 + wave1 * 0.12 + wave2 * 0.085 + wave3 * 0.05 + edgeTremor);
    const squash = 0.58 + Math.sin(time * 0.00018 + variant) * 0.075;
    points.push({
      x: cx + Math.cos(a) * r * (0.92 + mids * 0.05),
      y: cy + Math.sin(a) * r * squash + Math.cos(a * 1.7 + time * 0.00025) * radius * 0.08,
    });
  }

  return points;
}

function drawOrganicBlob(ctx, points, fillStyle, shadowColor, shadowBlur = 60) {
  buildClosedOrganicPath(ctx, points);
  ctx.shadowBlur = shadowBlur;
  ctx.shadowColor = shadowColor;
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawMovingGlint(ctx, cx, cy, radius, time, highs, intensity, phase, color = "cyan") {
  const t = (time * (0.000055 + phase * 0.000006) + phase) % 1;
  const angle = t * Math.PI * 2 + Math.sin(time * 0.00025 + phase) * 0.55;
  const r = radius * (0.42 + Math.sin(time * 0.00031 + phase * 4.2) * 0.18);
  const x = cx + Math.cos(angle) * r;
  const y = cy + Math.sin(angle) * r * 0.62;
  const pulse = Math.sin(time * 0.0042 + phase * 9.0) * 0.5 + 0.5;
  const alpha = (0.045 + pulse * 0.12 + highs * 0.22) * intensity;
  const glow = color === "pink" ? "rgba(255, 170, 245," : "rgba(120, 245, 255,";

  const g = ctx.createRadialGradient(x, y, 0, x, y, radius * (0.045 + highs * 0.028));
  g.addColorStop(0, `rgba(255,255,255, ${Math.min(0.62, alpha * 2.6)})`);
  g.addColorStop(0.22, `${glow} ${Math.min(0.36, alpha * 1.8)})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.shadowBlur = 40 + highs * 95;
  ctx.shadowColor = `${glow} ${0.25 + highs * 0.38})`;
  ctx.fillStyle = g;
  ctx.arc(x, y, radius * (0.052 + highs * 0.04), 0, Math.PI * 2);
  ctx.fill();
}

function drawMembraneCaustics(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const cx = width * (0.5 + Math.sin(time * 0.000035) * 0.012);
  const cy = height * (0.51 + Math.cos(time * 0.000031) * 0.01);
  const base = Math.min(width, height);
  const radius = base * (0.39 + bass * 0.025) * Math.max(0.72, intensity);

  // Broad blue pressure field behind the sphere — soft, not line-based.
  const field = ctx.createRadialGradient(cx, cy, radius * 0.12, cx, cy, radius * 2.05);
  field.addColorStop(0, `rgba(50, 180, 255, ${0.10 * intensity + bass * 0.025})`);
  field.addColorStop(0.42, `rgba(25, 75, 210, ${0.065 * intensity})`);
  field.addColorStop(0.74, `rgba(8, 20, 80, ${0.04 * intensity})`);
  field.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = field;
  ctx.fillRect(0, 0, width, height);

  // A few huge transparent water shadows that drift beneath the orb.
  for (let i = 0; i < 4; i++) {
    const px = cx + Math.sin(time * (0.000035 + i * 0.00001) + i * 1.9) * radius * 0.55;
    const py = cy + Math.cos(time * (0.000028 + i * 0.000012) + i * 2.4) * radius * 0.36;
    const rg = ctx.createRadialGradient(px, py, 0, px, py, radius * (0.58 + i * 0.10));
    rg.addColorStop(0, i % 2 ? `rgba(255, 112, 230, ${0.028 * intensity + mids * 0.012})` : `rgba(64, 220, 255, ${0.032 * intensity + highs * 0.012})`);
    rg.addColorStop(0.55, i % 2 ? `rgba(120, 80, 255, ${0.014 * intensity})` : `rgba(40, 110, 255, ${0.018 * intensity})`);
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(px, py, radius * (0.74 + i * 0.08), radius * (0.30 + i * 0.04), time * 0.00005 + i, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawLivingLiquidSphere(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  const cx = width * (0.5 + Math.sin(time * 0.000028) * 0.008);
  const cy = height * (0.505 + Math.cos(time * 0.000024) * 0.007);
  const base = Math.min(width, height);
  const radius = base * (0.365 + bass * 0.035) * Math.max(0.72, intensity);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // Deep blue halo, like light passing through water.
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.18, cx, cy, radius * 1.85);
  aura.addColorStop(0, `rgba(56, 185, 255, ${0.18 * intensity + bass * 0.04})`);
  aura.addColorStop(0.38, `rgba(26, 82, 255, ${0.10 * intensity})`);
  aura.addColorStop(0.72, `rgba(6, 20, 95, ${0.06 * intensity})`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Glass orb body.
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const glass = ctx.createRadialGradient(cx - radius * 0.36, cy - radius * 0.38, radius * 0.08, cx, cy, radius * 1.08);
  glass.addColorStop(0, `rgba(230, 250, 255, ${0.105 * intensity})`);
  glass.addColorStop(0.35, `rgba(72, 190, 255, ${0.070 * intensity})`);
  glass.addColorStop(0.78, `rgba(16, 58, 180, ${0.042 * intensity})`);
  glass.addColorStop(1, `rgba(5, 12, 55, ${0.018 * intensity})`);
  ctx.fillStyle = glass;
  ctx.fill();

  // Clip the orchestra of movement inside the sphere.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.988, 0, Math.PI * 2);
  ctx.clip();

  // Slow blue internal ocean.
  const ocean = ctx.createRadialGradient(cx + radius * 0.18, cy + radius * 0.12, radius * 0.05, cx, cy, radius * 1.05);
  ocean.addColorStop(0, `rgba(36, 210, 255, ${0.085 * intensity + bass * 0.035})`);
  ocean.addColorStop(0.42, `rgba(34, 92, 240, ${0.055 * intensity})`);
  ocean.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ocean;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Main pink/cyan liquid petals — filled shapes, not lines.
  const petalA = organicBlobPoints(cx + Math.sin(time * 0.00019) * radius * 0.12, cy - radius * 0.02, radius * 0.56, time, bass, mids, highs, 0.1);
  const petalFillA = ctx.createRadialGradient(cx - radius * 0.12, cy - radius * 0.22, 0, cx, cy, radius * 0.72);
  petalFillA.addColorStop(0, `rgba(255,255,255, ${0.12 * intensity + highs * 0.06})`);
  petalFillA.addColorStop(0.25, `rgba(255, 127, 236, ${0.28 * intensity + mids * 0.06})`);
  petalFillA.addColorStop(0.62, `rgba(116, 214, 255, ${0.13 * intensity + bass * 0.03})`);
  petalFillA.addColorStop(1, "rgba(255,255,255,0)");
  drawOrganicBlob(ctx, petalA, petalFillA, `rgba(255, 132, 240, ${0.25 * intensity})`, 92 + highs * 80);

  const petalB = organicBlobPoints(cx - radius * 0.08 + Math.cos(time * 0.00014) * radius * 0.10, cy + radius * 0.12, radius * 0.43, time + 3200, bass * 0.8, mids, highs, 1.6);
  const petalFillB = ctx.createRadialGradient(cx + radius * 0.12, cy + radius * 0.18, 0, cx, cy, radius * 0.64);
  petalFillB.addColorStop(0, `rgba(238, 255, 255, ${0.09 * intensity + highs * 0.045})`);
  petalFillB.addColorStop(0.28, `rgba(70, 230, 255, ${0.20 * intensity + bass * 0.04})`);
  petalFillB.addColorStop(0.70, `rgba(255, 104, 226, ${0.075 * intensity + mids * 0.035})`);
  petalFillB.addColorStop(1, "rgba(255,255,255,0)");
  drawOrganicBlob(ctx, petalB, petalFillB, `rgba(80, 225, 255, ${0.22 * intensity})`, 76 + bass * 80);

  // Whispering inner seams: just a few contour arcs to show turning light.
  for (let i = 0; i < 4; i++) {
    const phase = i * 1.57;
    ctx.beginPath();
    const segments = 90;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const a = t * Math.PI * (1.12 + i * 0.08) + time * (0.00016 + i * 0.00002) + phase;
      const rr = radius * (0.20 + t * 0.47 + Math.sin(t * Math.PI * 2.4 + time * 0.00055 + phase) * 0.035);
      const x = cx + Math.cos(a) * rr * (0.82 + mids * 0.08);
      const y = cy + Math.sin(a) * rr * (0.42 + i * 0.035) + Math.cos(time * 0.00021 + phase) * radius * 0.06;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 0.7 + highs * 1.6;
    ctx.shadowBlur = 24 + highs * 60;
    ctx.shadowColor = i % 2 ? `rgba(255, 170, 245, ${0.22 * intensity})` : `rgba(105, 235, 255, ${0.24 * intensity})`;
    ctx.strokeStyle = i % 2 ? `rgba(255, 205, 250, ${0.045 * intensity + highs * 0.045})` : `rgba(170, 250, 255, ${0.052 * intensity + highs * 0.052})`;
    ctx.stroke();
  }

  // Surface micro-texture: tiny liquid dust, weighted toward the lit side.
  for (let i = 0; i < 115; i++) {
    const seed = i * 19.19;
    const aSeed = Math.abs(Math.sin(seed) * 9999) % 1;
    const rSeed = Math.abs(Math.cos(seed * 1.73) * 9999) % 1;
    const a = aSeed * Math.PI * 2 + time * (0.000035 + (i % 5) * 0.000004);
    const rr = Math.sqrt(rSeed) * radius * 0.88;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr * 0.86;
    const lightSide = 0.5 + 0.5 * Math.cos(a - time * 0.00013);
    const flicker = Math.sin(time * 0.0022 + i) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.shadowBlur = 7 + highs * 28;
    ctx.shadowColor = `rgba(155, 235, 255, ${0.10 + flicker * 0.12})`;
    ctx.fillStyle = `rgba(210, 248, 255, ${(0.006 + lightSide * 0.030 + highs * 0.020) * intensity})`;
    ctx.arc(x, y, 0.25 + flicker * 0.72 + highs * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Traveling high-frequency glints.
  drawMovingGlint(ctx, cx, cy, radius, time, highs, intensity, 0.11, "cyan");
  drawMovingGlint(ctx, cx, cy, radius, time, highs, intensity, 0.43, "pink");
  if (highs > 0.12) drawMovingGlint(ctx, cx, cy, radius, time, highs, intensity, 0.72, "cyan");

  ctx.restore();

  // Exterior rim and crescent highlights.
  const rimShift = Math.sin(time * 0.00018 + mids) * 0.45;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.006, Math.PI * (0.56 + rimShift * 0.06), Math.PI * (1.78 + rimShift * 0.08));
  ctx.lineWidth = 2.0 + bass * 2.5;
  ctx.shadowBlur = 40 + highs * 58;
  ctx.shadowColor = `rgba(75, 230, 255, ${0.42 * intensity})`;
  ctx.strokeStyle = `rgba(100, 235, 255, ${0.22 * intensity + highs * 0.07})`;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.992, Math.PI * (1.05 + rimShift * 0.05), Math.PI * (1.96 + rimShift * 0.07));
  ctx.lineWidth = 1.3 + highs * 1.2;
  ctx.shadowBlur = 28 + highs * 52;
  ctx.shadowColor = `rgba(255, 170, 245, ${0.30 * intensity})`;
  ctx.strokeStyle = `rgba(255, 188, 245, ${0.12 * intensity + highs * 0.045})`;
  ctx.stroke();

  // Soft specular source.
  const shineX = cx + radius * (0.26 + Math.sin(time * 0.00011) * 0.05);
  const shineY = cy - radius * (0.32 + Math.cos(time * 0.00009) * 0.04);
  const shine = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, radius * 0.46);
  shine.addColorStop(0, `rgba(255,255,255, ${0.11 * intensity + highs * 0.08})`);
  shine.addColorStop(0.24, `rgba(105, 235, 255, ${0.070 * intensity})`);
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.restore();
}

function drawAtmosphericOrbitals(ctx, width, height, time, bass, mids, highs, intensity) {
  const cx = width * 0.5;
  const cy = height * 0.505;
  const radius = Math.min(width, height) * 0.42;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // Only ghost traces now, so the sphere remains the subject.
  [0, 1].forEach((i) => {
    ctx.beginPath();
    const segments = 120;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const angle = t * Math.PI * 2 + time * (0.000025 + i * 0.000008) + i * 2.4;
      const r = radius * (1.02 + Math.sin(t * Math.PI * 3.0 + time * 0.00025 + i) * 0.025);
      const x = cx + Math.cos(angle) * r * (1.20 - i * 0.10);
      const y = cy + Math.sin(angle + Math.sin(time * 0.00008 + i)) * r * (0.36 + i * 0.08);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 0.8 + i * 0.7 + bass * 0.9;
    ctx.shadowBlur = 16 + highs * 22;
    ctx.shadowColor = i === 1 ? `rgba(255, 130, 235, ${0.10 * intensity})` : `rgba(90, 220, 255, ${0.12 * intensity})`;
    ctx.strokeStyle = i === 1 ? `rgba(255, 140, 235, ${0.012 * intensity})` : `rgba(105, 225, 255, ${0.018 * intensity})`;
    ctx.stroke();
  });

  ctx.restore();
}

function drawBassRipples(ctx, cx, cy, radius, mood, time, bass, intensity) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "screen";
  const strength = Math.min(1, bass * 1.25);

  for (let i = 0; i < 3; i++) {
    const phase = (time * 0.00018 + i * 0.22) % 1;
    const rippleRadius = radius * (2.8 + phase * 4.6 + strength * 0.5);
    const alpha = Math.max(0.006, (1 - phase) * strength * 0.06 * intensity);
    ctx.beginPath();
    ctx.lineWidth = 0.75 + strength * 0.45;
    ctx.shadowBlur = 28 + strength * 34;
    ctx.shadowColor = `rgba(80, 220, 255, ${alpha * 2.2})`;
    ctx.strokeStyle = `rgba(110, 235, 255, ${alpha})`;
    ctx.arc(0, 0, rippleRadius, 0, Math.PI * 2);
    ctx.stroke();
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
    moods[embedParams.mood] ? embedParams.mood : "celestial"
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
  const [geometryStrength, setGeometryStrength] = useState(0.18);
  const [particleStrength, setParticleStrength] = useState(0.06);
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

      particlesRef.current = createParticles(18, rect.width, rect.height);
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
if (plasmaStrength > 0.01) {
  drawPlasmaField(
    ctx,
    width,
    height,
    mood,
    time,
    softBass,
    softMids,
    softHighs,
    intensity * plasmaStrength
  );
}

if (orbStrength > 0.01 || causticStrength > 0.01) {
  drawMembraneCaustics(
    ctx,
    width,
    height,
    mood,
    time,
    softBass * orbStrength,
    softMids * orbStrength,
    softHighs * causticStrength,
    intensity * Math.max(orbStrength, causticStrength)
  );
}

// Phase 2.4 core: living liquid sphere.
// The engine now favors one orchestral glass/liquid form instead of many independent lines.
if (lightFlowStrength > 0.01) {
  drawAtmosphericOrbitals(
    ctx,
    width,
    height,
    time,
    softBass,
    softMids,
    softHighs,
    intensity * lightFlowStrength
  );

  drawLivingLiquidSphere(
    ctx,
    width,
    height,
    mood,
    time,
    softBass,
    softMids,
    softHighs,
    intensity * lightFlowStrength
  );
}

const musicWarmth = (softHighs * 0.035 + softBass * 0.022) * lightFlowStrength;
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
          intensity * particleStrength
        );
      }

      const baseRadius = Math.min(width, height) * 0.088 * geometrySize;

      const breathingScale =
        1 + softBass * 0.095 * intensity + Math.sin(time * 0.00055) * 0.012;

      const opacity = 0.22 + softMids * 0.28 + intensity * 0.18;

      const drift = {
        x: Math.sin(time * 0.00011) * width * 0.018,
        y: Math.cos(time * 0.00009) * height * 0.014,
      };

drawBassRipples(
  ctx,
  width / 2,
  height / 2,
  baseRadius,
  mood,
  time,
  softBass,
  intensity * lightFlowStrength
);
      
      drawLivingGeometry(
  ctx,
  width / 2,
  height / 2,
  baseRadius,
  mood,
  time,
  softBass,
  softMids,
  softHighs,
  intensity * geometryStrength
);
      drawFlowerOfLife(
        ctx,
        width / 2,
        height / 2,
        baseRadius,
        3,
        mood,
        opacity * geometryStrength,
        (glowAmount + softHighs * 0.45) * geometryStrength,
        breathingScale,
        drift
      );

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

      halo.addColorStop(0, `${mood.glow} ${0.032 + softBass * 0.035})`);
      halo.addColorStop(0.55, `${mood.glow} ${0.018 + softHighs * 0.022})`);
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
