import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Film,
  Image as ImageIcon,
  Mic,
  Music,
  Palette,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Moon,
  Sparkles,
  Sun,
  Upload,
  Wallpaper,
  Waves,
} from "lucide-react";
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
const localDraftKey = "waveformVideoMakerDraftV1";
const draftMediaDatabaseName = "waveformVideoMakerDraftMedia";
const draftMediaStoreName = "media";
const getDefaultWaveformFrame = () =>
  window.innerWidth <= 720
    ? { x: 0.08, y: 0.60, w: 0.84, h: 0.28 }
    : { x: 0.2, y: 0.70, w: 0.6, h: 0.14 };

const openDraftMediaDatabase = () =>
  new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }

    const request = window.indexedDB.open(draftMediaDatabaseName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(draftMediaStoreName)) {
        database.createObjectStore(draftMediaStoreName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const writeDraftMedia = async (key, file) => {
  try {
    const database = await openDraftMediaDatabase();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(draftMediaStoreName, "readwrite");
      transaction.objectStore(draftMediaStoreName).put(file, key);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
    return true;
  } catch {
    return false;
  }
};

const readDraftMedia = async (key) => {
  try {
    const database = await openDraftMediaDatabase();
    const file = await new Promise((resolve, reject) => {
      const transaction = database.transaction(draftMediaStoreName, "readonly");
      const request = transaction.objectStore(draftMediaStoreName).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return file;
  } catch {
    return null;
  }
};

const clearDraftMedia = async () => {
  try {
    const database = await openDraftMediaDatabase();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(draftMediaStoreName, "readwrite");
      transaction.objectStore(draftMediaStoreName).clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  } catch {
    // Draft settings still work when browser media storage is unavailable.
  }
};

const readLocalDraft = () => {
  try {
    const savedDraft = window.localStorage.getItem(localDraftKey);
    if (!savedDraft) return null;
    const parsedDraft = JSON.parse(savedDraft);
    return parsedDraft?.savedAt && parsedDraft?.settings ? parsedDraft : null;
  } catch {
    return null;
  }
};

const formatDraftAge = (savedAt) => {
  const elapsedSeconds = Math.max(1, Math.round((Date.now() - savedAt) / 1000));
  if (elapsedSeconds < 60) return "less than a minute ago";
  const elapsedMinutes = Math.round(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  const elapsedDays = Math.round(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
};

const layerTabs = [
  { key: "quickStart", label: "Quick Start", icon: Sparkles },
  { key: "audio", label: "Audio", icon: Music },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "waveform", label: "Waveform", icon: Waves },
  { key: "color", label: "Color", icon: Palette },
  { key: "background", label: "Background", icon: Wallpaper },
  { key: "export", label: "Record/Export", icon: Download },
];

const quickStartSteps = [
  {
    tab: "audio",
    title: "Music",
    text: "Upload an MP3, WAV, M4A, or record with your microphone.",
    icon: Music,
    tone: "blue",
  },
  {
    tab: "image",
    title: "Image",
    text: "Add artwork, then resize or position it on the canvas.",
    icon: ImageIcon,
    tone: "violet",
  },
  {
    tab: "waveform",
    title: "Waveform",
    text: "Select a style and tune the motion to your music.",
    icon: Waves,
    tone: "rose",
  },
  {
    tab: "color",
    title: "Colors & Backgrounds",
    text: "Choose waveform colors, custom colors, and a background.",
    icon: Palette,
    tone: "sky",
  },
  {
    tab: "export",
    title: "Record & Export",
    text: "Record your video and download it as a 16:9 MP4 when supported.",
    icon: Download,
    tone: "mint",
  },
];

const visualDesigns = {
  liquid: { label: "Liquid Light" },
  sphere: { label: "Spectrum Sphere" },
  bars: { label: "Glow Bars" },
  pulseDots: { label: "Pulse Bars" },
  dotBand: { label: "Pulse Dots" },
  waveform: { label: "Glow Waveform" },
  singleWave: { label: "Single Wave" },
  filledWave: { label: "Filled Waveform" },
  rhythmRibbon: { label: "Rhythm Ribbon" },
  splitWave: { label: "Split Waveform" },
  stackedWave: { label: "Stacked Waves" },
  radial: { label: "Radial Pulse" },
};

const artworkBackgroundTemplates = {
  blurred: { label: "Blurred" },
  black: { label: "Clean Black" },
  white: { label: "White" },
  grayGradient: { label: "Light Gray" },
  softVignette: { label: "Soft" },
  colorWash: { label: "Color Wash" },
  studioGlow: { label: "Studio Glow" },
  none: { label: "None" },
};

const backgroundGradientPalettes = {
  pearl: { label: "Pearl", colors: ["#ffffff", "#f1f4ff", "#d8ddff"] },
  graphite: { label: "Graphite", colors: ["#f7f7f7", "#767676", "#171717"] },
  meadow: { label: "Meadow", colors: ["#f0ffd2", "#7bd112", "#2f5516"] },
  mint: { label: "Mint", colors: ["#d9fbe6", "#26c467", "#165d35"] },
  honey: { label: "Honey", colors: ["#fff5c9", "#ff9f0a", "#813714"] },
  rose: { label: "Rose", colors: ["#ffe2e2", "#f34146", "#8a1f23"] },
  sea: { label: "Sea", colors: ["#e0f4ff", "#22a9df", "#145775"] },
  violet: { label: "Violet", colors: ["#eee2ff", "#a84ef0", "#5a1f82"] },
  custom: { label: "Custom", colors: [] },
};

const audioAnalysisProfiles = {
  default: {
    fftSize: 1024,
    analyserSmoothing: 0.88,
    smoothingBias: 0,
    bassRange: [2, 18],
    midRange: [18, 86],
    highRange: [86, 180],
    bassSoft: 2.4,
    midSoft: 2.0,
    highSoft: 2.6,
    beatJump: 7.2,
    beatLift: 2.8,
    beatFloor: 0.035,
  },
  waveform: {
    fftSize: 1024,
    analyserSmoothing: 0.9,
    smoothingBias: 0.04,
    bassRange: [2, 20],
    midRange: [16, 92],
    highRange: [86, 190],
    bassSoft: 2.25,
    midSoft: 2.15,
    highSoft: 2.45,
    beatJump: 6.4,
    beatLift: 2.4,
    beatFloor: 0.040,
  },
  rhythmRibbon: {
    fftSize: 128,
    analyserSmoothing: 0.78,
    smoothingBias: -0.06,
    bassRange: [1, 5],
    midRange: [5, 18],
    highRange: [18, 42],
    bassSoft: 1.35,
    midSoft: 2.55,
    highSoft: 2.70,
    beatJump: 6.8,
    beatLift: 2.2,
    beatFloor: 0.028,
  },
  spectrum: {
    fftSize: 2048,
    analyserSmoothing: 0.78,
    smoothingBias: -0.06,
    bassRange: [3, 30],
    midRange: [30, 150],
    highRange: [150, 390],
    bassSoft: 2.2,
    midSoft: 2.05,
    highSoft: 3.0,
    beatJump: 8.4,
    beatLift: 3.0,
    beatFloor: 0.030,
  },
  sphere: {
    fftSize: 2048,
    analyserSmoothing: 0.84,
    smoothingBias: -0.02,
    bassRange: [3, 28],
    midRange: [24, 140],
    highRange: [130, 360],
    bassSoft: 2.35,
    midSoft: 2.0,
    highSoft: 2.85,
    beatJump: 7.8,
    beatLift: 3.0,
    beatFloor: 0.032,
  },
  liquid: {
    fftSize: 1024,
    analyserSmoothing: 0.93,
    smoothingBias: 0.08,
    bassRange: [2, 16],
    midRange: [16, 74],
    highRange: [74, 150],
    bassSoft: 2.0,
    midSoft: 1.75,
    highSoft: 2.1,
    beatJump: 5.6,
    beatLift: 2.1,
    beatFloor: 0.048,
  },
};

function getAnalysisProfile(visualDesign) {
  if (visualDesign === "liquid") return audioAnalysisProfiles.liquid;
  if (visualDesign === "sphere") return audioAnalysisProfiles.sphere;
  if (visualDesign === "rhythmRibbon") return audioAnalysisProfiles.rhythmRibbon;
  if (["bars", "pulseDots", "radial"].includes(visualDesign)) return audioAnalysisProfiles.spectrum;
  if (["waveform", "singleWave", "filledWave", "splitWave", "stackedWave", "dotBand"].includes(visualDesign)) {
    return audioAnalysisProfiles.waveform;
  }
  return audioAnalysisProfiles.default;
}

const sphereFinishes = {
  luminous: { label: "Luminous" },
  softLine: { label: "Soft Line" },
  drawMotion: { label: "Draw Motion" },
};

const backgroundPulseModes = {
  softBeat: { label: "Soft Beat Glow" },
  off: { label: "Off" },
};

const audioAccept = [
  ".mp3",
  ".wav",
  ".wave",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".flac",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
].join(",");

const supportedAudioFilePattern = /\.(mp3|wav|wave|m4a|aac|ogg|oga|flac)$/i;

const colorPalettes = {
  aurora: {
    label: "Aurora",
    colors: ["rgba(90, 225, 255,", "rgba(255, 95, 225,", "rgba(235, 245, 255,"],
  },
  sapphire: {
    label: "Sapphire",
    colors: ["rgba(70, 180, 255,", "rgba(115, 110, 255,", "rgba(230, 248, 255,"],
  },
  roseGold: {
    label: "Rose Gold",
    colors: ["rgba(255, 155, 205,", "rgba(255, 205, 125,", "rgba(255, 245, 230,"],
  },
  electric: {
    label: "Electric",
    colors: ["rgba(80, 255, 210,", "rgba(135, 95, 255,", "rgba(255, 255, 255,"],
  },
};

function hexToRgbaPrefix(hex) {
  const clean = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex.replace("#", "") : "ffffff";
  const value = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean;
  const numeric = Number.parseInt(value, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  return `rgba(${r}, ${g}, ${b},`;
}

function isHexColor(value) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function hexToRgba(hex, opacity = 1) {
  return `${hexToRgbaPrefix(hex)} ${Math.max(0, Math.min(1, opacity))})`;
}

function normalizeCustomColor(color, fallbackHex = "#ffffff") {
  if (typeof color === "string") {
    return { hex: isHexColor(color) ? color : fallbackHex, opacity: 1 };
  }

  const hex = isHexColor(color?.hex) ? color.hex : fallbackHex;
  const opacity = Number.isFinite(color?.opacity) ? Math.max(0, Math.min(1, color.opacity)) : 1;
  return { hex, opacity };
}

const hudStyles = `
html,
body,
#root {
  width: 100% !important;
  min-width: 100% !important;
  min-height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  text-align: initial !important;
}

body {
  overflow-x: hidden !important;
}

.engine-shell {
  --app-bg: radial-gradient(circle at 78% 12%, rgba(142, 92, 255, .12), transparent 34%),
    linear-gradient(135deg, #f8f9fd 0%, #edf1f7 46%, #e6ebf3 100%);
  --panel-bg: rgba(255,255,255,.96);
  --panel-border: #dde3ec;
  --workspace-bg: linear-gradient(135deg, #eef2f7, #e6ebf3);
  --nav-bg: rgba(255,255,255,.94);
  --nav-hover: #f4f8ff;
  --nav-active: #eef5ff;
  --text-primary: #1f2937;
  --text-secondary: #566174;
  --card-bg: #ffffff;
  --field-bg: #ffffff;
  --field-border: #d8dee9;
  --topbar-bg: linear-gradient(100deg, #8a3ffc 0%, #6f41f5 42%, #2f7df2 100%);
  --topbar-shadow: 0 10px 30px rgba(98, 70, 234, .22);
  background: var(--app-bg);
  color: var(--text-primary);
  transition: background 250ms ease, color 250ms ease;
}

.engine-shell.theme-dark {
  --app-bg: radial-gradient(circle at 82% 8%, rgba(113, 82, 255, .18), transparent 34%),
    linear-gradient(135deg, #111827 0%, #172033 48%, #0b1020 100%);
  --panel-bg: rgba(20, 27, 43, .96);
  --panel-border: rgba(148,163,184,.20);
  --workspace-bg: linear-gradient(135deg, #111827, #1d2638);
  --nav-bg: rgba(18, 25, 39, .94);
  --nav-hover: rgba(78,96,243,.14);
  --nav-active: rgba(78,96,243,.22);
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --card-bg: rgba(17, 24, 39, .94);
  --field-bg: rgba(15, 23, 42, .94);
  --field-border: rgba(148,163,184,.24);
  --topbar-bg: linear-gradient(100deg, #6d28d9 0%, #5145d8 48%, #1d4ed8 100%);
  --topbar-shadow: 0 10px 30px rgba(15, 23, 42, .34);
}

.draft-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: start center;
  padding: 92px 24px 24px;
  background: rgba(8, 12, 26, .34);
}

.draft-dialog {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  width: min(780px, 100%);
  padding: 18px 20px;
  border: 1px solid rgba(111,65,245,.25);
  border-radius: 18px;
  background:
    radial-gradient(circle at 92% 0%, rgba(90,225,255,.12), transparent 34%),
    radial-gradient(circle at 0% 100%, rgba(142,93,251,.12), transparent 35%),
    var(--card-bg);
  color: var(--text-primary);
  box-shadow:
    0 24px 64px rgba(9,14,35,.25),
    0 1px 0 rgba(255,255,255,.72) inset;
}

.draft-dialog-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  color: #ffffff;
  background: linear-gradient(135deg, #8a3ffc, #2f7df2);
  box-shadow: 0 10px 24px rgba(78,96,243,.24);
}

.draft-dialog-copy {
  min-width: 0;
}

.draft-dialog h2 {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -.025em;
}

.draft-dialog p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.45;
}

.draft-dialog-actions {
  display: flex;
  gap: 9px;
  margin: 0;
}

.draft-dialog-actions button {
  min-height: 42px;
  padding: 0 17px;
  border: 1px solid var(--field-border);
  border-radius: 11px;
  background: var(--field-bg);
  color: var(--text-primary);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.draft-dialog-actions .resume-draft-button {
  border-color: transparent;
  background: linear-gradient(100deg, #6f41f5, #2f7df2);
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(78,96,243,.24);
}

.draft-dialog.restored-dialog {
  grid-template-columns: 42px minmax(0, 1fr) auto;
  width: min(650px, 100%);
}

.draft-dialog-actions .dismiss-draft-button {
  border-color: transparent;
  background: linear-gradient(100deg, #6f41f5, #2f7df2);
  color: #ffffff;
  font-weight: 500;
  box-shadow: 0 12px 28px rgba(78,96,243,.20);
}

@media (max-width: 720px) {
  .draft-dialog-backdrop {
    padding: 82px 14px 18px;
  }

  .draft-dialog,
  .draft-dialog.restored-dialog {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .draft-dialog-actions {
    grid-column: 1 / -1;
    justify-content: stretch;
  }

  .draft-dialog-actions button {
    flex: 1;
  }
}

.engine-shell:not(.embed) {
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  margin-left: 0;
  padding: 0 !important;
  overflow-x: hidden;
}

.hud-topbar {
  width: auto;
  min-height: 66px;
  margin: 0;
  padding: 10px 16px 10px 14px;
  display: grid;
  grid-template-columns: minmax(210px, 1fr) auto;
  align-items: center;
  gap: 18px;
  background: var(--topbar-bg);
  box-shadow: var(--topbar-shadow);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
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
  border-radius: 10px;
  background: rgba(255,255,255,.16);
  border: 1px solid rgba(255,255,255,.32);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.10);
}

.hud-title {
  margin: 0;
  color: rgba(255,255,255,.98);
  font-size: 14px;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.hud-subtitle {
  margin: 2px 0 0;
  color: rgba(255,255,255,.72);
  font-size: 11px;
  letter-spacing: .04em;
}

.hud-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 14px;
  background: rgba(255,255,255,.11);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
}

.theme-toggle-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: rgba(231,238,255,.78);
  cursor: pointer;
  transition: background 250ms ease, color 250ms ease, transform 250ms ease;
}

.theme-toggle-button:hover {
  background: rgba(255,255,255,.14);
  color: #ffffff;
}

.theme-toggle-button.active {
  background: rgba(255,255,255,.24);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15,23,42,.18);
}

.hud-action-button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255,255,255,.30);
  border-radius: 10px;
  padding: 0 14px;
  background: rgba(255,255,255,.12);
  color: white;
  font-weight: 800;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.07);
}

.hud-action-button.icon-only {
  width: 42px;
  justify-content: center;
  padding: 0;
}

.hud-action-button:hover {
  background: rgba(255,255,255,.20);
}

.hud-tabs {
  position: fixed;
  left: 0;
  top: 66px;
  bottom: 0;
  width: 92px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 0;
  border-right: 1px solid #dbe1ea;
  border-radius: 0;
  background: var(--nav-bg);
  box-shadow: 12px 0 28px rgba(31, 41, 55, .06);
  backdrop-filter: blur(18px);
  z-index: 18;
}

.hud-tab {
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #566174;
  padding: 11px 6px;
  min-height: 72px;
  display: grid;
  place-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 750;
  letter-spacing: 0;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.hud-tab svg {
  width: 22px;
  height: 22px;
}

.hud-tab:hover {
  color: #2563eb;
  background: var(--nav-hover);
}

.hud-tab.active {
  color: #2563eb;
  background: var(--nav-active);
  border-left-color: #2563eb;
  box-shadow: none;
}

.engine-layout.hud-layout {
  width: 100vw;
  max-width: none;
  min-height: calc(100vh - 66px);
  grid-template-columns: 340px minmax(0, 1fr);
  align-items: start;
  gap: 0;
  margin: 66px 0 0;
  padding: 0 0 0 92px;
  background: transparent;
}

.hud-layout .control-card {
  order: 0;
  align-self: stretch;
  min-height: calc(100vh - 16px);
  max-height: calc(100vh - 16px);
  overflow-y: auto;
  scrollbar-width: thin;
  background: var(--panel-bg);
  border: 0;
  border-right: 1px solid var(--panel-border);
  border-radius: 0;
  box-shadow: 18px 0 38px rgba(31,41,55,.08);
  backdrop-filter: blur(16px);
  color: var(--text-primary);
  padding: 18px 16px 24px;
}

.hud-layout .visual-card {
  order: 1;
  align-self: stretch;
  min-height: calc(100vh - 66px);
  padding: 0 clamp(26px, 5.5vw, 76px) 28px;
  background: var(--workspace-bg);
  border-radius: 0;
}

.visual-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 0;
  transition: background 250ms ease, color 250ms ease;
}

.canvas-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: calc(100vh - 238px);
  margin-top: 50px;
  background: #ffffff;
  overflow: visible;
  user-select: none;
  touch-action: none;
  box-shadow: 0 18px 42px rgba(31,41,55,.14), 0 0 0 1px rgba(148,163,184,.32);
}

.canvas-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}

.canvas-drop-overlay {
  position: absolute;
  inset: 14px;
  display: grid;
  place-items: center;
  border: 1px dashed rgba(255,255,255,.62);
  border-radius: 18px;
  background:
    radial-gradient(circle at 50% 35%, rgba(142,93,251,.24), transparent 34%),
    linear-gradient(135deg, rgba(9,14,34,.82), rgba(45,31,88,.74));
  color: rgba(255,255,255,.94);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
  text-shadow: 0 2px 14px rgba(0,0,0,.34);
  backdrop-filter: blur(12px) saturate(135%);
  box-shadow:
    0 0 0 1px rgba(142,93,251,.20),
    0 24px 60px rgba(20,16,52,.28),
    0 1px 0 rgba(255,255,255,.14) inset;
  pointer-events: none;
  z-index: 3;
}

.visual-card.dragging .canvas-wrap {
  box-shadow:
    0 24px 64px rgba(78,96,243,.24),
    0 0 0 3px rgba(142,93,251,.22);
}

.canvas-center-guide {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  pointer-events: none;
  transform: translateX(-50%);
  z-index: 5;
  background: #8e5dfb;
  box-shadow: 0 0 16px rgba(142,93,251,.48);
}

.artwork-editor-frame,
.waveform-editor-frame {
  position: absolute;
  border: 2px solid rgba(145, 95, 255, .98);
  box-shadow: 0 0 0 1px rgba(255,255,255,.30), 0 0 18px rgba(125,80,255,.22);
  cursor: move;
  z-index: 4;
}

.artwork-editor-handle,
.waveform-editor-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(145, 95, 255, .98);
  background: white;
  box-shadow: 0 1px 8px rgba(0,0,0,.22);
  transform: translate(-50%, -50%);
}

.artwork-editor-handle.nw,
.artwork-editor-handle.se,
.waveform-editor-handle.nw,
.waveform-editor-handle.se {
  cursor: nwse-resize;
}

.artwork-editor-handle.ne,
.artwork-editor-handle.sw,
.waveform-editor-handle.ne,
.waveform-editor-handle.sw {
  cursor: nesw-resize;
}

.artwork-editor-handle.n,
.artwork-editor-handle.s,
.waveform-editor-handle.n,
.waveform-editor-handle.s {
  cursor: ns-resize;
}

.artwork-editor-handle.e,
.artwork-editor-handle.w,
.waveform-editor-handle.e,
.waveform-editor-handle.w {
  cursor: ew-resize;
}

.artwork-editor-handle.nw { left: 0; top: 0; }
.artwork-editor-handle.n { left: 50%; top: 0; }
.artwork-editor-handle.ne { left: 100%; top: 0; }
.artwork-editor-handle.e { left: 100%; top: 50%; }
.artwork-editor-handle.se { left: 100%; top: 100%; }
.artwork-editor-handle.s { left: 50%; top: 100%; }
.artwork-editor-handle.sw { left: 0; top: 100%; }
.artwork-editor-handle.w { left: 0; top: 50%; }

.waveform-editor-handle.nw { left: 0; top: 0; }
.waveform-editor-handle.n { left: 50%; top: 0; }
.waveform-editor-handle.ne { left: 100%; top: 0; }
.waveform-editor-handle.e { left: 100%; top: 50%; }
.waveform-editor-handle.se { left: 100%; top: 100%; }
.waveform-editor-handle.s { left: 50%; top: 100%; }
.waveform-editor-handle.sw { left: 0; top: 100%; }
.waveform-editor-handle.w { left: 0; top: 50%; }

.artwork-editor-stem,
.waveform-editor-stem {
  position: absolute;
  left: 50%;
  top: -50px;
  width: 2px;
  height: 50px;
  background: rgba(145, 95, 255, .98);
  transform: translateX(-50%);
  pointer-events: none;
}

.artwork-editor-handle.float,
.waveform-editor-handle.float {
  left: 50%;
  top: -50px;
  cursor: ns-resize;
}

.preview-player {
  position: relative;
  width: min(100%, 1040px);
  display: grid;
  grid-template-columns: 72px minmax(180px, 1fr) 72px;
  align-items: center;
  gap: 12px 14px;
  margin: 34px auto 0;
  padding: 8px 0 28px;
  color: var(--text-secondary);
}

.preview-loaded-pill {
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  gap: 4px;
  width: min(280px, 32vw);
  padding: 10px 14px;
  border: 1px solid var(--field-border);
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow:
    0 1px 0 rgba(255,255,255,.95) inset,
    0 14px 34px rgba(31,41,55,.10);
}

.preview-loaded-pill span {
  color: #8a94a6;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .22em;
  text-transform: uppercase;
}

.preview-loaded-pill strong {
  overflow: hidden;
  color: #202938;
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-play-button {
  grid-column: 1 / -1;
  grid-row: 1;
  justify-self: center;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(31,41,55,.10);
  border-radius: 999px;
  background: white;
  color: #0f172a;
  box-shadow: 0 10px 28px rgba(31,41,55,.18);
  cursor: pointer;
}

.preview-time {
  font-size: 15px;
  color: #566174;
  font-variant-numeric: tabular-nums;
}

.preview-time:first-of-type {
  grid-column: 1 / 2;
  grid-row: 2;
}

.preview-time:last-of-type {
  grid-column: 3 / 4;
  grid-row: 2;
  justify-self: end;
}

.preview-scrubber {
  grid-column: 2 / 3;
  grid-row: 2;
  width: 100%;
  accent-color: #0f172a;
}

.hud-panel-intro {
  padding: 0 2px 10px;
  color: #667085;
  font-size: 12px;
  line-height: 1.55;
}

.hud-section {
  border: 1px solid var(--field-border);
  border-radius: 10px;
  background: var(--card-bg);
  padding: 14px;
  margin-top: 12px;
  box-shadow: none;
}

.hud-section-title {
  margin: 0 0 12px;
  color: var(--text-primary);
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
  border: 1px solid #d8dee9;
  border-radius: 10px;
  padding: 10px 9px;
  background: #ffffff;
  color: #475467;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.2;
  text-align: left;
  transition: border-color .16s ease, background .16s ease, transform .16s ease;
}

.preset-button:hover {
  border-color: rgba(78,96,243,.34);
  transform: translateY(-1px);
}

.preset-button.active {
  background: linear-gradient(135deg, rgba(78,96,243,.16), rgba(47,125,242,.10));
  color: #4e60f3;
  border-color: rgba(78,96,243,.42);
}

.design-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.sphere-finish-field {
  padding-top: 5px;
}

.waveform-style-field,
.sphere-finish-field {
  padding-bottom: 15px;
}

.waveform-style-field select,
.sphere-finish-field select {
  min-height: 52px;
  appearance: none;
  padding: 0 46px 0 14px;
  border: 1px solid rgba(78,96,243,.18);
  border-radius: 14px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23071324' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") right 15px center / 18px 18px no-repeat,
    linear-gradient(135deg, rgba(255,255,255,.98), rgba(247,249,255,.94));
  color: #1f2937;
  font-size: 14px;
  font-weight: 750;
  box-shadow:
    0 1px 0 rgba(255,255,255,.90) inset,
    0 10px 24px rgba(31,41,55,.07);
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.waveform-style-field select:hover,
.sphere-finish-field select:hover {
  border-color: rgba(78,96,243,.34);
  box-shadow:
    0 1px 0 rgba(255,255,255,.92) inset,
    0 14px 30px rgba(31,41,55,.10);
  transform: translateY(-1px);
}

.waveform-style-field select:focus,
.sphere-finish-field select:focus {
  outline: 0;
  border-color: rgba(78,96,243,.52);
  box-shadow:
    0 0 0 3px rgba(78,96,243,.16),
    0 14px 30px rgba(31,41,55,.10);
}

.sphere-finish-field > label {
  display: block;
  padding-top: 5px;
}

.field-group {
  display: grid;
  gap: 8px;
  margin-top: 13px;
}

.field-group input[type="range"],
.color-opacity-row input[type="range"] {
  width: 100%;
  margin: 0;
  accent-color: #4e60f3;
}

.field-group input[type="range"]::-webkit-slider-runnable-track,
.color-opacity-row input[type="range"]::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, #4e60f3, #6c7bff);
}

.field-group input[type="range"]::-webkit-slider-thumb,
.color-opacity-row input[type="range"]::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  margin-top: -6.5px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #4e60f3;
  box-shadow: 0 3px 10px rgba(78,96,243,.34);
  -webkit-appearance: none;
  appearance: none;
}

.field-group input[type="range"]::-moz-range-track,
.color-opacity-row input[type="range"]::-moz-range-track {
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, #4e60f3, #6c7bff);
}

.field-group input[type="range"]::-moz-range-thumb,
.color-opacity-row input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #4e60f3;
  box-shadow: 0 3px 10px rgba(78,96,243,.34);
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.label-row label {
  color: #4b5563;
}

.label-row span {
  color: #8a94a6;
  font-variant-numeric: tabular-nums;
}

.background-mood-field > label {
  display: block;
  padding-top: 15px;
}

.background-pulse-field > label,
.mid-sensitivity-field .label-row {
  padding-top: 10px;
}

.image-center-glow-field {
  padding-bottom: 12px;
}

.palette-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.palette-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.palette-swatches {
  display: flex;
  gap: 4px;
}

.palette-swatches i {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 12px currentColor;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.template-button {
  display: block;
  min-width: 0;
  padding: 7px;
  line-height: 0;
  box-shadow: 0 6px 16px rgba(31,41,55,.06);
}

.template-thumb {
  display: block;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 50px;
  border-radius: 8px;
  background: #050812;
  border: 0 solid rgba(31,41,55,.12);
}

.template-thumb::before,
.template-thumb::after {
  content: "";
  position: absolute;
  inset: 0;
}

.template-thumb.blurred::before {
  transform: scale(1.18);
  filter: blur(6px) brightness(.62) saturate(1.2);
  background:
    radial-gradient(circle at 36% 40%, rgba(140,230,255,.68), transparent 30%),
    radial-gradient(circle at 66% 54%, rgba(255,110,220,.48), transparent 28%),
    linear-gradient(135deg, #171d2f, #090b13);
}

.template-thumb.black {
  background: #02030a;
}

.template-thumb.white {
  background: #f8f8f5;
}

.template-thumb.grayGradient {
  background:
    radial-gradient(circle at 52% 40%, rgba(255,255,255,.56), transparent 38%),
    linear-gradient(135deg, #f2f3f3, #d4d2d2 58%, #fafafa);
}

.template-thumb.softVignette {
  background:
    radial-gradient(circle at 50% 44%, rgba(210,210,205,.50), transparent 42%),
    radial-gradient(circle at center, transparent 34%, rgba(0,0,0,.58) 100%),
    #151820;
}

.template-thumb.colorWash {
  background:
    radial-gradient(circle at 40% 42%, rgba(90,225,255,.48), transparent 42%),
    radial-gradient(circle at 70% 62%, rgba(255,95,225,.38), transparent 36%),
    #070b18;
}

.template-thumb.studioGlow {
  background:
    radial-gradient(circle at 50% 45%, rgba(255,255,255,.62), rgba(125,220,255,.16) 38%, transparent 66%),
    #060914;
}

.template-thumb.none {
  background:
    linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25% 75%, rgba(255,255,255,.08) 75%),
    linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25% 75%, rgba(255,255,255,.08) 75%),
    #070b16;
  background-position: 0 0, 8px 8px;
  background-size: 16px 16px;
}

.background-gradient-field {
  margin-top: 14px;
}

.background-gradient-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.gradient-swatch-button {
  min-width: 0;
  padding: 3px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(31,41,55,.08);
  transition:
    transform .25s cubic-bezier(.2,.8,.2,1),
    box-shadow .25s ease;
}

.gradient-swatch-button:hover {
  box-shadow: 0 12px 26px rgba(31,41,55,.12);
  transform: translateY(-2px);
}

.gradient-swatch-button.active {
  box-shadow:
    0 0 0 2px #8b5cf6,
    0 0 16px rgba(139,92,246,.32);
  transform: translateY(-1px);
}

.gradient-swatch {
  display: block;
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 9px;
  border: 0 solid rgba(31,41,55,.14);
}

.gradient-swatch::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .12;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255,255,255,.18) 0 1px, transparent 1.4px),
    radial-gradient(circle at 70% 65%, rgba(0,0,0,.16) 0 1px, transparent 1.5px);
  background-size: 9px 9px, 11px 11px;
}

.color-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px 96px;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.custom-color-block {
  margin-top: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5eaf2;
}

.custom-color-block:last-child {
  border-bottom: 0;
}

.color-row input[type="color"] {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--field-border);
  border-radius: 999px;
  background: var(--field-bg);
  cursor: pointer;
  overflow: hidden;
}

.color-row input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-row input[type="color"]::-webkit-color-swatch {
  border: 0;
  border-radius: 999px;
}

.color-row input[type="color"]::-moz-color-swatch {
  border: 0;
  border-radius: 999px;
}

.color-row input[type="text"] {
  width: 44px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--field-border);
  border-radius: 10px;
  background: var(--field-bg);
  cursor: pointer;
}

.color-row input[type="text"] {
  width: 96px;
  padding: 0 8px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: text;
}

.color-opacity-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  margin-left: 0;
  padding-left: 0;
  color: #667085;
  font-size: 11px;
}

.color-opacity-row span:last-child {
  text-align: right;
  color: #4b5563;
}

.color-effects-group {
  margin-top: 8px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.export-button {
  width: 100%;
}

.export-button-content {
  display: grid;
  gap: 3px;
  place-items: center;
}

.export-button-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
}

.export-state-icon {
  width: 21px;
  height: 21px;
  color: #ffffff;
  stroke-width: 2.4;
}

.export-recording-dot {
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255,255,255,.34);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(255,255,255,.12);
}

.export-button-content small {
  color: rgba(255,255,255,.78);
  font-size: 11px;
  font-weight: 700;
}

.export-button.ready {
  background: linear-gradient(100deg, #20a46b, #22b884);
}

.hud-upload-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.upload-box {
  min-height: 54px;
  border-style: dashed;
  border-color: rgba(78,96,243,.36);
  background: linear-gradient(135deg, rgba(78,96,243,.08), rgba(47,125,242,.04));
  color: #24304a;
}

.upload-box svg {
  color: #4e60f3;
}

.upload-box:hover {
  border-color: rgba(78,96,243,.58);
  background: linear-gradient(135deg, rgba(78,96,243,.12), rgba(47,125,242,.07));
}

.mic-button {
  color: #4e60f3;
}

.mic-button svg {
  color: #4e60f3;
}

.mic-button.active {
  border-color: rgba(78,96,243,.34);
  background: rgba(78,96,243,.10);
  color: #4e60f3;
}

.mic-button.active svg {
  color: #4e60f3;
}

.hud-microcopy {
  color: #667085;
  font-size: 11px;
  line-height: 1.45;
}

.quick-start-panel {
  display: grid;
  gap: 12px;
}

.quick-start-hero h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.quick-start-hero p {
  margin: 10px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.quick-start-list {
  position: relative;
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.quick-start-list::before {
  content: "";
  position: absolute;
  left: 23px;
  top: 34px;
  bottom: 72px;
  width: 1px;
  background: linear-gradient(180deg, rgba(78,96,243,.22), rgba(78,96,243,.08));
}

.quick-start-step {
  appearance: none;
  position: relative;
  display: grid;
  width: 100%;
  grid-template-columns: 48px 54px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--field-border);
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: 0 14px 34px rgba(31,41,55,.07);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.quick-start-step:hover {
  transform: translateY(-1px);
  border-color: rgba(78,96,243,.28);
  box-shadow: 0 16px 36px rgba(31,41,55,.10);
}

.quick-start-step:focus-visible {
  outline: 3px solid rgba(78,96,243,.25);
  outline-offset: 2px;
}

.quick-start-number {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #4e60f3, #1aa8f5);
  box-shadow: 0 10px 22px rgba(78,96,243,.22);
  z-index: 1;
}

.quick-start-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(78,96,243,.12), rgba(47,125,242,.06));
  color: #2174e8;
}

.quick-start-step.violet .quick-start-number,
.quick-start-step.violet .quick-start-icon {
  background: linear-gradient(135deg, rgba(142,93,251,.28), rgba(176,76,232,.18));
  color: #7c3aed;
}

.quick-start-step.violet .quick-start-number {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(142,93,251,.62), rgba(176,76,232,.50));
}

.quick-start-step.rose .quick-start-number,
.quick-start-step.rose .quick-start-icon {
  background: linear-gradient(135deg, rgba(239,74,160,.26), rgba(255,107,107,.18));
  color: #d73d85;
}

.quick-start-step.rose .quick-start-number {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(239,74,160,.62), rgba(255,107,107,.50));
}

.quick-start-step.sky .quick-start-number,
.quick-start-step.sky .quick-start-icon {
  background: linear-gradient(135deg, rgba(34,169,223,.26), rgba(78,96,243,.18));
  color: #1b86c8;
}

.quick-start-step.sky .quick-start-number {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(34,169,223,.62), rgba(78,96,243,.50));
}

.quick-start-step.mint .quick-start-number,
.quick-start-step.mint .quick-start-icon {
  background: linear-gradient(135deg, rgba(21,200,162,.26), rgba(32,215,134,.18));
  color: #0da982;
}

.quick-start-step.mint .quick-start-number {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(21,200,162,.62), rgba(32,215,134,.50));
}

.quick-start-copy strong {
  display: block;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.quick-start-copy span {
  display: block;
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.quick-start-ready {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  margin-top: 4px;
  padding: 16px;
  border: 1px solid rgba(142,93,251,.24);
  border-radius: 18px;
  background:
    radial-gradient(circle at 12% 15%, rgba(255,255,255,.82), transparent 25%),
    radial-gradient(circle at 88% 90%, rgba(255,95,225,.16), transparent 34%),
    linear-gradient(135deg, rgba(78,96,243,.16), rgba(142,93,251,.10) 52%, rgba(255,95,225,.14));
  box-shadow:
    0 1px 0 rgba(255,255,255,.82) inset,
    0 16px 38px rgba(78,96,243,.12);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.quick-start-ready::before {
  content: "";
  position: absolute;
  z-index: -1;
  width: 130px;
  height: 130px;
  top: -84px;
  right: -30px;
  border-radius: 999px;
  background: rgba(255,255,255,.46);
  filter: blur(2px);
}

.quick-start-ready::after {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 1px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.42);
  pointer-events: none;
}

.quick-start-ready:hover {
  transform: translateY(-2px);
  border-color: rgba(142,93,251,.42);
  box-shadow:
    0 1px 0 rgba(255,255,255,.90) inset,
    0 20px 44px rgba(78,96,243,.18),
    0 0 0 4px rgba(142,93,251,.06);
}

.quick-start-ready-icon {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 999px;
  background: linear-gradient(145deg, #ffffff, #f7f3ff);
  color: #8e5dfb;
  justify-self: center;
  box-shadow:
    0 8px 22px rgba(78,96,243,.18),
    0 1px 0 rgba(255,255,255,.92) inset;
}

.quick-start-ready-icon svg {
  display: block;
  width: 30px;
  height: 30px;
  margin: 0;
  margin-top: 10px !important;
  color: #8e5dfb;
  filter: drop-shadow(0 3px 6px rgba(142,93,251,.22));
}

.quick-start-ready strong {
  display: block;
  color: var(--text-primary);
  font-size: 16px;
}

.quick-start-ready span {
  display: block;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.quick-start-ready input,
.upload-box input {
  display: none;
}

.field-group > label,
.color-row label,
.color-opacity-row span:first-child {
  color: var(--text-secondary);
}

.field-group select,
.upload-box,
.play-button,
.theater-button {
  width: 100%;
  min-height: 44px;
  border: 1px solid #d8dee9;
  border-radius: 9px;
  background: #ffffff;
  color: #1f2937;
  box-shadow: none;
}

.field-group select {
  padding: 0 12px;
}

.field-group.waveform-style-field select,
.field-group.sphere-finish-field select {
  min-height: 52px;
  appearance: none;
  padding: 0 46px 0 14px;
  border: 1px solid rgba(78,96,243,.18);
  border-radius: 14px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23071324' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") right 15px center / 18px 18px no-repeat,
    linear-gradient(135deg, rgba(255,255,255,.98), rgba(247,249,255,.94));
  color: #1f2937;
  font-size: 14px;
  font-weight: 750;
  box-shadow:
    0 1px 0 rgba(255,255,255,.90) inset,
    0 10px 24px rgba(31,41,55,.07);
}

.field-group.background-mood-field select,
.field-group.background-pulse-field select {
  appearance: none;
  padding: 0 42px 0 12px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23071324' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") right 18px center / 18px 18px no-repeat,
    #ffffff;
}

.field-group select:focus,
.color-row input[type="text"]:focus,
.upload-box:focus-within,
.play-button:focus,
.theater-button:focus,
.preset-button:focus {
  outline: 2px solid rgba(78,96,243,.24);
  outline-offset: 2px;
}

.upload-box,
.play-button,
.theater-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 750;
  cursor: pointer;
}

.play-button svg,
.upload-box svg {
  flex: 0 0 auto;
  stroke-width: 2.25;
}

.hud-upload-row .upload-box {
  min-height: 54px;
  border-style: dashed;
  border-color: rgba(78,96,243,.36);
  background: linear-gradient(135deg, rgba(78,96,243,.08), rgba(47,125,242,.04));
  color: #24304a;
  font-weight: 700;
}

.hud-upload-row .upload-box:hover {
  border-color: rgba(78,96,243,.58);
  background: linear-gradient(135deg, rgba(78,96,243,.12), rgba(47,125,242,.07));
}

.theater-button,
.export-button {
  background: linear-gradient(100deg, #4e60f3, #2f7df2);
  color: white;
  border-color: transparent;
  box-shadow: 0 12px 28px rgba(78,96,243,.22);
}

.theater-button:hover,
.export-button:hover {
  background: linear-gradient(100deg, #4355e8, #276ee4);
  color: white;
  border-color: transparent;
}

@media (max-width: 1100px) {
  .hud-topbar {
    grid-template-columns: 1fr;
    position: static;
  }

  .hud-actions {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .hud-tabs {
    position: static;
    width: auto;
    flex-direction: row;
    justify-content: flex-start;
    overflow-x: auto;
    border-right: 0;
    box-shadow: none;
  }

  .engine-layout.hud-layout {
    grid-template-columns: 1fr;
    margin-top: 0;
    padding: 0;
  }

  .hud-layout .control-card {
    order: 1;
    max-height: none;
    min-height: auto;
    border-right: 0;
    border-radius: 0;
  }

  .hud-layout .visual-card {
    order: 0;
    min-height: auto;
    padding: 20px;
  }

  .hud-layout .canvas-wrap {
    margin-top: 0;
  }
}

@media (max-width: 720px) {
  .hud-topbar {
    gap: 12px;
    padding: 12px 10px 14px;
  }

  .hud-actions {
    gap: 9px;
    padding: 3px 2px 9px;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.56) rgba(255,255,255,.12);
  }

  .hud-actions::-webkit-scrollbar,
  .hud-tabs::-webkit-scrollbar {
    height: 5px;
  }

  .hud-actions::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(255,255,255,.58);
  }

  .hud-actions::-webkit-scrollbar-track {
    border-radius: 999px;
    background: rgba(255,255,255,.12);
  }

  .hud-actions > * {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  .hud-action-button {
    min-width: 128px;
    min-height: 52px;
    justify-content: center;
    border-radius: 15px;
    background: linear-gradient(145deg, rgba(255,255,255,.20), rgba(255,255,255,.10));
    box-shadow:
      0 10px 24px rgba(28,20,90,.18),
      0 1px 0 rgba(255,255,255,.22) inset;
  }

  .hud-action-button.icon-only {
    min-width: 52px;
    width: 52px;
  }

  .theme-toggle {
    min-height: 52px;
    flex: 0 0 auto;
  }

  .hud-tabs {
    width: calc(100% - 20px);
    gap: 7px;
    margin: 0 10px;
    padding: 8px;
    border: 1px solid rgba(255,255,255,.56);
    border-radius: 20px;
    background: rgba(255,255,255,.94);
    box-shadow:
      0 16px 34px rgba(32,25,88,.18),
      0 1px 0 rgba(255,255,255,.92) inset;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
    scrollbar-color: rgba(97,102,255,.46) rgba(97,102,255,.10);
  }

  .hud-tabs::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(97,102,255,.48);
  }

  .hud-tabs::-webkit-scrollbar-track {
    border-radius: 999px;
    background: rgba(97,102,255,.10);
  }

  .hud-tab {
    flex: 0 0 108px;
    min-height: 88px;
    padding: 12px 8px;
    border: 1px solid transparent;
    border-radius: 15px;
    font-size: 12px;
    scroll-snap-align: start;
  }

  .hud-tab svg {
    width: 27px;
    height: 27px;
  }

  .hud-tab.active {
    border-color: rgba(97,102,255,.16);
    border-left-color: rgba(97,102,255,.16);
    background: linear-gradient(145deg, rgba(97,102,255,.14), rgba(47,125,242,.08));
    box-shadow: 0 9px 20px rgba(78,96,243,.12);
  }

  .engine-layout.hud-layout {
    gap: 0 !important;
    background: var(--panel-bg);
  }

  .hud-layout .visual-card {
    width: 100%;
    padding: 8px 8px 0;
    margin: 0 !important;
    border: 0;
    box-shadow: none;
  }

  .hud-layout .canvas-wrap {
    width: 100%;
    max-height: none;
  }

  .preview-player {
    width: 100%;
    margin-top: 22px;
    margin-bottom: 0 !important;
    padding-bottom: 24px;
  }

  .hud-layout .control-card {
    margin: 0 !important;
    padding-top: 0;
    border-top: 0;
    box-shadow: none;
  }

  .hud-section {
    margin-top: 0;
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
    midSensitivity: 1.25,
    highSensitivity: 0.82,
    smoothness: 0.9,
    orbStrength: 1.0,
    plasmaStrength: 0.95,
    geometryStrength: 0.08,
    particleStrength: 0.0,
    causticStrength: 0.72,
    lightFlowStrength: 1.0,
  },
  celestialBlue: {
    label: "Celestial Blue",
    mood: "celestial",
    intensity: 0.58,
    geometrySize: 0.58,
    glowAmount: 0.82,
    bassSensitivity: 1.25,
    midSensitivity: 1.2,
    highSensitivity: 1.05,
    smoothness: 0.92,
    orbStrength: 0.95,
    plasmaStrength: 1.0,
    geometryStrength: 0.06,
    particleStrength: 0.0,
    causticStrength: 0.70,
    lightFlowStrength: 1.0,
  },
  plasmaTemple: {
    label: "Plasma Temple",
    mood: "temple",
    intensity: 0.7,
    geometrySize: 0.64,
    glowAmount: 0.68,
    bassSensitivity: 1.55,
    midSensitivity: 1.35,
    highSensitivity: 0.72,
    smoothness: 0.88,
    orbStrength: 0.72,
    plasmaStrength: 1.25,
    geometryStrength: 0.10,
    particleStrength: 0.0,
    causticStrength: 0.64,
    lightFlowStrength: 1.0,
  },
  harmonicLight: {
    label: "Harmonic Light",
    mood: "sunset",
    intensity: 0.68,
    geometrySize: 0.6,
    glowAmount: 0.9,
    bassSensitivity: 1.42,
    midSensitivity: 1.45,
    highSensitivity: 1.25,
    smoothness: 0.86,
    orbStrength: 1.0,
    plasmaStrength: 0.75,
    geometryStrength: 0.08,
    particleStrength: 0.0,
    causticStrength: 0.76,
    lightFlowStrength: 1.0,
  },
  deepMeditation: {
    label: "Deep Meditation",
    mood: "dawn",
    intensity: 0.42,
    geometrySize: 0.56,
    glowAmount: 0.55,
    bassSensitivity: 1.1,
    midSensitivity: 1.05,
    highSensitivity: 0.55,
    smoothness: 0.96,
    orbStrength: 0.72,
    plasmaStrength: 0.72,
    geometryStrength: 0.04,
    particleStrength: 0.0,
    causticStrength: 0.38,
    lightFlowStrength: 0.82,
  },
  sacredGeometry: {
    label: "Sacred Geometry",
    mood: "celestial",
    intensity: 0.55,
    geometrySize: 0.72,
    glowAmount: 0.62,
    bassSensitivity: 1.25,
    midSensitivity: 1.25,
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

function drawBackground(ctx, width, height, mood, time, lightArtboard = false) {
  if (lightArtboard) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    const paper = ctx.createLinearGradient(0, 0, width, height);
    paper.addColorStop(0, "rgba(255,255,255,0.95)");
    paper.addColorStop(0.58, "rgba(248,250,252,0.72)");
    paper.addColorStop(1, "rgba(241,245,249,0.45)");
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#020613");
  gradient.addColorStop(0.38, "#07142d");
  gradient.addColorStop(0.70, "#081126");
  gradient.addColorStop(1, "#02030b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const cx = width * (0.52 + Math.sin(time * 0.000035) * 0.02);
  const cy = height * 0.50;
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.72);
  aura.addColorStop(0, "rgba(26, 95, 190, 0.16)");
  aura.addColorStop(0.42, "rgba(18, 42, 112, 0.10)");
  aura.addColorStop(0.78, "rgba(70, 18, 92, 0.045)");
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Gentle vignette.
  const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function drawBackgroundPulse(ctx, width, height, mood, beatPulse, mode) {
  if (mode === "off" || beatPulse <= 0.01) return;

  const pulse = Math.min(1, beatPulse);
  const cx = width * 0.5;
  const cy = height * 0.52;
  const radius = Math.max(width, height) * (0.42 + pulse * 0.08);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

  glow.addColorStop(0, `${mood.line} ${0.020 + pulse * 0.045})`);
  glow.addColorStop(0.36, `${mood.glow} ${0.012 + pulse * 0.030})`);
  glow.addColorStop(0.78, `${mood.glow} ${pulse * 0.012})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawArtworkBackgroundTemplate(
  ctx,
  image,
  width,
  height,
  time,
  bass,
  mids,
  palette,
  backgroundTemplate = "blurred"
) {
  const colorWithTemplateAlpha = (templatePalette, index, alpha) => {
    const colors = templatePalette?.colors || colorPalettes.aurora.colors;
    const opacities = templatePalette?.opacities || colors.map(() => 1);
    const colorIndex = ((index % colors.length) + colors.length) % colors.length;
    return `${colors[colorIndex]} ${Math.max(0, Math.min(1, alpha * (opacities[colorIndex] ?? 1)))})`;
  };

  if (!image && (backgroundTemplate === "blurred" || backgroundTemplate === "softVignette")) {
    return;
  }

  ctx.save();
  ctx.fillStyle = backgroundTemplate === "white" || backgroundTemplate === "grayGradient" ? "#f7f7f5" : "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  if (image && (backgroundTemplate === "blurred" || backgroundTemplate === "softVignette")) {
    const breath = 1.015 + bass * 0.028 + Math.sin(time * 0.00055) * 0.004;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(breath, breath);
    ctx.globalAlpha = backgroundTemplate === "softVignette" ? 0.12 + mids * 0.06 : 0.18 + mids * 0.08;
    ctx.filter = backgroundTemplate === "softVignette"
      ? "blur(18px) saturate(1.05) brightness(0.42)"
      : "blur(24px) saturate(1.22) brightness(0.48)";
    ctx.drawImage(image, -width * 0.56, -height * 0.56, width * 1.12, height * 1.12);
    ctx.restore();
  }

  if (backgroundTemplate === "grayGradient") {
    ctx.save();
    const gray = ctx.createLinearGradient(0, 0, width, height);
    gray.addColorStop(0, "#f4f5f5");
    gray.addColorStop(0.34, "#e6e6e5");
    gray.addColorStop(0.62, "#d4d2d2");
    gray.addColorStop(1, "#f8f8f7");
    ctx.fillStyle = gray;
    ctx.fillRect(0, 0, width, height);

    const centerWash = ctx.createRadialGradient(width * 0.52, height * 0.42, 0, width * 0.52, height * 0.42, Math.max(width, height) * 0.62);
    centerWash.addColorStop(0, "rgba(255,255,255,0.40)");
    centerWash.addColorStop(0.48, "rgba(255,255,255,0.16)");
    centerWash.addColorStop(1, "rgba(210,210,210,0)");
    ctx.fillStyle = centerWash;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (backgroundTemplate === "colorWash" || backgroundTemplate === "studioGlow") {
    ctx.save();
    const wash = ctx.createRadialGradient(width / 2, height * 0.48, 0, width / 2, height * 0.48, Math.max(width, height) * 0.74);
    wash.addColorStop(0, backgroundTemplate === "studioGlow" ? colorWithTemplateAlpha(palette, 2, 0.42) : colorWithTemplateAlpha(palette, 0, 0.36));
    wash.addColorStop(0.44, colorWithTemplateAlpha(palette, 1, backgroundTemplate === "studioGlow" ? 0.20 : 0.28));
    wash.addColorStop(1, backgroundTemplate === "studioGlow" ? colorWithTemplateAlpha(palette, 0, 0.08) : colorWithTemplateAlpha(palette, 2, 0.16));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);

    const sweep = ctx.createLinearGradient(0, 0, width, height);
    sweep.addColorStop(0, colorWithTemplateAlpha(palette, 0, backgroundTemplate === "studioGlow" ? 0.14 : 0.18));
    sweep.addColorStop(0.52, colorWithTemplateAlpha(palette, 1, backgroundTemplate === "studioGlow" ? 0.10 : 0.14));
    sweep.addColorStop(1, colorWithTemplateAlpha(palette, 2, backgroundTemplate === "studioGlow" ? 0.18 : 0.22));
    ctx.fillStyle = sweep;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (backgroundTemplate === "softVignette" || backgroundTemplate === "studioGlow") {
    ctx.save();
    const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.18, width / 2, height / 2, Math.max(width, height) * 0.76);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.34)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

function drawCoverArtwork(
  ctx,
  image,
  width,
  height,
  time,
  bass,
  mids,
  palette,
  artworkFrame,
  centerGlowColor = "#f4fbff",
  centerGlowOpacity = 0,
  borderColor = "#5ae1ff",
  borderOpacity = 0.72,
  imagePulseStrength = 0,
  beatPulse = 0,
  backgroundTemplate = "blurred"
) {
  drawArtworkBackgroundTemplate(ctx, image, width, height, time, bass, mids, palette, backgroundTemplate);
  if (!image) return;

  const frame = artworkFrame || { x: 0, y: 0, w: 1, h: 1 };
  const x = frame.x * width;
  const y = frame.y * height;
  const drawWidth = frame.w * width;
  const drawHeight = frame.h * height;
  const imagePulse = 1 + imagePulseStrength * (bass * 0.13 + mids * 0.035 + beatPulse * 0.075);
  const pulsedWidth = drawWidth * imagePulse;
  const pulsedHeight = drawHeight * imagePulse;
  const pulsedX = x + (drawWidth - pulsedWidth) / 2;
  const pulsedY = y + (drawHeight - pulsedHeight) / 2;
  const centerGlowRgba = hexToRgbaPrefix(centerGlowColor);
  const borderRgba = hexToRgbaPrefix(borderColor);

  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.filter = "saturate(1.08) brightness(0.95)";
  if (borderOpacity > 0.01) {
    ctx.shadowBlur = 24 + bass * 44;
    ctx.shadowColor = `${borderRgba} ${(0.22 + bass * 0.18) * borderOpacity})`;
  }
  ctx.drawImage(image, pulsedX, pulsedY, pulsedWidth, pulsedHeight);
  if (borderOpacity > 0.01) {
    ctx.filter = "none";
    ctx.lineWidth = Math.max(1.5, Math.min(width, height) * 0.002);
    ctx.strokeStyle = `${borderRgba} ${(0.54 + bass * 0.18) * borderOpacity})`;
    ctx.strokeRect(pulsedX, pulsedY, pulsedWidth, pulsedHeight);
  }
  ctx.restore();

  if (centerGlowOpacity > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const glowRadius = Math.min(width, height) * 0.58;
    const glow = ctx.createRadialGradient(width / 2, height / 2, glowRadius * 0.1, width / 2, height / 2, glowRadius);
    glow.addColorStop(0, `${centerGlowRgba} ${(0.09 + bass * 0.12) * centerGlowOpacity})`);
    glow.addColorStop(0.45, `${centerGlowRgba} ${(0.035 + mids * 0.055) * centerGlowOpacity})`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

function drawAudioDesign(
  ctx,
  width,
  height,
  time,
  bass,
  mids,
  highs,
  intensity,
  design,
  palette,
  frequencyData,
  waveData,
  elementScale = 1,
  elementY = 0.72,
  elementFrame = null,
  sphereFinish = "luminous",
  beatPulse = 0,
  visualGlow = 0.75,
  previewMode = false
) {
  const frame = elementFrame || {
    x: 0.5 - Math.min(0.9, 0.52 + elementScale * 0.32) / 2,
    y: elementY - 0.08,
    w: Math.min(0.9, 0.52 + elementScale * 0.32),
    h: 0.16 * elementScale,
  };
  const frameX = frame.x * width;
  const frameY = frame.y * height;
  const frameWidth = frame.w * width;
  const frameHeight = frame.h * height;
  const cx = frameX + frameWidth / 2;
  const cy = frameY + frameHeight / 2;
  const base = Math.min(width, height);
  const colors = palette.colors;
  const colorOpacities = palette.opacities || colors.map(() => 1);
  const colorWithAlpha = (index, alpha) => {
    const colorIndex = ((index % colors.length) + colors.length) % colors.length;
    return `${colors[colorIndex]} ${Math.max(0, Math.min(1, alpha * (colorOpacities[colorIndex] ?? 1)))})`;
  };
  const energy = Math.min(1, bass * 0.50 + mids * 0.48 + highs * 0.42);
  const glowBoost = 0.40 + visualGlow * 1.05;
  const beatScale = 1 + bass * 0.18 * intensity;
  const softSphere = sphereFinish === "softLine";
  const drawMotionSphere = sphereFinish === "drawMotion";
  const sphereLineColors = softSphere
    ? ["rgba(235, 238, 232,", "rgba(188, 195, 188,", "rgba(255, 255, 248,"]
    : colors;
  const sphereColorWithAlpha = (index, alpha) =>
    softSphere ? `${sphereLineColors[index % sphereLineColors.length]} ${alpha})` : colorWithAlpha(index, alpha);
  const sphereGlowPulse = Math.min(
    1,
    drawMotionSphere
      ? beatPulse * 1.55 + bass * 0.32 + highs * 0.18
      : bass * 1.35 + highs * 0.28
  );

  ctx.save();
  ctx.globalCompositeOperation = previewMode || palette.label === "Custom" ? "source-over" : "screen";

  if (design === "bars") {
    const barCount = 88;
    const gap = Math.max(2, width * 0.0025);
    const usableWidth = frameWidth;
    const barWidth = usableWidth / barCount - gap;
    const startX = frameX;
    const floorY = frameY + frameHeight;

    for (let i = 0; i < barCount; i++) {
      const t = i / Math.max(1, barCount - 1);
      const sample = frequencyData?.[Math.floor((i / barCount) * 210)] || 0;
      const bandResponse = t < 0.28 ? bass : t < 0.68 ? mids : highs;
      const level = Math.min(1, sample / 255 * (0.72 + bandResponse * 0.75));
      const heightPulse = frameHeight * (0.18 + level * 0.82 * intensity + bass * 0.12);
      const x = startX + i * (barWidth + gap);
      const gradient = ctx.createLinearGradient(0, floorY - heightPulse, 0, floorY);
      gradient.addColorStop(0, colorWithAlpha(i, (0.58 + highs * 0.16) * glowBoost));
      gradient.addColorStop(1, colorWithAlpha(i, 0.05 + visualGlow * 0.08));

      ctx.fillStyle = gradient;
      ctx.shadowBlur = (10 + level * 34) * glowBoost;
      ctx.shadowColor = colorWithAlpha(i, (0.22 + level * 0.34) * glowBoost);
      ctx.fillRect(x, floorY - heightPulse, Math.max(1, barWidth), heightPulse);
    }
  }

  if (design === "pulseDots") {
    const dotCount = 130;
    const baselineY = frameY + frameHeight - Math.max(2, frameHeight * 0.018);
    const dotRadius = Math.max(0.7, Math.min(1.7, frameHeight * 0.018));
    const barCount = 80;
    const barGap = frameWidth / barCount;
    const barWidth = Math.max(1.3, Math.min(3.5, barGap * 0.28));

    ctx.save();
    ctx.shadowBlur = (5 + highs * 14) * glowBoost;
    ctx.shadowColor = `rgba(255,255,255, ${(0.14 + highs * 0.22) * glowBoost})`;
    ctx.fillStyle = `rgba(255,255,255, ${(0.30 + intensity * 0.18) * glowBoost})`;

    for (let i = 0; i < dotCount; i++) {
      const t = i / (dotCount - 1);
      const x = frameX + t * frameWidth;
      const fade = 0.45 + Math.sin(t * Math.PI) * 0.35;
      ctx.globalAlpha = fade * (0.46 + highs * 0.20);
      ctx.beginPath();
      ctx.arc(x, baselineY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    for (let i = 0; i < barCount; i++) {
      const t = i / (barCount - 1);
      const sampleIndex = Math.floor((t * 180 + time * 0.012) % 210);
      const freq = (frequencyData?.[sampleIndex] || 0) / 255;
      const bandResponse = t < 0.28 ? bass : t < 0.68 ? mids : highs;
      const clustered =
        Math.exp(-Math.pow((t - 0.23) / 0.04, 2)) * (0.38 + mids * 0.24) +
        Math.exp(-Math.pow((t - 0.47) / 0.035, 2)) * (0.72 + bass * 0.45 + beatPulse * 0.32) +
        Math.exp(-Math.pow((t - 0.77) / 0.045, 2)) * (0.45 + highs * 0.35) +
        Math.exp(-Math.pow((t - 0.93) / 0.025, 2)) * (0.28 + highs * 0.24);
      const local = Math.max(0, freq * (0.54 + bandResponse * 0.56) + clustered - 0.16);
      if (local < 0.05) continue;

      const x = frameX + t * frameWidth;
      const heightPulse = frameHeight * Math.min(0.96, (0.12 + local * 0.92) * intensity);
      const top = baselineY - heightPulse;
      const grad = ctx.createLinearGradient(0, top, 0, baselineY);
      grad.addColorStop(0, `rgba(255,255,255, ${0.84 + highs * 0.10})`);
      grad.addColorStop(1, `rgba(255,255,255, ${0.25 + local * 0.22})`);

      ctx.fillStyle = grad;
      ctx.shadowBlur = (7 + local * 20) * glowBoost;
      ctx.shadowColor = `rgba(255,255,255, ${(0.20 + local * 0.22) * glowBoost})`;
      ctx.fillRect(x - barWidth / 2, top, barWidth, heightPulse);
    }
    ctx.restore();
  }

  if (design === "dotBand") {
    const bassBins = 6;
    let bassSum = 0;
    for (let i = 0; i < bassBins; i++) {
      bassSum += frequencyData?.[i] || 0;
    }

    const bassAverage = bassSum / bassBins / 255;
    const columns = 72;
    const dotRadius = Math.max(1.1, Math.min(3.2, frameWidth / columns * 0.14, frameHeight * 0.024));
    const dotStep = dotRadius * 2.42;
    const maxRows = Math.max(4, Math.floor(frameHeight * 0.48 / dotStep));
    const phase = time * 0.0011;
    const centerLine = cy;
    const frequencyLength = frequencyData?.length || 1;

    ctx.save();
    ctx.globalCompositeOperation = previewMode || palette.label === "Custom" ? "source-over" : "screen";
    ctx.shadowBlur = 0;

    for (let i = 0; i < columns; i++) {
      const t = i / Math.max(1, columns - 1);
      const freqIndex = Math.min(frequencyLength - 1, Math.floor(t * Math.min(220, frequencyLength - 1)));
      const freq = (frequencyData?.[freqIndex] || 0) / 255;
      const tonePulse = t < 0.32 ? bass : t < 0.70 ? mids : highs;
      const texture =
        Math.sin(phase * 1.8 + i * 0.77) * 0.08 +
        Math.sin(phase * 0.9 + i * 1.93) * 0.05;
      const edgeTaper = Math.min(1, t / 0.085, (1 - t) / 0.085);
      const envelope = Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.12);
      const columnEnergy = Math.min(
        1,
        (0.18 + freq * 0.92 + tonePulse * 0.70 + bassAverage * 0.30 + beatPulse * 0.34 + texture) *
          envelope *
          edgeTaper *
          intensity
      );
      const rowCount = Math.max(1, Math.round(2 + columnEnergy * maxRows));
      const x = frameX + t * frameWidth;
      const colorIndex = i % 3;

      ctx.fillStyle = colorWithAlpha(colorIndex, 0.92);
      for (let row = -rowCount; row <= rowCount; row++) {
        const distance = Math.abs(row) / Math.max(1, rowCount);
        const edgeFade = 1 - distance * 0.38;
        const y =
          centerLine +
          row * dotStep +
          Math.sin(phase * 0.75 + i * 0.34) * frameHeight * 0.012 * (0.35 + mids);

        if (y < frameY || y > frameY + frameHeight) continue;

        ctx.globalAlpha = Math.max(0, Math.min(1, (0.46 + columnEnergy * 0.50 + beatPulse * 0.12) * edgeFade * glowBoost));
        ctx.beginPath();
        ctx.arc(x, y, dotRadius * (0.76 + columnEnergy * 0.34 + beatPulse * 0.12), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  if (design === "waveform" || design === "singleWave" || design === "splitWave" || design === "stackedWave") {
    const passes = design === "singleWave" ? 1 : design === "stackedWave" ? 5 : 3;
    for (let pass = 0; pass < passes; pass++) {
      ctx.beginPath();
      const yBase = cy + (pass - (passes - 1) / 2) * frameHeight * (design === "stackedWave" ? 0.22 : 0.15);
      const amp = frameHeight * (0.24 + bass * 0.26 + (design === "singleWave" ? 0 : pass * 0.05)) * intensity;

      for (let i = 0; i < 256; i++) {
        const x = frameX + (i / 255) * frameWidth;
        const sample = waveData?.[i * 2] ?? 128;
        const wave = (sample - 128) / 128;
        const drift = Math.sin(time * 0.001 + i * 0.035 + pass) * base * (design === "singleWave" ? 0.006 : 0.012);
        const mirror = design === "splitWave" && pass % 2 ? -1 : 1;
        const y = yBase + wave * amp * mirror + drift;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineWidth = design === "singleWave" ? 2.4 + highs * 2.2 : 2.2 + pass * 1.4 + highs * 3;
      ctx.shadowBlur = (design === "singleWave" ? 18 : 24) + energy * 54;
      ctx.shadowColor = colorWithAlpha(pass, 0.38 + energy * 0.32);
      ctx.strokeStyle = colorWithAlpha(pass, (design === "singleWave" ? 0.56 : 0.36 - pass * 0.07) + energy * 0.18);
      ctx.stroke();
    }
  }

  if (design === "filledWave") {
    const span = frameWidth;
    const x0 = frameX;
    const centerY = cy;
    const amp = frameHeight * (0.28 + bass * 0.22) * intensity;
    const waveform = [];

    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      const x = x0 + (i / 255) * span;
      const sample = waveData?.[i * 2] ?? 128;
      const wave = Math.abs((sample - 128) / 128);
      const edgeTaper = Math.sin(Math.PI * t);
      const taper = Math.pow(Math.max(0, edgeTaper), 0.62);
      const shaped = Math.max(
        0.015,
        (wave * 0.95 + (frequencyData?.[Math.floor(i * 0.9)] || 0) / 255 * 0.28) * taper
      );
      const y = centerY - shaped * amp;
      waveform.push({ x, y, level: shaped });
    }

    ctx.save();
    ctx.shadowBlur = 18 + energy * 38;
    ctx.shadowColor = colorWithAlpha(0, 0.35 + energy * 0.3);
    const gradient = ctx.createLinearGradient(x0, 0, x0 + span, 0);
    gradient.addColorStop(0, colorWithAlpha(2, 0.92));
    gradient.addColorStop(0.42, colorWithAlpha(0, 0.86));
    gradient.addColorStop(1, colorWithAlpha(1, 0.84));

    ctx.beginPath();
    ctx.moveTo(x0, centerY);
    waveform.forEach((point) => ctx.lineTo(point.x, point.y));
    for (let i = waveform.length - 1; i >= 0; i--) {
      const point = waveform[i];
      ctx.lineTo(point.x, centerY + (centerY - point.y) * 0.92);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.lineWidth = 1.4 + highs * 1.5;
    ctx.strokeStyle = colorWithAlpha(2, 0.62 + highs * 0.18);
    ctx.stroke();
    ctx.restore();
  }

  if (design === "rhythmRibbon") {
    const span = frameWidth;
    const x0 = frameX;
    const centerY = cy;
    const amp = frameHeight * (0.32 + mids * 0.12 + highs * 0.04 + beatPulse * 0.035) * intensity;
    const points = [];
    const count = 168;
    const phase = time * 0.00022;
    const broadMasses = [0.0, 1.9, 3.7, 5.4, 7.2].map((seed, index) => ({
      c: 0.08 + (Math.sin(phase * (0.28 + index * 0.06) + seed) * 0.5 + 0.5) * 0.84,
      w: 0.070 + (index % 2) * 0.030 + mids * 0.012,
      a: 0.14 + bass * 0.035 + mids * 0.34 + highs * 0.045 + beatPulse * (index % 2 ? 0.045 : 0.070),
      tone: index % 3 === 0 ? "mid" : index % 3 === 1 ? "low" : "high",
    }));
    const sharpPeaks = [0.8, 2.6, 4.8, 6.6, 8.1, 9.7].map((seed, index) => ({
      c: 0.06 + (Math.sin(phase * (0.42 + index * 0.05) + seed) * 0.5 + 0.5) * 0.88,
      w: 0.020 + (index % 3) * 0.006 + highs * 0.006,
      a: 0.06 + highs * 0.20 + mids * 0.10 + beatPulse * 0.08,
      tone: "high",
    }));
    const gaussianPeaks = [...broadMasses, ...sharpPeaks];
    const gaussianSamples = gaussianPeaks.map((peak) => ({
      ...peak,
      freq: (frequencyData?.[Math.floor(8 + peak.c * 180)] || 0) / 255,
    }));
    const valleyMasses = [1.1, 3.0, 4.4, 6.1, 8.6].map((seed, index) => ({
      c: 0.10 + (Math.sin(phase * (0.24 + index * 0.045) + seed) * 0.5 + 0.5) * 0.80,
      w: 0.030 + (index % 3) * 0.018,
      a: 0.14 + mids * 0.10 + highs * 0.08,
    }));

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = x0 + t * span;
      const lowIndex = Math.floor(8 + t * 44);
      const midIndex = Math.floor(36 + t * 92);
      const highIndex = Math.floor(96 + t * 104);
      const lowFreq = (frequencyData?.[lowIndex] || 0) / 255;
      const midFreq = (frequencyData?.[midIndex] || 0) / 255;
      const highFreq = (frequencyData?.[highIndex] || 0) / 255;
      const sample = waveData?.[Math.floor(t * (waveData.length - 1))] ?? 128;
      const wave = Math.abs((sample - 128) / 128);
      let peakField = 0;
      gaussianSamples.forEach((peak) => {
        const distance = Math.min(Math.abs(t - peak.c), 1 - Math.abs(t - peak.c));
        const audioWeight =
          peak.tone === "low"
            ? lowFreq * 0.24 + peak.freq * 0.18
            : peak.tone === "mid"
              ? midFreq * 0.38 + peak.freq * 0.22
              : highFreq * 0.32 + peak.freq * 0.16;
        const beatNarrow = 1 - beatPulse * (peak.w > 0.05 ? 0.10 : 0.22);
        const width = Math.max(0.018, peak.w * beatNarrow);
        peakField += Math.exp(-0.5 * Math.pow(distance / width, 2)) * (peak.a + audioWeight);
      });
      const filledMotion =
        wave * 0.98 +
        (frequencyData?.[Math.floor(t * 230)] || 0) / 255 * 0.34 +
        lowFreq * 0.12 +
        midFreq * 0.34 +
        highFreq * 0.18;
      const frequencyTexture =
        lowFreq * 0.12 +
        midFreq * (0.24 + Math.sin(t * Math.PI * 6) * 0.035) +
        highFreq * (0.20 + Math.sin(t * Math.PI * 28) * 0.030);
      let valleyField = 0;
      valleyMasses.forEach((valley) => {
        const distance = Math.abs(t - valley.c);
        valleyField += Math.exp(-0.5 * Math.pow(distance / valley.w, 2)) * valley.a;
      });
      const beatPeak =
        Math.exp(-0.5 * Math.pow((t - broadMasses[1].c) / 0.070, 2)) * beatPulse * 0.070 +
        Math.exp(-0.5 * Math.pow((t - broadMasses[3].c) / 0.055, 2)) * beatPulse * 0.090;
      const edgeRound = Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.42);
      const pointTaper = Math.min(1, Math.min(t / 0.026, (1 - t) / 0.040));
      const fourierEdges =
        Math.max(0, Math.sin(t * Math.PI * 14 + time * 0.0015)) * highFreq * 0.045 +
        Math.max(0, Math.sin(t * Math.PI * 9 - time * 0.0010)) * midFreq * 0.055;
      const waveDriven = Math.pow(Math.max(0, filledMotion - 0.18), 1.34);
      const massGate = 0.32 + Math.min(1, peakField * 1.35 + midFreq * 0.22 + highFreq * 0.12);
      const organicRipple =
        Math.max(0, Math.sin(t * Math.PI * 5.2 + time * 0.00072)) * (0.035 + mids * 0.035) +
        Math.max(0, Math.sin(t * Math.PI * 11.0 - time * 0.00058)) * (0.020 + highs * 0.030);
      const body =
        (0.042 +
          waveDriven * massGate * 0.70 +
          peakField * 0.86 +
          frequencyTexture * 0.22 +
          beatPeak +
          fourierEdges +
          organicRipple -
          valleyField * 0.72) *
        edgeRound *
        Math.max(0, pointTaper);
      const thickness = Math.max(0.018, Math.min(1.46, body));
      const topBias =
        1 +
        Math.sin(t * Math.PI * 7.0 + time * 0.00042) * 0.040 +
        highFreq * 0.035 -
        valleyField * 0.030;
      const bottomBias =
        0.91 +
        Math.cos(t * Math.PI * 5.0 - time * 0.00036) * 0.045 +
        midFreq * 0.085 -
        highFreq * 0.015;

      points.push({
        x,
        top: centerY - thickness * amp * topBias,
        bottom: centerY + thickness * amp * bottomBias,
      });
    }

    ctx.save();
    ctx.shadowBlur = 5 + energy * 16;
    ctx.shadowColor = colorWithAlpha(1, 0.12 + energy * 0.16);
    const gradient = ctx.createLinearGradient(x0, 0, x0 + span, 0);
    gradient.addColorStop(0, colorWithAlpha(2, 0.74));
    gradient.addColorStop(0.18, colorWithAlpha(0, 0.76));
    gradient.addColorStop(0.62, colorWithAlpha(0, 0.90));
    gradient.addColorStop(1, colorWithAlpha(1, 0.98));

    ctx.strokeStyle = gradient;
    ctx.lineCap = "round";
    const barWidth = Math.max(2, (span / count) * 0.62);
    ctx.lineWidth = barWidth;
    points.forEach((point, index) => {
      const t = index / (points.length - 1);
      ctx.globalAlpha = Math.min(1, 0.78 + Math.sin(t * Math.PI) * 0.14 + energy * 0.08);
      ctx.beginPath();
      ctx.moveTo(point.x, point.top);
      ctx.lineTo(point.x, point.bottom);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  if (design === "sphere") {
    const radius = Math.min(frameWidth, frameHeight) * 0.43 * beatScale;
    const coreGradient = ctx.createRadialGradient(
      cx,
      cy,
      radius * 0.08,
      cx,
      cy,
      radius * 1.25
    );

    coreGradient.addColorStop(
      0,
      sphereColorWithAlpha(2, softSphere ? 0.14 + bass * 0.05 : 0.22 + sphereGlowPulse * 0.13)
    );
    coreGradient.addColorStop(
      0.28,
      sphereColorWithAlpha(0, softSphere ? 0.075 + mids * 0.025 : 0.10 + sphereGlowPulse * 0.055)
    );
    coreGradient.addColorStop(
      0.66,
      sphereColorWithAlpha(1, softSphere ? 0.032 + highs * 0.025 : 0.034 + sphereGlowPulse * 0.035)
    );
    coreGradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
    ctx.fill();

    for (let orbit = 0; orbit < 48; orbit++) {
      const sample = frequencyData?.[Math.floor((orbit / 48) * 230)] || 0;
      const level = sample / 255;
      const tilt = Math.sin(orbit * 1.71) * 0.62;
      const spin = time * (0.00024 + orbit * 0.000006) + orbit * 0.38 + bass * 0.22;
      const orbitRadius = radius * (0.64 + (orbit % 7) * 0.045 + level * 0.12);
      const xRadius = orbitRadius * (0.98 + Math.sin(orbit * 0.9) * 0.18);
      const yRadius = orbitRadius * (0.20 + Math.abs(tilt) * 0.58 + mids * 0.05);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spin);
      ctx.beginPath();

      const drawEnergy = Math.min(
        1,
        level * 0.50 + bass * 0.22 + highs * 0.20 + beatPulse * 0.95
      );
      const drawLength = drawMotionSphere ? Math.PI * (0.42 + drawEnergy * 1.72) : Math.PI * 2;
      const drawHead = drawMotionSphere
        ? (time * (0.00115 + orbit * 0.000018) + orbit * 0.71 + level * 1.2) % (Math.PI * 2)
        : 0;
      const steps = drawMotionSphere ? 92 : 180;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const t = drawMotionSphere
          ? drawHead + progress * drawLength
          : progress * Math.PI * 2;
        const x = Math.cos(t) * xRadius;
        const y =
          Math.sin(t) * yRadius +
          Math.sin(t * 2.0 + time * 0.001 + orbit) * radius * 0.018 * (0.5 + level);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineWidth = softSphere
        ? 0.55 + level * 1.2 + highs * 0.32
        : drawMotionSphere
          ? 0.92 + level * 2.1 + beatPulse * 1.55 + sphereGlowPulse * 0.35
          : 0.92 + level * 2.15 + highs * 0.72 + sphereGlowPulse * 0.50;
      ctx.shadowBlur = softSphere
        ? 3 + level * 7 + highs * 4
        : drawMotionSphere
          ? 5 + level * 15 + beatPulse * 34 + sphereGlowPulse * 8
          : 8 + level * 24 + sphereGlowPulse * 20;
      ctx.shadowColor = sphereColorWithAlpha(orbit, softSphere ? 0.08 + level * 0.12 : drawMotionSphere ? 0.16 + level * 0.18 + beatPulse * 0.34 + sphereGlowPulse * 0.08 : 0.22 + level * 0.24 + sphereGlowPulse * 0.16);
      ctx.strokeStyle = sphereColorWithAlpha(orbit, softSphere ? 0.16 + level * 0.18 + intensity * 0.025 : drawMotionSphere ? 0.34 + level * 0.22 + beatPulse * 0.24 + sphereGlowPulse * 0.08 : 0.32 + level * 0.32 + sphereGlowPulse * 0.10);
      ctx.stroke();

      if (drawMotionSphere && orbit % 5 === 0) {
        ctx.lineWidth = 0.45 + level * 0.6;
        ctx.shadowBlur = 2 + beatPulse * 10;
        ctx.shadowColor = `rgba(255,255,255, ${0.06 + beatPulse * 0.16})`;
        ctx.strokeStyle = `rgba(255,255,255, ${0.055 + level * 0.04 + beatPulse * 0.11})`;
        ctx.stroke();
      }

      if (!drawMotionSphere && orbit % (softSphere ? 4 : 3) === 0) {
        ctx.lineWidth = softSphere ? 0.45 + level * 0.55 : 0.65 + level * 1.6;
        ctx.shadowBlur = softSphere ? 2 + highs * 4 : 7 + sphereGlowPulse * 12;
        ctx.shadowColor = `rgba(255,255,255, ${softSphere ? 0.08 + level * 0.08 : 0.18 + level * 0.14 + sphereGlowPulse * 0.12})`;
        ctx.strokeStyle = `rgba(255,255,255, ${softSphere ? 0.10 + level * 0.10 + highs * 0.025 : 0.26 + level * 0.18 + sphereGlowPulse * 0.10})`;
        ctx.stroke();
      }
      ctx.restore();
    }

    for (let guide = 0; guide < (drawMotionSphere ? 5 : 9); guide++) {
      const angle = time * 0.00016 + guide * (Math.PI / 9);
      const squash = 0.34 + (guide % 3) * 0.18 + mids * 0.04;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.98, radius * squash, 0, 0, Math.PI * 2);
      ctx.lineWidth = softSphere ? 0.65 + bass * 0.25 : drawMotionSphere ? 0.48 + beatPulse * 0.45 : 0.9 + bass * 1.2;
      ctx.shadowBlur = softSphere ? 3 + highs * 5 : drawMotionSphere ? 2 + beatPulse * 10 : 8 + sphereGlowPulse * 18;
      ctx.shadowColor = `rgba(255,255,255, ${softSphere ? 0.08 + highs * 0.04 : drawMotionSphere ? 0.035 + beatPulse * 0.10 : 0.16 + sphereGlowPulse * 0.12})`;
      ctx.strokeStyle = `rgba(255,255,255, ${softSphere ? 0.075 + bass * 0.035 + highs * 0.035 : drawMotionSphere ? 0.040 + beatPulse * 0.075 : 0.19 + sphereGlowPulse * 0.10})`;
      ctx.stroke();
      ctx.restore();
    }

    for (let node = 0; node < 12; node++) {
      const sample = frequencyData?.[Math.floor((node / 12) * 210)] || 0;
      const level = sample / 255;
      const angle = time * (0.0005 + node * 0.000025) + node * 1.72;
      const lane = radius * (0.58 + (node % 4) * 0.12 + level * 0.10);
      const x = cx + Math.cos(angle) * lane;
      const y = cy + Math.sin(angle * (0.48 + (node % 3) * 0.08)) * lane * 0.62;
      const nodeSize = radius * (0.018 + level * 0.026 + highs * 0.008);

      ctx.beginPath();
      ctx.shadowBlur = softSphere ? 4 + level * 8 : 9 + level * 18 + sphereGlowPulse * 14;
      ctx.shadowColor = sphereColorWithAlpha(node, softSphere ? 0.16 + level * 0.18 : 0.30 + level * 0.22 + sphereGlowPulse * 0.18);
      ctx.fillStyle = sphereColorWithAlpha(2, softSphere ? 0.35 + level * 0.20 : 0.50 + level * 0.26 + sphereGlowPulse * 0.12);
      ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.setLineDash([2, 9]);
    ctx.lineWidth = 1.0;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = sphereColorWithAlpha(2, softSphere ? 0.035 + highs * 0.025 : 0.08 + highs * 0.08);
    ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.lineWidth = softSphere ? 0.95 + bass * 0.45 : 1.4 + bass * 2.2;
    ctx.shadowBlur = softSphere ? 4 + bass * 8 : 10 + sphereGlowPulse * 24;
    ctx.shadowColor = sphereColorWithAlpha(2, softSphere ? 0.08 + bass * 0.06 : 0.18 + sphereGlowPulse * 0.20);
    ctx.strokeStyle = sphereColorWithAlpha(2, softSphere ? 0.12 + energy * 0.08 : 0.18 + energy * 0.14 + sphereGlowPulse * 0.08);
    ctx.arc(cx, cy, radius * 0.94, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (design === "radial") {
    const bars = 96;
    const radius = Math.min(frameWidth, frameHeight) * 0.36 * beatScale;

    for (let i = 0; i < bars; i++) {
      const angle = (Math.PI * 2 * i) / bars + time * 0.00008;
      const sample = frequencyData?.[Math.floor((i / bars) * 230)] || 0;
      const t = i / Math.max(1, bars - 1);
      const bandResponse = t < 0.28 ? bass : t < 0.68 ? mids : highs;
      const level = Math.min(1, sample / 255 * (0.70 + bandResponse * 0.72));
      const length = Math.min(frameWidth, frameHeight) * (0.045 + level * 0.44 * intensity + bass * 0.035);
      const wobble = Math.sin(time * 0.0012 + i * 0.19) * base * 0.012 * (0.4 + mids);
      const inner = radius + wobble;
      const outer = inner + length;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      ctx.lineWidth = 1.2 + level * 4.4;
      ctx.shadowBlur = (12 + level * 50) * glowBoost;
      ctx.shadowColor = colorWithAlpha(i, (0.20 + level * 0.45) * glowBoost);
      ctx.strokeStyle = colorWithAlpha(i, (0.12 + level * 0.62) * glowBoost);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.lineWidth = 0.6 + bass * 0.7;
    ctx.shadowBlur = (3 + bass * 10) * glowBoost;
    ctx.shadowColor = colorWithAlpha(0, (0.035 + bass * 0.035) * glowBoost);
    ctx.strokeStyle = colorWithAlpha(2, (0.025 + energy * 0.035) * glowBoost);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
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
  const radius = base * (0.338 + bass * 0.026) * (0.96 + intensity * 0.075);
  const energy = Math.min(1, bass * 0.42 + mids * 0.48 + highs * 0.72);
  const liquidSpeed = 1 + mids * 0.65 + highs * 0.28;

  const drawOrbClip = () => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.985, 0, Math.PI * 2);
    ctx.clip();
  };

  const flowPoints = (seed, scale = 1, turn = 1, count = 180) => {
    const points = [];
    const phase = seed * Math.PI * 2;
    const spin = time * (0.000105 + seed * 0.000028) * liquidSpeed + phase;
    const driftX = Math.sin(time * (0.000075 + seed * 0.00002) + phase) * radius * (0.035 + mids * 0.04);
    const driftY = Math.cos(time * (0.000065 + seed * 0.000018) + phase * 1.4) * radius * (0.03 + bass * 0.03);

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const sweep = (t - 0.5) * Math.PI * (2.55 + seed * 0.9) * turn;
      const foldA = Math.sin(t * Math.PI * 3.0 + spin) * (0.13 + mids * 0.10);
      const foldB = Math.cos(t * Math.PI * 6.0 - spin * 0.82 + seed * 4.0) * (0.055 + highs * 0.035);
      const foldC = Math.sin(t * Math.PI * 9.0 + time * 0.00034 + seed * 11.0) * 0.025;
      const a = phase + spin * 0.42 + sweep + foldA + foldB;
      const rr = radius * scale * (0.18 + 0.62 * Math.sin(t * Math.PI) + foldB * 0.20 + foldC);
      const orbitalPull = Math.sin(t * Math.PI * 2 + phase + time * 0.00016) * radius * 0.07;
      const x = cx + driftX + Math.cos(a) * rr * (0.92 + mids * 0.05) + Math.cos(phase + time * 0.00019) * orbitalPull;
      const y = cy + driftY + Math.sin(a * 0.88) * rr * (0.62 + bass * 0.035) + Math.sin(t * Math.PI * 2.0 + spin) * radius * 0.07;
      const widthPulse = Math.sin(t * Math.PI) * (0.72 + bass * 0.22) + Math.sin(t * Math.PI * 4 + phase + time * 0.00028) * 0.10;
      points.push({ x, y, w: Math.max(0.16, widthPulse) });
    }
    return points;
  };

  const drawSoftBand = (seed, colors, alpha = 1, scale = 1, turn = 1, widthScale = 1, blur = 8) => {
    const pts = flowPoints(seed, scale, turn, 190);
    const left = [];
    const right = [];

    for (let i = 0; i < pts.length; i++) {
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.max(0.0001, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      const taper = Math.sin((i / (pts.length - 1)) * Math.PI);
      const breathing = 1 + bass * 0.28 + Math.sin(time * 0.00032 + seed * 8 + i * 0.027) * 0.08;
      const halfW = radius * (0.052 + 0.045 * pts[i].w) * widthScale * taper * breathing;
      left.push({ x: pts[i].x + nx * halfW, y: pts[i].y + ny * halfW });
      right.push({ x: pts[i].x - nx * halfW, y: pts[i].y - ny * halfW });
    }

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    ctx.beginPath();
    left.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();

    const phase = seed * Math.PI * 2 + time * 0.00012;
    const gx1 = cx + Math.cos(phase) * radius * 0.54;
    const gy1 = cy + Math.sin(phase * 0.78) * radius * 0.36;
    const gx2 = cx - Math.cos(phase * 0.86) * radius * 0.42;
    const gy2 = cy - Math.sin(phase) * radius * 0.30;
    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    grad.addColorStop(0.00, colors[0]);
    grad.addColorStop(0.28, colors[1]);
    grad.addColorStop(0.56, colors[2]);
    grad.addColorStop(0.82, colors[3]);
    grad.addColorStop(1.00, "rgba(0,0,0,0)");
    ctx.shadowBlur = 80 + highs * 110;
    ctx.shadowColor = colors[1];
    ctx.globalAlpha = alpha * intensity;
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  const drawLiquidHighlight = (seed, color, alpha = 1, scale = 1, turn = 1, widthScale = 1) => {
    // A soft luminous vein made from a narrow filled band, not a marker stroke.
    drawSoftBand(
      seed,
      [
        `rgba(255,255,255,${0.42 + highs * 0.16})`,
        `rgba(${color},${0.52 + highs * 0.20})`,
        `rgba(255,255,255,${0.16 + highs * 0.16})`,
        `rgba(${color},${0.06})`,
      ],
      alpha * (0.52 + highs * 0.42),
      scale,
      turn,
      widthScale,
      3.5
    );
  };

  ctx.save();

  // Deep cosmic aura around the orb, kept dark so the liquid reads as light.
  ctx.globalCompositeOperation = "screen";
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius * 2.1);
  aura.addColorStop(0, `rgba(30, 210, 255, ${0.050 * intensity + bass * 0.018})`);
  aura.addColorStop(0.35, `rgba(50, 70, 255, ${0.045 * intensity})`);
  aura.addColorStop(0.64, `rgba(255, 45, 225, ${0.022 * intensity + mids * 0.015})`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Transparent glass body.
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const glass = ctx.createRadialGradient(cx - radius * 0.30, cy - radius * 0.38, radius * 0.02, cx, cy, radius * 1.04);
  glass.addColorStop(0, `rgba(225, 250, 255, ${0.050 + highs * 0.018})`);
  glass.addColorStop(0.32, `rgba(40, 130, 255, ${0.075 * intensity})`);
  glass.addColorStop(0.70, `rgba(10, 12, 60, ${0.42 * intensity})`);
  glass.addColorStop(1, `rgba(0, 3, 18, ${0.70 * intensity})`);
  ctx.fillStyle = glass;
  ctx.fill();

  ctx.save();
  drawOrbClip();

  // Soft internal shadows / depth pockets, no particles.
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "blur(10px)";
  for (let i = 0; i < 7; i++) {
    const a = time * (0.000055 + i * 0.000012) + i * 2.24;
    const px = cx + Math.cos(a) * radius * (0.12 + (i % 3) * 0.22);
    const py = cy + Math.sin(a * 0.86) * radius * (0.10 + (i % 2) * 0.22);
    const pr = radius * (0.20 + (i % 4) * 0.045 + Math.sin(time * 0.00021 + i) * 0.025);
    const pocket = ctx.createRadialGradient(px, py, 0, px, py, pr);
    pocket.addColorStop(0, `rgba(0, 0, 20, ${0.52 * intensity})`);
    pocket.addColorStop(0.55, `rgba(0, 8, 45, ${0.25 * intensity})`);
    pocket.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pocket;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = "none";

  // Rear, middle, and front liquid layers. These are broad filled sheets, not strokes.
  drawSoftBand(0.06, [
    `rgba(60,230,255,${0.22 + bass * 0.05})`,
    `rgba(0,130,255,${0.42 + bass * 0.08})`,
    `rgba(80,60,255,${0.18})`,
    `rgba(0,0,0,0)`,
  ], 0.72, 1.18, 1, 1.28, 15);

  drawSoftBand(0.28, [
    `rgba(255,255,255,${0.15 + highs * 0.06})`,
    `rgba(255,45,225,${0.58 + mids * 0.12})`,
    `rgba(105,40,255,${0.36})`,
    `rgba(0,0,0,0)`,
  ], 0.88, 1.05, -1, 1.08, 9);

  drawSoftBand(0.52, [
    `rgba(255,250,210,${0.18 + highs * 0.08})`,
    `rgba(255,155,35,${0.48 + highs * 0.10})`,
    `rgba(255,35,185,${0.28})`,
    `rgba(0,0,0,0)`,
  ], 0.72, 0.90, 1, 0.92, 10);

  drawSoftBand(0.73, [
    `rgba(230,255,255,${0.20 + highs * 0.05})`,
    `rgba(35,235,255,${0.62 + highs * 0.10})`,
    `rgba(20,105,255,${0.30})`,
    `rgba(0,0,0,0)`,
  ], 0.86, 0.96, -1, 0.86, 7);

  drawSoftBand(0.91, [
    `rgba(255,255,255,${0.10 + highs * 0.05})`,
    `rgba(175,80,255,${0.36 + mids * 0.08})`,
    `rgba(20,80,255,${0.18})`,
    `rgba(0,0,0,0)`,
  ], 0.48, 1.22, 1, 1.42, 20);

  // Phase 2.21: no marker-like top strokes.
  // The bright motion now comes from wider, blurred liquid sheets so the center reads as
  // flowing plasma rather than drawn lines.
  drawSoftBand(0.17, [
    `rgba(255,255,255,${0.13 + highs * 0.04})`,
    `rgba(45,235,255,${0.34 + highs * 0.10})`,
    `rgba(30,105,255,${0.20})`,
    `rgba(0,0,0,0)`,
  ], 0.50, 0.96, 1, 0.74, 15);

  drawSoftBand(0.47, [
    `rgba(255,240,255,${0.12 + highs * 0.04})`,
    `rgba(255,65,225,${0.32 + mids * 0.10})`,
    `rgba(120,45,255,${0.18})`,
    `rgba(0,0,0,0)`,
  ], 0.48, 0.92, -1, 0.70, 16);

  drawSoftBand(0.63, [
    `rgba(255,245,210,${0.10 + highs * 0.03})`,
    `rgba(255,175,65,${0.24 + highs * 0.08})`,
    `rgba(255,55,180,${0.15})`,
    `rgba(0,0,0,0)`,
  ], 0.38, 0.84, 1, 0.64, 18);

  // Gentle refractive wash over the whole orb to merge layers into liquid.
  ctx.globalCompositeOperation = "screen";
  ctx.filter = "blur(14px)";
  const wash = ctx.createRadialGradient(cx - radius * 0.12, cy + radius * 0.06, radius * 0.05, cx, cy, radius * 0.94);
  wash.addColorStop(0, `rgba(255,255,255,${0.045 + highs * 0.025})`);
  wash.addColorStop(0.45, `rgba(30,210,255,${0.085 * intensity})`);
  wash.addColorStop(0.78, `rgba(255,45,225,${0.055 * intensity})`);
  wash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.92, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = "none";

  ctx.restore();

  // Glass rim and selective crescent glows.
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.006, 0, Math.PI * 2);
  ctx.lineWidth = 1.25 + bass * 1.45;
  ctx.shadowBlur = 38 + highs * 70;
  ctx.shadowColor = `rgba(75,230,255, ${0.42 + highs * 0.30})`;
  ctx.strokeStyle = `rgba(110,235,255, ${0.26 * intensity + highs * 0.10})`;
  ctx.stroke();

  const drift = Math.sin(time * 0.00022) * 0.22 + mids * 0.06;
  [
    { a: 0.55, b: 1.46, c: "80,235,255", alpha: 0.30, w: 2.6 },
    { a: -0.18, b: 0.24, c: "255,88,235", alpha: 0.18, w: 1.8 },
    { a: 1.62, b: 1.83, c: "255,185,75", alpha: 0.12, w: 1.4 },
  ].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (1.015 + bass * 0.012), Math.PI * (r.a + drift), Math.PI * (r.b + drift));
    ctx.lineWidth = r.w + bass * 1.2;
    ctx.shadowBlur = 44 + highs * 72;
    ctx.shadowColor = `rgba(${r.c}, ${0.48 + highs * 0.26})`;
    ctx.strokeStyle = `rgba(${r.c}, ${(r.alpha + highs * 0.08) * intensity})`;
    ctx.stroke();
  });

  // Protected moving orbital nodes — preserved exactly as the musical rim punctuation.
  drawMovingOrbitalNodes(ctx, cx, cy, radius, time, bass, mids, highs, intensity);

  ctx.restore();
}



// Phase 2.23 — Pure Liquid Light Sphere.
// Built from the working plasma version, but removes marker-like strokes entirely.
// The center is now layered soft liquid masses: blurred elliptical glows, plasma clouds,
// and broad traveling glow regions. The protected orbital rim nodes remain unchanged.
function drawPureLiquidLightSphere(ctx, width, height, time, bass, mids, highs, intensity, controls = {}) {
  const glowScale = Math.max(0, controls.glow ?? 0.75);
  const orbScale = Math.max(0, controls.orb ?? 1);
  const causticScale = Math.max(0, controls.caustic ?? 1);
  const flowScale = Math.max(0, controls.flow ?? 1);
  const plasmaScale = Math.max(0, controls.plasma ?? 1);
  const beatPulse = Math.max(0, controls.beat ?? 0);
  const beatGlow = beatPulse * beatPulse;
  const flowMotion = Math.min(2.4, flowScale);
  const flowOpacity = 0.45 + Math.min(1.25, flowScale) * 0.44;
  const membraneScale = 0.18 + orbScale * 0.82;
  const motionScale = 0.35 + flowMotion * 1.95;
  const foldScale = 0.55 + flowMotion * 1.55 + causticScale * 0.45 + beatPulse * 1.35;
  const cx = width * 0.5;
  const cy = height * (0.50 + Math.sin(time * 0.00012 * motionScale) * 0.018 - beatPulse * 0.016);
  const base = Math.min(width, height);
  const radius = base * (0.320 + membraneScale * 0.034 + bass * 0.024 + beatPulse * 0.050) * (0.94 + intensity * 0.06);
  const energy = Math.min(1, bass * 0.45 + mids * 0.45 + highs * 0.58 + beatPulse * 0.48);
  const t = time * 0.001 * motionScale + beatPulse * 0.38;

  const clipOrb = () => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.988, 0, Math.PI * 2);
    ctx.clip();
  };

  const drawGradientBlob = ({ x, y, rx, ry, rot = 0, stops, alpha = 1, blur = 6, op = "screen" }) => {
    ctx.save();
    ctx.globalCompositeOperation = op;
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(-0.22, -0.18, 0.02, 0, 0, 1);
    stops.forEach(([stop, color]) => g.addColorStop(stop, color));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawLiquidMass = ({ seed, colorA, colorB, colorC, layer = 1, alpha = 1, scale = 1, blur = 7 }) => {
    const phase = seed * 18.731;
    const viscosity = 0.68 + bass * 0.22 + mids * 0.34;
    const drift = t * (0.085 + seed * 0.026) * viscosity;
    const undertow = Math.sin(t * (0.26 + seed * 0.05) + phase * 0.7) * foldScale;
    const fold =
      Math.sin(t * (0.62 + seed * 0.12) + phase) * (0.10 + mids * 0.14) * foldScale +
      Math.sin(t * (0.31 + seed * 0.06) + phase * 2.3) * (0.040 + bass * 0.075) * foldScale;
    const stretch =
      1 +
      Math.sin(t * (0.42 + seed * 0.08) + phase * 1.6) * (0.18 + flowMotion * 0.13) +
      Math.cos(t * 0.24 + phase * 0.9) * (0.06 + flowMotion * 0.08) +
      bass * 0.30;
    const x =
      cx +
      Math.cos(drift + phase + undertow * 0.26) * radius * (0.15 + seed * 0.060 + flowMotion * 0.074) +
      Math.sin(t * 0.24 + phase) * radius * (0.10 + mids * 0.060 + flowMotion * 0.052);
    const y =
      cy +
      Math.sin(drift * 0.72 + phase + undertow * 0.20) * radius * (0.10 + seed * 0.04 + flowMotion * 0.058) +
      Math.cos(t * 0.22 + phase * 1.2) * radius * (0.09 + bass * 0.055 + flowMotion * 0.042);
    const rx = radius * (0.34 + layer * 0.17 + fold) * stretch * scale;
    const ry = radius * (0.095 + layer * 0.044 - fold * 0.18) * (0.92 + bass * 0.12) * scale;
    const rot = phase + drift * 1.45 + undertow * 0.55 + Math.sin(t * 0.13 + phase) * 0.82;

    // Outer glow body: soft enough to merge, but not so blurred that it becomes fog.
    drawGradientBlob({
      x, y, rx: rx * 1.08, ry: ry * 0.82, rot,
      alpha: alpha * (0.42 + energy * 0.12) * intensity * flowOpacity,
      blur: Math.max(4, blur * 0.45 + glowScale * 1.2),
      stops: [
        [0.00, `rgba(255,255,255,${0.22 + highs * 0.05})`],
        [0.18, colorA],
        [0.54, colorB],
        [0.86, colorC],
        [1.00, "rgba(0,10,40,0.015)"],
      ],
    });

    // Brighter inner core: gives definition without drawing marker strokes.
    drawGradientBlob({
      x: x + Math.cos(rot) * rx * 0.10,
      y: y + Math.sin(rot) * ry * 0.10,
      rx: rx * 0.50,
      ry: ry * 0.24,
      rot: rot + 0.22,
      alpha: alpha * (0.30 + highs * 0.13) * intensity * flowOpacity,
      blur: Math.max(2.4, blur * 0.28),
      stops: [
        [0.00, `rgba(255,255,255,${0.36 + highs * 0.10})`],
        [0.36, colorA],
        [0.78, colorB],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });

    drawGradientBlob({
      x: x - Math.cos(rot) * rx * 0.08,
      y: y - Math.sin(rot) * ry * 0.06,
      rx: rx * 0.26,
      ry: ry * 0.12,
      rot: rot - 0.10,
      alpha: alpha * (0.14 + highs * 0.08 + beatPulse * 0.05) * intensity,
      blur: 2.2 + glowScale * 0.8,
      stops: [
        [0.00, `rgba(245,255,255,${0.32 + highs * 0.12})`],
        [0.44, `rgba(130,245,255,${0.20 + highs * 0.08})`],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });
  };

  const drawMorphingLiquidBody = (seed, colors, alpha = 1, scale = 1) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `blur(${10 + glowScale * 5 + beatPulse * 4}px)`;
    ctx.globalAlpha = alpha * intensity * flowOpacity * 0.72;

    const phase = seed * 17.37;
    const count = 170;
    const drift = t * (0.085 + seed * 0.024);
    const wobble = 1 + bass * 0.10 + beatPulse * 0.16;

    ctx.beginPath();
    for (let i = 0; i <= count; i++) {
      const p = i / count;
      const angle = p * Math.PI * 2;
      const flow =
        Math.sin(angle * 2.0 + drift + phase) * (0.16 + flowMotion * 0.07) +
        Math.cos(angle * 3.4 - drift * 0.72 + phase) * (0.10 + mids * 0.06) +
        Math.sin(angle * 5.2 + t * 0.24 + phase) * 0.045;
      const r =
        radius *
        scale *
        (0.34 + flow + bass * 0.025 + beatPulse * 0.045 + flowMotion * 0.010) *
        wobble;
      const x =
        cx +
        Math.cos(angle + Math.sin(t * 0.12 + phase) * 0.18) * r * (1.02 + mids * 0.035) +
        Math.sin(t * 0.18 + phase) * radius * 0.075;
      const y =
        cy +
        Math.sin(angle * 0.92 + Math.cos(t * 0.10 + phase) * 0.16) * r * (0.78 + bass * 0.030) +
        Math.cos(t * 0.15 + phase) * radius * 0.055;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const gx = cx + Math.cos(phase + drift) * radius * 0.20;
    const gy = cy + Math.sin(phase + drift * 0.76) * radius * 0.14;
    const gradient = ctx.createRadialGradient(gx, gy, radius * 0.03, cx, cy, radius * 0.78);
    colors.forEach(([stop, color]) => gradient.addColorStop(stop, color));
    ctx.shadowBlur = 20 + glowScale * 34 + highs * 18 + beatPulse * 24;
    ctx.shadowColor = colors[1]?.[1] || colors[0][1];
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  };

  const drawMorphingLiquidTexture = (seed, color, alpha = 1, scale = 1) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const phase = seed * 29.73;
    const count = 260;
    const drift = t * (0.15 + seed * 0.035);

    for (let i = 0; i < count; i++) {
      const n = i / (count - 1);
      const golden = i * 2.399963 + phase;
      const radialSeed = ((i * 37) % count) / count;
      const core = Math.sqrt(radialSeed);
      const angle =
        golden +
        Math.sin(drift + n * Math.PI * 4.0 + phase) * (0.18 + flowMotion * 0.055);
      const shell =
        radius *
        scale *
        core *
        (0.42 + Math.sin(n * Math.PI * 5.0 + drift + phase) * 0.045 + beatPulse * 0.035);
      const swirl =
        Math.sin(drift * 1.4 + n * Math.PI * 7.0 + phase) *
        radius *
        (0.010 + flowMotion * 0.010);
      const x =
        cx +
        Math.cos(angle) * shell * (1.03 + mids * 0.030) +
        Math.cos(angle + Math.PI * 0.5) * swirl;
      const y =
        cy +
        Math.sin(angle * 0.90) * shell * (0.76 + bass * 0.025) +
        Math.sin(angle + Math.PI * 0.5) * swirl * 0.60;

      const edgeFade = Math.max(0, 1 - Math.pow(core, 2.6));
      const sparkle = Math.max(0, Math.sin(t * 2.8 + i * 0.63 + phase));
      const size =
        radius *
        (0.0011 + radialSeed * 0.0023 + highs * 0.0015 + beatPulse * 0.0015);
      const particleAlpha =
        alpha *
        intensity *
        flowOpacity *
        edgeFade *
        (0.004 + sparkle * 0.010 + highs * 0.010 + beatGlow * 0.014);

      if (particleAlpha < 0.0008) continue;

      const glowRadius = size * (4.8 + glowScale * 3.2 + beatPulse * 3.0);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      glow.addColorStop(0, `rgba(255,255,255,${Math.min(0.30, particleAlpha * 6.0)})`);
      glow.addColorStop(0.34, `rgba(${color},${Math.min(0.24, particleAlpha * 4.2)})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawFrontLiquidLobe = (seed, colors, alpha = 1, scale = 1) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `blur(${5 + glowScale * 2.2 + beatPulse * 2}px)`;
    ctx.globalAlpha = alpha * intensity * flowOpacity;

    const phase = seed * 15.41;
    const drift = t * (0.105 + seed * 0.018);
    const breath =
      1 +
      Math.sin(t * (0.74 + seed * 0.10) + phase) * (0.16 + flowMotion * 0.050) +
      Math.cos(t * (0.44 + seed * 0.08) + phase * 1.7) * 0.080 +
      bass * 0.15 +
      beatPulse * 0.28;
    const melt =
      Math.sin(t * (0.42 + seed * 0.05) + phase * 2.2) * (0.08 + mids * 0.05) +
      Math.cos(t * 0.31 + phase) * 0.040;
    const x =
      cx +
      Math.cos(drift + phase + melt * 0.55) * radius * (0.11 + flowMotion * 0.030) +
      Math.sin(t * 0.32 + phase) * radius * (0.050 + flowMotion * 0.014);
    const y =
      cy +
      Math.sin(drift * 0.74 + phase + melt * 0.40) * radius * (0.08 + flowMotion * 0.026) +
      Math.cos(t * 0.24 + phase) * radius * (0.042 + bass * 0.018);
    const rx =
      radius *
      scale *
      (0.25 + mids * 0.050 + Math.sin(t * 0.46 + phase) * 0.070 + beatPulse * 0.070) *
      breath;
    const ry =
      radius *
      scale *
      (0.18 + bass * 0.040 + Math.cos(t * 0.42 + phase) * 0.060 + beatPulse * 0.055) *
      (1 + Math.sin(t * 0.56 + phase * 0.8) * 0.12 + beatPulse * 0.12);
    const rot = Math.sin(t * 0.18 + phase) * 0.26 + melt * 0.28;

    drawGradientBlob({
      x,
      y,
      rx,
      ry,
      rot,
      alpha,
      blur: 4.5 + glowScale * 1.5,
      stops: colors,
    });

    drawGradientBlob({
      x: x - rx * 0.12,
      y: y - ry * 0.15,
      rx: rx * 0.48,
      ry: ry * 0.36,
      rot: rot + 0.18,
      alpha: alpha * (0.34 + highs * 0.12 + beatPulse * 0.08),
      blur: 2.4 + glowScale * 0.7,
      stops: [
        [0.00, `rgba(245,255,255,${0.25 + highs * 0.08})`],
        [0.44, `rgba(115,238,255,${0.18 + highs * 0.07})`],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });

    drawGradientBlob({
      x: x + Math.sin(t * 0.36 + phase) * rx * 0.13,
      y: y + Math.cos(t * 0.30 + phase) * ry * 0.08,
      rx: rx * (0.54 + beatPulse * 0.10),
      ry: ry * (0.42 + bass * 0.06),
      rot: rot - 0.28,
      alpha: alpha * (0.42 + mids * 0.18 + beatPulse * 0.18),
      blur: 5.5 + glowScale * 2.0,
      stops: [
        [0.00, `rgba(255,210,255,${0.34 + mids * 0.12})`],
        [0.36, `rgba(255,65,220,${0.28 + highs * 0.08})`],
        [0.72, `rgba(145,80,255,${0.13 + bass * 0.04})`],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });

    ctx.restore();
  };

  const drawParticularLiquidWisps = (seed, color, alpha = 1, offset = 0) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const phase = seed * 21.17;
    const count = 150;
    const fallSpeed = t * (0.24 + seed * 0.06);

    for (let i = 0; i < count; i++) {
      const p = i / (count - 1);
      const strand = ((i * 17) % 11) / 10 - 0.5;
      const dust = Math.sin(i * 19.19 + seed * 41.7) * 0.5 + 0.5;
      const fade = Math.sin(p * Math.PI);
      const curl =
        Math.sin(p * Math.PI * 3.6 + fallSpeed + phase + strand * 1.7) *
        radius *
        (0.035 + flowMotion * 0.020);
      const x =
        cx +
        radius * (offset + strand * (0.12 + p * 0.10)) +
        curl +
        Math.sin(t * 0.58 + i * 0.31 + phase) * radius * 0.018;
      const y =
        cy -
        radius * (0.22 + dust * 0.08) +
        p * p * radius * (0.78 + flowMotion * 0.12 + beatPulse * 0.18) +
        Math.cos(t * 0.42 + i * 0.23 + phase) * radius * 0.018;

      const twinkle = Math.max(0, Math.sin(t * 2.4 + i * 0.91 + phase));
      const size = radius * (0.0016 + dust * 0.0026 + beatPulse * 0.0018 + highs * 0.0016);
      const particleAlpha =
        alpha *
        intensity *
        flowOpacity *
        fade *
        (0.006 + twinkle * 0.010 + highs * 0.010 + beatGlow * 0.014);

      if (particleAlpha < 0.001) continue;

      const glowRadius = size * (7 + glowScale * 4 + beatPulse * 4);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      glow.addColorStop(0, `rgba(255,245,255,${Math.min(0.36, particleAlpha * 6)})`);
      glow.addColorStop(0.38, `rgba(${color},${Math.min(0.26, particleAlpha * 4)})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawDepthPocket = (seed, alpha = 1) => {
    const phase = seed * 12.41;
    const a = t * (0.052 + seed * 0.014) + phase;
    drawGradientBlob({
      x: cx + Math.cos(a) * radius * (0.10 + seed * 0.10),
      y: cy + Math.sin(a * 0.86) * radius * (0.08 + seed * 0.08),
      rx: radius * (0.18 + seed * 0.05),
      ry: radius * (0.10 + seed * 0.035),
      rot: a + phase,
      alpha: alpha * intensity,
      blur: 9,
      op: "source-over",
      stops: [
        [0.00, "rgba(0,2,22,0.30)"],
        [0.58, "rgba(0,8,46,0.13)"],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });
  };

  const drawInternalMembraneBoundary = () => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(t * 0.09) * 0.10);
    ctx.scale(0.96 + Math.sin(t * 0.12) * 0.018, 1.04 + Math.cos(t * 0.11) * 0.020);

    ctx.beginPath();
    ctx.arc(0, 0, radius * (0.985 + bass * 0.012 + beatPulse * 0.012), Math.PI * -0.56, Math.PI * 1.38);
    ctx.lineWidth = 0.75 + glowScale * 0.55 + beatPulse * 0.9;
    ctx.shadowBlur = 18 + glowScale * 22 + beatPulse * 28;
    ctx.shadowColor = `rgba(80,225,255, ${0.20 + highs * 0.10 + beatPulse * 0.12})`;
    ctx.strokeStyle = `rgba(120,235,255, ${(0.055 + highs * 0.028 + beatPulse * 0.050) * intensity * membraneScale})`;
    ctx.stroke();

    ctx.restore();
  };

  const drawLivingCoreBloom = () => {
    const pulse = 1 + bass * 0.16 + beatPulse * 0.34 + Math.sin(t * 0.72) * 0.045;
    const coreX = cx - radius * (0.12 + Math.sin(t * 0.16) * 0.045 - beatPulse * 0.052);
    const coreY = cy - radius * (0.08 + Math.cos(t * 0.19) * 0.035 + beatPulse * 0.060);

    drawGradientBlob({
      x: coreX,
      y: coreY,
      rx: radius * (0.26 + mids * 0.045) * pulse,
      ry: radius * (0.15 + bass * 0.030) * pulse,
      rot: -0.20 + Math.sin(t * 0.18) * 0.28,
      alpha: (0.34 + highs * 0.10 + beatPulse * 0.22) * intensity * glowScale,
      blur: 24 + glowScale * 16 + beatPulse * 18,
      stops: [
        [0.00, `rgba(255,255,255,${0.30 + highs * 0.10})`],
        [0.24, `rgba(255,185,245,${0.34 + mids * 0.10})`],
        [0.58, `rgba(255,75,210,${0.16 + highs * 0.06})`],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });

    drawGradientBlob({
      x: coreX + radius * 0.18,
      y: coreY + radius * 0.04,
      rx: radius * (0.72 + bass * 0.08 + beatPulse * 0.12),
      ry: radius * (0.44 + mids * 0.08 + beatPulse * 0.10),
      rot: 0.24 + Math.sin(t * 0.13) * 0.34,
      alpha: (0.30 + energy * 0.08 + beatPulse * 0.14) * intensity * plasmaScale,
      blur: 38 + glowScale * 22 + beatPulse * 18,
      stops: [
        [0.00, `rgba(130,250,255,${0.30 + highs * 0.08})`],
        [0.44, `rgba(25,150,255,${0.26 + bass * 0.05})`],
        [0.78, `rgba(25,70,170,${0.13 + mids * 0.03})`],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });
  };

  const drawDescendingMembraneCurrents = (seed, color, alpha = 1, offset = 0) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.filter = `blur(${5 + glowScale * 4 + beatPulse * 4}px)`;

    const strands = 7;
    const segments = 120;
    const phase = seed * 10.37;

    for (let strand = 0; strand < strands; strand++) {
      const lane = (strand - (strands - 1) / 2) / strands;
      const lanePhase = phase + strand * 0.84;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const p = i / segments;
        const fall = p * p;
        const sway =
          Math.sin(t * (0.34 + seed * 0.05) + p * Math.PI * 2.2 + lanePhase) *
          radius *
          (0.035 + flowMotion * 0.048 + beatPulse * 0.035);
        const x =
          cx +
          radius * (lane * 0.58 + offset) +
          sway +
          Math.sin(p * Math.PI * 3.0 + t * 0.20 + lanePhase) * radius * 0.035;
        const y =
          cy -
          radius * (0.18 + Math.sin(lanePhase) * 0.04) +
          fall * radius * (0.78 + bass * 0.12 + flowMotion * 0.11 + beatPulse * 0.18);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const taper = Math.sin(((strand + 1) / (strands + 1)) * Math.PI);
      ctx.lineWidth = (9 + taper * 12 + highs * 4 + beatPulse * 10) * Math.max(0.20, causticScale);
      ctx.shadowBlur = 38 + glowScale * 50 + highs * 34 + beatPulse * 56;
      ctx.shadowColor = `rgba(${color}, ${0.14 + highs * 0.12 + beatPulse * 0.16})`;
      ctx.strokeStyle = `rgba(${color}, ${(0.014 + highs * 0.020 + beatPulse * 0.020) * alpha * intensity * flowOpacity * causticScale})`;
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawFluidParticleWisp = (seed, color, alpha = 1, offset = 0, spread = 1) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const phase = seed * 13.91;
    const count = 72;
    const stream = t * (0.18 + seed * 0.05) + phase;

    for (let i = 0; i < count; i++) {
      const p = i / (count - 1);
      const lane = Math.sin(i * 12.989 + seed * 78.233) * 0.5 + 0.5;
      const depth = Math.sin(i * 4.371 + seed * 19.19) * 0.5 + 0.5;
      const fall = p * p;
      const curl =
        stream +
        p * Math.PI * (1.15 + seed * 0.32) +
        Math.sin(p * Math.PI * 3.4 + t * 0.42 + phase) * (0.36 + mids * 0.24);
      const centerPull = Math.sin(p * Math.PI) * radius * (0.08 + flowMotion * 0.074);
      const side =
        (lane - 0.5) *
        radius *
        (0.36 + spread * 0.24) *
        (0.26 + Math.sin(p * Math.PI) * 0.74);
      const pulsePush = beatPulse * radius * (0.06 + depth * 0.08);
      const x =
        cx +
        offset * radius +
        Math.cos(curl) * centerPull +
        side +
        Math.sin(t * 0.62 + i * 0.37 + phase) * radius * (0.012 + beatPulse * 0.018);
      const y =
        cy -
        radius * (0.22 + depth * 0.08) +
        fall * radius * (0.86 + bass * 0.10 + flowMotion * 0.15 + beatPulse * 0.22) +
        Math.sin(curl * 0.8) * radius * (0.035 + flowMotion * 0.032) +
        pulsePush * p;

      const fade = Math.sin(p * Math.PI);
      const sparkle = Math.max(0, Math.sin(t * 2.1 + i * 1.77 + phase));
      const size = radius * (0.0018 + depth * 0.0038 + beatPulse * 0.0025 + highs * 0.0022) * (0.60 + fade);
      const particleAlpha =
        alpha *
        intensity *
        flowOpacity *
        causticScale *
        fade *
        (0.006 + sparkle * 0.010 + highs * 0.012 + beatGlow * 0.014);

      if (particleAlpha <= 0.0012) continue;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * (5 + glowScale * 5 + beatPulse * 4));
      glow.addColorStop(0, `rgba(255,255,255,${Math.min(0.32, particleAlpha * 5.0)})`);
      glow.addColorStop(0.34, `rgba(${color},${Math.min(0.24, particleAlpha * 3.4)})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size * (5 + glowScale * 5 + beatPulse * 4), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawLiquidVeil = (seed, colors, alpha = 1, scale = 1, blur = 10) => {
    const phase = seed * Math.PI * 2;
    const points = 140;
    const drift = t * (0.11 + seed * 0.035) * (0.72 + mids * 0.28);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    ctx.globalAlpha = alpha * intensity;
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const p = i / points;
      const angle =
        phase +
        drift +
        p * Math.PI * 2 +
        Math.sin(p * Math.PI * 4.0 + t * 0.34 + phase) * (0.20 + mids * 0.20) +
        Math.cos(p * Math.PI * 7.0 - t * 0.27 + phase) * (0.08 + highs * 0.05);
      const liquify =
        Math.sin(p * Math.PI * 3.0 + t * 0.42 + phase) * (0.13 + bass * 0.09) +
        Math.cos(p * Math.PI * 5.0 - t * 0.21 + seed) * 0.055;
      const r = radius * scale * (0.26 + 0.40 * Math.sin(p * Math.PI) + liquify);
      const x =
        cx +
        Math.cos(angle) * r * (0.96 + mids * 0.05) +
        Math.sin(t * 0.12 + phase) * radius * 0.10;
      const y =
        cy +
        Math.sin(angle * 0.78) * r * (0.68 + bass * 0.05) +
        Math.cos(p * Math.PI * 2 + t * 0.20 + phase) * radius * 0.09;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    for (let i = points; i >= 0; i--) {
      const p = i / points;
      const angle =
        phase +
        drift +
        p * Math.PI * 2 +
        Math.sin(p * Math.PI * 4.0 + t * 0.34 + phase) * (0.20 + mids * 0.20) +
        Math.cos(p * Math.PI * 7.0 - t * 0.27 + phase) * (0.08 + highs * 0.05);
      const liquify =
        Math.sin(p * Math.PI * 3.0 + t * 0.42 + phase) * (0.13 + bass * 0.09) +
        Math.cos(p * Math.PI * 5.0 - t * 0.21 + seed) * 0.055;
      const r = radius * scale * (0.18 + 0.24 * Math.sin(p * Math.PI) + liquify * 0.62);
      const x =
        cx +
        Math.cos(angle + 0.24 + Math.sin(t * 0.16 + phase) * 0.12) * r +
        Math.sin(t * 0.12 + phase) * radius * 0.10;
      const y =
        cy +
        Math.sin(angle * 0.78 + 0.18) * r * (0.68 + bass * 0.05) +
        Math.cos(p * Math.PI * 2 + t * 0.20 + phase) * radius * 0.09;

      ctx.lineTo(x, y);
    }

    ctx.closePath();
    const gx = cx + Math.cos(phase + drift) * radius * 0.34;
    const gy = cy + Math.sin(phase + drift * 0.8) * radius * 0.26;
    const gradient = ctx.createRadialGradient(gx, gy, radius * 0.03, cx, cy, radius * 0.78);
    colors.forEach(([stop, color]) => gradient.addColorStop(stop, color));
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 54 + highs * 80;
    ctx.shadowColor = colors[1]?.[1] || colors[0][1];
    ctx.fill();
    ctx.restore();
  };

  const drawRefractiveCurrent = (seed, color, alpha = 1) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.filter = `blur(${8 + glowScale * 6 + beatPulse * 4}px)`;

    const phase = seed * 9.713;
    const turns = 1.25 + seed * 0.55;
    const segments = 150;

    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const p = i / segments;
      const ribbon = Math.sin(p * Math.PI);
      const a =
        phase +
        t * (0.12 + seed * 0.028) +
        (p - 0.5) * Math.PI * turns +
        Math.sin(p * Math.PI * 4.2 + t * 0.38 + phase) * (0.20 + mids * 0.16);
      const r =
        radius *
        (0.12 + ribbon * (0.54 + bass * 0.07) + Math.sin(p * Math.PI * 7.0 - t * 0.31 + phase) * 0.035);
      const x = cx + Math.cos(a) * r * (0.94 + mids * 0.04);
      const y = cy + Math.sin(a * 0.82) * r * (0.64 + bass * 0.05);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineWidth = 12 + highs * 4.4 + bass * 2.4 + beatPulse * 5;
    ctx.shadowBlur = 54 + glowScale * 72 + highs * 50 + beatPulse * 50;
    ctx.shadowColor = `rgba(${color}, ${0.13 + highs * 0.10 + beatPulse * 0.12})`;
    ctx.strokeStyle = `rgba(${color}, ${(0.006 + highs * 0.012 + beatPulse * 0.012) * alpha * intensity * causticScale})`;
    ctx.stroke();
    ctx.restore();
  };

  const drawLiquidFilamentSheet = (seed, color, alpha = 1, scale = 1) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `blur(${13 + glowScale * 8 + beatPulse * 4}px)`;

    const phase = seed * 12.913;
    const sheets = 2;
    const segments = 120;
    const sheetDrift = t * (0.070 + seed * 0.018) * (0.64 + mids * 0.24);

    for (let sheet = 0; sheet < sheets; sheet++) {
      const lane = (sheet - 0.5) * 0.16;
      const lanePhase = phase + sheet * 0.72;
      const spine = [];
      const left = [];
      const right = [];

      for (let i = 0; i <= segments; i++) {
        const p = i / segments;
        const taper = Math.sin(p * Math.PI);
        const stream =
          phase +
          sheetDrift +
          (p - 0.5) * Math.PI * (0.72 + seed * 0.10) +
          Math.sin(p * Math.PI * 2.8 + t * 0.22 + lanePhase) * (0.42 + mids * 0.18) +
          Math.cos(p * Math.PI * 5.4 - t * 0.18 + phase) * 0.12;
        const shear =
          lane * radius * (0.08 + taper * 0.04) +
          Math.sin(p * Math.PI * 3.8 + t * 0.24 + lanePhase) * radius * (0.025 + highs * 0.010);
        const r =
          radius *
          scale *
          (0.11 + taper * (0.32 + bass * 0.025) + Math.sin(p * Math.PI * 3.4 - t * 0.18 + phase) * 0.030);
        const x =
          cx +
          Math.cos(stream) * r * (0.72 + mids * 0.020) +
          Math.cos(stream + Math.PI * 0.5) * shear;
        const y =
          cy +
          Math.sin(stream * 0.90) * r * (0.50 + bass * 0.025) +
          Math.sin(stream + Math.PI * 0.5) * shear * 0.40;

        spine.push({ x, y, taper });
      }

      for (let i = 0; i < spine.length; i++) {
        const current = spine[i];
        const prev = spine[Math.max(0, i - 1)];
        const next = spine[Math.min(spine.length - 1, i + 1)];
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = Math.max(0.0001, Math.hypot(dx, dy));
        const nx = -dy / len;
        const ny = dx / len;
        const widthPulse = 0.72 + Math.sin(i * 0.060 + t * 0.30 + lanePhase) * 0.16;
        const halfWidth = radius * (0.085 + sheet * 0.018 + highs * 0.012 + beatPulse * 0.020) * current.taper * widthPulse;

        left.push({ x: current.x + nx * halfWidth, y: current.y + ny * halfWidth });
        right.push({ x: current.x - nx * halfWidth, y: current.y - ny * halfWidth });
      }

      ctx.beginPath();
      left.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
      ctx.closePath();

      const glow = ctx.createRadialGradient(
        cx + Math.cos(phase + sheetDrift) * radius * 0.18,
        cy + Math.sin(phase + sheetDrift) * radius * 0.12,
        radius * 0.02,
        cx,
        cy,
        radius * 0.72
      );
      glow.addColorStop(0.00, `rgba(230,255,255,${0.08 + highs * 0.025})`);
      glow.addColorStop(0.26, `rgba(75,225,255,${0.16 + highs * 0.045})`);
      glow.addColorStop(0.58, `rgba(${color},${0.045 + mids * 0.018})`);
      glow.addColorStop(0.82, `rgba(20,105,230,${0.035 + bass * 0.014})`);
      glow.addColorStop(1.00, "rgba(0,0,0,0)");

      ctx.globalAlpha = alpha * intensity * flowOpacity * causticScale * (0.36 - sheet * 0.06);
      ctx.shadowBlur = 54 + glowScale * 72 + highs * 40;
      ctx.shadowColor = `rgba(95,230,255, ${0.16 + highs * 0.14})`;
      ctx.fillStyle = glow;
      ctx.fill();
    }

    ctx.restore();
  };

  ctx.save();

  // Dark cinematic aura around the sphere.
  ctx.globalCompositeOperation = "screen";
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.04, cx, cy, radius * 2.05);
  aura.addColorStop(0, `rgba(30,210,255,${(0.018 + glowScale * 0.014) * intensity * plasmaScale + bass * 0.008})`);
  aura.addColorStop(0.34, `rgba(50,80,255,${(0.014 + glowScale * 0.010) * intensity * plasmaScale})`);
  aura.addColorStop(0.62, `rgba(255,40,220,${(0.007 + glowScale * 0.006) * intensity * plasmaScale + mids * 0.003})`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Transparent glass body, darker than the prior frosted version.
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const glass = ctx.createRadialGradient(cx - radius * 0.30, cy - radius * 0.36, radius * 0.01, cx, cy, radius * 1.08);
  glass.addColorStop(0, `rgba(235,252,255,${(0.010 + glowScale * 0.010) * orbScale + highs * 0.004})`);
  glass.addColorStop(0.32, `rgba(18,100,235,${0.018 * intensity * orbScale})`);
  glass.addColorStop(0.72, `rgba(5,9,48,${0.16 * intensity * orbScale})`);
  glass.addColorStop(1, `rgba(0,2,18,${0.36 * intensity * orbScale})`);
  ctx.fillStyle = glass;
  ctx.fill();

  ctx.save();
  clipOrb();

  // Rear layer: darker, slower masses to create depth without punching visible holes.
  drawDepthPocket(0.10, 0.38 * orbScale);
  drawDepthPocket(0.32, 0.30 * orbScale);
  drawDepthPocket(0.62, 0.26 * orbScale);
  drawMorphingLiquidBody(0.12, [
    [0.00, `rgba(220,255,255,${0.16 + highs * 0.030})`],
    [0.30, `rgba(55,220,255,${0.28 + bass * 0.040})`],
    [0.66, `rgba(35,125,255,${0.20 + mids * 0.030})`],
    [1.00, "rgba(0,0,0,0)"],
  ], 0.78, 1.04);
  drawMorphingLiquidBody(0.47, [
    [0.00, `rgba(240,245,255,${0.090 + highs * 0.020})`],
    [0.34, `rgba(125,205,255,${0.19 + mids * 0.030})`],
    [0.72, `rgba(45,95,220,${0.14 + bass * 0.020})`],
    [1.00, "rgba(0,0,0,0)"],
  ], 0.54, 0.88);
  drawMorphingLiquidTexture(0.11, "90,225,255", 0.72, 1.02);
  drawMorphingLiquidTexture(0.39, "255,95,225", 0.42, 0.88);
  drawMorphingLiquidTexture(0.67, "180,245,255", 0.36, 0.72);
  drawInternalMembraneBoundary();
  drawLiquidMass({
    seed: 0.08,
    colorA: `rgba(45,245,255,${0.66 + highs * 0.07})`,
    colorB: `rgba(0,125,255,${0.48 + bass * 0.04})`,
    colorC: `rgba(6,28,120,0.08)`,
    layer: 1.38,
    alpha: 0.46,
    scale: 0.92,
    blur: 7,
  });
  drawLiquidMass({
    seed: 0.23,
    colorA: `rgba(160,220,255,${0.34 + mids * 0.06})`,
    colorB: `rgba(80,130,255,${0.24})`,
    colorC: `rgba(12,45,120,0.06)`,
    layer: 1.22,
    alpha: 0.34,
    scale: 0.86,
    blur: 7,
  });
  drawLiquidMass({
    seed: 0.41,
    colorA: `rgba(105,235,255,${0.25 + highs * 0.06})`,
    colorB: `rgba(70,125,245,${0.18 + mids * 0.04})`,
    colorC: `rgba(18,55,120,0.055)`,
    layer: 0.96,
    alpha: 0.30,
    scale: 0.78,
    blur: 8,
  });
  drawFluidParticleWisp(0.18, "105,238,255", 0.28, -0.18, 1.30);
  drawFluidParticleWisp(0.42, "255,115,230", 0.16, -0.28, 1.06);

  drawLiquidVeil(0.14, [
    [0.00, `rgba(255,255,255,${0.12 + highs * 0.04})`],
    [0.30, `rgba(45,235,255,${0.24 + bass * 0.06})`],
    [0.64, `rgba(55,80,255,${0.15 + mids * 0.04})`],
    [1.00, "rgba(0,0,0,0)"],
  ], 0.22 * flowOpacity, 1.00, 5 + glowScale * 1.5);

  drawLiquidVeil(0.46, [
    [0.00, `rgba(255,245,255,${0.10 + highs * 0.035})`],
    [0.34, `rgba(255,65,225,${0.22 + mids * 0.07})`],
    [0.70, `rgba(120,55,255,${0.13 + bass * 0.025})`],
    [1.00, "rgba(0,0,0,0)"],
  ], 0.12 * flowOpacity, 0.88, 5 + glowScale * 1.5);

  drawDescendingMembraneCurrents(0.22, "95,230,255", 0.92, -0.06);
  drawDescendingMembraneCurrents(0.57, "255,105,225", 0.52, -0.18);
  drawLivingCoreBloom();

  drawLiquidFilamentSheet(0.21, "90,240,255", 0.12, 0.86);
  drawLiquidFilamentSheet(0.49, "125,205,255", 0.08, 0.78);

  drawLiquidFilamentSheet(0.68, "120,220,255", 0.05, 0.70);

  // Front layer: rounded liquid lobes so foreground motion does not read as turning bars.
  drawFrontLiquidLobe(0.59, [
    [0.00, `rgba(255,245,255,${0.28 + highs * 0.07})`],
    [0.20, `rgba(135,245,255,${0.22 + bass * 0.035})`],
    [0.46, `rgba(255,70,220,${0.26 + mids * 0.07})`],
    [0.72, `rgba(70,135,255,${0.13 + mids * 0.03})`],
    [1.00, "rgba(0,0,0,0)"],
  ], 0.58, 1.08);
  drawFrontLiquidLobe(0.77, [
    [0.00, `rgba(255,235,255,${0.18 + highs * 0.05})`],
    [0.26, `rgba(170,220,255,${0.13 + mids * 0.035})`],
    [0.54, `rgba(245,75,220,${0.18 + highs * 0.05})`],
    [0.80, `rgba(85,110,235,${0.08 + bass * 0.02})`],
    [1.00, "rgba(0,0,0,0)"],
  ], 0.42, 0.90);
  drawParticularLiquidWisps(0.36, "255,95,225", 0.74, -0.05);
  drawParticularLiquidWisps(0.64, "130,235,255", 0.44, 0.12);

  drawDescendingMembraneCurrents(0.81, "135,245,255", 0.26, 0.22);
  drawFluidParticleWisp(0.76, "140,245,255", 0.12, 0.24, 1.12);
  drawRefractiveCurrent(0.18, "135,245,255", 0.10);
  drawRefractiveCurrent(0.51, "255,105,235", 0.06);
  drawRefractiveCurrent(0.84, "255,195,95", 0.04);

  // Broad moving illumination patches: visible glow regions, not lines/strokes.
  for (let i = 0; i < 3; i++) {
    const phase = i * 2.08;
    const a = t * (0.15 + i * 0.025) + phase;
    const pulse = Math.max(0, Math.sin(t * 1.55 + i * 1.18)) * highs;
    drawGradientBlob({
      x: cx + Math.cos(a) * radius * (0.18 + i * 0.045),
      y: cy + Math.sin(a * 0.76) * radius * (0.11 + i * 0.030),
      rx: radius * (0.17 + pulse * 0.08),
      ry: radius * (0.075 + pulse * 0.035),
      rot: a + Math.PI * 0.35,
      alpha: (0.024 + pulse * 0.040) * intensity * flowOpacity * glowScale,
      blur: 3 + glowScale * 1.2,
      stops: [
        [0.00, "rgba(255,255,255,0.34)"],
        [0.34, i % 2 ? "rgba(255,95,235,0.36)" : "rgba(90,245,255,0.44)"],
        [0.72, i % 3 ? "rgba(65,105,255,0.20)" : "rgba(255,180,70,0.18)"],
        [1.00, "rgba(0,0,0,0)"],
      ],
    });
  }

  // Very gentle unifying wash. Low opacity and lower blur keeps definition intact.
  drawGradientBlob({
    x: cx - radius * 0.03 + Math.sin(t * 0.20) * radius * 0.05,
    y: cy + radius * 0.02 + Math.cos(t * 0.18) * radius * 0.035,
    rx: radius * 0.70,
    ry: radius * 0.48,
    rot: Math.sin(t * 0.08) * 0.55,
    alpha: (0.010 + energy * 0.010) * intensity * flowOpacity * glowScale,
    blur: 4 + glowScale * 1.4,
    stops: [
      [0.00, `rgba(255,255,255,${0.030 + highs * 0.010})`],
      [0.42, `rgba(35,220,255,0.045)`],
      [0.76, `rgba(255,45,225,0.024)`],
      [1.00, "rgba(0,0,0,0)"],
    ],
  });

  ctx.restore();

  // Glass rim and selective crescent arcs. These frame the liquid without drawing over it.
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(t * 0.10) * 0.10);
  ctx.scale(0.94 + Math.sin(t * 0.16) * 0.020, 1.06 + Math.cos(t * 0.14) * 0.026);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.006, Math.PI * -0.40, Math.PI * 1.32);
  ctx.lineWidth = (1.8 + bass * 1.5 + glowScale * 1.2 + beatPulse * 2.4) * orbScale;
  ctx.shadowBlur = 34 + glowScale * 62 + highs * 58 + beatPulse * 80;
  ctx.shadowColor = `rgba(75,230,255, ${0.32 + glowScale * 0.26 + highs * 0.22 + beatPulse * 0.22})`;
  ctx.strokeStyle = `rgba(110,235,255, ${(0.28 * intensity + highs * 0.08 + beatPulse * 0.16) * orbScale})`;
  if (orbScale > 0.01) ctx.stroke();
  ctx.restore();

  const drift = Math.sin(time * 0.00022) * 0.22 + mids * 0.06;
  [
    { a: 0.55, b: 1.46, c: "80,235,255", alpha: 0.30, w: 2.6 },
    { a: -0.18, b: 0.24, c: "255,88,235", alpha: 0.16, w: 1.7 },
    { a: 1.62, b: 1.83, c: "255,185,75", alpha: 0.11, w: 1.3 },
  ].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (1.015 + bass * 0.012), Math.PI * (r.a + drift), Math.PI * (r.b + drift));
    ctx.lineWidth = (r.w + bass * 1.1 + beatPulse * 1.8) * orbScale;
    ctx.shadowBlur = 26 + glowScale * 52 + highs * 58 + beatPulse * 56;
    ctx.shadowColor = `rgba(${r.c}, ${0.32 + glowScale * 0.18 + highs * 0.20 + beatPulse * 0.18})`;
    ctx.strokeStyle = `rgba(${r.c}, ${(r.alpha + highs * 0.06 + beatPulse * 0.10) * intensity * orbScale})`;
    ctx.stroke();
  });

  // Protected moving orbital nodes from the good plasma build.
  drawMovingOrbitalNodes(ctx, cx, cy, radius, time, bass + beatPulse * 0.55, mids, highs + beatPulse * 0.45, intensity * orbScale * (0.65 + glowScale * 0.35 + beatPulse * 0.25));

  ctx.restore();
}

function drawMovingOrbitalNodes(ctx, cx, cy, radius, time, bass, mids, highs, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  const count = 8;
  const orbitRadius = radius * (1.045 + bass * 0.012);

  for (let i = 0; i < count; i++) {
    const baseAngle = (i / count) * Math.PI * 2;
    const drift = time * (0.00020 + (i % 3) * 0.000018);
    const musicalSlip = Math.sin(time * 0.00055 + i * 1.71) * (0.035 + mids * 0.055);
    const angle = baseAngle + drift + musicalSlip;
    const x = cx + Math.cos(angle) * orbitRadius;
    const y = cy + Math.sin(angle) * orbitRadius;

    const pulse = Math.max(0, Math.sin(time * 0.0032 + i * 1.27));
    const size = 1.9 + pulse * 1.55 + bass * 1.05 + highs * 1.4;
    const colors = [
      "100,238,255",
      "145,115,255",
      "255,105,235",
      "110,245,255",
      "255,205,105",
    ];
    const color = colors[i % colors.length];

    // Tiny trailing arc so the node feels like it is riding the rim, not pinned to it.
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      orbitRadius,
      angle - 0.035 - highs * 0.025,
      angle - 0.006
    );
    ctx.lineWidth = 1.2 + highs * 0.7;
    ctx.shadowBlur = 18 + highs * 34;
    ctx.shadowColor = `rgba(${color}, ${0.36 + highs * 0.24})`;
    ctx.strokeStyle = `rgba(${color}, ${(0.12 + pulse * 0.11 + highs * 0.12) * intensity})`;
    ctx.stroke();

    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 7.5);
    glow.addColorStop(0, `rgba(255,255,255, ${(0.42 + pulse * 0.28 + highs * 0.20) * intensity})`);
    glow.addColorStop(0.28, `rgba(${color}, ${(0.35 + pulse * 0.22 + highs * 0.20) * intensity})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 7.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.shadowBlur = 26 + highs * 58;
    ctx.shadowColor = `rgba(${color}, ${0.70 + highs * 0.22})`;
    ctx.fillStyle = `rgba(235,250,255, ${(0.72 + pulse * 0.22) * intensity})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export default function App() {
  const embedParams = useMemo(() => getEmbedParams(), []);
  const initialDraft = useMemo(() => readLocalDraft(), []);

  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const microphoneSourceRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const microphoneRecorderRef = useRef(null);
  const microphoneChunksRef = useRef([]);
  const saveMicrophoneRecordingRef = useRef(false);
  const dataRef = useRef(null);
  const waveDataRef = useRef(null);
  const smoothedDataRef = useRef(null);
  const smoothedWaveDataRef = useRef(null);
  const idleFrequencyDataRef = useRef(new Uint8Array(512));
  const idleWaveDataRef = useRef(new Uint8Array(512));
  const artworkRef = useRef(null);
  const artworkFileRef = useRef(null);
  const editorDragRef = useRef(null);
  const waveformDragRef = useRef(null);
  const recorderRef = useRef(null);
  const audioFileRef = useRef(null);
  const uploadedAudioUrlRef = useRef(null);
  const uploadedAudioNameRef = useRef("No audio selected");
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const beatRef = useRef({ bassFloor: 0, lastBass: 0, pulse: 0, lastTime: 0 });
  const levelsUpdateRef = useRef(0);

  const [audioName, setAudioName] = useState("No audio selected");
  const [artworkName, setArtworkName] = useState("No image selected");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
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
  const [orbStrength, setOrbStrength] = useState(1.0);
  const [plasmaStrength, setPlasmaStrength] = useState(1.0);
  const [geometryStrength, setGeometryStrength] = useState(0.18);
  const [particleStrength, setParticleStrength] = useState(0.0);
  const [showParticles, setShowParticles] = useState(false);
  const [causticStrength, setCausticStrength] = useState(1.0);
  const [lightFlowStrength, setLightFlowStrength] = useState(1.0);
  const [activePreset, setActivePreset] = useState("livingOrb");
  const [activeTab, setActiveTab] = useState("quickStart");
  const [studioTheme, setStudioTheme] = useState(() => {
    try {
      return window.localStorage.getItem("waveformVideoMakerTheme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [visualDesign, setVisualDesign] = useState("bars");
  const [sphereFinish, setSphereFinish] = useState("luminous");
  const [backgroundPulseMode, setBackgroundPulseMode] = useState("off");
  const [artworkBackgroundTemplate, setArtworkBackgroundTemplate] = useState("blurred");
  const [backgroundGradientKey, setBackgroundGradientKey] = useState("pearl");
  const [paletteKey, setPaletteKey] = useState("aurora");
  const [customColors, setCustomColors] = useState([
    { hex: "#5ae1ff", opacity: 1 },
    { hex: "#ff5fe1", opacity: 1 },
    { hex: "#f4fbff", opacity: 1 },
  ]);
  const [imageBorderColor, setImageBorderColor] = useState({ hex: "#5ae1ff", opacity: 0.72 });
  const [imageCenterGlowColor, setImageCenterGlowColor] = useState({ hex: "#f4fbff", opacity: 0 });
  const [imagePulseStrength, setImagePulseStrength] = useState(0);
  const [elementScale, setElementScale] = useState(1.0);
  const [elementY, setElementY] = useState(0.78);
  const [waveformFrame, setWaveformFrame] = useState(() => getDefaultWaveformFrame());
  const [showWaveform, setShowWaveform] = useState(true);
  const [waveformSelected, setWaveformSelected] = useState(true);
  const [artworkScale, setArtworkScale] = useState(1.0);
  const [artworkFrame, setArtworkFrame] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [artworkSelected, setArtworkSelected] = useState(false);
  const [showArtworkCenterGuide, setShowArtworkCenterGuide] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedVideo, setExportedVideo] = useState(null);
  const [draftPrompt, setDraftPrompt] = useState(initialDraft);
  const [draftSavingEnabled, setDraftSavingEnabled] = useState(!initialDraft);
  const [showDraftRestoredMessage, setShowDraftRestoredMessage] = useState(false);


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

  useEffect(() => {
    try {
      window.localStorage.setItem("waveformVideoMakerTheme", studioTheme);
    } catch {
      // localStorage can be unavailable in private or embedded contexts.
    }
  }, [studioTheme]);

  const startFreshDraft = async () => {
    try {
      window.localStorage.removeItem(localDraftKey);
    } catch {
      // localStorage can be unavailable in private or embedded contexts.
    }
    await clearDraftMedia();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.srcObject = null;
      audio.load();
    }
    if (uploadedAudioUrlRef.current) {
      URL.revokeObjectURL(uploadedAudioUrlRef.current);
      uploadedAudioUrlRef.current = null;
    }
    audioFileRef.current = null;
    uploadedAudioNameRef.current = "No audio selected";
    artworkFileRef.current = null;
    if (artworkRef.current?.src?.startsWith("blob:")) {
      URL.revokeObjectURL(artworkRef.current.src);
    }
    artworkRef.current = null;
    setAudioName("No audio selected");
    setArtworkName("No image selected");
    setIsPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
    setVisualDesign("bars");
    setBackgroundPulseMode("off");
    const defaultWaveformFrame = getDefaultWaveformFrame();
    setElementScale(defaultWaveformFrame.w / 0.6);
    setElementY(defaultWaveformFrame.y + defaultWaveformFrame.h / 2);
    setWaveformFrame(defaultWaveformFrame);
    setShowWaveform(true);
    setWaveformSelected(true);
    setArtworkSelected(false);
    setShowArtworkCenterGuide(false);
    resetAnalysisSmoothing();
    setDraftPrompt(null);
    setDraftSavingEnabled(true);
  };

  const startOver = async () => {
    await startFreshDraft();
    if (exportedVideo?.url) URL.revokeObjectURL(exportedVideo.url);
    setExportedVideo(null);
    setShowWaveform(false);
    setWaveformSelected(false);
    setActiveTab("quickStart");
  };

  const resumeDraft = async () => {
    const settings = draftPrompt?.settings;
    if (!settings) {
      await startFreshDraft();
      return;
    }

    if (settings.activeTab) setActiveTab(settings.activeTab);
    if (settings.studioTheme) setStudioTheme(settings.studioTheme);
    if (settings.visualDesign) setVisualDesign(settings.visualDesign);
    if (settings.sphereFinish) setSphereFinish(settings.sphereFinish);
    if (settings.moodKey) setMoodKey(settings.moodKey);
    if (settings.activePreset) setActivePreset(settings.activePreset);
    if (settings.backgroundPulseMode) setBackgroundPulseMode(settings.backgroundPulseMode);
    if (settings.artworkBackgroundTemplate) setArtworkBackgroundTemplate(settings.artworkBackgroundTemplate);
    if (settings.backgroundGradientKey) setBackgroundGradientKey(settings.backgroundGradientKey);
    if (settings.paletteKey) setPaletteKey(settings.paletteKey);
    if (settings.customColors) setCustomColors(settings.customColors);
    if (settings.imageBorderColor) setImageBorderColor(settings.imageBorderColor);
    if (settings.imageCenterGlowColor) setImageCenterGlowColor(settings.imageCenterGlowColor);
    if (settings.waveformFrame) setWaveformFrame(settings.waveformFrame);
    if (settings.artworkFrame) setArtworkFrame(settings.artworkFrame);
    if (typeof settings.showWaveform === "boolean") setShowWaveform(settings.showWaveform);

    [
      ["intensity", setIntensity],
      ["geometrySize", setGeometrySize],
      ["glowAmount", setGlowAmount],
      ["bassSensitivity", setBassSensitivity],
      ["midSensitivity", setMidSensitivity],
      ["highSensitivity", setHighSensitivity],
      ["smoothness", setSmoothness],
      ["orbStrength", setOrbStrength],
      ["plasmaStrength", setPlasmaStrength],
      ["geometryStrength", setGeometryStrength],
      ["particleStrength", setParticleStrength],
      ["causticStrength", setCausticStrength],
      ["lightFlowStrength", setLightFlowStrength],
      ["imagePulseStrength", setImagePulseStrength],
      ["elementScale", setElementScale],
      ["elementY", setElementY],
      ["artworkScale", setArtworkScale],
    ].forEach(([key, setter]) => {
      if (typeof settings[key] === "number") setter(settings[key]);
    });
    if (typeof settings.showParticles === "boolean") setShowParticles(settings.showParticles);

    const [savedAudio, savedArtwork] = await Promise.all([
      readDraftMedia("audio"),
      readDraftMedia("artwork"),
    ]);
    if (savedAudio) setupAudio(savedAudio);
    if (savedArtwork) handleArtworkFile(savedArtwork, { preserveFrame: true });

    setDraftPrompt(null);
    setDraftSavingEnabled(true);
    setShowDraftRestoredMessage(true);
  };

  useEffect(() => {
    if (!draftSavingEnabled || embedParams.embed) return;

    const saveTimer = window.setTimeout(() => {
      const settings = {
        activeTab,
        studioTheme,
        visualDesign,
        sphereFinish,
        moodKey,
        activePreset,
        intensity,
        geometrySize,
        glowAmount,
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
        backgroundPulseMode,
        artworkBackgroundTemplate,
        backgroundGradientKey,
        paletteKey,
        customColors,
        imageBorderColor,
        imageCenterGlowColor,
        imagePulseStrength,
        elementScale,
        elementY,
        waveformFrame,
        showWaveform,
        artworkScale,
        artworkFrame,
      };

      try {
        window.localStorage.setItem(localDraftKey, JSON.stringify({ savedAt: Date.now(), settings }));
      } catch {
        // localStorage can be unavailable or full.
      }
    }, 700);

    return () => window.clearTimeout(saveTimer);
  }, [
    activePreset, activeTab, artworkBackgroundTemplate, artworkFrame, artworkScale,
    backgroundGradientKey, backgroundPulseMode, bassSensitivity, causticStrength,
    customColors, draftSavingEnabled, elementScale, elementY, embedParams.embed,
    geometrySize, geometryStrength, glowAmount, highSensitivity, imageBorderColor,
    imageCenterGlowColor, imagePulseStrength, intensity, lightFlowStrength,
    midSensitivity, moodKey, orbStrength, paletteKey, particleStrength,
    plasmaStrength, showParticles, showWaveform, smoothness, sphereFinish, studioTheme,
    visualDesign, waveformFrame,
  ]);

  const fitArtworkFrame = (image) => {
    const imageAspect = image.width / image.height;
    const stageAspect = 16 / 9;

    if (imageAspect > stageAspect) {
      const height = stageAspect / imageAspect;
      return { x: 0, y: (1 - height) / 2, w: 1, h: height };
    }

    const width = imageAspect / stageAspect;
    return { x: (1 - width) / 2, y: 0, w: width, h: 1 };
  };

  const constrainArtworkFrame = (frame) => {
    const minWidth = 0.08;
    const minHeight = 0.08;
    const maxWidth = 3;
    const maxHeight = 3;
    let w = Math.max(minWidth, Math.min(maxWidth, frame.w));
    let h = Math.max(minHeight, Math.min(maxHeight, frame.h));

    if (h > maxHeight) {
      const ratio = h / w;
      h = maxHeight;
      w = h / ratio;
    }

    if (w > maxWidth) {
      const ratio = h / w;
      w = maxWidth;
      h = w * ratio;
    }
    const minX = -w * 0.86;
    const maxX = 1 - w * 0.14;
    const minY = -h * 0.86;
    const maxY = 1 - h * 0.14;

    return {
      x: Math.max(minX, Math.min(maxX, frame.x)),
      y: Math.max(minY, Math.min(maxY, frame.y)),
      w,
      h,
    };
  };

  const scaleArtworkFrame = (scale) => {
    setArtworkScale(scale);
    setArtworkFrame((frame) => {
      const ratio = frame.h / frame.w;
      const nextWidth = Math.max(0.08, Math.min(1, scale));
      const nextHeight = Math.max(0.08, Math.min(1, nextWidth * ratio));
      const centerX = frame.x + frame.w / 2;
      const centerY = frame.y + frame.h / 2;

      return constrainArtworkFrame({
        x: centerX - nextWidth / 2,
        y: centerY - nextHeight / 2,
        w: nextWidth,
        h: nextHeight,
      });
    });
  };

  const constrainFreeFrame = (frame) => {
    const minWidth = 0.08;
    const minHeight = 0.035;
    const w = Math.max(minWidth, Math.min(1, frame.w));
    const h = Math.max(minHeight, Math.min(1, frame.h));
    const minX = -w * 0.8;
    const maxX = 1 - w * 0.2;
    const minY = -h * 0.8;
    const maxY = 1 - h * 0.18;

    return {
      x: Math.max(minX, Math.min(maxX, frame.x)),
      y: Math.max(minY, Math.min(maxY, frame.y)),
      w,
      h,
    };
  };

  const scaleWaveformFrame = (scale) => {
    setElementScale(scale);
    setWaveformFrame((frame) => {
      const nextWidth = Math.max(0.08, Math.min(1, 0.6 * scale));
      const centerX = frame.x + frame.w / 2;

      return constrainFreeFrame({
        ...frame,
        x: centerX - nextWidth / 2,
        w: nextWidth,
      });
    });
  };

  const moveWaveformFrameY = (value) => {
    setElementY(value);
    setWaveformFrame((frame) =>
      constrainFreeFrame({
        ...frame,
        y: value - frame.h / 2,
      })
    );
  };

  const startArtworkEdit = (event, handle = "move") => {
    if (!artworkRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    setArtworkSelected(true);
    setShowArtworkCenterGuide(Math.abs(artworkFrame.x + artworkFrame.w / 2 - 0.5) < 0.02);

    editorDragRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      frame: artworkFrame,
    };
  };

  const startWaveformEdit = (event, handle = "move") => {
    if (!showWaveform || visualDesign === "liquid") return;

    event.preventDefault();
    event.stopPropagation();
    setWaveformSelected(true);
    setArtworkSelected(false);
    setShowArtworkCenterGuide(Math.abs(waveformFrame.x + waveformFrame.w / 2 - 0.5) < 0.02);

    waveformDragRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      frame: waveformFrame,
    };
  };

  const changeVisualDesign = (nextDesign) => {
    const audio = audioRef.current;
    const shouldResumeAudio = isPlaying && !isMicActive && audio?.src;

    setVisualDesign(nextDesign);
    setShowWaveform(true);
    setWaveformSelected(nextDesign !== "liquid");
    resetAnalysisSmoothing();

    if (shouldResumeAudio) {
      const resumePlayback = async () => {
        if (!audio.paused) return;
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume();
        }
        await audio.play();
        setIsPlaying(true);
      };

      [0, 90, 240].forEach((delay) => {
        window.setTimeout(() => {
          resumePlayback().catch(() => {
            setIsPlaying(false);
          });
        }, delay);
      });
    }
  };

  const selectArtworkFromCanvas = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const insideWaveform =
      showWaveform &&
      visualDesign !== "liquid" &&
      x >= waveformFrame.x &&
      x <= waveformFrame.x + waveformFrame.w &&
      y >= waveformFrame.y &&
      y <= waveformFrame.y + waveformFrame.h;
    const insideArtwork =
      artworkRef.current &&
      x >= artworkFrame.x &&
      x <= artworkFrame.x + artworkFrame.w &&
      y >= artworkFrame.y &&
      y <= artworkFrame.y + artworkFrame.h;

    setWaveformSelected(insideWaveform);
    setArtworkSelected(!insideWaveform && insideArtwork);
    if (!insideArtwork) setShowArtworkCenterGuide(false);
  };

  useEffect(() => {
    const updateArtworkEdit = (event) => {
      const drag = editorDragRef.current;
      const wrap = canvasWrapRef.current;

      if (!drag || !wrap) return;

      const rect = wrap.getBoundingClientRect();
      const dx = (event.clientX - drag.startX) / rect.width;
      const dy = (event.clientY - drag.startY) / rect.height;
      const start = drag.frame;

      if (drag.handle === "move") {
        const nextFrame = constrainArtworkFrame({
          ...start,
          x: start.x + dx,
          y: start.y + dy,
        });
        setShowArtworkCenterGuide(Math.abs(nextFrame.x + nextFrame.w / 2 - 0.5) < 0.02);
        setArtworkFrame(nextFrame);
        return;
      }

      const ratio = start.h / start.w;
      let width = start.w;
      let x = start.x;

      if (drag.handle.includes("e")) width = start.w + dx;
      if (drag.handle.includes("w")) width = start.w - dx;
      if (drag.handle === "n" || drag.handle === "s" || drag.handle === "float") {
        const height = drag.handle === "n" || drag.handle === "float" ? start.h - dy : start.h + dy;
        width = height / ratio;
      }

      width = Math.max(0.08, Math.min(3, width));
      const height = width * ratio;

      if (drag.handle.includes("w")) x = start.x + start.w - width;

      let y = start.y;
      if (drag.handle.includes("n") || drag.handle === "float") {
        y = start.y + start.h - height;
      }

      setArtworkScale(width);
      const nextFrame = constrainArtworkFrame({ x, y, w: width, h: height });
      setShowArtworkCenterGuide(Math.abs(nextFrame.x + nextFrame.w / 2 - 0.5) < 0.02);
      setArtworkFrame(nextFrame);
    };

    const endArtworkEdit = () => {
      editorDragRef.current = null;
      setShowArtworkCenterGuide(false);
    };

    window.addEventListener("pointermove", updateArtworkEdit);
    window.addEventListener("pointerup", endArtworkEdit);
    window.addEventListener("pointercancel", endArtworkEdit);

    return () => {
      window.removeEventListener("pointermove", updateArtworkEdit);
      window.removeEventListener("pointerup", endArtworkEdit);
      window.removeEventListener("pointercancel", endArtworkEdit);
    };
  }, [artworkFrame]);

  useEffect(() => {
    const updateWaveformEdit = (event) => {
      const drag = waveformDragRef.current;
      const wrap = canvasWrapRef.current;

      if (!drag || !wrap) return;

      const rect = wrap.getBoundingClientRect();
      const dx = (event.clientX - drag.startX) / rect.width;
      const dy = (event.clientY - drag.startY) / rect.height;
      const start = drag.frame;

      if (drag.handle === "move") {
        const nextFrame = constrainFreeFrame({
          ...start,
          x: start.x + dx,
          y: start.y + dy,
        });
        setShowArtworkCenterGuide(Math.abs(nextFrame.x + nextFrame.w / 2 - 0.5) < 0.02);
        setWaveformFrame(nextFrame);
        setElementY(nextFrame.y + nextFrame.h / 2);
        return;
      }

      let x = start.x;
      let y = start.y;
      let w = start.w;
      let h = start.h;

      if (drag.handle.includes("e")) w = start.w + dx;
      if (drag.handle.includes("w")) {
        w = start.w - dx;
        x = start.x + dx;
      }
      if (drag.handle.includes("s")) h = start.h + dy;
      if (drag.handle.includes("n") || drag.handle === "float") {
        h = start.h - dy;
        y = start.y + dy;
      }

      const nextFrame = constrainFreeFrame({ x, y, w, h });
      setShowArtworkCenterGuide(Math.abs(nextFrame.x + nextFrame.w / 2 - 0.5) < 0.02);
      setWaveformFrame(nextFrame);
      setElementScale(nextFrame.w / 0.6);
      setElementY(nextFrame.y + nextFrame.h / 2);
    };

    const endWaveformEdit = () => {
      waveformDragRef.current = null;
      setShowArtworkCenterGuide(false);
    };

    window.addEventListener("pointermove", updateWaveformEdit);
    window.addEventListener("pointerup", endWaveformEdit);
    window.addEventListener("pointercancel", endWaveformEdit);

    return () => {
      window.removeEventListener("pointermove", updateWaveformEdit);
      window.removeEventListener("pointerup", endWaveformEdit);
      window.removeEventListener("pointercancel", endWaveformEdit);
    };
  }, [waveformFrame]);

  useEffect(() => {
    const hideArtworkSelection = (event) => {
      const wrap = canvasWrapRef.current;
      if (!wrap || wrap.contains(event.target)) return;
      setArtworkSelected(false);
      setWaveformSelected(false);
    };

    document.addEventListener("pointerdown", hideArtworkSelection);

    return () => {
      document.removeEventListener("pointerdown", hideArtworkSelection);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (exportedVideo?.url) URL.revokeObjectURL(exportedVideo.url);
    };
  }, [exportedVideo]);

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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const render = (time) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mood = moods[moodKey];
      const analysisProfile = getAnalysisProfile(visualDesign);

      let bass = 0;
      let mids = 0;
      let highs = 0;
      let canvasBass = 0;

      if (analyserRef.current && dataRef.current) {
        analyserRef.current.getByteFrequencyData(dataRef.current);
        if (waveDataRef.current) {
          analyserRef.current.getByteTimeDomainData(waveDataRef.current);
        }

        const blend = 1 - Math.max(0, Math.min(0.98, smoothness + analysisProfile.smoothingBias));
        if (!smoothedDataRef.current || smoothedDataRef.current.length !== dataRef.current.length) {
          smoothedDataRef.current = Float32Array.from(dataRef.current);
        } else {
          for (let i = 0; i < dataRef.current.length; i++) {
            smoothedDataRef.current[i] += (dataRef.current[i] - smoothedDataRef.current[i]) * blend;
          }
        }

        if (waveDataRef.current) {
          if (!smoothedWaveDataRef.current || smoothedWaveDataRef.current.length !== waveDataRef.current.length) {
            smoothedWaveDataRef.current = Float32Array.from(waveDataRef.current);
          } else {
            for (let i = 0; i < waveDataRef.current.length; i++) {
              smoothedWaveDataRef.current[i] += (waveDataRef.current[i] - smoothedWaveDataRef.current[i]) * blend;
            }
          }
        }

        canvasBass = averageRange(dataRef.current, analysisProfile.bassRange[0], analysisProfile.bassRange[1]);
        bass = canvasBass * bassSensitivity;
        mids = averageRange(dataRef.current, analysisProfile.midRange[0], analysisProfile.midRange[1]) * midSensitivity;
        highs = averageRange(dataRef.current, analysisProfile.highRange[0], analysisProfile.highRange[1]) * highSensitivity;

        canvasBass = Math.min(1, canvasBass);
        bass = Math.min(1, bass);
        mids = Math.min(1, mids);
        highs = Math.min(1, highs);
      }

      const beatState = beatRef.current;
      const deltaSeconds = beatState.lastTime
        ? Math.min(0.08, Math.max(0.001, (time - beatState.lastTime) / 1000))
        : 0.016;
      beatState.lastTime = time;
      beatState.bassFloor += (canvasBass - beatState.bassFloor) * analysisProfile.beatFloor;

      const bassJump = Math.max(0, canvasBass - beatState.lastBass);
      const bassLift = Math.max(0, canvasBass - beatState.bassFloor);
      const beatHit = canvasBass > 0.12 ? Math.min(1, bassJump * analysisProfile.beatJump + bassLift * analysisProfile.beatLift) : 0;

      beatState.pulse = Math.max(
        beatState.pulse * Math.pow(0.10, deltaSeconds),
        beatHit
      );
      beatState.lastBass = canvasBass;

      const smoothingAmount = 1 - smoothness;

      if (time - levelsUpdateRef.current > 90) {
        levelsUpdateRef.current = time;
        setLevels((previous) => ({
          bass: previous.bass + (bass - previous.bass) * smoothingAmount,
          mids: previous.mids + (mids - previous.mids) * smoothingAmount,
          highs: previous.highs + (highs - previous.highs) * smoothingAmount,
        }));
      }

      let softBass = Math.min(1, bass * analysisProfile.bassSoft);
      let canvasSoftBass = Math.min(1, canvasBass * analysisProfile.bassSoft);
      let softMids = Math.min(1, mids * analysisProfile.midSoft);
      let softHighs = Math.min(1, highs * analysisProfile.highSoft);
      const beatPulse = Math.min(1, beatState.pulse);
      const waveformBeatPulse = Math.min(1, beatPulse * (0.65 + bassSensitivity * 0.55));
      const normalizedCustomColors = customColors.map((color, index) =>
        normalizeCustomColor(color, ["#5ae1ff", "#ff5fe1", "#f4fbff"][index] || "#ffffff")
      );
      const normalizedBorderColor = normalizeCustomColor(imageBorderColor, "#5ae1ff");
      const normalizedCenterGlowColor = normalizeCustomColor(imageCenterGlowColor, "#f4fbff");

      const palette = paletteKey === "custom"
        ? {
            label: "Custom",
            colors: normalizedCustomColors.map((color) => hexToRgbaPrefix(color.hex)),
            opacities: normalizedCustomColors.map((color) => color.opacity),
          }
        : colorPalettes[paletteKey] || colorPalettes.aurora;
      const selectedBackgroundGradient = backgroundGradientPalettes[backgroundGradientKey] || backgroundGradientPalettes.pearl;
      const backgroundPalette = backgroundGradientKey === "custom"
        ? {
            label: "Custom Background",
            colors: normalizedCustomColors.map((color) => hexToRgbaPrefix(color.hex)),
            opacities: normalizedCustomColors.map((color) => color.opacity),
          }
        : {
            label: selectedBackgroundGradient.label,
            colors: selectedBackgroundGradient.colors.map((color) => hexToRgbaPrefix(color)),
            opacities: selectedBackgroundGradient.colors.map(() => 1),
          };
      const hasAudioInput = isMicActive || audioName !== "No audio selected";
      const hasArtwork = artworkName !== "No image selected";
      const hasLoadedContent = hasAudioInput || hasArtwork;

      if (!hasAudioInput) {
        const idleFrequencyData = idleFrequencyDataRef.current;
        const idleWaveData = idleWaveDataRef.current;
        const previewPhase = time * 0.00115;

        for (let index = 0; index < idleFrequencyData.length; index++) {
          const position = index / idleFrequencyData.length;
          const envelope = Math.pow(Math.sin(Math.PI * position), 0.42);
          const motion =
            Math.sin(previewPhase * 1.25 + index * 0.115) * 0.18 +
            Math.sin(previewPhase * 0.68 + index * 0.043) * 0.12;
          const clusters =
            Math.exp(-Math.pow((position - 0.18) / 0.08, 2)) * 0.48 +
            Math.exp(-Math.pow((position - 0.47) / 0.12, 2)) * 0.36 +
            Math.exp(-Math.pow((position - 0.76) / 0.09, 2)) * 0.28;
          idleFrequencyData[index] = Math.round(
            Math.max(10, Math.min(185, (0.20 + clusters + motion) * envelope * 170))
          );

          idleWaveData[index] = Math.round(
            128 +
            Math.sin(previewPhase * 1.4 + index * 0.075) * 22 +
            Math.sin(previewPhase * 0.72 + index * 0.031) * 10
          );
        }

        canvasBass = 0.20 + Math.sin(previewPhase * 1.2) * 0.035;
        bass = canvasBass * Math.min(1.2, bassSensitivity);
        mids = 0.16 + Math.sin(previewPhase * 0.82 + 1.2) * 0.025;
        highs = 0.13 + Math.sin(previewPhase * 1.05 + 2.1) * 0.02;
        softBass = Math.min(1, bass * analysisProfile.bassSoft);
        canvasSoftBass = Math.min(1, canvasBass * analysisProfile.bassSoft);
        softMids = Math.min(1, mids * analysisProfile.midSoft);
        softHighs = Math.min(1, highs * analysisProfile.highSoft);
      }

      drawBackground(ctx, width, height, mood, time, !hasLoadedContent);
      if (!hasLoadedContent) {
        drawArtworkBackgroundTemplate(
          ctx,
          null,
          width,
          height,
          time,
          canvasSoftBass,
          softMids,
          backgroundPalette,
          artworkBackgroundTemplate
        );
      } else {
        drawCoverArtwork(
          ctx,
          artworkRef.current,
          width,
          height,
          time,
          canvasSoftBass,
          softMids,
          backgroundPalette,
          artworkFrame,
          normalizedCenterGlowColor.hex,
          normalizedCenterGlowColor.opacity,
          normalizedBorderColor.hex,
          normalizedBorderColor.opacity,
          imagePulseStrength,
          beatPulse,
          artworkBackgroundTemplate
        );
      }

      drawBackgroundPulse(ctx, width, height, mood, beatPulse, backgroundPulseMode);

if (visualDesign === "liquid" && (lightFlowStrength > 0.01 || plasmaStrength > 0.01)) {
  drawPureLiquidLightSphere(
    ctx,
    width,
    height,
    time,
    canvasSoftBass,
    softMids,
    softHighs,
    Math.min(1.35, intensity * Math.max(lightFlowStrength, plasmaStrength)),
    {
      glow: glowAmount,
      orb: orbStrength,
      caustic: causticStrength,
      flow: lightFlowStrength,
      plasma: plasmaStrength,
      beat: beatPulse,
    }
  );
}

if (showWaveform && visualDesign !== "liquid") {
  const waveformPalette = hasAudioInput
    ? palette
    : {
        label: "Default Purple",
        colors: ["rgba(97, 102, 255,", "rgba(97, 102, 255,", "rgba(97, 102, 255,"],
        opacities: [1, 0.88, 0.72],
      };

  drawAudioDesign(
    ctx,
    width,
    height,
    time,
    softBass,
    softMids,
    softHighs,
    intensity,
    visualDesign,
    waveformPalette,
    hasAudioInput
      ? smoothedDataRef.current || dataRef.current
      : idleFrequencyDataRef.current,
    hasAudioInput
      ? smoothedWaveDataRef.current || waveDataRef.current
      : idleWaveDataRef.current,
    elementScale,
    elementY,
    waveformFrame,
    sphereFinish,
    waveformBeatPulse,
    glowAmount,
    !hasAudioInput
  );
}

if (backgroundPulseMode !== "off") {
  const musicWarmth = (softHighs * 0.08 + canvasSoftBass * 0.05 + beatPulse * 0.10) * lightFlowStrength * glowAmount;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = `${mood.glow} ${musicWarmth})`;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

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
        1 + canvasSoftBass * 0.095 * intensity + Math.sin(time * 0.00055) * 0.012;

      const opacity = 0.22 + softMids * 0.28 + intensity * 0.18;

      const drift = {
        x: Math.sin(time * 0.00011) * width * 0.018,
        y: Math.cos(time * 0.00009) * height * 0.014,
      };

// Bass ripple circles are intentionally off in the liquid-light presets.
      
      // Keep geometry out of the main plasma presets so the center reads as liquid light, not line art.
      if (activePreset === "sacredGeometry") {
        drawLivingGeometry(
          ctx,
          width / 2,
          height / 2,
          baseRadius,
          mood,
          time,
          canvasSoftBass,
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

      if (backgroundPulseMode !== "off") {
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

        halo.addColorStop(0, `${mood.glow} ${0.08 + canvasSoftBass * 0.07})`);
        halo.addColorStop(0.55, `${mood.glow} ${0.035 + softHighs * 0.04})`);
        halo.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

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
    visualDesign,
    showWaveform,
    paletteKey,
    customColors,
    elementScale,
    elementY,
    waveformFrame,
    sphereFinish,
    backgroundPulseMode,
    artworkBackgroundTemplate,
    backgroundGradientKey,
    imageBorderColor,
    imageCenterGlowColor,
    imagePulseStrength,
    artworkFrame,
    audioName,
    artworkName,
    isMicActive,
  ]);

  const handleFile = (file) => {
    if (!file) return;

    const type = (file.type || "").toLowerCase();
    const isAudio =
      type.startsWith("audio/") ||
      ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/x-wav"].includes(type) ||
      supportedAudioFilePattern.test(file.name);

    if (!isAudio) {
      alert("Please upload an audio file such as MP3, WAV, M4A, AAC, OGG, or FLAC.");
      return;
    }

    setupAudio(file);
  };

  const handleArtworkFile = (file, { preserveFrame = false } = {}) => {
    if (!file) return;

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file.name);

    if (!isImage) {
      alert("Please upload an image such as JPG, PNG, GIF, WebP, or AVIF.");
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (artworkRef.current?.src?.startsWith("blob:")) {
        URL.revokeObjectURL(artworkRef.current.src);
      }
      artworkRef.current = image;
      artworkFileRef.current = file;
      if (!preserveFrame) {
        const fittedFrame = fitArtworkFrame(image);
        setArtworkFrame(fittedFrame);
        setArtworkScale(fittedFrame.w);
      }
      setArtworkSelected(true);
      setArtworkName(file.name);
      writeDraftMedia("artwork", file);
    };
    image.src = url;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files || []);
    const imageFile = files.find(
      (file) =>
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file.name)
    );
    const audioFile = files.find(
      (file) =>
        file.type.startsWith("audio/") ||
        /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name)
    );

    if (imageFile) handleArtworkFile(imageFile);
    if (audioFile) handleFile(audioFile);
    if (!imageFile && !audioFile) handleFile(files[0]);
  };

  const resetAnalysisSmoothing = () => {
    smoothedDataRef.current = null;
    smoothedWaveDataRef.current = null;
    beatRef.current = { bassFloor: 0, lastBass: 0, pulse: 0, lastTime: 0 };
  };

  const ensureAudioAnalyser = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      analyserRef.current = audioContextRef.current.createAnalyser();
      const profile = getAnalysisProfile(visualDesign);
      analyserRef.current.fftSize = profile.fftSize;
      analyserRef.current.smoothingTimeConstant = profile.analyserSmoothing;

      dataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      waveDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }
  };

  useEffect(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const profile = getAnalysisProfile(visualDesign);
    if (analyser.fftSize !== profile.fftSize) {
      analyser.fftSize = profile.fftSize;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      waveDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      resetAnalysisSmoothing();
    }
    analyser.smoothingTimeConstant = profile.analyserSmoothing;
  }, [visualDesign]);

  const stopMicrophone = ({ saveRecording = false } = {}) => {
    const audio = audioRef.current;
    const microphoneRecorder = microphoneRecorderRef.current;
    if (microphoneRecorder && microphoneRecorder.state !== "inactive") {
      saveMicrophoneRecordingRef.current = saveRecording;
      microphoneRecorder.stop();
    }
    microphoneSourceRef.current?.disconnect();
    microphoneSourceRef.current = null;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    if (audio?.srcObject) {
      audio.pause();
      audio.srcObject = null;
      audio.muted = false;
    }
    setIsMicActive(false);
  };

  const setupAudio = async (file) => {
    const audio = audioRef.current;
    const url = URL.createObjectURL(file);

    stopMicrophone({ saveRecording: false });
    if (uploadedAudioUrlRef.current) {
      URL.revokeObjectURL(uploadedAudioUrlRef.current);
    }
    uploadedAudioUrlRef.current = url;
    audioFileRef.current = file;
    writeDraftMedia("audio", file);
    audio.srcObject = null;
    audio.muted = false;
    audio.src = url;
    audio.load();
    uploadedAudioNameRef.current = file.name;
    setAudioName(file.name);
    setIsPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
    resetAnalysisSmoothing();

    ensureAudioAnalyser();

    if (!sourceRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      sourceRef.current.connect(audioContextRef.current.destination);
    } else {
      try {
        sourceRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        // The media element may already be connected to the destination.
      }
    }
  };

  const startMicrophone = async () => {
    const audio = audioRef.current;

    if (!navigator.mediaDevices?.getUserMedia) {
      alert("This browser does not support microphone input.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      alert("This browser can use the microphone, but it cannot save microphone recordings.");
      return;
    }

    try {
      ensureAudioAnalyser();

      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.srcObject = null;
        audio.load();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      stopMicrophone();
      try {
        analyserRef.current?.disconnect(audioContextRef.current.destination);
      } catch (error) {
        // The analyser may not be connected to speakers, which is preferred for microphone use.
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      if (audio) {
        audio.srcObject = stream;
        audio.muted = true;
        audio.playsInline = true;
      }
      microphoneSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneSourceRef.current.connect(analyserRef.current);

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];
      const recordingType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const microphoneRecorder = new MediaRecorder(
        stream,
        recordingType ? { mimeType: recordingType } : undefined
      );
      microphoneChunksRef.current = [];
      saveMicrophoneRecordingRef.current = false;
      microphoneRecorderRef.current = microphoneRecorder;

      microphoneRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) microphoneChunksRef.current.push(event.data);
      };

      microphoneRecorder.onstop = () => {
        const shouldSave = saveMicrophoneRecordingRef.current;
        const chunks = microphoneChunksRef.current;
        const mimeType = microphoneRecorder.mimeType || chunks[0]?.type || "audio/webm";
        microphoneRecorderRef.current = null;
        microphoneChunksRef.current = [];
        saveMicrophoneRecordingRef.current = false;

        if (!shouldSave || chunks.length === 0) return;

        const extension = mimeType.includes("mp4")
          ? "m4a"
          : mimeType.includes("ogg")
            ? "ogg"
            : "webm";
        const recordedAt = Date.now();
        const audioBlob = new Blob(chunks, { type: mimeType });
        const microphoneFile = new File(
          [audioBlob],
          `recorded-mic-${recordedAt}.${extension}`,
          { type: mimeType, lastModified: recordedAt }
        );

        setupAudio(microphoneFile);
      };

      microphoneRecorder.start(250);

      setAudioName("Microphone Input");
      setAudioTime(0);
      setAudioDuration(0);
      setIsPlaying(true);
      setIsMicActive(true);
      resetAnalysisSmoothing();
    } catch (error) {
      setIsMicActive(false);
      alert("Microphone access was not available.");
    }
  };

  const toggleMicrophone = async () => {
    if (isMicActive) {
      stopMicrophone({ saveRecording: true });
      setIsPlaying(false);
      return;
    }

    await startMicrophone();
  };

  useEffect(() => {
    return () => {
      const microphoneRecorder = microphoneRecorderRef.current;
      if (microphoneRecorder && microphoneRecorder.state !== "inactive") {
        saveMicrophoneRecordingRef.current = false;
        microphoneRecorder.stop();
      }
      microphoneSourceRef.current?.disconnect();
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (uploadedAudioUrlRef.current) {
        URL.revokeObjectURL(uploadedAudioUrlRef.current);
      }
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (isMicActive) {
      stopMicrophone({ saveRecording: true });
      setIsPlaying(false);
      return;
    }

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

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${remaining}`;
  };

  const scrubAudio = (event) => {
    const audio = audioRef.current;
    if (!audio.src || isMicActive) return;

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setAudioTime(nextTime);
  };

  const exportVideo = async () => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;

    if (exportedVideo?.url) {
      URL.revokeObjectURL(exportedVideo.url);
      setExportedVideo(null);
    }

    if (!canvas || (!audio.src && !isMicActive)) {
      alert("Upload an audio track or start the microphone before exporting.");
      return;
    }

    if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
      alert("This browser cannot record the canvas directly. Try Chrome or Edge for export.");
      return;
    }

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    const videoStream = canvas.captureStream(30);
    let exportAudioDestination = null;
    let exportAudioStream = null;

    try {
      exportAudioDestination = audioContextRef.current.createMediaStreamDestination();
      if (isMicActive && microphoneSourceRef.current) {
        microphoneSourceRef.current.connect(exportAudioDestination);
      } else if (sourceRef.current) {
        sourceRef.current.connect(exportAudioDestination);
      }
      exportAudioStream = exportAudioDestination.stream;
    } catch (error) {
      exportAudioStream = null;
    }

    const audioStream = exportAudioStream || (isMicActive
      ? microphoneStreamRef.current
      : audio.captureStream?.() || audio.mozCaptureStream?.());
    const audioTracks = audioStream
      ? audioStream.getAudioTracks().map((track) => (isMicActive ? track.clone() : track))
      : [];

    if (audioTracks.length === 0) {
      alert("This browser did not provide an audio track for export. The video may export silently on this device.");
    }

    const tracks = [
      ...videoStream.getVideoTracks(),
      ...audioTracks,
    ];
    const mixedStream = new MediaStream(tracks);
    const mp4Type = "video/mp4;codecs=avc1.42E01E,mp4a.40.2";
    const webmType = "video/webm;codecs=vp9,opus";
    const mimeType = MediaRecorder.isTypeSupported(mp4Type)
      ? mp4Type
      : MediaRecorder.isTypeSupported(webmType)
        ? webmType
        : "";
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    const chunks = [];

    try {
      const recorder = new MediaRecorder(mixedStream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      setIsExporting(true);
      if (isMicActive) setAudioName("Microphone input");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        setIsExporting(false);
        recorderRef.current = null;
        if (exportAudioDestination) {
          try {
            if (isMicActive && microphoneSourceRef.current) {
              microphoneSourceRef.current.disconnect(exportAudioDestination);
            } else if (sourceRef.current) {
              sourceRef.current.disconnect(exportAudioDestination);
            }
          } catch (error) {
            // The export audio route may already be disconnected.
          }
        }
        tracks.forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        setExportedVideo({ url, extension });
      };

      if (!isMicActive) {
        audio.currentTime = 0;
        await audio.play();
        setIsPlaying(true);
      }
      recorder.start(1000);

      const stopExport = () => {
        if (recorder.state !== "inactive") recorder.stop();
        audio.removeEventListener("ended", stopExport);
      };

      if (!isMicActive) audio.addEventListener("ended", stopExport);
    } catch (error) {
      setIsExporting(false);
      alert("The browser could not start video export.");
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    const audio = audioRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const downloadExportedVideo = () => {
    if (!exportedVideo?.url) return;

    const link = document.createElement("a");
    link.href = exportedVideo.url;
    link.download = `music-visualizer.${exportedVideo.extension}`;
    link.click();

    if (exportedVideo.extension !== "mp4") {
      alert("Your browser created a WebM video because MP4 recording is not supported here.");
    }
  };

  const handleExportAction = () => {
    if (isExporting) {
      stopRecording();
    } else if (exportedVideo) {
      downloadExportedVideo();
    } else {
      exportVideo();
    }
  };

  const isLiquidVisual = visualDesign === "liquid";
  const isSpectrumVisual = ["bars", "pulseDots", "radial"].includes(visualDesign);
  const responsePrefix = isSpectrumVisual ? "Spectrum" : isLiquidVisual ? "Liquid Light" : "Waveform";
  const loadedAudioLabel = isMicActive
    ? isExporting ? "Recording Microphone Input" : "Microphone Input"
    : audioName;
  const customBackgroundGradient = customColors
    .map((color, index) => normalizeCustomColor(color, ["#5ae1ff", "#ff5fe1", "#f4fbff"][index] || "#ffffff"))
    .map((color) => hexToRgba(color.hex, color.opacity));
  const getBackgroundGradientStyle = (key, gradient) => {
    const colors = key === "custom" ? customBackgroundGradient : gradient.colors;
    return {
      background: `
        linear-gradient(145deg, ${colors[0]}, ${colors[1] || colors[0]} 58%, ${colors[2] || colors[1] || colors[0]}),
        linear-gradient(0deg, rgba(255,255,255,.10), rgba(0,0,0,.05))
      `,
    };
  };

  return (
    <main
      className={`${embedParams.embed ? "engine-shell embed" : "engine-shell"} theme-${studioTheme}`}
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

      {draftPrompt && !embedParams.embed && (
        <div className="draft-dialog-backdrop" role="presentation">
          <section
            className="draft-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-dialog-title"
            aria-describedby="draft-dialog-description"
          >
            <span className="draft-dialog-icon" aria-hidden="true">
              <Sparkles size={21} />
            </span>
            <div className="draft-dialog-copy">
              <h2 id="draft-dialog-title">Resume your last draft?</h2>
              <p id="draft-dialog-description">
                We found a locally saved draft from {formatDraftAge(draftPrompt.savedAt)}.
                {" "}Layout, settings, and locally stored media will be restored when available.
              </p>
            </div>
            <div className="draft-dialog-actions">
              <button type="button" onClick={startFreshDraft}>Start Fresh</button>
              <button type="button" className="resume-draft-button" onClick={resumeDraft}>Resume Draft</button>
            </div>
          </section>
        </div>
      )}

      {showDraftRestoredMessage && !embedParams.embed && (
        <div className="draft-dialog-backdrop" role="presentation">
          <section
            className="draft-dialog restored-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-restored-title"
            aria-describedby="draft-restored-description"
          >
            <span className="draft-dialog-icon" aria-hidden="true">
              <Sparkles size={21} />
            </span>
            <div className="draft-dialog-copy">
              <h2 id="draft-restored-title">Draft settings restored.</h2>
              <p id="draft-restored-description">
                Please reselect audio before playback or download.
              </p>
            </div>
            <div className="draft-dialog-actions">
              <button
                type="button"
                className="dismiss-draft-button"
                onClick={() => setShowDraftRestoredMessage(false)}
              >
                Dismiss
              </button>
            </div>
          </section>
        </div>
      )}

      <audio
        ref={audioRef}
        onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setAudioTime(event.currentTarget.currentTime || 0)}
        onEnded={() => {
          setIsPlaying(false);
          setAudioTime(audioDuration || 0);
        }}
      />

      {!embedParams.embed && (
        <header className="hud-topbar">
          <div className="hud-brand">
            <div className="hud-logo">✦</div>
            <div>
              <h1 className="hud-title">Waveform Video Maker</h1>
              <p className="hud-subtitle">Motion for Every Melody</p>
            </div>
          </div>

          <div className="hud-actions">
            <div className="theme-toggle" role="group" aria-label="Studio theme">
              <button
                type="button"
                className={studioTheme === "light" ? "theme-toggle-button active" : "theme-toggle-button"}
                onClick={() => setStudioTheme("light")}
                aria-label="Studio Light"
                title="Studio Light"
              >
                <Sun size={18} />
              </button>
              <button
                type="button"
                className={studioTheme === "dark" ? "theme-toggle-button active" : "theme-toggle-button"}
                onClick={() => setStudioTheme("dark")}
                aria-label="Midnight Studio"
                title="Midnight Studio"
              >
                <Moon size={18} />
              </button>
            </div>
            <button type="button" className="hud-action-button" onClick={handleExportAction}>
              {isExporting ? (
                <span className="export-recording-dot" aria-hidden="true" />
              ) : exportedVideo ? (
                <Download className="export-state-icon" />
              ) : (
                <Film className="export-state-icon" />
              )}
              {isExporting
                ? "Stop & Export"
                : exportedVideo
                  ? "Download MP4"
                  : "Record Video"}
            </button>
            <button type="button" className="hud-action-button" onClick={startOver}>
              <RotateCcw size={18} />
              Start Over
            </button>
            <button type="button" className="hud-action-button icon-only" onClick={() => setActiveTab("background")} aria-label="Settings">
              <Settings size={20} />
            </button>
          </div>

          <nav className="hud-tabs" aria-label="Layer navigation">
            {layerTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={activeTab === tab.key ? "hud-tab active" : "hud-tab"}
                  onClick={() => setActiveTab(tab.key)}
                  aria-label={tab.label}
                >
                  <TabIcon aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </header>
      )}

      <div className={embedParams.embed ? "engine-layout embed" : "engine-layout hud-layout"}>
        <div className={isDragging ? "visual-card dragging" : "visual-card"}>
          <div className="canvas-wrap" ref={canvasWrapRef} onPointerDown={selectArtworkFromCanvas} onDrop={handleDrop}>
            <canvas ref={canvasRef} />

            {isDragging && (
              <div className="canvas-drop-overlay">
                Drop audio or image
              </div>
            )}

            {showArtworkCenterGuide && (
              <span className="canvas-center-guide" aria-hidden="true" />
            )}

            {artworkRef.current && artworkSelected && (
              <div
                className="artwork-editor-frame"
                style={{
                  left: `${artworkFrame.x * 100}%`,
                  top: `${artworkFrame.y * 100}%`,
                  width: `${artworkFrame.w * 100}%`,
                  height: `${artworkFrame.h * 100}%`,
                }}
                onPointerDown={(event) => startArtworkEdit(event, "move")}
              >
                <span className="artwork-editor-stem" />
                <span className="artwork-editor-handle float" onPointerDown={(event) => startArtworkEdit(event, "float")} />
                {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
                  <span
                    key={handle}
                    className={`artwork-editor-handle ${handle}`}
                    onPointerDown={(event) => startArtworkEdit(event, handle)}
                  />
                ))}
              </div>
            )}

            {showWaveform && visualDesign !== "liquid" && waveformSelected && (
              <div
                className="waveform-editor-frame"
                style={{
                  left: `${waveformFrame.x * 100}%`,
                  top: `${waveformFrame.y * 100}%`,
                  width: `${waveformFrame.w * 100}%`,
                  height: `${waveformFrame.h * 100}%`,
                }}
                onPointerDown={(event) => startWaveformEdit(event, "move")}
              >
                <span className="waveform-editor-stem" />
                <span className="waveform-editor-handle float" onPointerDown={(event) => startWaveformEdit(event, "float")} />
                {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
                  <span
                    key={handle}
                    className={`waveform-editor-handle ${handle}`}
                    onPointerDown={(event) => startWaveformEdit(event, handle)}
                  />
                ))}
              </div>
            )}

          </div>

          <div className="preview-player">
            <div className="preview-loaded-pill">
              <span>Now loaded</span>
              <strong>{loadedAudioLabel}</strong>
            </div>
            <button className="preview-play-button" onClick={togglePlayback} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={24} /> : <Play size={26} />}
            </button>
            <span className="preview-time">{formatTime(audioTime)}</span>
            <input
              className="preview-scrubber"
              type="range"
              min="0"
              max={audioDuration || 0}
              step="0.01"
              value={Math.min(audioTime, audioDuration || 0)}
              onChange={scrubAudio}
            />
            <span className="preview-time">{formatTime(audioDuration)}</span>
          </div>
        </div>

        {embedParams.controls && (
          <aside className="control-card">
            {activeTab === "quickStart" && (
              <HudSection title="Quick Start">
                <div className="quick-start-panel">
                  <div className="quick-start-hero">
                    <h3>Quick Start</h3>
                    <p>Create beautiful music videos in five simple steps.</p>
                  </div>

                  <div className="quick-start-list">
                    {quickStartSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                        <button
                          type="button"
                          className={`quick-start-step ${step.tone}`}
                          key={step.title}
                          onClick={() => setActiveTab(step.tab)}
                          aria-label={`Open ${step.title}`}
                        >
                          <span className="quick-start-number">{index + 1}</span>
                          <span className="quick-start-icon" aria-hidden="true">
                            <StepIcon size={28} />
                          </span>
                          <span className="quick-start-copy">
                            <strong>{step.title}</strong>
                            <span>{step.text}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <label className="quick-start-ready">
                    <span className="quick-start-ready-icon" aria-hidden="true">
                      <Music />
                    </span>
                    <span>
                      <strong>Upload or Drop Audio File to begin.</strong>
                    </span>
                    <input
                      type="file"
                      accept={audioAccept}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </label>
                </div>
              </HudSection>
            )}

            {activeTab === "audio" && (
            <HudSection title="Audio">
              <div className="hud-upload-row">
                <label className="upload-box">
                  <Upload size={22} /> Upload or Drop Audio File
                  <input
                    type="file"
                    accept={audioAccept}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                </label>

                <button className={isMicActive ? "play-button mic-button active" : "play-button mic-button"} onClick={toggleMicrophone}>
                  {isMicActive ? <Pause size={22} /> : <Mic size={22} />}
                  {isMicActive ? "Stop Microphone" : "Use Microphone"}
                </button>

                <button className="play-button" onClick={togglePlayback}>
                  {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>

              <p className="hud-microcopy">Drag audio and an image onto the canvas, use the upload fields, or animate the visual from your microphone.</p>
            </HudSection>
            )}

            {activeTab === "image" && (
                <HudSection title="Artwork">
                  <div className="hud-upload-row">
                    <label className="upload-box">
                      <Upload size={18} /> Upload Image Artwork
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handleArtworkFile(file);
                        }}
                      />
                    </label>
                  </div>
                  <p className="hud-microcopy">{artworkName}</p>
                  <Control label="Image Pulse" value={imagePulseStrength} onChange={setImagePulseStrength} min={0} max={1} />
                </HudSection>
            )}

            {activeTab === "waveform" && (
                <HudSection title="Visualizer Design">
                  <div className="field-group waveform-style-field">
                    <label>Waveform Style</label>
                    <select
                      value={visualDesign}
                      onChange={(event) => changeVisualDesign(event.target.value)}
                    >
                      {Object.entries(visualDesigns).map(([key, design]) => (
                        <option key={key} value={key}>
                          {design.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {visualDesign === "sphere" && (
                    <div className="field-group sphere-finish-field">
                      <label>Sphere Finish</label>
                      <select
                        value={sphereFinish}
                        onChange={(event) => setSphereFinish(event.target.value)}
                      >
                        {Object.entries(sphereFinishes).map(([key, finish]) => (
                          <option key={key} value={key}>
                            {finish.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <Control label="Intensity" value={intensity} onChange={setIntensity} />
                  <Control label="Glow Amount" value={glowAmount} onChange={setGlowAmount} />
                  {isLiquidVisual && (
                    <>
                      <Control label="Orb Opacity" value={orbStrength} onChange={setOrbStrength} min={0} max={1} />
                      <Control label="Plasma Strength" value={plasmaStrength} onChange={setPlasmaStrength} />
                    </>
                  )}
                  {!isLiquidVisual && (
                    <>
                      <Control label="Element Size" value={elementScale} onChange={scaleWaveformFrame} min={0.35} max={1.65} />
                      <Control label="Element Position" value={elementY} onChange={moveWaveformFrameY} min={-0.04} max={1.08} />
                    </>
                  )}
                  <Control label={`${responsePrefix} Bass Response`} value={bassSensitivity} onChange={setBassSensitivity} />
                  <Control label={`${responsePrefix} Mid Response`} value={midSensitivity} onChange={setMidSensitivity} />
                  <Control label={`${responsePrefix} High Response`} value={highSensitivity} onChange={setHighSensitivity} />
                  <Control label="Motion Smoothness" value={smoothness} onChange={setSmoothness} min={0.5} max={0.98} />
                </HudSection>
            )}

            {activeTab === "color" && (
                <HudSection title="Color Palette">
                  <div className="palette-grid">
                    {Object.entries(colorPalettes).map(([key, palette]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPaletteKey(key)}
                        className={`preset-button palette-button ${paletteKey === key ? "active" : ""}`}
                      >
                        {palette.label}
                        <span className="palette-swatches" aria-hidden="true">
                          {palette.colors.map((color, index) => (
                            <i
                              key={`${key}-${index}`}
                              style={{
                                background: `${color} 0.95)`,
                                color: `${color} 0.95)`,
                              }}
                            />
                          ))}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPaletteKey("custom")}
                      className={`preset-button palette-button ${paletteKey === "custom" ? "active" : ""}`}
                    >
                      Custom
                      <span className="palette-swatches" aria-hidden="true">
                        {customColors.map((color, index) => {
                          const normalizedColor = normalizeCustomColor(color, ["#5ae1ff", "#ff5fe1", "#f4fbff"][index] || "#ffffff");
                          return (
                            <i
                              key={`custom-${index}`}
                              style={{
                                background: hexToRgba(normalizedColor.hex, normalizedColor.opacity),
                                color: hexToRgba(normalizedColor.hex, normalizedColor.opacity),
                              }}
                            />
                          );
                        })}
                      </span>
                    </button>
                  </div>
                  {paletteKey === "custom" && (
                    <div>
                      {customColors.map((color, index) => {
                        const normalizedColor = normalizeCustomColor(color, ["#5ae1ff", "#ff5fe1", "#f4fbff"][index] || "#ffffff");
                        return (
                        <div className="custom-color-block" key={`custom-color-${index}`}>
                          <div className="color-row">
                            <label>{`Color ${index + 1}`}</label>
                            <input
                              type="color"
                              value={normalizedColor.hex}
                              onChange={(event) => {
                                setCustomColors((previous) =>
                                  previous.map((item, colorIndex) =>
                                    colorIndex === index ? { ...normalizeCustomColor(item), hex: event.target.value } : item
                                  )
                                );
                              }}
                            />
                            <input
                              type="text"
                              value={normalizedColor.hex}
                              onChange={(event) => {
                                setCustomColors((previous) =>
                                  previous.map((item, colorIndex) =>
                                    colorIndex === index ? { ...normalizeCustomColor(item), hex: event.target.value } : item
                                  )
                                );
                              }}
                            />
                          </div>
                          <div className="color-opacity-row">
                            <span>Opacity</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={normalizedColor.opacity}
                              onChange={(event) => {
                                const value = Number(event.target.value);
                                setCustomColors((previous) =>
                                  previous.map((item, colorIndex) =>
                                    colorIndex === index ? { ...normalizeCustomColor(item), opacity: value } : item
                                  )
                                );
                              }}
                            />
                            <span>{Math.round(normalizedColor.opacity * 100)}%</span>
                          </div>
                        </div>
                      );
                      })}
                      <EffectColorControl
                        title="Image Border"
                        value={imageBorderColor}
                        fallback="#5ae1ff"
                        onChange={setImageBorderColor}
                      />
                      <EffectColorControl
                        title="Center Glow"
                        value={imageCenterGlowColor}
                        fallback="#f4fbff"
                        onChange={setImageCenterGlowColor}
                      />
                    </div>
                  )}
                </HudSection>
            )}

            {activeTab === "export" && (
                <HudSection title="Video Output">
                  <button
                    className={`theater-button export-button ${exportedVideo ? "ready" : ""}`}
                    onClick={handleExportAction}
                  >
                    <span className="export-button-content">
                      {isExporting ? (
                        <>
                          <span className="export-button-label">
                            <span className="export-recording-dot" aria-hidden="true" />
                            Recording…
                          </span>
                          <small>Stop &amp; Export</small>
                        </>
                      ) : exportedVideo ? (
                        <>
                          <span className="export-button-label">
                            <Download className="export-state-icon" />
                            Download MP4
                          </span>
                        </>
                      ) : (
                        <span className="export-button-label">
                          <Film className="export-state-icon" />
                          Record Video
                        </span>
                      )}
                    </span>
                  </button>
                  <p className="hud-microcopy">Exports the 16:9 canvas with the uploaded audio when your browser supports recording.</p>
                </HudSection>
            )}

            {activeTab === "background" && (
              <HudSection title="Background">
                <div className="field-group">
                  <label>Background Template</label>
                  <div className="template-grid">
                    {Object.entries(artworkBackgroundTemplates).map(([key, template]) => (
                      <button
                        key={key}
                        type="button"
                        className={`preset-button template-button ${artworkBackgroundTemplate === key ? "active" : ""}`}
                        onClick={() => setArtworkBackgroundTemplate(key)}
                        aria-label={template.label}
                        title={template.label}
                      >
                        <span className={`template-thumb ${key}`} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-group background-gradient-field">
                  <label>Background Colors</label>
                  <div className="background-gradient-grid">
                    {Object.entries(backgroundGradientPalettes).map(([key, gradient]) => (
                      <button
                        key={key}
                        type="button"
                        className={`gradient-swatch-button ${backgroundGradientKey === key ? "active" : ""}`}
                        onClick={() => {
                          setBackgroundGradientKey(key);
                          if (artworkBackgroundTemplate !== "studioGlow") {
                            setArtworkBackgroundTemplate("colorWash");
                          }
                        }}
                        aria-label={gradient.label}
                        title={gradient.label}
                      >
                        <span
                          className="gradient-swatch"
                          style={getBackgroundGradientStyle(key, gradient)}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-group background-mood-field">
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
                <div className="field-group background-pulse-field">
                  <label>Background Pulse</label>
                  <select
                    value={backgroundPulseMode}
                    onChange={(event) => setBackgroundPulseMode(event.target.value)}
                  >
                    {Object.entries(backgroundPulseModes).map(([key, mode]) => (
                      <option key={key} value={key}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
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

function EffectColorControl({ title, value, fallback, onChange }) {
  const color = normalizeCustomColor(value, fallback);

  return (
    <div className="color-effects-group">
      <div className="color-row">
        <label>{title}</label>
        <input
          type="color"
          value={color.hex}
          onChange={(event) => onChange({ ...color, hex: event.target.value })}
        />
        <input
          type="text"
          value={color.hex}
          onChange={(event) => onChange({ ...color, hex: event.target.value })}
        />
      </div>
      <div className="color-opacity-row">
        <span>Opacity</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={color.opacity}
          onChange={(event) => onChange({ ...color, opacity: Number(event.target.value) })}
        />
        <span>{Math.round(color.opacity * 100)}%</span>
      </div>
    </div>
  );
}

function Control({ label, value, onChange, min, max, className = "" }) {
  const inputMin = min ?? (label.includes("Strength") ? 0 : 0.1);
  const inputMax = max ?? (label.includes("Sensitivity") ? 2 : label.includes("Strength") ? 2 : 1);

  return (
    <div className={`field-group ${className}`.trim()}>
      <input
        type="range"
        min={inputMin}
        max={inputMax}
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="label-row">
        <label>{label}</label>
        <span>{Math.round(value * 100)}%</span>
      </div>
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
