import React from "react";
import { Scene } from "./_shared";
import { scenarioState } from "./_shared";

export function BattleRedesignCopyPOKuIJU() {
  return (
    <Scene
      variant="neon-floating"
      state={scenarioState}
      renderToggle={
        <div className="absolute top-3 right-3 z-40 pointer-events-auto">
          <style>{`
            @keyframes neon-pulse {
              0%, 100% { box-shadow: 0 0 6px rgba(56,189,248,0.4), 0 0 20px rgba(56,189,248,0.2); }
              50% { box-shadow: 0 0 12px rgba(56,189,248,0.7), 0 0 40px rgba(56,189,248,0.4); }
            }
          `}</style>
          <div className="relative flex items-center rounded-full p-1 bg-slate-900/90 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden">
            {/* Track background */}
            <div className="absolute inset-0 rounded-full bg-slate-800/60" />

            {/* Sliding active indicator — MANUAL (left) */}
            <div
              className="absolute left-1 top-1 bottom-1 w-[72px] rounded-full bg-sky-500/25 border border-sky-400/50 transition-all duration-300"
              style={{
                animation: "neon-pulse 2s ease-in-out infinite",
                transform: "translateX(0)",
              }}
            />

            {/* AUTO button */}
            <button
              className="relative z-10 w-[72px] h-8 flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 transition-all duration-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a9 9 0 0 0 0 18a9 9 0 0 0 0 -18" />
                <path d="M12 7v5l3 3" />
              </svg>
              AUTO
            </button>

            {/* MANUAL button */}
            <button
              className="relative z-10 w-[72px] h-8 flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider text-sky-200 transition-all duration-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              MANUAL
            </button>
          </div>

          {/* Floating label */}
          <div className="text-center mt-1.5">
            <span className="text-[9px] font-mono tracking-[0.15em] text-sky-300/60 uppercase">
              ● Manual Control Active
            </span>
          </div>
        </div>
      }
    />
  );
}
