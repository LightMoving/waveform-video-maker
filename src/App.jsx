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


function drawLivingOrbField(ctx, width, height, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const cx = width * (0.5 + Math.sin(time * 0.000055) * 0.018);
  const cy = height * (0.5 + Math.cos(time * 0.00005) * 0.014);
  const base = Math.min(width, height);
  const radius = base * (0.34 + bass * 0.035 * intensity);

  // Soft blue aura behind the orb.
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.12, cx, cy, radius * 1.65);
  aura.addColorStop(0, `rgba(80, 180, 255, ${0.10 + bass * 0.08})`);
  aura.addColorStop(0.44, `rgba(20, 95, 210, ${0.075 + mids * 0.05})`);
  aura.addColorStop(0.78, `rgba(30, 20, 120, ${0.035 + highs * 0.035})`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.7, 0, Math.PI * 2);
  ctx.fill();

  // Orb membrane body.
  const body = ctx.createRadialGradient(
    cx - radius * 0.22,
    cy - radius * 0.24,
    radius * 0.05,
    cx,
    cy,
    radius
  );
  body.addColorStop(0, `rgba(255, 160, 240, ${0.05 + mids * 0.06})`);
  body.addColorStop(0.38, `rgba(60, 170, 255, ${0.09 + bass * 0.07})`);
  body.addColorStop(0.72, `rgba(20, 70, 190, ${0.10 + highs * 0.05})`);
  body.addColorStop(1, "rgba(0, 20, 90, 0.02)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Clip inner light to orb.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.985, 0, Math.PI * 2);
  ctx.clip();

  const flowColors = [
    "rgba(0, 225, 255,",
    "rgba(255, 95, 225,",
    "rgba(255, 210, 135,",
    "rgba(130, 95, 255,",
  ];

  // Living internal ribbons / color-light pitches.
  for (let ribbon = 0; ribbon < 9; ribbon++) {
    const color = flowColors[ribbon % flowColors.length];
    const phase = ribbon * 1.21;
    const speed = time * (0.00019 + ribbon * 0.000013);
    const energy = Math.min(1, bass * 0.55 + mids * 0.55 + highs * 0.75);

    ctx.beginPath();
    for (let i = 0; i <= 180; i++) {
      const t = i / 180;
      const angle = t * Math.PI * 2.2 + speed + phase;
      const curl = Math.sin(t * Math.PI * 3.0 + time * 0.0011 + phase) * (0.18 + mids * 0.25);
      const r = radius * (0.22 + ribbon * 0.038 + Math.sin(t * Math.PI * 2 + phase) * 0.11 + bass * 0.055);

      const x = cx + Math.cos(angle + curl) * r + Math.sin(time * 0.00033 + phase) * radius * 0.15;
      const y = cy + Math.sin(angle * 0.78 - curl) * r + Math.cos(time * 0.00028 + phase) * radius * 0.13;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineWidth = 1.0 + highs * 2.6 + energy * 0.8;
    ctx.shadowBlur = 24 + energy * 54;
    ctx.shadowColor = `${color} ${0.48 + highs * 0.35})`;
    ctx.strokeStyle = `${color} ${0.08 + energy * 0.26 * intensity})`;
    ctx.stroke();
  }

  // Soft inner luminous membranes.
  for (let i = 0; i < 8; i++) {
    const phase = i * 1.87;
    const x = cx + Math.cos(time * 0.00011 + phase) * radius * (0.12 + i * 0.035);
    const y = cy + Math.sin(time * 0.000095 + phase) * radius * (0.10 + i * 0.026);
    const rr = radius * (0.16 + (i % 3) * 0.055 + bass * 0.035);
    const color = flowColors[(i + 1) % flowColors.length];

    const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, `${color} ${0.06 + mids * 0.07 + highs * 0.04})`);
    g.addColorStop(0.46, `${color} ${0.025 + bass * 0.035})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine caustic shimmer/dust inside membrane, deterministic so it animates cleanly.
  for (let i = 0; i < 120; i++) {
    const a = i * 2.399 + time * 0.00019;
    const rr = radius * Math.sqrt(((i * 37) % 100) / 100) * 0.92;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a * 0.93) * rr;
    const twinkle = 0.018 + highs * 0.09 + Math.sin(time * 0.004 + i) * 0.018;
    ctx.fillStyle = `rgba(210, 245, 255, ${Math.max(0.01, twinkle)})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.45 + highs * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Orb rim: cyan edge plus magenta/gold crescents.
  ctx.lineCap = "round";
  ctx.shadowBlur = 34 + highs * 50;

  // Moving cyan membrane rim — slow breathing orbit instead of a fixed shell.
  const cyanDrift = Math.sin(time * 0.00022) * 0.42;

  ctx.beginPath();
  ctx.lineWidth = 1.8 + bass * 1.3;
  ctx.shadowColor = `rgba(0, 220, 255, ${0.55 + highs * 0.25})`;
  ctx.strokeStyle = `rgba(80, 230, 255, ${0.25 + highs * 0.16})`;
  ctx.arc(
    cx,
    cy,
    radius,
    Math.PI * 0.55 + cyanDrift,
    Math.PI * 1.72 + cyanDrift
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 2.2 + highs * 2.0;
  ctx.shadowColor = `rgba(255, 90, 230, ${0.50 + mids * 0.22})`;
  ctx.strokeStyle = `rgba(255, 120, 230, ${0.18 + mids * 0.18})`;
  ctx.arc(cx, cy, radius * (0.72 + bass * 0.045), time * 0.00032 + 0.55, time * 0.00032 + 2.25);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1.4 + highs * 1.4;
  ctx.shadowColor = `rgba(255, 220, 140, ${0.45 + highs * 0.25})`;
  ctx.strokeStyle = `rgba(255, 230, 160, ${0.14 + highs * 0.16})`;
  ctx.arc(cx, cy, radius * (0.86 + mids * 0.035), time * -0.00026 + 3.55, time * -0.00026 + 5.35);
  ctx.stroke();

  // A few pitch-light points riding the membrane.
  for (let i = 0; i < 5; i++) {
    const phase = i * 1.38;
    const a = time * (0.00028 + i * 0.000025) + phase;
    const x = cx + Math.cos(a) * radius * (0.72 + (i % 2) * 0.2);
    const y = cy + Math.sin(a * 0.84) * radius * (0.58 + (i % 3) * 0.08);
    const light = Math.min(1, 0.25 + highs * 0.85 + mids * 0.2);
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius * (0.05 + highs * 0.05));
    g.addColorStop(0, `rgba(255,255,255, ${0.25 + light * 0.55})`);
    g.addColorStop(0.22, `rgba(120,225,255, ${0.16 + light * 0.32})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius * (0.028 + highs * 0.025), 0, Math.PI * 2);
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

      // Deep living atmosphere beneath the orb.
      drawPlasmaField(
        ctx,
        width,
        height,
        mood,
        time,
        softBass * 0.65,
        softMids * 0.75,
        softHighs * 0.7,
        intensity * 0.85
      );

      // New main subject: translucent living orb with internal color flow.
      drawLivingOrbField(
        ctx,
        width,
        height,
        time,
        softBass,
        softMids,
        softHighs,
        intensity
      );

      const musicWarmth = softHighs * 0.035 + softBass * 0.025;
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
        softHighs * 0.75,
        mood,
        time,
        intensity * 0.75
      );

      const baseRadius = Math.min(width, height) * 0.088 * geometrySize;

      const breathingScale =
        1 + softBass * 0.095 * intensity + Math.sin(time * 0.00055) * 0.012;

      const opacity = 0.11 + softMids * 0.14 + intensity * 0.08;

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
        glowAmount + softHighs * 0.45,
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
