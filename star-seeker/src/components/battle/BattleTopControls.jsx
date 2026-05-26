import React from 'react';
import { Infinity as InfinityIcon, ChevronRight } from 'lucide-react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip.
//  - 자동/수동: ∞ 아이콘 단일. 자동 = 진한 sky + 글로우, 수동 = 흐려진 슬레이트.
//  - 1x/2x:   ▶ 아이콘. 1x = 단일·중립 톤, 2x = 두 개 겹친 빨리감기 + amber 글로우.
//
// 위치: 보스 이름/HP 헤더의 border-b 줄 아래로 살짝 내려 둠.
// 디자인: 배경 없음, 옅은 슬래시 구분자만으로 두 토글을 묶음. 활성/비활성은 색과 글로우로만 표현.
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
      <div className="pointer-events-auto inline-flex items-center gap-0">
        {/* 자동(∞) / 수동(∞ 흐림) */}
        <button
          type="button"
          onClick={onToggleBattleMode}
          title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
          className="pl-2 pr-1 py-1 rounded-full transition-colors duration-200 active:scale-95"
        >
          <InfinityIcon
            size={22}
            strokeWidth={2.25}
            className={`transition-all duration-200 ${
              isManual
                ? 'text-slate-500/50'
                : 'text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]'
            }`}
          />
        </button>

        {/* 옅은 슬래시 구분자 */}
        <span aria-hidden className="text-slate-200 font-mono text-base font-bold select-none drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">/</span>

        {/* 1배(▶) / 2배(▶▶) — 단일 토글 */}
        <button
          type="button"
          onClick={onToggleBattleSpeed}
          title={isFast ? '2배속 — 탭하여 1배속 전환' : '1배속 — 탭하여 2배속 전환'}
          className="pl-1 pr-2 py-1 rounded-full transition-colors duration-200 active:scale-95"
        >
          <span className="inline-flex items-center">
            <ChevronRight
              size={20}
              strokeWidth={2.5}
              className={`transition-all duration-200 ${
                isFast
                  ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]'
                  : 'text-slate-300'
              }`}
            />
            {isFast && (
              <ChevronRight
                size={20}
                strokeWidth={2.5}
                className="text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)] -ml-3"
              />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
