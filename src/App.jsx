{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww15740\viewh16580\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
// ============================================\
// FILE: src/App.jsx\
// ============================================\
\
import React, \{ useEffect, useMemo, useRef, useState \} from "react";\
import \{ Button \} from "@/components/ui/button";\
import \{ Card, CardContent \} from "@/components/ui/card";\
import \{ Slider \} from "@/components/ui/slider";\
import \{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue \} from "@/components/ui/select";\
import \{ Upload, Play, Pause, Sparkles, CircleDot \} from "lucide-react";\
\
const moods = \{\
  dawn: \{\
    label: "Dawn Gold",\
    gradient: ["#1b1f3b", "#6f4f8f", "#f2b36d", "#fff3d0"],\
    glow: "rgba(255, 210, 150,",\
    line: "rgba(255, 238, 210,",\
  \},\
  sunset: \{\
    label: "Rose Sunset",\
    gradient: ["#15172f", "#51335d", "#d18472", "#f5d6bd"],\
    glow: "rgba(255, 174, 160,",\
    line: "rgba(255, 224, 216,",\
  \},\
  celestial: \{\
    label: "Celestial Blue",\
    gradient: ["#07152f", "#123a61", "#6ea4bf", "#e8f5ff"],\
    glow: "rgba(155, 215, 255,",\
    line: "rgba(224, 244, 255,",\
  \},\
  temple: \{\
    label: "Temple Sage",\
    gradient: ["#0e1f24", "#31524c", "#9daf8d", "#efe8cf"],\
    glow: "rgba(208, 223, 176,",\
    line: "rgba(238, 244, 219,",\
  \},\
\};\
\
function averageRange(dataArray, start, end) \{\
  let sum = 0;\
  const safeEnd = Math.min(end, dataArray.length);\
  for (let i = start; i < safeEnd; i++) sum += dataArray[i];\
  return sum / Math.max(1, safeEnd - start) / 255;\
\}\
\
function drawBackground(ctx, width, height, mood, time) \{\
  const gradient = ctx.createLinearGradient(0, 0, width, height);\
  const colors = mood.gradient;\
  gradient.addColorStop(0, colors[0]);\
  gradient.addColorStop(0.35, colors[1]);\
  gradient.addColorStop(0.72, colors[2]);\
  gradient.addColorStop(1, colors[3]);\
  ctx.fillStyle = gradient;\
  ctx.fillRect(0, 0, width, height);\
\
  const sunX = width * (0.52 + Math.sin(time * 0.00004) * 0.03);\
  const sunY = height * 0.58;\
  const radial = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.5);\
  radial.addColorStop(0, "rgba(255, 238, 188, 0.24)");\
  radial.addColorStop(0.45, "rgba(255, 220, 180, 0.09)");\
  radial.addColorStop(1, "rgba(255, 255, 255, 0)");\
  ctx.fillStyle = radial;\
  ctx.fillRect(0, 0, width, height);\
\}\
\
function drawFlowerOfLife(ctx, cx, cy, radius, rings, mood, opacity, glowAmount, scale, drift) \{\
  ctx.save();\
  ctx.translate(cx + drift.x, cy + drift.y);\
  ctx.scale(scale, scale);\
  ctx.lineWidth = Math.max(0.8, radius * 0.012);\
  ctx.shadowBlur = 22 * glowAmount;\
  ctx.shadowColor = `$\{mood.glow\} 0.72)`;\
\
  const circles = [\{ x: 0, y: 0 \}];\
  const spacing = radius;\
  for (let q = -rings; q <= rings; q++) \{\
    for (let r = -rings; r <= rings; r++) \{\
      const s = -q - r;\
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= rings) \{\
        const x = spacing * (q + r / 2);\
        const y = spacing * (Math.sqrt(3) / 2) * r;\
        circles.push(\{ x, y \});\
      \}\
    \}\
  \}\
\
  circles.forEach((c, index) => \{\
    const alpha = opacity * (index === 0 ? 0.78 : 0.5);\
    ctx.strokeStyle = `$\{mood.line\} $\{alpha\})`;\
    ctx.beginPath();\
    ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);\
    ctx.stroke();\
  \});\
\
  ctx.shadowBlur = 34 * glowAmount;\
  ctx.strokeStyle = `$\{mood.glow\} $\{0.18 * opacity\})`;\
  for (let i = 1; i <= 4; i++) \{\
    ctx.lineWidth = 1.2;\
    ctx.beginPath();\
    ctx.arc(0, 0, radius * (rings + i * 0.58), 0, Math.PI * 2);\
    ctx.stroke();\
  \}\
\
  ctx.restore();\
