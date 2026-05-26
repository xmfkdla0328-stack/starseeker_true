import React from 'react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip 클러스터.
//  - MANUAL/AUTO: 기존 BattleControlZone에서 이전. 7-c 우선 타겟 마킹과 7-d 수동 ult를 통제.
//  - 1x/2x: 단일 토글 버튼 — 누를 때마다 1x ↔ 2x. 1x(기본) = 현재 속도의 절반(느림) / 2x = 이전(현재) 속도.
//
// 레이아웃: 일반 모바일 RPG처럼 한 행에 가로로 나열 (모드 → 속도).
// 위치 정책: GameHeader 바로 아래(top-12) 오른쪽 모서리.
export default function BattleTopControls({
  battleMode = 'manual',
  onToggleBattleMode,
  battleSpeed = 1,
  onToggleBattleSpeed,
}) {
  const isManual = battleMode === 'manual';
  const isFast = battleSpeed === 2;

  return (
    <div className="absolute top-12 right-3 z-30 flex flex-row items-center gap-1.5 pointer-events-none">
      {/* MANUAL / AUTO */}
      <button
        type="button"
        onClick={onToggleBattleMode}
        title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
        className={`pointer-events-auto min-w-[64px] px-2.5 py-1 rounded-md border font-mono text-[11px] font-bold tracking-wider backdrop-blur-md transition-all duration-200 active:scale-95
          ${isManual
            ? 'border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
            : 'border-white/20 bg-slate-900/60 text-slate-300 hover:border-white/35 hover:bg-slate-900/80'}`}
      >
        {isManual ? 'MANUAL' : 'AUTO'}
      </button>

      {/* 1x / 2x — 단일 토글 */}
      <button
        type="button"
        onClick={onToggleBattleSpeed}
        title={isFast ? '2배속 — 탭하여 1배속 전환' : '1배속 — 탭하여 2배속 전환'}
        className={`pointer-events-auto min-w-[48px] px-2.5 py-1 rounded-md border font-mono text-[11px] font-bold tracking-wider backdrop-blur-md transition-all duration-200 active:scale-95
          ${isFast
            ? 'border-amber-400/70 bg-amber-500/15 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
            : 'border-white/20 bg-slate-900/60 text-slate-300 hover:border-white/35 hover:bg-slate-900/80'}`}
      >
        {isFast ? '2x' : '1x'}
      </button>
    </div>
  );
}
