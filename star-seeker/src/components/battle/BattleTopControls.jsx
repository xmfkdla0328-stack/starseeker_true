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
      {/* [정렬 픽스] 모든 자식을 동일 height(h-7)의 flex 박스에 넣고 items-center로 통일.
          기존엔 아이콘(SVG, 가운데 정렬)과 슬래시(텍스트 baseline)가 서로 다른 기준으로
          정렬되어 시각적으로 위아래로 어긋났음. h-7 컨테이너 + 각 셀에 items-center 강제. */}
      <div className="pointer-events-auto inline-flex items-center h-7 gap-0">
        {/* 자동(∞) / 수동(∞ 흐림) */}
        <button
          type="button"
          onClick={onToggleBattleMode}
          title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
          className="h-7 pl-2 pr-1 inline-flex items-center justify-center rounded-full transition-colors duration-200 active:scale-95"
        >
          <InfinityIcon
            size={22}
            strokeWidth={2.25}
            className={`block transition-all duration-200 ${
              isManual
                ? 'text-slate-500/50'
                : 'text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]'
            }`}
          />
        </button>

        {/* 슬래시 구분자 — 같은 h-7 안에서 가운데 정렬 + leading-none로 baseline 영향 제거. */}
        <span
          aria-hidden
          className="h-7 inline-flex items-center text-slate-200 font-mono text-base font-bold leading-none select-none drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]"
        >
          /
        </span>

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
