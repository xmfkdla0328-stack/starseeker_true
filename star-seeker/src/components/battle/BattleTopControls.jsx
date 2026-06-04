import React from 'react';
import { ChevronRight } from 'lucide-react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip.
//  - 하나의 외곽선이 [자동/수동] + [속도] 두 버튼을 함께 감싸고, 가운데 세로선으로 양분.
//  - 자동/수동: 텍스트 단일 pill 토글. 탭할 때마다 AUTO ↔ MANUAL 전환 (아이콘 없음).
//      도형 크기는 MANUAL 기준으로 고정(텍스트만 교체) → 토글 시 외곽선 크기 변화 없음.
//      MANUAL = 은은한 흰색 외곽선(주변과 어울리게 절제), AUTO = 중립 슬레이트 톤.
//  - 1x/2x:   ▶ 아이콘 + 배속 라벨. 1x = 중립 톤, 2x = amber 강조.
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
      {/* 두 버튼을 함께 감싸는 단일 외곽선 컨테이너. MANUAL이면 은은한 흰색 글로우. */}
      <div
        className={`pointer-events-auto inline-flex items-center h-7 rounded-full border transition-all duration-300 ${
          isManual
            ? 'border-white/45 bg-slate-900/60 shadow-[0_0_8px_rgba(255,255,255,0.18)]'
            : 'border-slate-600/50 bg-slate-800/70'
        }`}
      >
        {/* 자동/수동 — 텍스트 단일 토글. 탭하면 AUTO ↔ MANUAL 전환.
            너비는 MANUAL 기준으로 고정(text-center)하여 외곽선 크기 불변. */}
        <button
          type="button"
          onClick={onToggleBattleMode}
          aria-pressed={isManual}
          aria-label={isManual ? '수동 전투 모드' : '자동 전투 모드'}
          title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
          className={`h-7 w-[68px] inline-flex items-center justify-center rounded-l-full text-[11px] font-bold tracking-wider transition-colors duration-300 active:scale-95 ${
            isManual ? 'text-white/90' : 'text-slate-300'
          }`}
        >
          {isManual ? 'MANUAL' : 'AUTO'}
        </button>

        {/* 두 버튼을 양분하는 세로 구분선 */}
        <span
          aria-hidden
          className={`w-px h-4 transition-colors duration-300 ${
            isManual ? 'bg-white/25' : 'bg-slate-500/50'
          }`}
        />

        {/* 1배속 / 2배속 — ▶ 아이콘 + 배속 라벨 단일 토글 */}
        <button
          type="button"
          onClick={onToggleBattleSpeed}
          title={isFast ? '2배속 — 탭하여 1배속 전환' : '1배속 — 탭하여 2배속 전환'}
          className="h-7 pl-2 pr-2.5 inline-flex items-center gap-0.5 justify-center rounded-r-full transition-colors duration-200 active:scale-95"
        >
          <ChevronRight
            size={13}
            strokeWidth={3}
            className={`block transition-all duration-200 ${
              isFast
                ? 'text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]'
                : 'text-slate-400'
            }`}
          />
          <span
            className={`text-[11px] font-bold tracking-tight tabular-nums transition-colors duration-200 ${
              isFast
                ? 'text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]'
                : 'text-slate-300'
            }`}
          >
            {isFast ? '2x' : '1x'}
          </span>
        </button>
      </div>
    </div>
  );
}
