import React from "react";
import {
  Sword, Shield, Zap, Sparkles, Brain, Heart,
  Crosshair,
} from "lucide-react";

export type Variant = "current" | "disciplined" | "mode-aware" | "neon-floating" | "segmented" | "holographic";

export const scenarioState = {
  battleMode: "manual" as const,
  causality: 45,
  buffs: {
    atk:    { active: false, timeLeft: 0 },
    shield: { active: false, timeLeft: 0 },
    speed:  { active: false, timeLeft: 0 },
  },
  userStats: { str: 12, agi: 18, int: 8, wil: 6, chr: 4 },
  allies: [
    { id: 1, name: "리온",   color: "from-rose-500 to-rose-700",     hp: 78, maxHp: 100, ult: 100, maxUlt: 100, shield: 0, ultReady: true,  pending: false },
    { id: 2, name: "셀라",   color: "from-sky-500 to-sky-700",       hp: 92, maxHp: 100, ult: 100, maxUlt: 100, shield: 25, ultReady: true, pending: true  },
    { id: 3, name: "카이엔", color: "from-amber-500 to-amber-700",   hp: 60, maxHp: 100, ult: 70,  maxUlt: 100, shield: 0, ultReady: false, pending: false },
    { id: 4, name: "노아",   color: "from-emerald-500 to-emerald-700", hp: 100, maxHp: 100, ult: 30,  maxUlt: 100, shield: 0, ultReady: false, pending: false },
  ],
  boss: {
    name: "심연의 감시자",
    hp: 1840, maxHp: 3200,
    ultGauge: 60, maxUltGauge: 100,
    causalityPct: 45,
    isCharging: false,
    isPriority: true,
  },
  minions: [
    { idx: 0, name: "잡몹", hp: 80,  maxHp: 120, isPriority: false },
    { idx: 2, name: "잡몹", hp: 110, maxHp: 120, isPriority: false },
  ],
};

type State = typeof scenarioState;

/* ============================================================
   Variant token map — each variant overrides a small set of
   color / chrome tokens. Layout stays identical for fair compare.
   ============================================================ */

function tokens(v: Variant) {
  if (v === "current") {
    return {
      // Background / frame
      pageBg: "bg-slate-950",
      vignette: "",
      // Mode toggle
      modePill: "border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.3)] min-w-[68px]",
      modeLabel: "MANUAL",
      modeBanner: null as React.ReactNode,
      // Causality bar color
      causalityBar: "from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
      causalityLabel: "text-cyan-300",
      // Skill button "actionable" pulse
      skillActionableHint: false,
      // Ally portrait outline rules
      allyReadyBorder: "border-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.4)]",
      allyQueuedBorder: "border-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.6)]",
      allyUltBar: "from-amber-500 to-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]",
      // Priority crosshair
      crosshairColor: "text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.95)]",
      bossPriorityRing: "",
      // Stat tray density
      statTrayBold: false,
    };
  }
  if (v === "disciplined") {
    return {
      pageBg: "bg-slate-950",
      vignette: "",
      // Same MANUAL pill but quieter — priority on actionable surfaces
      modePill: "border-sky-400/60 bg-sky-500/10 text-sky-100 min-w-[68px]",
      modeLabel: "MANUAL",
      modeBanner: null,
      // Causality stays cyan (system color)
      causalityBar: "from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
      causalityLabel: "text-cyan-300",
      // Affordable skill (ATTACK 10 CP, have 45) gets amber actionable pulse
      skillActionableHint: true,
      // Same amber ult conventions but tighter contrast
      allyReadyBorder: "border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]",
      allyQueuedBorder: "border-amber-200 shadow-[0_0_22px_rgba(252,211,77,0.85)] ring-1 ring-amber-200/60",
      allyUltBar: "from-amber-400 to-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.7)]",
      // User-marked target stays sky (only sky-meaning in scene = user marking)
      crosshairColor: "text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]",
      bossPriorityRing: "ring-2 ring-sky-300/70 ring-offset-2 ring-offset-slate-950",
      statTrayBold: false,
    };
  }
  if (v === "mode-aware") {
    return {
      pageBg: "bg-slate-950",
      // Sky inner-vignette around whole scene → MANUAL mode is unmistakable
      vignette: "shadow-[inset_0_0_80px_rgba(56,189,248,0.18)] ring-1 ring-inset ring-sky-400/15",
      // Mode pill upgraded to a labeled banner+pill
      modePill: "border-sky-300 bg-sky-400/25 text-sky-50 font-extrabold shadow-[0_0_14px_rgba(56,189,248,0.55)] min-w-[80px]",
      modeLabel: "● MANUAL",
      modeBanner: (
        <div className="flex-shrink-0 z-30 pointer-events-none">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
          <div className="text-center text-[9px] font-mono tracking-[0.4em] text-sky-200/80 py-1 bg-sky-500/5">
            MANUAL CONTROL
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
        </div>
      ),
      causalityBar: "from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
      causalityLabel: "text-cyan-300",
      skillActionableHint: true,
      allyReadyBorder: "border-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.65)] animate-[ult-ready-pulse_1.6s_ease-in-out_infinite]",
      allyQueuedBorder: "border-amber-200 shadow-[0_0_24px_rgba(252,211,77,0.95)] ring-2 ring-amber-200/70",
      allyUltBar: "from-amber-300 via-amber-200 to-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.85)]",
      crosshairColor: "text-sky-200 drop-shadow-[0_0_14px_rgba(56,189,248,1)]",
      bossPriorityRing: "ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.4)]",
      statTrayBold: true,
    };
  }

  // NEW AUTO/MANUAL TOGGLE VARIANTS
  if (v === "neon-floating") return NEON_FLOATING;
  if (v === "segmented") return SEGMENTED;
  if (v === "holographic") return HOLOGRAPHIC;

  // fallback
  return {
    pageBg: "bg-slate-950",
    vignette: "",
    modePill: "hidden",
    modeLabel: "",
    modeBanner: null,
    causalityBar: "from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
    causalityLabel: "text-cyan-300",
    skillActionableHint: true,
    allyReadyBorder: "border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]",
    allyQueuedBorder: "border-amber-200 shadow-[0_0_22px_rgba(252,211,77,0.85)] ring-1 ring-amber-200/60",
    allyUltBar: "from-amber-400 to-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.7)]",
    crosshairColor: "text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]",
    bossPriorityRing: "ring-2 ring-sky-300/70 ring-offset-2 ring-offset-slate-950",
    statTrayBold: false,
  };
}

