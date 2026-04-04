import React from 'react';
import { Telescope, Pickaxe, ChevronLeft, Star, Zap } from 'lucide-react';

export default function SelectScreen({ onSelectContent, onBack }) {
  return (
    <div className="flex-1 relative overflow-hidden h-full bg-[#04080f]">

      {/* ── 상단 패널: 행성 관측 ── */}
      {/* clip-path: 화면 좌측 65% ~ 우측 38% 지점으로 대각선 절단 */}
      <button
        onClick={() => onSelectContent('story')}
        className="group absolute inset-0 w-full h-full active:brightness-90 transition-all"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 38%, 0 65%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#010a1c] via-[#071535] to-[#0d2040] group-hover:brightness-110 transition-all duration-300" />

        {/* 별빛 파티클 */}
        {[...Array(22)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 65}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* 사이안 광원 */}
        <div className="absolute left-1/4 top-1/4 w-56 h-56 rounded-full bg-cyan-600/15 blur-3xl group-hover:bg-cyan-500/25 transition-all duration-500" />
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* 워터마크 아이콘 */}
        <div className="absolute right-6 bottom-12 text-cyan-900/25 group-hover:text-cyan-800/35 transition-colors">
          <Telescope size={110} strokeWidth={0.7} />
        </div>

        {/* 콘텐츠 — 상단 절반 중앙 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: '28%' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 group-hover:bg-cyan-500/25 group-hover:border-cyan-400/50 transition-all">
              <Telescope size={34} />
            </div>
            <h2 className="text-2xl font-bold tracking-[0.18em] text-white group-hover:text-cyan-100 transition-colors uppercase">
              행성 관측
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed text-center max-w-[200px]">
              미지의 좌표를 탐사하고<br />성운의 기억을 추적합니다
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/70 px-3 py-1 rounded-full border border-cyan-500/25">
              <Star size={9} className="fill-cyan-400" />
              <span className="tracking-widest uppercase">Main Story</span>
            </div>
          </div>
        </div>
      </button>

      {/* ── 하단 패널: 자원 채굴 ── */}
      {/* clip-path: 상단 패널과 맞닿는 대각선 기준 하단 영역 */}
      <button
        onClick={() => onSelectContent('mining')}
        className="group absolute inset-0 w-full h-full active:brightness-90 transition-all"
        style={{ clipPath: 'polygon(0 65%, 100% 38%, 100% 100%, 0 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-[#0c0600] via-[#1a0e02] to-[#0a0a04] group-hover:brightness-110 transition-all duration-300" />

        {/* 앰버 광원 */}
        <div className="absolute right-1/4 bottom-1/4 w-56 h-56 rounded-full bg-amber-600/15 blur-3xl group-hover:bg-amber-500/25 transition-all duration-500" />
        <div className="absolute left-0 bottom-0 w-32 h-32 rounded-full bg-orange-700/10 blur-3xl" />

        {/* 워터마크 아이콘 */}
        <div className="absolute left-5 top-10 text-amber-900/20 group-hover:text-amber-800/30 transition-colors -rotate-12">
          <Pickaxe size={110} strokeWidth={0.7} />
        </div>

        {/* 콘텐츠 — 하단 절반 중앙 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '28%' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 group-hover:bg-amber-500/25 group-hover:border-amber-400/50 transition-all">
              <Pickaxe size={34} />
            </div>
            <h2 className="text-2xl font-bold tracking-[0.18em] text-white group-hover:text-amber-100 transition-colors uppercase">
              자원 채굴
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed text-center max-w-[200px]">
              소행성대에서 필요한 자원을<br />확보하고 전력을 강화합니다
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-950/70 px-3 py-1 rounded-full border border-amber-500/25">
              <Zap size={9} className="fill-amber-400" />
              <span className="tracking-widest uppercase">Resource Zone</span>
            </div>
          </div>
        </div>
      </button>

      {/* ── 대각선 경계 글로우 라인 ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <filter id="diagGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="diagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {/* 베이스 라인 */}
        <line x1="0" y1="65" x2="100" y2="38" stroke="url(#diagGrad)" strokeWidth="0.25" filter="url(#diagGlow)" />
        {/* 얇은 글로우 라인 */}
        <line x1="0" y1="65" x2="100" y2="38" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      </svg>

      {/* ── 뒤로가기 버튼 ── */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
      >
        <ChevronLeft size={14} />
        <span className="text-[10px] tracking-widest uppercase">Back</span>
      </button>

      {/* ── 중앙 대각선 위 라벨 ── */}
      <div className="absolute z-20 pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)' }}>
        <span className="text-[9px] tracking-[0.5em] text-slate-600 font-mono uppercase select-none">
          Select
        </span>
      </div>

    </div>
  );
}
