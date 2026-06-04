import React from 'react';
import { ChevronRight } from 'lucide-react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip.
//  - 하나의 외곽선이 [자동/수동] + [속도] 두 버튼을 함께 감싸고, 가운데 세로선으로 양분.
//  - 자동/수동: 텍스트 단일 pill 토글. 탭할 때마다 AUTO ↔ MANUAL 전환 (아이콘 없음).
//      MANUAL = 더 밝게 빛나는 흰색 외곽선, AUTO = 중립 슬레이트 톤.
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
      {/* 두 버튼을 함께 감싸는 단일 외곽선 컨테이너. MANUAL이면 흰색 글로우. */}
      <div
        className={`pointer-events-auto inline-flex items-center h-7 rounded-full border transition-all duration-300 ${
          isManual
            ? 'border-white/80 bg-slate-900/50 shadow-[0_0_14px_rgba(255,255,255,0.55)]'
            : 'border-slate-600/50 bg-slate-800/70'
        }`}
      >
        {/* 자동/수동 — 텍스트 단일 토글. 탭하면 AUTO ↔ MANUAL 전환. */}
        <button
          type="button"
          onClick={onToggleBattleMode}
          title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
          className={`h-7 pl-3 pr-3 inline-flex items-center justify-center rounded-l-full text-[11px] font-bold tracking-wider transition-colors duration-300 active:scale-95 ${
            isManual ? 'text-white' : 'text-slate-300'
          }`}
        >
          {isManual ? 'MANUAL' : 'AUTO'}
        </button>

        {/* 두 버튼을 양분하는 세로 구분선 */}
        <span
          aria-hidden
          className={`w-px h-4 transition-colors duration-300 ${
            isManual ? 'bg-white/40' : 'bg-slate-500/50'
          }`}
        />

        {/* 1배(▶) / 2배(▶▶) — 단일 토글 */}
        <button
          type="button"
          onClick={onToggleBattleSpeed}
          title={isFast ? '2배속 — 탭하여 1배속 전환' : '1배속 — 탭하여 2배속 전환'}
          className="h-7 pl-2 pr-2.5 inline-flex items-center justify-center rounded-r-full transition-colors duration-200 active:scale-95"
        >
          <span className="inline-flex items-center">
            <ChevronRight
              size={20}
              strokeWidth={2.5}
              className={`block transition-all duration-200 ${
                isFast
                  ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]'
                  : 'text-slate-300'
              }`}
            />
            {isFast && (
              <ChevronRight
                size={20}
                strokeWidth={2.5}
                className="block text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)] -ml-2.5"
              />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
