import React from 'react';

export default function BattleStartOverlay({ fading }) {
  return (
    <div
      className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-1000 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* 화면 테두리 붉은 글로우 (사각형 전체 채우지 않음) */}
      <div className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 60px rgba(220, 38, 38, 0.45), inset 0 0 20px rgba(220, 38, 38, 0.2)',
        }}
      />

      {/* 상단 스캔라인 효과 */}
      <div
        className="absolute left-0 right-0 h-[1px] bg-red-500/60"
        style={{ animation: 'scanDown 1.8s linear infinite', top: 0 }}
      />

      {/* 네 모서리 HUD 브래킷 */}
      {/* 좌상단 */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-red-500/80" />
      {/* 우상단 */}
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/80" />
      {/* 좌하단 */}
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/80" />
      {/* 우하단 */}
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-red-500/80" />

      {/* 중앙 상단 경고 텍스트 */}
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-10 gap-2">
        {/* WARNING 라벨 */}
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-px w-12 bg-red-500/70" />
          <span className="text-[10px] font-mono tracking-[0.5em] text-red-500 uppercase">
            Warning
          </span>
          <div className="h-px w-12 bg-red-500/70" />
        </div>

        {/* ENCOUNTER 메인 텍스트 */}
        <h1
          className="font-black text-white tracking-[0.2em] uppercase"
          style={{
            fontSize: '2.4rem',
            textShadow: '0 0 20px rgba(220,38,38,0.9), 0 0 40px rgba(220,38,38,0.4)',
            letterSpacing: '0.25em',
          }}
        >
          ENCOUNTER
        </h1>

        {/* 하단 구분선 + 프로토콜 텍스트 */}
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px w-8 bg-red-700/50" />
          <span className="text-[9px] font-mono tracking-[0.35em] text-red-600 animate-pulse uppercase">
            Battle Protocol Initiated
          </span>
          <div className="h-px w-8 bg-red-700/50" />
        </div>
      </div>

      {/* 하단 상태 바 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-5 pb-5">
        <span className="text-[9px] font-mono text-red-800 tracking-widest uppercase">
          SYS://COMBAT_MODE
        </span>
        <div className="flex gap-1.5 items-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              style={{ animation: `pulse 0.6s ease-in-out ${i * 0.15}s infinite alternate` }}
            />
          ))}
        </div>
        <span className="text-[9px] font-mono text-red-800 tracking-widest uppercase">
          STANDBY...
        </span>
      </div>

    </div>
  );
}
