import React from "react";
import { Scene } from "./_shared";
import { scenarioState } from "./_shared";

export function Segmented() {
  return (
    <Scene
      variant="segmented"
      state={scenarioState}
      renderToggle={
        <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <style>{`
            @keyframes segmented-breathe {
              0%, 100% { opacity: 0.85; }
              50% { opacity: 1; }
            }
          `}</style>
          <div className="flex items-center gap-0">
            {/* AUTO button */}
            <button
              className="flex items-center gap-1.5 pl-4 pr-5 py-2.5 rounded-l-full
                bg-slate-800/70 border border-r-0 border-slate-600/40
                text-[11px] font-bold tracking-wider text-slate-500
                transition-all duration-300 hover:bg-slate-700/50"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a9 9 0 0 0 0 18a9 9 0 0 0 0 -18" />
                <path d="M12 7v5l3 3" />
              </svg>
              AUTO
            </button>

            {/* Divider with glow dot */}
            <div className="relative flex items-center justify-center bg-slate-800/70 border border-slate-600/40 border-l-0 border-r-0 px-2 py-2.5">
              <div className="w-px h-5 bg-slate-600/50" />
              <div
                className="absolute w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                style={{ animation: "segmented-breathe 2s ease-in-out infinite" }}
              />
            </div>

            {/* MANUAL button — active */}
            <button
              className="flex items-center gap-1.5 pl-5 pr-4 py-2.5 rounded-r-full
                bg-slate-800/70 border border-l-0 border-slate-600/40
                text-[11px] font-bold tracking-wider text-sky-200
                transition-all duration-300
                shadow-[0_0_20px_rgba(56,189,248,0.2),inset_0_1px_0_rgba(56,189,248,0.15)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              MANUAL
            </button>
          </div>
        </div>
      }
    />
  );
}
