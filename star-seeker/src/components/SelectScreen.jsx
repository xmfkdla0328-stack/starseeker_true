import React from 'react';
import { Telescope, Pickaxe, ChevronLeft, Star, Zap } from 'lucide-react';

export default function SelectScreen({ onSelectContent, onBack }) {
  return (
    <div className="flex-1 flex flex-col relative animate-fade-in overflow-hidden h-full bg-[#060d1a]">

      {/* 뒤로가기 버튼 - 좌상단 플로팅 */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-1 text-slate-500 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
      >
        <ChevronLeft size={14} />
        <span className="text-[10px] tracking-widest uppercase">Back</span>
      </button>

      {/* 중앙 라벨 */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-5 pointer-events-none">
        <span className="text-[9px] tracking-[0.4em] text-slate-500 uppercase font-mono">Mission Select</span>
      </div>

      {/* ── 상단 패널: 행성 관측 ── */}
      <button
        onClick={() => onSelectContent('story')}
        className="group relative flex-1 w-full overflow-hidden flex flex-col items-center justify-center text-center active:scale-[0.98] transition-transform duration-150"
      >
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020818] via-[#071535] to-[#0d2040] group-hover:opacity-90 transition-opacity" />

        {/* 별빛 효과 */}
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-40 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* 배경 아이콘 워터마크 */}
        <div className="absolute right-6 bottom-4 text-cyan-900/40 group-hover:text-cyan-800/50 transition-colors">
          <Telescope size={120} strokeWidth={0.8} />
        </div>

        {/* 사이드 광원 */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-400/20 transition-all" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-400/15 transition-all" />

        {/* 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center gap-3 px-8">
          <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 group-hover:bg-cyan-500/25 group-hover:border-cyan-400/40 transition-all mb-1">
            <Telescope size={36} />
          </div>
          <h2 className="text-2xl font-bold tracking-[0.15em] text-white group-hover:text-cyan-100 transition-colors uppercase">
            행성 관측
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
            미지의 좌표를 탐사하고<br />성운의 기억을 추적합니다
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/20">
            <Star size={9} className="fill-cyan-400" />
            <span className="tracking-widest uppercase">Main Story</span>
          </div>
        </div>

        {/* 하단 탭 힌트 */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* ── 구분선 ── */}
      <div className="relative z-20 flex items-center justify-center h-[1px] flex-shrink-0">
        <div className="absolute inset-0 bg-white/10" />
        <div className="relative bg-[#060d1a] px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* ── 하단 패널: 자원 채굴 ── */}
      <button
        onClick={() => onSelectContent('mining')}
        className="group relative flex-1 w-full overflow-hidden flex flex-col items-center justify-center text-center active:scale-[0.98] transition-transform duration-150"
      >
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0500] via-[#1a0e02] to-[#0f0c04] group-hover:opacity-90 transition-opacity" />

        {/* 배경 아이콘 워터마크 */}
        <div className="absolute left-4 top-4 text-amber-900/30 group-hover:text-amber-800/40 transition-colors rotate-12">
          <Pickaxe size={120} strokeWidth={0.8} />
        </div>

        {/* 사이드 광원 */}
        <div className="absolute right-0 bottom-1/4 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-400/20 transition-all" />
        <div className="absolute left-10 top-0 w-24 h-24 rounded-full bg-orange-700/10 blur-3xl group-hover:bg-orange-600/15 transition-all" />

        {/* 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center gap-3 px-8">
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-300 group-hover:bg-amber-500/25 group-hover:border-amber-400/40 transition-all mb-1">
            <Pickaxe size={36} />
          </div>
          <h2 className="text-2xl font-bold tracking-[0.15em] text-white group-hover:text-amber-100 transition-colors uppercase">
            자원 채굴
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
            소행성대에서 필요한 자원을<br />확보하고 전력을 강화합니다
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
            <Zap size={9} className="fill-amber-400" />
            <span className="tracking-widest uppercase">Resource Zone</span>
          </div>
        </div>

        {/* 상단 탭 힌트 */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* 하단 상태 표시 */}
      <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <span className="text-[9px] tracking-[0.3em] text-slate-700 font-mono uppercase">System Standby</span>
      </div>
    </div>
  );
}
