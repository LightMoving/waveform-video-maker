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
      ? Math.max(0.035, twinkle * 0.38)
      : Math.max(0.06, twinkle * 0.82);

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


// Phase 2.13 — Liquid Light / Trapcode-inspired internal plasma.
// This does not change the protected orbital/ring/node system. It only adds
// a living internal fluid layer that folds, breathes, and glows with the music.
function drawLiquidTrapcodeBlobPath(ctx, cx, cy, radius, time, bass, mids, highs, variant, count = 160) {
  const rot = time * (0.0001 + variant * 0.000018) + variant * 1.618;
  const driftX = Math.sin(time * (0.00013 + variant * 0.00001) + variant) * radius * (0.10 + mids * 0.08);
  const driftY = Math.cos(time * (0.00011 + variant * 0.000012) + variant * 1.7) * radius * (0.08 + bass * 0.06);

  ctx.beginPath();
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const a = t * Math.PI * 2 + rot;
    const flowA = Math.sin(a * 1.65 + time * 0.00043 + variant * 2.1);
    const flowB = Math.cos(a * 2.8 - time * 0.00034 + variant * 3.2);
    const flowC = Math.sin(a * 4.7 + time * 0.00062 + highs * 2.8 + variant);
    const fold = Math.sin(a - time * 0.00021 + mids * 1.6 + variant) * Math.cos(a * 2.0 + time * 0.00018);
    const breathing = 1 + bass * 0.18 + mids * flowA * 0.075 + highs * flowC * 0.025;
    const r = radius * (0.52 + flowA * 0.16 + flowB * 0.105 + flowC * 0.055 + fold * 0.045) * breathing;
    const squash = 0.56 + Math.sin(time * 0.00017 + variant) * 0.11;
    const x = cx + driftX + Math.cos(a) * r * (1.02 + mids * 0.06);
    const y = cy + driftY + Math.sin(a) * r * squash + Math.cos(a * 1.35 + time * 0.00031) * radius * 0.09;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawLiquidTrapcodeVein(ctx, cx, cy, radius, time, bass, mids, highs, intensity, seed, color, alpha, widthScale) {
  ctx.beginPath();
  const segments = 150;
  const phase = seed * 2.731;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const spiral = t * Math.PI * (1.25 + seed * 0.22) + phase + time * (0.000055 + seed * 0.000006);
    const fold = Math.sin(t * Math.PI * 4.0 + time * 0.00045 + phase) * (0.055 + mids * 0.06);
    const rr = radius * (0.10 + t * (0.62 + bass * 0.06) + fold);
    const x = cx + Math.cos(spiral + Math.sin(time * 0.0002 + seed) * 0.6) * rr * (0.88 + mids * 0.08);
    const y = cy + Math.sin(spiral * 0.92) * rr * 0.58 + Math.sin(t * Math.PI * 2 + time * 0.00032 + seed) * radius * 0.13;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = (1.25 + highs * 2.4) * widthScale;
  ctx.shadowBlur = 24 + highs * 62;
  ctx.shadowColor = `rgba(${color}, ${0.22 + highs * 0.24})`;
  ctx.strokeStyle = `rgba(${color}, ${(alpha + highs * 0.035) * intensity})`;
  ctx.stroke();
}

function drawLiquidLightTrapcodeSphere(ctx, width, height, time, bass, mids, highs, intensity) {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const base = Math.min(width, height);
  const radius = base * (0.35 + bass * 0.035) * Math.max(0.86, intensity * 0.96);
  const energy = Math.min(1, bass * 0.45 + mids * 0.55 + highs * 0.75);

  const makeSheetPath = (variant, scale = 1, yScale = 0.68, points = 220) => {
    ctx.beginPath();
    const phase = variant * 2.731;
    const driftX = Math.sin(time * (0.00010 + variant * 0.000012) + phase) * radius * (0.09 + mids * 0.06);
    const driftY = Math.cos(time * (0.000085 + variant * 0.00001) + phase) * radius * (0.055 + bass * 0.04);

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const a = t * Math.PI * 2;
      const flow1 = Math.sin(a * 1.15 + time * 0.00042 + phase);
      const flow2 = Math.cos(a * 2.25 - time * 0.00031 + phase * 1.7);
      const flow3 = Math.sin(a * 3.7 + time * 0.00052 + variant * 4.1 + mids * 1.8);
      const fold = Math.sin(a + flow1 * 0.85 + time * 0.00022 + variant) * Math.cos(a * 2.0 - time * 0.00016);
      const breathe = 1 + bass * 0.18 + mids * 0.07 * flow2 + highs * 0.025 * flow3;
      const r = radius * scale * (0.46 + flow1 * 0.13 + flow2 * 0.09 + flow3 * 0.055 + fold * 0.075) * breathe;
      const swirl = Math.sin(time * 0.00018 + variant) * 0.28 + mids * 0.18;
      const x = cx + driftX + Math.cos(a + swirl * flow2) * r * (1.02 + mids * 0.06);
      const y = cy + driftY + Math.sin(a + swirl * flow1) * r * yScale + Math.cos(a * 1.42 + time * 0.00027 + phase) * radius * 0.075;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const fillSheet = (variant, scale, yScale, gradientStops, alpha, blur = 0) => {
    ctx.save();
    if (blur) ctx.filter = `blur(${blur}px)`;
    makeSheetPath(variant, scale, yScale);
    const gx = cx + Math.sin(time * 0.00013 + variant) * radius * 0.18;
    const gy = cy + Math.cos(time * 0.00011 + variant * 2) * radius * 0.12;
    const g = ctx.createRadialGradient(gx - radius * 0.22, gy - radius * 0.10, radius * 0.03, gx, gy, radius * 0.9);
    gradientStops.forEach(([stop, color]) => g.addColorStop(stop, color));
    ctx.globalCompositeOperation = "screen";
    ctx.shadowBlur = 58 + energy * 96;
    ctx.shadowColor = gradientStops[1]?.[1] || "rgba(80,220,255,0.25)";
    ctx.globalAlpha = alpha * intensity;
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  };

  const drawSilkVein = (variant, color, alpha, widthScale = 1) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const phase = variant * 3.91;
    const segments = 180;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const fade = Math.sin(t * Math.PI);
      const a = phase + time * (0.00012 + variant * 0.000006) + (t - 0.5) * Math.PI * (1.55 + variant * 0.18);
      const curl = Math.sin(t * Math.PI * 3.0 + time * 0.00042 + phase) * (0.22 + mids * 0.22);
      const rr = radius * (0.16 + t * 0.64 + Math.sin(t * Math.PI * 5.0 + time * 0.00030 + phase) * 0.04);
      const x = cx + Math.cos(a + curl) * rr * (0.93 + mids * 0.08);
      const y = cy + Math.sin(a * 0.88 + curl * 0.35) * rr * 0.64 + Math.sin(time * 0.00017 + variant) * radius * 0.08;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      if (i === Math.floor(segments * 0.58) && highs > 0.18) {
        ctx.save();
        ctx.beginPath();
        ctx.shadowBlur = 42 + highs * 72;
        ctx.shadowColor = `rgba(${color}, ${0.32 + highs * 0.38})`;
        ctx.fillStyle = `rgba(255,255,255, ${(0.08 + highs * 0.18) * intensity * fade})`;
        ctx.arc(x, y, 1.2 + highs * 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.lineWidth = (0.9 + highs * 1.6) * widthScale;
    ctx.shadowBlur = 18 + highs * 55;
    ctx.shadowColor = `rgba(${color}, ${0.18 + highs * 0.28})`;
    ctx.strokeStyle = `rgba(${color}, ${(alpha + highs * 0.035) * intensity})`;
    ctx.stroke();
    ctx.restore();
  };

  ctx.save();

  // Deep atmosphere behind the sphere.
  ctx.globalCompositeOperation = "screen";
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius * 2.05);
  aura.addColorStop(0, `rgba(48, 175, 255, ${0.055 * intensity + bass * 0.022})`);
  aura.addColorStop(0.42, `rgba(12, 75, 210, ${0.060 * intensity})`);
  aura.addColorStop(0.72, `rgba(95, 35, 180, ${0.024 * intensity + mids * 0.010})`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Glass membrane base.
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const glass = ctx.createRadialGradient(cx - radius * 0.34, cy - radius * 0.36, radius * 0.05, cx, cy, radius * 1.12);
  glass.addColorStop(0, `rgba(205, 250, 255, ${0.040 * intensity + highs * 0.01})`);
  glass.addColorStop(0.34, `rgba(38, 155, 255, ${0.045 * intensity})`);
  glass.addColorStop(0.68, `rgba(7, 36, 125, ${0.075 * intensity})`);
  glass.addColorStop(1, `rgba(0, 5, 30, ${0.20 * intensity})`);
  ctx.fillStyle = glass;
  ctx.fill();

  // Clip all liquid inside orb.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.982, 0, Math.PI * 2);
  ctx.clip();

  // Volumetric dark pockets make the currents feel like layers inside glass.
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 6; i++) {
    const a = time * (0.00008 + i * 0.00001) + i * 1.57;
    const px = cx + Math.cos(a) * radius * (0.18 + (i % 3) * 0.13);
    const py = cy + Math.sin(a * 0.84) * radius * (0.10 + (i % 2) * 0.16);
    const pr = radius * (0.19 + (i % 4) * 0.04 + Math.sin(time * 0.00024 + i) * 0.018);
    const pocket = ctx.createRadialGradient(px, py, 0, px, py, pr);
    pocket.addColorStop(0, `rgba(0, 2, 20, ${0.26 * intensity})`);
    pocket.addColorStop(0.58, `rgba(0, 8, 42, ${0.11 * intensity})`);
    pocket.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pocket;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Broad liquid sheets, not marker lines.
  fillSheet(0.21, 1.14, 0.62, [
    [0, `rgba(235,255,255,${0.16 + highs * 0.04})`],
    [0.26, `rgba(45,235,255,${0.42 + bass * 0.08})`],
    [0.60, `rgba(22,120,255,${0.25 + mids * 0.05})`],
    [1, "rgba(0,0,0,0)"],
  ], 0.72, 8);

  fillSheet(1.44, 0.98, 0.70, [
    [0, `rgba(255,245,255,${0.15 + highs * 0.06})`],
    [0.28, `rgba(255,80,235,${0.42 + mids * 0.08})`],
    [0.63, `rgba(115,65,255,${0.25})`],
    [1, "rgba(0,0,0,0)"],
  ], 0.66, 9);

  fillSheet(2.64, 0.72, 0.58, [
    [0, `rgba(255,255,220,${0.10 + highs * 0.04})`],
    [0.32, `rgba(255,205,95,${0.24 + highs * 0.05})`],
    [0.72, `rgba(255,90,210,${0.12})`],
    [1, "rgba(0,0,0,0)"],
  ], 0.46, 7);

  // A soft inner bloom where sheets overlap.
  ctx.globalCompositeOperation = "screen";
  const core = ctx.createRadialGradient(cx - radius * 0.08, cy + radius * 0.05, radius * 0.02, cx, cy, radius * 0.68);
  core.addColorStop(0, `rgba(255,255,255,${0.12 * intensity + highs * 0.06})`);
  core.addColorStop(0.22, `rgba(95,235,255,${0.20 * intensity})`);
  core.addColorStop(0.54, `rgba(255,80,230,${0.10 * intensity + mids * 0.025})`);
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Fine bright currents. Very few, silky, not scribbly.
  drawSilkVein(0.18, "185,255,255", 0.12, 1.0);
  drawSilkVein(0.46, "255,160,248", 0.10, 0.95);
  drawSilkVein(0.78, "75,242,255", 0.11, 0.9);
  if (highs > 0.12) drawSilkVein(1.02, "255,220,135", 0.065, 0.75);

  ctx.restore();

  // Glass rim/crescent inside the protected orbital ring.
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  const rimDrift = Math.sin(time * 0.00020) * 0.20 + mids * 0.04;
  [
    { start: 0.54, end: 1.52, color: "82,238,255", alpha: 0.32, w: 2.4 },
    { start: 1.58, end: 2.10, color: "120,245,255", alpha: 0.20, w: 1.25 },
    { start: -0.12, end: 0.20, color: "255,160,250", alpha: 0.13, w: 1.0 },
  ].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (1.005 + bass * 0.012), Math.PI * (r.start + rimDrift), Math.PI * (r.end + rimDrift));
    ctx.lineWidth = r.w + bass * 1.4 + highs * 0.65;
    ctx.shadowBlur = 30 + highs * 58;
    ctx.shadowColor = `rgba(${r.color}, ${0.35 + highs * 0.22})`;
    ctx.strokeStyle = `rgba(${r.color}, ${(r.alpha + highs * 0.07) * intensity})`;
    ctx.stroke();
  });

  // Sparse traveling glints on the membrane and within folds.
  const glintCount = 4 + Math.floor(highs * 5);
  for (let i = 0; i < glintCount; i++) {
    const a = time * (0.00042 + i * 0.000018) + i * 2.13 + mids * 0.7;
    const rr = radius * (i % 3 === 0 ? 0.95 : 0.62 + (i % 4) * 0.08);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a * 0.93) * rr * 0.74;
    const pulse = Math.max(0, Math.sin(time * 0.0052 + i * 1.9));
    const c = i % 3 === 0 ? "120,245,255" : i % 3 === 1 ? "255,165,250" : "255,220,145";
    ctx.beginPath();
    ctx.shadowBlur = 28 + pulse * 70 + highs * 62;
    ctx.shadowColor = `rgba(${c}, ${0.38 + highs * 0.34})`;
    ctx.fillStyle = `rgba(255,255,255, ${(0.055 + pulse * 0.18 + highs * 0.12) * intensity})`;
    ctx.arc(x, y, 0.9 + pulse * 2.8 + highs * 2.2, 0, Math.PI * 2);
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
  const [geometryStrength, setGeometryStrength] = useState(0.18);
  const [particleStrength, setParticleStrength] = useState(0.22);
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
    intensity * plasmaStrength * 0.10
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

if (lightFlowStrength > 0.01) {
  drawLiquidLightTrapcodeSphere(
    ctx,
    width,
    height,
    time,
    softBass,
    softMids,
    softHighs,
    intensity * lightFlowStrength
  );
}

const musicWarmth = (softHighs * 0.08 + softBass * 0.05) * lightFlowStrength;
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
          softHighs * 0.35,
          mood,
          time,
          intensity * particleStrength * 0.12
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
      
      // Keep geometry out of the main plasma presets so the center reads as liquid light, not line art.
      if (activePreset === "sacredGeometry") {
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
          intensity * geometryStrength * 0.22
        );
        drawFlowerOfLife(
          ctx,
          width / 2,
          height / 2,
          baseRadius,
          3,
          mood,
          opacity * geometryStrength * 0.18,
          (glowAmount + softHighs * 0.45) * geometryStrength * 0.20,
          breathingScale,
          drift
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

      halo.addColorStop(0, `${mood.glow} ${0.08 + softBass * 0.07})`);
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
