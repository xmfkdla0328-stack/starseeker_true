import React from 'react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip 클러스터.
//  - MANUAL/AUTO: 기존 BattleControlZone에서 이전. 7-c 우선 타겟 마킹과 7-d 수동 ult를 통제.
//  - 1x/2x: 1x(기본) = 현재 속도의 절반(느림) / 2x = 이전(현재) 속도.
//
// 위치 정책: GameHeader 바로 아래(top-12) 오른쪽 모서리. 적 카드 상단 영역과 살짝
// 겹칠 수 있으므로 z-index를 컷인/일시정지 메뉴보다는 낮게(z-30) 유지하되, 적 카드
// 컨텐츠 위로는 떠 있도록 한다.
export default function BattleTopControls({
  battleMode = 'manual',
  onToggleBattleMode,
  battleSpeed = 1,
  onToggleBattleSpeed,
}) {
  return (
    <div className="absolute top-12 right-3 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
      {/* MANUAL / AUTO */}
      <button
        type="button"
        onClick={onToggleBattleMode}
        title={battleMode === 'auto' ? '자동 전투 — 탭하여 수동 전환' : '수동 전투 — 탭하여 자동 전환'}
        className={`pointer-events-auto min-w-[64px] px-2 py-1 rounded-md border font-mono text-[11px] font-bold tracking-wider backdrop-blur-md transition-all duration-200 active:scale-95
          ${battleMode === 'manual'
            ? 'border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
            : 'border-white/20 bg-slate-900/60 text-slate-300 hover:border-white/35 hover:bg-slate-900/80'}`}
      >
        {battleMode === 'manual' ? 'MANUAL' : 'AUTO'}
      </button>

      {/* 1x / 2x — segmented control */}
      <div className="pointer-events-auto flex rounded-md border border-white/20 bg-slate-900/60 backdrop-blur-md overflow-hidden">
        {[1, 2].map((spd) => {
          const active = battleSpeed === spd;
          return (
            <button
              key={spd}
              type="button"
              onClick={() => {
                if (!active && onToggleBattleSpeed) onToggleBattleSpeed();
              }}
              title={spd === 1 ? '1배속 (기본)' : '2배속 (빠름)'}
              className={`px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider transition-all duration-150 active:scale-95
                ${active
                  ? 'bg-amber-500/20 text-amber-200 shadow-[inset_0_0_8px_rgba(251,191,36,0.25)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              {spd}x
            </button>
          );
        })}
      </div>
    </div>
  );
}
