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
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.6 + Math.random() * 1.8,
    speed: 0.08 + Math.random() * 0.22,
    phase: Math.random() * Math.PI * 2,
    depth: 0.35 + Math.random() * 0.65,
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
    ctx.shadowColor = `${mood.glow} 0.8)`;
    ctx.fillStyle = `${mood.line} ${Math.max(0.08, twinkle)})`;

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


function drawSpectralCaustics(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const base = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const energy = Math.min(1, bass * 0.7 + mids * 0.5 + highs * 0.9);

  for (let band = 0; band < 6; band++) {
    const phase = band * 1.23;
    const color = band % 3 === 0 ? "rgba(75, 220, 255," : band % 3 === 1 ? "rgba(255, 120, 230," : "rgba(255, 215, 145,";

    ctx.beginPath();

    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const angle = t * Math.PI * 2 + time * (0.00008 + band * 0.000012) + phase;
      const wave = Math.sin(t * Math.PI * (3.5 + band * 0.25) + time * 0.0007 + phase);
      const radius = base * (0.18 + band * 0.055 + wave * (0.018 + mids * 0.022));

      const x = cx + Math.cos(angle) * radius + Math.sin(time * 0.00013 + phase) * base * 0.035;
      const y = cy + Math.sin(angle * 0.86) * radius + Math.cos(time * 0.00011 + phase) * base * 0.03;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineWidth = 0.6 + highs * 1.35;
    ctx.shadowBlur = 16 + energy * 35;
    ctx.shadowColor = `${color} ${0.25 + highs * 0.35})`;
    ctx.strokeStyle = `${color} ${0.035 + energy * 0.115 * intensity})`;
    ctx.stroke();
  }

  ctx.restore();
}

