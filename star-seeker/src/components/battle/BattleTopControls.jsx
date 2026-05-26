import React from 'react';

// [속도 조절 + 모드 토글] 전투 화면 우상단의 floating chip.
//  - MANUAL/AUTO: 7-c 우선 타겟 마킹과 7-d 수동 ult를 통제.
//  - 1x/2x: 단일 토글. 1x(기본) = 현재 속도의 절반(느림) / 2x = 이전(현재) 속도.
//
// 위치: 보스 이름/HP 헤더(border-b) 아래로 내려, 헤더 시각 요소를 침범하지 않도록 한다.
// 디자인: 한 줄 가로 배치, 외곽선 거의 없는 단일 캡슐, AUTO/SPEED 사이에 옅은 슬래시 구분자.
//        활성 상태는 텍스트 색상으로만 표현 (배경은 공통).
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
        {/* MANUAL / AUTO */}
        <button
          type="button"
          onClick={onToggleBattleMode}
          title={isManual ? '수동 전투 — 탭하여 자동 전환' : '자동 전투 — 탭하여 수동 전환'}
          style={{ fontFamily: '"Dotum", "돋움", "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif' }}
          className={`pl-2 pr-1 py-1 rounded-full text-base font-semibold tracking-wider transition-colors duration-200 active:scale-95
            ${isManual
              ? 'text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]'
              : 'text-slate-300 hover:text-white'}`}
        >
          {isManual ? '수동' : '자동'}
        </button>

        {/* 옅은 슬래시 구분자 */}
        <span aria-hidden className="text-slate-200 font-mono text-base font-bold select-none drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">/</span>

        {/* 1x / 2x — 단일 토글 */}
        <button
          type="button"
          onClick={onToggleBattleSpeed}
          title={isFast ? '2배속 — 탭하여 1배속 전환' : '1배속 — 탭하여 2배속 전환'}
          className={`pl-1 pr-2 py-1 rounded-full font-mono text-base font-bold tracking-wider transition-colors duration-200 active:scale-95
            ${isFast
              ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]'
              : 'text-slate-300 hover:text-white'}`}
        >
          {isFast ? '2x' : '1x'}
        </button>
      </div>
    </div>
  );
}