// --- NEW AUTO/MANUAL TOGGLE VARIANTS ---
// These inherit the disciplined battle scene but replace the toggle UI

export const NEON_FLOATING: ReturnType<typeof tokens> = {
  pageBg: "bg-slate-950",
  vignette: "",
  modePill: "hidden",
  modeLabel: "",
  modeBanner: null,
  causalityBar: "from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
  causalityLabel: "text-cyan-300",
  skillActionableHint: true,
  allyReadyBorder: "border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]",
  allyQueuedBorder: "border-amber-200 shadow-[0_0_22px_rgba(252,211,77,0.85)] ring-1 ring-amber-200/60",
  allyUltBar: "from-amber-400 to-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.7)]",
  crosshairColor: "text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]",
  bossPriorityRing: "ring-2 ring-sky-300/70 ring-offset-2 ring-offset-slate-950",
  statTrayBold: false,
};

export const SEGMENTED: ReturnType<typeof tokens> = {
  pageBg: "bg-slate-950",
  vignette: "",
  modePill: "hidden",
  modeLabel: "",
  modeBanner: null,
  causalityBar: "from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
  causalityLabel: "text-cyan-300",
  skillActionableHint: true,
  allyReadyBorder: "border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]",
  allyQueuedBorder: "border-amber-200 shadow-[0_0_22px_rgba(252,211,77,0.85)] ring-1 ring-amber-200/60",
  allyUltBar: "from-amber-400 to-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.7)]",
  crosshairColor: "text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]",
  bossPriorityRing: "ring-2 ring-sky-300/70 ring-offset-2 ring-offset-slate-950",
  statTrayBold: false,
};

export const HOLOGRAPHIC: ReturnType<typeof tokens> = {
  pageBg: "bg-slate-950",
  vignette: "shadow-[inset_0_0_120px_rgba(139,92,246,0.12)] ring-1 ring-inset ring-violet-400/15",
  modePill: "hidden",
  modeLabel: "",
  modeBanner: null,
  causalityBar: "from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
  causalityLabel: "text-cyan-300",
  skillActionableHint: true,
  allyReadyBorder: "border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]",
  allyQueuedBorder: "border-amber-200 shadow-[0_0_22px_rgba(252,211,77,0.85)] ring-1 ring-amber-200/60",
  allyUltBar: "from-amber-400 to-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.7)]",
  crosshairColor: "text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]",
  bossPriorityRing: "ring-2 ring-sky-300/70 ring-offset-2 ring-offset-slate-950",
  statTrayBold: false,
};

/* ============================================================
   Scene
   ============================================================ */