\}\
\
function createParticles(count, width, height) \{\
  return Array.from(\{ length: count \}, () => (\{\
    x: Math.random() * width,\
    y: Math.random() * height,\
    size: 0.6 + Math.random() * 1.8,\
    speed: 0.08 + Math.random() * 0.22,\
    phase: Math.random() * Math.PI * 2,\
    depth: 0.35 + Math.random() * 0.65,\
  \}));\
\}\
\
function drawParticles(ctx, particles, width, height, high, mood, time, intensity) \{\
  particles.forEach((p) => \{\
    p.y -= p.speed * p.depth * (0.35 + intensity * 0.25);\
    p.x += Math.sin(time * 0.00035 + p.phase) * 0.08;\
    if (p.y < -10) \{\
      p.y = height + 10;\
      p.x = Math.random() * width;\
    \}\
    const twinkle = 0.16 + high * 0.62 + Math.sin(time * 0.002 + p.phase) * 0.08;\
    ctx.beginPath();\
    ctx.shadowBlur = 12 + high * 28;\
    ctx.shadowColor = `$\{mood.glow\} $\{0.7\})`;\
    ctx.fillStyle = `$\{mood.line\} $\{Math.max(0.05, twinkle)\})`;\
    ctx.arc(p.x, p.y, p.size * (1 + high * 1.8), 0, Math.PI * 2);\
    ctx.fill();\
  \});\
  ctx.shadowBlur = 0;\
\}\
\
function getEmbedParams() \{\
  const params = new URLSearchParams(window.location.search);\
  return \{\
    embed: params.get("embed") === "1",\
    mood: params.get("mood") || "dawn",\
    intensity: Number(params.get("intensity") || 0.55),\
    geometry: Number(params.get("geometry") || 0.62),\
    glow: Number(params.get("glow") || 0.55),\
    controls: params.get("controls") !== "0",\
  \};\
\}\
\
function clamp(value, min = 0.1, max = 1) \{\
  if (Number.isNaN(value)) return min;\
  return Math.min(max, Math.max(min, value));\
\}\
\
export default function LightMovingVisualEngine() \{\
  const embedParams = useMemo(() => getEmbedParams(), []);\
  const canvasRef = useRef(null);\
  const audioRef = useRef(null);\
  const audioContextRef = useRef(null);\
  const analyserRef = useRef(null);\
  const sourceRef = useRef(null);\
  const dataRef = useRef(null);\
  const animationRef = useRef(null);\
  const particlesRef = useRef([]);\
\
  const [audioName, setAudioName] = useState("No audio selected");\
  const [isPlaying, setIsPlaying] = useState(false);\
  const [intensity, setIntensity] = useState([clamp(embedParams.intensity)]);\
  const [geometrySize, setGeometrySize] = useState([clamp(embedParams.geometry)]);\
  const [glowAmount, setGlowAmount] = useState([clamp(embedParams.glow)]);\
  const [moodKey, setMoodKey] = useState(moods[embedParams.mood] ? embedParams.mood : "dawn");\
  const [levels, setLevels] = useState(\{ bass: 0, mids: 0, highs: 0 \});\
\
  useEffect(() => \{\
    const canvas = canvasRef.current;\
    const ctx = canvas.getContext("2d");\
\
    const resize = () => \{\
      const rect = canvas.parentElement.getBoundingClientRect();\
      const dpr = window.devicePixelRatio || 1;\
      canvas.width = Math.floor(rect.width * dpr);\
      canvas.height = Math.floor(rect.height * dpr);\
      canvas.style.width = `$\{rect.width\}px`;\
      canvas.style.height = `$\{rect.height\}px`;\
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\
      particlesRef.current = createParticles(120, rect.width, rect.height);\
    \};\
\
    resize();\
    window.addEventListener("resize", resize);\
    return () => window.removeEventListener("resize", resize);\
  \}, []);\
\
  useEffect(() => \{\
    const canvas = canvasRef.current;\
    const ctx = canvas.getContext("2d");\
\
    const render = (time) => \{\
      const rect = canvas.getBoundingClientRect();\
      const width = rect.width;\
      const height = rect.height;\
      const mood = moods[moodKey];\
\
      let bass = 0;\
      let mids = 0;\
      let highs = 0;\
\
      if (analyserRef.current && dataRef.current) \{\
        analyserRef.current.getByteFrequencyData(dataRef.current);\
        bass = averageRange(dataRef.current, 2, 18);\
        mids = averageRange(dataRef.current, 18, 86);\
        highs = averageRange(dataRef.current, 86, 180);\
      \}\
\
      const smoothing = 0.065;\
      setLevels((prev) => (\{\
        bass: prev.bass + (bass - prev.bass) * smoothing,\
        mids: prev.mids + (mids - prev.mids) * smoothing,\
        highs: prev.highs + (highs - prev.highs) * smoothing,\
      \}));\
\
      const softBass = Math.min(1, bass * 1.8);\
      const softMids = Math.min(1, mids * 1.5);\
      const softHighs = Math.min(1, highs * 1.8);\
\
      drawBackground(ctx, width, height, mood, time);\
\
      const baseRadius = Math.min(width, height) * 0.088 * geometrySize[0];\
      const breathingScale = 1 + softBass * 0.095 * intensity[0] + Math.sin(time * 0.00055) * 0.012;\
      const opacity = 0.22 + softMids * 0.28 + intensity[0] * 0.18;\
      const drift = \{\
        x: Math.sin(time * 0.00011) * width * 0.018,\
        y: Math.cos(time * 0.00009) * height * 0.014,\
      \};\
\
      drawParticles(ctx, particlesRef.current, width, height, softHighs, mood, time, intensity[0]);\
      drawFlowerOfLife(\
        ctx,\
        width / 2,\
        height / 2,\
        baseRadius,\
        3,\
        mood,\
        opacity,\
        glowAmount[0] + softHighs * 0.45,\
        breathingScale,\
        drift\
      );\
\
      ctx.save();\
      ctx.globalCompositeOperation = "screen";\
      const halo = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.min(width, height) * 0.52);\
      halo.addColorStop(0, `$\{mood.glow\} $\{0.08 + softBass * 0.07\})`);\
      halo.addColorStop(0.55, `$\{mood.glow\} $\{0.035 + softHighs * 0.04\})`);\
      halo.addColorStop(1, "rgba(255,255,255,0)");\
      ctx.fillStyle = halo;\
      ctx.fillRect(0, 0, width, height);\
      ctx.restore();\
\
      animationRef.current = requestAnimationFrame(render);\
    \};\
\
    animationRef.current = requestAnimationFrame(render);\
    return () => cancelAnimationFrame(animationRef.current);\
  \}, [intensity, geometrySize, glowAmount, moodKey]);\