function drawLivingLightFlow(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const cx = width / 2;
  const cy = height / 2;
  const base = Math.min(width, height);
  const colors = [
    "rgba(0, 220, 255,",
    "rgba(255, 80, 220,",
    "rgba(255, 210, 120,",
    "rgba(140, 90, 255,"
  ];

  const energy = Math.min(1, bass * 0.75 + mids * 0.75 + highs * 0.95);

  for (let ribbon = 0; ribbon < 8; ribbon++) {
    const color = colors[ribbon % colors.length];
    const phase = ribbon * 1.17;
    const rotation = time * (0.00011 + ribbon * 0.000016) + phase;
    const radius = base * (0.17 + ribbon * 0.033 + bass * 0.04);

    ctx.beginPath();

    for (let i = 0; i <= 170; i++) {
      const t = i / 170;
      const angle =
        t * Math.PI * 2 +
        rotation +
        Math.sin(time * 0.00042 + t * 8 + phase) * (0.28 + mids * 0.42);

      const wave =
        Math.sin(t * Math.PI * 4 + time * 0.001 + phase) *
        base *
        (0.014 + highs * 0.022);

      const x =
        cx +
        Math.cos(angle) * (radius + wave) +
        Math.sin(time * 0.00018 + phase) * base * 0.07;

      const y =
        cy +
        Math.sin(angle * 0.82) * (radius + wave) +
        Math.cos(time * 0.00016 + phase) * base * 0.055;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineWidth = 1.0 + highs * 1.8 + energy * 0.55;
    ctx.shadowBlur = 18 + energy * 38;
    ctx.shadowColor = `${color} ${0.42 + highs * 0.28})`;
    ctx.strokeStyle = `${color} ${0.07 + energy * 0.22 * intensity})`;
    ctx.stroke();
  }

  for (let i = 0; i < 11; i++) {
    const phase = i * 0.73;
    const angle = time * 0.00032 + phase;
    const r = base * (0.18 + (i % 5) * 0.07 + bass * 0.06);
    const x = cx + Math.cos(angle * 1.4) * r;
    const y = cy + Math.sin(angle) * r * 0.82;
    const color = colors[i % colors.length];
    const spark = highs * intensity;

    const g = ctx.createRadialGradient(x, y, 0, x, y, base * (0.015 + spark * 0.035));
    g.addColorStop(0, `${color} ${0.28 + spark * 0.45})`);
    g.addColorStop(0.4, `${color} ${0.10 + spark * 0.20})`);
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, base * (0.014 + spark * 0.03), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawHarmonicArcs(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.globalCompositeOperation = "screen";

  const base = Math.min(width, height);
  const energy = Math.min(1, bass * 0.6 + mids * 0.55 + highs * 0.9);
  const colors = [mood.line, "rgba(255, 120, 230,", "rgba(90, 220, 255,"];

  for (let i = 0; i < 7; i++) {
    const phase = i * 0.74;
    const rotation = time * (0.00006 + i * 0.00001) + phase + mids * 0.22;
    const rx = base * (0.28 + i * 0.045 + bass * 0.035);
    const ry = base * (0.12 + i * 0.022 + highs * 0.025);
    const color = colors[i % colors.length];

    ctx.save();
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 0.08, Math.PI * (1.22 + highs * 0.25));
    ctx.lineWidth = 0.85 + highs * 1.1;
    ctx.shadowBlur = 14 + energy * 34;
    ctx.shadowColor = `${color} ${0.34 + highs * 0.30})`;
    ctx.strokeStyle = `${color} ${0.055 + energy * 0.16 * intensity})`;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawConstellationConnections(ctx, particles, width, height, mood, highs, mids, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const maxDistance = Math.min(width, height) * (0.085 + mids * 0.04);
  const maxConnections = 80;
  let connections = 0;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      if (connections > maxConnections) break;
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        const closeness = 1 - distance / maxDistance;
        const alpha = closeness * (0.025 + highs * 0.09) * intensity;
        ctx.beginPath();
        ctx.lineWidth = 0.45 + highs * 0.55;
        ctx.shadowBlur = 6 + highs * 16;
        ctx.shadowColor = `${mood.glow} ${alpha})`;
        ctx.strokeStyle = `${mood.line} ${alpha})`;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        connections++;
      }
    }
  }

  ctx.restore();
}

function drawBloomVeil(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const cx = width * (0.5 + Math.sin(time * 0.000035) * 0.035);
  const cy = height * (0.5 + Math.cos(time * 0.00003) * 0.028);
  const radius = Math.min(width, height) * (0.36 + bass * 0.08);
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

  bloom.addColorStop(0, `${mood.glow} ${0.045 + highs * 0.035 + bass * 0.025})`);
  bloom.addColorStop(0.35, `${mood.line} ${0.032 + mids * 0.035})`);
  bloom.addColorStop(0.78, `${mood.glow} ${0.012 + bass * 0.018})`);
  bloom.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}


function drawDepthAtmosphere(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const base = Math.min(width, height);
  const layers = [
    { scale: 0.9, alpha: 0.028, speed: 0.000018, offset: 0.0 },
    { scale: 0.62, alpha: 0.035, speed: 0.000032, offset: 1.8 },
    { scale: 0.38, alpha: 0.026, speed: 0.000052, offset: 3.4 },
  ];

  layers.forEach((layer, index) => {
    const x = width * (0.5 + Math.sin(time * layer.speed + layer.offset) * (0.16 - index * 0.035));
    const y = height * (0.52 + Math.cos(time * layer.speed * 0.82 + layer.offset) * (0.11 - index * 0.022));
    const radius = base * (layer.scale + bass * 0.08 + mids * 0.025);
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);

    g.addColorStop(0, `${mood.glow} ${layer.alpha + bass * 0.028 * intensity})`);
    g.addColorStop(0.42, `${mood.line} ${layer.alpha * 0.65 + highs * 0.018})`);
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  });

  ctx.restore();
}