export function Scene({ variant, state, renderToggle }: { variant: Variant; state: State; renderToggle?: React.ReactNode }) {
  const t = tokens(variant);
  const isNewVariant = variant === "neon-floating" || variant === "segmented" || variant === "holographic";

  return (
    <div className={`w-full min-h-screen ${t.pageBg} text-slate-100 flex justify-center`}>
      <style>{`
        @keyframes ult-ready-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(251,191,36,0.55); }
          50%      { box-shadow: 0 0 22px rgba(251,191,36,0.95); }
        }
        @keyframes skill-pop {
          0%, 100% { box-shadow: 0 0 0px rgba(252,211,77,0.0); border-color: rgba(252,211,77,0.6); }
          50%      { box-shadow: 0 0 16px rgba(252,211,77,0.55); border-color: rgba(252,211,77,1); }
        }
      `}</style>
      <div
        className={`relative w-full max-w-md h-[100dvh] flex flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 ${t.vignette}`}
      >
        {isNewVariant ? (
          renderToggle
        ) : (
          t.modeBanner
        )}

        {/* Enemy zone */}
        <EnemyZone variant={variant} t={t} state={state} />

        {/* Ally zone */}
        <AllyZone variant={variant} t={t} state={state} />

        {/* Control zone */}
        <ControlZone variant={variant} t={t} state={state} />
      </div>
    </div>
  );
}

/* ----- Enemy zone ----- */