\
  const setupAudio = async (file) => \{\
    const audio = audioRef.current;\
    const url = URL.createObjectURL(file);\
    audio.src = url;\
    setAudioName(file.name);\
    setIsPlaying(false);\
\
    if (!audioContextRef.current) \{\
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();\
      analyserRef.current = audioContextRef.current.createAnalyser();\
      analyserRef.current.fftSize = 1024;\
      analyserRef.current.smoothingTimeConstant = 0.88;\
      dataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);\
    \}\
\
    if (!sourceRef.current) \{\
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio);\
      sourceRef.current.connect(analyserRef.current);\
      analyserRef.current.connect(audioContextRef.current.destination);\
    \}\
  \};\
\
  const togglePlayback = async () => \{\
    const audio = audioRef.current;\
    if (!audio.src) return;\
\
    if (audioContextRef.current?.state === "suspended") \{\
      await audioContextRef.current.resume();\
    \}\
\
    if (isPlaying) \{\
      audio.pause();\
      setIsPlaying(false);\
    \} else \{\
      await audio.play();\
      setIsPlaying(true);\
    \}\
  \};\
\
  return (\
    <div className=\{`$\{embedParams.embed ? "min-h-0 p-0" : "min-h-screen p-4 md:p-8"\} bg-slate-950 text-white`\}>\
      <div className=\{`$\{embedParams.embed ? "mx-auto w-full space-y-3" : "mx-auto max-w-7xl space-y-5"\}`\}>\
        \{!embedParams.embed && (\
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">\
            <div>\
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-sm text-white/75">\
                <Sparkles className="h-4 w-4" /> Prototype 1\
              </div>\
              <h1 className="text-3xl md:text-5xl font-light tracking-tight">LightMoving Visual Engine</h1>\
              <p className="mt-2 max-w-2xl text-white/65">\
                A slow cinematic audio-reactive sacred geometry visualizer using Canvas and the Web Audio API.\
              </p>\
            </div>\
            <div className="flex items-center gap-2 text-sm text-white/60">\
              <CircleDot className="h-4 w-4" /> Flower of Life / Music Reactive\
            </div>\
          </div>\
        )\}\
\
        <div className=\{`$\{embedParams.embed ? "grid gap-3" : "grid gap-5 lg:grid-cols-[1fr_340px]"\}`\}>\
          <Card className=\{`$\{embedParams.embed ? "rounded-none border-0" : "rounded-3xl border-white/10"\} overflow-hidden bg-white/5 shadow-2xl`\}\
            <CardContent className="p-0">\
              <div className=\{`$\{embedParams.embed ? "rounded-none" : "rounded-3xl"\} relative aspect-video w-full overflow-hidden`\}\
                <canvas ref=\{canvasRef\} className="absolute inset-0 h-full w-full" />\
                <div className=\{`$\{embedParams.embed ? "rounded-none" : "rounded-3xl"\} pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10`\} />\
                <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-black/25 px-4 py-3 backdrop-blur-md">\
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">Now loaded</div>\
                  <div className="max-w-[70vw] truncate text-sm text-white/80">\{audioName\}</div>\
                </div>\
              </div>\
            </CardContent>\
          </Card>\
\
          \{embedParams.controls && (\
            <Card className=\{`$\{embedParams.embed ? "mx-3 mb-3" : ""\} rounded-3xl border-white/10 bg-white/7 shadow-xl backdrop-blur`\}>\
              <CardContent className="space-y-6 p-5">\
                <div className="space-y-3">\
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/8 px-4 py-4 text-sm text-white/80 transition hover:bg-white/12">\
                    <Upload className="h-4 w-4" /> Upload audio file\
                    <input\
                      type="file"\
                      accept="audio/*"\
                      className="hidden"\
                      onChange=\{(event) => \{\
                        const file = event.target.files?.[0];\
                        if (file) setupAudio(file);\
                      \}\}\
                    />\
                  </label>\
                  <Button onClick=\{togglePlayback\} className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-white/90">\
                    \{isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />\}\
                    \{isPlaying ? "Pause" : "Play"\}\
                  </Button>\
                  <audio ref=\{audioRef\} onEnded=\{() => setIsPlaying(false)\} className="hidden" />\
                </div>\
\
                <div className="space-y-5">\
                  <Control label="Intensity" value=\{intensity\} onChange=\{setIntensity\} />\
                  <Control label="Geometry Size" value=\{geometrySize\} onChange=\{setGeometrySize\} />\
                  <Control label="Glow Amount" value=\{glowAmount\} onChange=\{setGlowAmount\} />\
                </div>\
\
                <div className="space-y-2">\
                  <div className="text-sm text-white/70">Background Mood</div>\
                  <Select value=\{moodKey\} onValueChange=\{setMoodKey\}>\
                    <SelectTrigger className="rounded-2xl border-white/10 bg-white/8 text-white">\
                      <SelectValue />\
                    </SelectTrigger>\
                    <SelectContent>\
                      \{Object.entries(moods).map(([key, mood]) => (\
                        <SelectItem key=\{key\} value=\{key\}>\{mood.label\}</SelectItem>\
                      ))\}\
                    </SelectContent>\
                  </Select>\
                </div>\
\
                <div className="grid grid-cols-3 gap-2 pt-1">\
                  <Meter label="Bass" value=\{levels.bass\} />\
                  <Meter label="Mids" value=\{levels.mids\} />\
                  <Meter label="Highs" value=\{levels.highs\} />\
                </div>\
\
                <div className="rounded-2xl border border-white/10 bg-black/18 p-4 text-xs leading-relaxed text-white/55">\
                  Bass gently controls scale breathing. Mids shape opacity movement. Highs add restrained sparkle and glow.\
                </div>\
              </CardContent>\
            </Card>\
          )\}\
        </div>\
      </div>\
    </div>\
  );\
\}\
\
function Control(\{ label, value, onChange \}) \{\
  return (\
    <div className="space-y-2">\
      <div className="flex justify-between text-sm">\
        <span className="text-white/70">\{label\}</span>\
        <span className="text-white/40">\{Math.round(value[0] * 100)\}%</span>\
      </div>\
      <Slider value=\{value\} onValueChange=\{onChange\} min=\{0.1\} max=\{1\} step=\{0.01\} />\
    </div>\
  );\
\}\
\
// ============================================\
// GITHUB UPLOAD STRUCTURE\
// ============================================\
\
// lightmoving-visual-engine/\
// \uc0\u9500 \u9472 \u9472  package.json\
// \uc0\u9500 \u9472 \u9472  vite.config.js\
// \uc0\u9500 \u9472 \u9472  index.html\
// \uc0\u9500 \u9472 \u9472  README.md\
// \uc0\u9500 \u9472 \u9472  .gitignore\
// \uc0\u9492 \u9472 \u9472  src/\
//     \uc0\u9500 \u9472 \u9472  main.jsx\
//     \uc0\u9500 \u9472 \u9472  App.jsx\
//     \uc0\u9492 \u9472 \u9472  index.css\
\
function Meter(\{ label, value \}) \{\
  return (\
    <div className="rounded-2xl border border-white/10 bg-white/6 p-3">\
      <div className="mb-2 text-xs text-white/45">\{label\}</div>\
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">\
        <div className="h-full rounded-full bg-white/70 transition-all duration-150" style=\{\{ width: `$\{Math.round(value * 100)\}%` \}\} />\
      </div>\
    </div>\
  );\
\}\
}