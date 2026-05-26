import React from "react";

export default function App() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at center, #1e3a5f 0%, #020617 70%)",
        color: "white",
        fontFamily: "sans-serif",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.2)",
          boxShadow: "0 0 80px rgba(120,180,255,0.35)",
          position: "relative",
          animation: "pulse 6s ease-in-out infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 60,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />
      </div>

      <h1
        style={{
          marginTop: 40,
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: 2,
        }}
      >
        LightMoving Visual Engine
      </h1>

      <p
        style={{
          opacity: 0.7,
          marginTop: 10,
          fontSize: 14,
        }}
      >
        Prototype 1 • Sacred Geometry Audio Visualizer
      </p>

      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
}
