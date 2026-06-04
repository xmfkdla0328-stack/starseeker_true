import React from 'react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip.
//  - 하나의 외곽선이 [자동/수동] + [속도] 두 버튼을 함께 감싸고, 가운데 세로선으로 양분.
//  - 배경은 어느 모드에서든 투명. MANUAL이면 외곽선만 은은하게 강조.
//  - 자동/수동: 텍스트 단일 토글. 도형 크기는 MANUAL 기준 고정(텍스트만 교체).
//  - 1x/2x:   배속 텍스트 단일 토글(아이콘 없음). 글씨 크기는 모드 토글과 동일.
//
// 형태: 직각 사각형. 우측 외곽선을 없애고 화면 우측 경계선과 겹치게 배치(right-0).
export default function BattleTopControls({
  battleMode = 'manual',
  onToggleBattleMode,
  battleSpeed = 1,
  onToggleBattleSpeed,
}) {
  const isManual = battleMode === 'manual';
  const isFast = battleSpeed === 2;

  return (
    <div className="absolute top-[76px] right-0 z-30 pointer-events-none">
      {/* 두 버튼을 함께 감싸는 단일 외곽선 컨테이너. 배경 투명 · 직각 · 우측 외곽선 제거.
          MANUAL = 약간 회색빛 도는 흰색 외곽선(글로우 없음, AUTO보단 밝게). */}
      <div
        className={`pointer-events-auto inline-flex items-center h-8 border border-r-0 transition-all duration-300 ${
          isManual ? 'border-slate-500/55' : 'border-slate-600/50'
        }`}
      >
        {/* 자동/수동 — 텍스트 단일 토글. 너비는 MANUAL 기준으로 고정. */}
        <button
          type="button"
          onClick={onToggleBattleMode}
          aria-pressed={isManual}
          aria-label={isManual ? '수동 전투 모드' : '자동 전투 모드'}
          title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
          className={`h-8 w-[76px] inline-flex items-center justify-center text-xs font-bold tracking-wider transition-colors duration-300 active:scale-95 ${
            isManual ? 'text-slate-100' : 'text-slate-300'
          }`}
        >
          {isManual ? 'MANUAL' : 'AUTO'}
        </button>

        {/* 두 버튼을 양분하는 세로 구분선 */}
        <span
          aria-hidden
          className={`w-px h-4 transition-colors duration-300 ${
            isManual ? 'bg-slate-300/30' : 'bg-slate-500/50'
          }`}
        />

        {/* 1배속 / 2배속 — 배속 텍스트 단일 토글. 모드 토글과 동일한 글씨 크기. */}
        <button
          type="button"
          onClick={onToggleBattleSpeed}
          aria-pressed={isFast}
          aria-label={isFast ? '2배속' : '1배속'}
          title={isFast ? '2배속 — 탭하여 1배속 전환' : '1배속 — 탭하여 2배속 전환'}
          className="h-8 px-4 inline-flex items-center justify-center transition-colors duration-200 active:scale-95"
        >
          <span
            className={`text-xs font-bold tracking-wider tabular-nums transition-colors duration-200 ${
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
