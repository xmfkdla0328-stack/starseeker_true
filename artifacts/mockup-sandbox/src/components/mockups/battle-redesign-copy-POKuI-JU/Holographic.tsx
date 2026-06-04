import React from "react";
import { Scene } from "./_shared";
import { scenarioState } from "./_shared";

export function Holographic() {
  return (
    <Scene
      variant="holographic"
      state={scenarioState}
      renderToggle={
        <div className="absolute top-2 left-3 right-3 z-50 pointer-events-auto">
          <style>{`
            @keyframes holographic-shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes holographic-scanline {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(200%); }
            }
          `}</style>
          <div className="relative flex items-center justify-between px-3 py-2 rounded-lg
            bg-slate-900/80 border border-sky-400/30
            shadow-[0_0_30px_rgba(56,189,248,0.15),0_4px_20px_rgba(0,0,0,0.5)]
            backdrop-blur-md overflow-hidden">

            {/* Shimmer overlay — subtle animated sheen */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)",
                backgroundSize: "200% 100%",
                animation: "holographic-shimmer 3s linear infinite",
              }}
            />

            {/* Scanline effect */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(56,189,248,0.02) 2px, rgba(56,189,248,0.02) 4px)",
              }}
            />
            <div
              className="absolute left-0 right-0 h-[1px] bg-sky-400/30 pointer-events-none"
              style={{ animation: "holographic-scanline 4s linear infinite" }}
            />

            {/* Left: Status indicator */}
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-40" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-mono tracking-[0.2em] text-sky-400/80 uppercase">Mode</span>
                <span className="text-[12px] font-bold tracking-wider text-sky-100">MANUAL</span>
              </div>
            </div>

            {/* Center: Live text */}
            <div className="relative flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-[9px] font-mono tracking-[0.15em] text-emerald-300/80">LIVE</span>
            </div>

            {/* Right: Toggle pill */}
            <button
              className="relative flex items-center gap-2 pl-3 pr-2 py-1 rounded-full
                bg-sky-500/15 border border-sky-400/40
                transition-all duration-300 hover:bg-sky-500/25 hover:border-sky-400/60
                active:scale-95"
            >
              <span className="text-[9px] font-bold tracking-wider text-sky-200">SWITCH</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-300">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
        </div>
      }
    />
  );
}