function drawVolumetricBreathingLight(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const cx = width * (0.5 + Math.sin(time * 0.000038) * 0.035);
  const cy = height * (0.5 + Math.cos(time * 0.000031) * 0.03);
  const base = Math.min(width, height);
  const breath = 0.5 + 0.5 * Math.sin(time * 0.00045);
  const radius = base * (0.28 + breath * 0.09 + bass * 0.11 * intensity);

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  core.addColorStop(0, `${mood.glow} ${0.04 + bass * 0.08 + highs * 0.045})`);
  core.addColorStop(0.3, `${mood.line} ${0.035 + mids * 0.05})`);
  core.addColorStop(0.65, `${mood.glow} ${0.014 + breath * 0.018})`);
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 4; i++) {
    const phase = i * 1.43;
    const x = cx + Math.cos(time * 0.00011 + phase) * base * (0.12 + i * 0.035);
    const y = cy + Math.sin(time * 0.00009 + phase) * base * (0.08 + i * 0.026);
    const r = base * (0.12 + i * 0.035 + highs * 0.045);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `${mood.line} ${0.025 + highs * 0.06})`);
    g.addColorStop(0.55, `${mood.glow} ${0.012 + bass * 0.025})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

function drawPulseWaveField(ctx, cx, cy, radius, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "screen";

  const strength = Math.min(1, bass * 1.9 + mids * 0.35);

  for (let i = 0; i < 7; i++) {
    const phase = (time * (0.00018 + i * 0.000015) + i * 0.13) % 1;
    const waveRadius = radius * (1.25 + phase * 5.3 + strength * 0.9);
    const alpha = Math.max(0, (1 - phase) * strength * (0.12 + highs * 0.08) * intensity);

    ctx.beginPath();
    ctx.lineWidth = 0.65 + strength * 1.45;
    ctx.shadowBlur = 18 + strength * 54;
    ctx.shadowColor = `${mood.glow} ${alpha * 1.4})`;
    ctx.strokeStyle = `${mood.line} ${alpha})`;
    ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawRefractionCaustics(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const base = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const colors = ["rgba(100, 230, 255,", "rgba(255, 160, 235,", "rgba(255, 230, 165,"];
  const energy = Math.min(1, bass * 0.45 + mids * 0.65 + highs * 1.0);

  for (let strand = 0; strand < 9; strand++) {
    const phase = strand * 0.91;
    const color = colors[strand % colors.length];

    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      const sweep = t * Math.PI * 2.0;
      const curve = Math.sin(t * Math.PI * (2.2 + strand * 0.08) + time * 0.00075 + phase);
      const angle = sweep + time * (0.000075 + strand * 0.000008) + phase;
      const r = base * (0.16 + strand * 0.028 + curve * (0.012 + mids * 0.018) + bass * 0.028);
      const x = cx + Math.cos(angle) * r + Math.sin(time * 0.00013 + phase) * base * 0.045;
      const y = cy + Math.sin(angle * 0.76) * r + Math.cos(time * 0.00012 + phase) * base * 0.04;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineWidth = 0.42 + highs * 1.2;
    ctx.shadowBlur = 12 + energy * 34;
    ctx.shadowColor = `${color} ${0.20 + energy * 0.32})`;
    ctx.strokeStyle = `${color} ${0.025 + energy * 0.11 * intensity})`;
    ctx.stroke();
  }

  ctx.restore();
}

function drawParallaxDepthParticles(ctx, width, height, mood, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const base = Math.min(width, height);
  const starCount = 34;

  for (let i = 0; i < starCount; i++) {
    const phase = i * 12.9898;
    const depth = (i % 5) / 5;
    const x = width * ((Math.sin(phase) * 43758.5453) % 1) + Math.sin(time * (0.000025 + depth * 0.00004) + phase) * base * (0.012 + depth * 0.026);
    const y = height * ((Math.cos(phase * 0.73) * 24634.6345) % 1) + Math.cos(time * (0.00002 + depth * 0.000035) + phase) * base * (0.01 + depth * 0.022);
    const size = base * (0.0025 + depth * 0.004 + highs * 0.004);
    const alpha = 0.035 + depth * 0.055 + highs * 0.08;

    const g = ctx.createRadialGradient(x, y, 0, x, y, size * 8);
    g.addColorStop(0, `${mood.line} ${alpha * intensity})`);
    g.addColorStop(0.35, `${mood.glow} ${alpha * 0.45})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, size * 6, 0, Math.PI * 2);
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

      drawDepthAtmosphere(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawVolumetricBreathingLight(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawPlasmaField(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawSpectralCaustics(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawRefractionCaustics(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawLivingLightFlow(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      const musicWarmth = softHighs * 0.045 + softBass * 0.035;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `${mood.glow} ${musicWarmth})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      drawParticles(
        ctx,
        particlesRef.current,
        width,
        height,
        softHighs,
        mood,
        time,
        intensity
      );

      drawParallaxDepthParticles(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawConstellationConnections(
        ctx,
        particlesRef.current,
        width,
        height,
        mood,
        softHighs,
        softMids,
        intensity
      );

      const baseRadius = Math.min(width, height) * 0.088 * geometrySize;

      const breathingScale =
        1 + softBass * 0.095 * intensity + Math.sin(time * 0.00055) * 0.012;

      const opacity = 0.28 + softMids * 0.25 + intensity * 0.16;

      const drift = {
        x: Math.sin(time * 0.00011) * width * 0.018,
        y: Math.cos(time * 0.00009) * height * 0.014,
      };

      drawHarmonicArcs(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawPulseWaveField(
        ctx,
        width / 2,
        height / 2,
        baseRadius,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      drawBassRipples(
        ctx,
        width / 2,
        height / 2,
        baseRadius,
        mood,
        time,
        softBass,
        intensity
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
  intensity
);
      drawFlowerOfLife(
        ctx,
        width / 2,
        height / 2,
        baseRadius,
        3,
        mood,
        opacity,
        glowAmount + softHighs * 0.35,
        breathingScale,
        drift
      );

      drawBloomVeil(
        ctx,
        width,
        height,
        mood,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
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

      halo.addColorStop(0, `${mood.glow} ${0.045 + softBass * 0.045})`);
      halo.addColorStop(0.55, `${mood.glow} ${0.022 + softHighs * 0.028})`);
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
      <header className="hero">
        <p className="eyebrow">Prototype 1</p>
        <h1>LightMoving Visual Engine</h1>
        <p className="hero-copy">
          Slow cinematic audio-reactive sacred geometry visualizer.
        </p>
      </header>

      <div className={embedParams.embed ? "engine-layout embed" : "engine-layout"}>
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

            <button className="theater-button" onClick={toggleTheaterMode}>
              {theaterMode ? "Exit Theater Mode" : "Theater Mode"}
            </button>

            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

            <Control label="Intensity" value={intensity} onChange={setIntensity} />
            <Control
              label="Geometry Size"
              value={geometrySize}
              onChange={setGeometrySize}
            />
            <Control label="Glow Amount" value={glowAmount} onChange={setGlowAmount} />
            <Control
              label="Bass Sensitivity"
              value={bassSensitivity}
              onChange={setBassSensitivity}
            />
            <Control
              label="Mid Sensitivity"
              value={midSensitivity}
              onChange={setMidSensitivity}
            />
            <Control
              label="High Sensitivity"
              value={highSensitivity}
              onChange={setHighSensitivity}
            />
            <Control
              label="Motion Smoothness"
              value={smoothness}
              onChange={setSmoothness}
            />

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

            <div className="meters">
              <Meter label="Bass" value={levels.bass} />
              <Meter label="Mids" value={levels.mids} />
              <Meter label="Highs" value={levels.highs} />
            </div>

            <p className="note">
              Bass controls gentle breathing. Mids shape opacity. Highs create
              subtle sparkle and glow.
            </p>
          </aside>
        )}
      </div>
    </main>
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
  max={label.includes("Sensitivity") ? "2" : "1"}
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
