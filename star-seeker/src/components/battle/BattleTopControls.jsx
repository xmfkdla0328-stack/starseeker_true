import React from 'react';
import { Clock, Layers, ChevronRight } from 'lucide-react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip.
//  - 자동/수동: 단일 pill 토글. 탭할 때마다 AUTO ↔ MANUAL 전환.
//      MANUAL = sky 글로우 + Layers 아이콘, AUTO = 중립 슬레이트 + Clock 아이콘.
//  - 1x/2x:   ▶ 아이콘. 1x = 단일·중립 톤, 2x = 두 개 겹친 빨리감기 + amber 글로우.
//
// 위치: 보스 이름/HP 헤더의 border-b 줄 아래로 살짝 내려 둠.
export default function BattleTopControls({
  battleMode = 'manual',
  onToggleBattleMode,
  battleSpeed = 1,
  onToggleBattleSpeed,
}) {
  const isManual = battleMode === 'manual';
  const isFast = battleSpeed === 2;

  return (
    <div className="absolute top-[76px] right-3 z-30 pointer-events-none">
      <div className="pointer-events-auto inline-flex items-center h-7 gap-2">
        {/* 자동/수동 — 단일 pill 토글. 탭하면 AUTO ↔ MANUAL 전환. */}
        <button
          type="button"
          onClick={onToggleBattleMode}
          title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
          className={`h-7 inline-flex items-center gap-1.5 pl-2.5 pr-3 rounded-full border text-[11px] font-bold tracking-wider transition-all duration-300 active:scale-95 ${
            isManual
              ? 'bg-sky-500/15 border-sky-400/50 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.25),inset_0_1px_0_rgba(56,189,248,0.15)]'
              : 'bg-slate-800/70 border-slate-600/50 text-slate-300'
          }`}
        >
          {isManual ? (
            <Layers size={13} strokeWidth={2.5} className="block" />
          ) : (
            <Clock size={13} strokeWidth={2.5} className="block" />
          )}
          {isManual ? 'MANUAL' : 'AUTO'}
        </button>

        {/* 1배(▶) / 2배(▶▶) — 단일 토글 */}
        <button
          type="button"
          onClick={onToggleBattleSpeed}
          title={isFast ? '2배속 — 탭하여 1배속 전환' : '1배속 — 탭하여 2배속 전환'}
          className="h-7 pl-1 pr-2 inline-flex items-center justify-center rounded-full transition-colors duration-200 active:scale-95"
        >
          <span className="inline-flex items-center">
            <ChevronRight
              size={22}
              strokeWidth={2.5}
              className={`block transition-all duration-200 ${
                isFast
                  ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]'
                  : 'text-slate-300'
              }`}
            />
            {isFast && (
              <ChevronRight
                size={22}
                strokeWidth={2.5}
                className="block text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)] -ml-3"
              />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