function EnemyZone({ variant, t, state }: { variant: Variant; t: ReturnType<typeof tokens>; state: State }) {
  const { boss, minions } = state;
  const causalityPct = boss.causalityPct;
  const stage = boss.isCharging ? "charging" : causalityPct >= 70 ? "warn" : "normal";
  const auraClass =
    stage === "charging" ? "bg-rose-500/40 animate-pulse"
    : stage === "warn"   ? "bg-fuchsia-500/30 animate-pulse"
    :                       "bg-white/10 animate-pulse";
  const borderClass =
    stage === "charging" ? "border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.85)]"
    : stage === "warn"   ? "border-fuchsia-500 shadow-[0_0_28px_rgba(232,121,249,0.6)] animate-pulse"
    :                       "border-slate-300/70 shadow-[0_0_20px_rgba(255,255,255,0.25)]";
  const overlayGradientFrom =
    stage === "charging" ? "from-rose-900/80"
    : stage === "warn"   ? "from-fuchsia-900/75"
    :                       "from-slate-700/70";

  return (
    <div className="relative flex-1 min-h-0 flex flex-col items-center gap-3 p-3 z-10 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 w-4/5 max-w-md z-10">
        <div className="flex justify-between items-end border-b border-white/20 pb-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-fuchsia-300 uppercase tracking-widest mb-1">Target Entity</span>
            <span className="text-base font-light text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {boss.name}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-rose-400 tabular-nums">{boss.hp}</span>
            <span className="text-[10px] text-slate-400 ml-1">/ {boss.maxHp} HP</span>
          </div>
        </div>
      </div>

      {/* Boss circle */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
        <div className={`relative w-48 h-48 flex items-center justify-center mt-2 ${t.bossPriorityRing} rounded-full`}>
          {boss.isPriority && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
              <Crosshair className={`${t.crosshairColor} animate-pulse`} size={56} strokeWidth={2} />
            </div>
          )}
          <div className={`absolute inset-6 blur-3xl rounded-full ${auraClass}`} />
          <div className={`absolute inset-8 rounded-full border-2 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden z-10 ${borderClass}`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${overlayGradientFrom} to-black opacity-60 z-0`} />
            <span className="absolute text-5xl select-none grayscale opacity-80 z-10">👾</span>
          </div>
        </div>

        {/* Minions row at boss feet */}
        <div className="absolute left-0 right-0 z-[15] flex justify-center items-end gap-3 px-4 pointer-events-none" style={{ bottom: "20px" }}>
          <div className="flex items-end gap-2 justify-end">
            {minions.slice(0, 1).map((m) => <Minion key={m.idx} m={m} t={t} />)}
          </div>
          <div className="w-24 flex-shrink-0" />
          <div className="flex items-end gap-2 justify-start">
            {minions.slice(1).map((m) => <Minion key={m.idx} m={m} t={t} />)}
          </div>
        </div>
      </div>

      {/* Boss bars */}
      <div className="flex-shrink-0 relative z-10 w-4/5 max-w-md space-y-2 backdrop-blur-sm bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-[2] flex flex-col gap-0.5">
            <span className="text-[9px] text-amber-500 font-mono flex items-center gap-1"><Zap size={8} /> SKILL CHARGE</span>
            <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${(boss.ultGauge / boss.maxUltGauge) * 100}%` }} />
            </div>
          </div>
          <div className="flex-[1] flex flex-col gap-0.5">
            <span className="text-[9px] font-mono text-right text-slate-300">CAUSALITY</span>
            <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300" style={{ width: `${Math.min(100, causalityPct)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Minion({ m, t }: { m: State["minions"][number]; t: ReturnType<typeof tokens> }) {
  return (
    <div className="relative flex flex-col items-center w-14 pointer-events-auto">
      <div className={`relative w-12 h-12 rounded-md border bg-slate-900/70 backdrop-blur-sm flex items-center justify-center overflow-hidden
          ${m.isPriority ? "border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.85)] scale-105" : "border-slate-300/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]"}`}>
        <span className="text-xl select-none opacity-80">👾</span>
        {m.isPriority && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <Crosshair className={`${t.crosshairColor}`} size={20} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <span className="mt-1 text-[9px] text-slate-200 font-light truncate max-w-[56px] text-center">{m.name}</span>
      <span className="text-[9px] text-rose-300 tabular-nums leading-none">
        {m.hp}<span className="text-slate-500">/{m.maxHp}</span>
      </span>
      <div className="w-full h-[3px] bg-slate-800/80 rounded-full overflow-hidden mt-0.5">
        <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400" style={{ width: `${(m.hp / m.maxHp) * 100}%` }} />
      </div>
    </div>
  );
}

/* ----- Ally zone ----- */

function AllyZone({ variant, t, state }: { variant: Variant; t: ReturnType<typeof tokens>; state: State }) {
  return (
    <div className="w-full px-2 pt-4 pb-2 grid grid-cols-4 gap-2 z-10 backdrop-blur-xl bg-slate-900/60 border-t border-white/10 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] relative">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      {state.allies.map((ally) => {
        const ultBorder =
          ally.ultReady
            ? (ally.pending ? t.allyQueuedBorder : t.allyReadyBorder)
            : "border-white/10";

        return (
          <div
            key={ally.id}
            className={`relative flex flex-col items-center p-2 rounded-xl border ${ultBorder} bg-gradient-to-b from-white/10 to-black/40 shadow-lg ${ally.ultReady ? "cursor-pointer" : ""}`}
          >
            {ally.shield > 0 && (
              <div className="absolute -top-2 z-20 flex items-center gap-0.5 text-[9px] font-bold text-cyan-200 bg-cyan-900/90 px-1.5 py-0.5 rounded-full border border-cyan-500/50 shadow-lg backdrop-blur-sm">
                <Shield size={8} className="fill-cyan-400" />
                {ally.shield}
              </div>
            )}

            <div className={`w-12 h-12 rounded-full overflow-hidden mb-2 border-2 border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] relative bg-slate-800 flex-shrink-0`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${ally.color} opacity-70`} />
              <span className="absolute inset-0 flex items-center justify-center text-base font-black text-white/95 drop-shadow-md">
                {ally.name.charAt(0)}
              </span>

              {/* [Step 7-e] READY/QUEUED 라벨 — 초상화 전체를 덮는 방사형 검정 오버레이 + 중앙 텍스트.
                  READY = white, QUEUED = yellow + pulse 로 차별화. */}
              {ally.ultReady && (
                <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.7)_70%,rgba(0,0,0,0.55)_100%)] ${
                  ally.pending ? "animate-pulse" : ""
                }`}>
                  <span className={`text-[8px] font-black tracking-[0.06em] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] ${
                    ally.pending ? "text-amber-300" : "text-white"
                  }`}>
                    {ally.pending ? "QUEUED" : "READY"}
                  </span>
                </div>
              )}
            </div>

            {/* HP */}
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full mb-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" style={{ width: `${(ally.hp / ally.maxHp) * 100}%` }} />
            </div>

            {/* Ult */}
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-1">
              <div className={`h-full bg-gradient-to-r ${t.allyUltBar}`} style={{ width: `${(ally.ult / ally.maxUlt) * 100}%` }} />
            </div>

            <span className="text-[11px] text-slate-200 mt-0.5 font-bold tracking-tight truncate w-full text-center drop-shadow-md">
              {ally.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ----- Control zone ----- */

function ControlZone({ variant, t, state, renderToggle }: { variant: Variant; t: ReturnType<typeof tokens>; state: State; renderToggle?: React.ReactNode }) {
  const { causality, buffs, userStats } = state;
  const skills = [
    { key: "atk",    label: "ATTACK",  cost: 10, Icon: Sword,  color: "rose"  },
    { key: "shield", label: "DEFENSE", cost: 20, Icon: Shield, color: "cyan"  },
    { key: "speed",  label: "HASTE",   cost: 30, Icon: Zap,    color: "amber" },
  ];
  const isNewVariant = variant === "neon-floating" || variant === "segmented" || variant === "holographic";

  return (
    <div className="p-3 flex flex-col z-20 backdrop-blur-md bg-[#0f172a]/80 border-t border-white/10 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      {/* Causality + mode toggle */}
      <div className="flex items-center justify-between mb-3 px-1 gap-2">
        {isNewVariant && renderToggle ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className={`flex items-center gap-2 ${t.causalityLabel} font-bold tracking-wider text-xs drop-shadow-md`}>
              <Sparkles size={14} className="animate-pulse" />
              <span>CAUSALITY</span>
            </div>
            <div className="flex-1 mx-1 h-3 bg-slate-800/50 rounded-sm overflow-hidden border border-white/10 relative">
              <div className={`h-full bg-gradient-to-r ${t.causalityBar} relative`} style={{ width: `${Math.min(100, causality)}%` }}>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]" />
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-200 mr-1">{causality}<span className="text-slate-500">/100</span></span>
            {renderToggle}
          </div>
        ) : (
          <>
            <div className={`flex items-center gap-2 ${t.causalityLabel} font-bold tracking-wider text-xs drop-shadow-md`}>
              <Sparkles size={14} className="animate-pulse" />
              <span>CAUSALITY</span>
            </div>
            <div className="flex-1 mx-1 h-3 bg-slate-800/50 rounded-sm overflow-hidden border border-white/10 relative">
              <div className={`h-full bg-gradient-to-r ${t.causalityBar} relative`} style={{ width: `${Math.min(100, causality)}%` }}>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]" />
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-200 mr-1">{causality}<span className="text-slate-500">/100</span></span>
            <button className={`flex items-center justify-center px-2 py-1 rounded border font-mono text-[11px] font-bold tracking-wider transition-all duration-200 ${t.modePill}`}>
              {t.modeLabel}
            </button>
          </>
        )}
      </div>

      {/* Skill buttons */}
      <div className="flex gap-3 mb-3">
        {skills.map((s) => {
          const affordable = causality >= s.cost;
          const inactive = !buffs[s.key as keyof typeof buffs].active;
          const showHint = t.skillActionableHint && affordable && inactive;
          const baseCls = "flex-1 flex flex-col items-center justify-center py-2 rounded-lg border backdrop-blur-md transition-all duration-300 group border-white/10 bg-white/5";
          const hintCls = showHint
            ? " animate-[skill-pop_1.4s_ease-in-out_infinite]"
            : "";
          const dimCls = !affordable ? " opacity-50" : "";
          return (
            <button key={s.key} className={baseCls + hintCls + dimCls} style={showHint ? { borderColor: "rgba(252,211,77,0.7)" } : undefined}>
              <s.Icon size={18} className={`mb-1 transition-colors ${
                s.color === "rose"  ? "text-slate-400 group-hover:text-rose-300"  :
                s.color === "cyan"  ? "text-slate-400 group-hover:text-cyan-300"  :
                                      "text-slate-400 group-hover:text-amber-300"
              } ${showHint && s.color === "rose" ? "text-rose-300" : ""}`} />
              <span className="text-[10px] font-bold tracking-wide text-slate-300 group-hover:text-white">{s.label}</span>
              <span className={`text-[9px] font-mono mt-0.5 ${affordable ? "text-amber-300" : "text-slate-500"}`}>{s.cost} CP</span>
            </button>
          );
        })}
      </div>

      {/* Stat tray */}
      <div className={`flex justify-between items-center bg-black/40 rounded px-2 py-2 border border-white/5 font-mono ${t.statTrayBold ? "py-2.5" : ""}`}>
        {([
          { key: "str", Icon: Sword,  color: "text-rose-400"   },
          { key: "agi", Icon: Zap,    color: "text-amber-400"  },
          { key: "int", Icon: Brain,  color: "text-violet-400" },
          { key: "wil", Icon: Shield, color: "text-emerald-400"},
          { key: "chr", Icon: Heart,  color: "text-pink-400"   },
        ] as const).map(({ key, Icon, color }) => (
          <button key={key} className="flex items-center gap-1 px-2 py-0.5 rounded border border-transparent hover:bg-white/5">
            <Icon size={10} className={color} />
            <span className={`${t.statTrayBold ? "text-[11px] font-bold" : "text-[10px]"} text-slate-400`}>
              {userStats[key as keyof typeof userStats]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
