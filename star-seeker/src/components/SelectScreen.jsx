import React from 'react';
import { Telescope, Pickaxe, ChevronLeft, Star, Zap } from 'lucide-react';

export default function SelectScreen({ onSelectContent, onBack }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#04080f] animate-fade-in overflow-hidden">

      {/* 상단 헤더 */}
      <div className="flex items-center px-4 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="text-[10px] tracking-widest uppercase">Back</span>
        </button>
        <span className="mx-auto text-[9px] tracking-[0.4em] text-slate-600 font-mono uppercase">
          Mission Select
        </span>
        <div className="w-10" />
      </div>

      {/* 1행 2열 카드 영역 */}
      <div className="flex flex-1 gap-3 px-3 pb-4 min-h-0">

        {/* 왼쪽: 행성 관측 */}
        <button
          onClick={() => onSelectContent('story')}
          className="group relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-900/40 hover:border-cyan-500/50 active:scale-[0.97] transition-all duration-200 bg-[#060f20]"
        >
          {/* 배경 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#071535] via-[#060f20] to-[#020810] group-hover:from-[#0a1f45] transition-all duration-300" />

          {/* 별빛 파티클 */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
                opacity: Math.random() * 0.4 + 0.1,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}

          {/* 광원 */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-cyan-600/20 blur-2xl group-hover:bg-cyan-500/30 transition-all duration-500" />

          {/* 워터마크 */}
          <div className="absolute bottom-3 right-2 text-cyan-900/20 group-hover:text-cyan-800/30 transition-colors">
            <Telescope size={80} strokeWidth={0.7} />
          </div>

          {/* 콘텐츠 */}
          <div className="relative z-10 flex flex-col items-center gap-3 px-3">
            <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 group-hover:bg-cyan-500/25 group-hover:border-cyan-400/50 transition-all">
              <Telescope size={28} />
            </div>
            <h2 className="text-base font-bold tracking-[0.12em] text-white group-hover:text-cyan-100 transition-colors uppercase leading-tight text-center">
              행성<br />관측
            </h2>
            <p className="text-[10px] text-slate-500 leading-relaxed text-center">
              미지의 좌표를<br />탐사하고 성운의<br />기억을 추적합니다
            </p>
            <div className="flex items-center gap-1 text-[9px] text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-500/25">
              <Star size={8} className="fill-cyan-400" />
              <span className="tracking-wider uppercase">Story</span>
            </div>
          </div>

          {/* 하단 강조선 */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* 오른쪽: 자원 채굴 */}
        <button
          onClick={() => onSelectContent('mining')}
          className="group relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-amber-900/40 hover:border-amber-500/50 active:scale-[0.97] transition-all duration-200 bg-[#120a02]"
        >
          {/* 배경 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c0e02] via-[#120a02] to-[#060400] group-hover:from-[#2a1503] transition-all duration-300" />

          {/* 광원 */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-amber-600/15 blur-2xl group-hover:bg-amber-500/25 transition-all duration-500" />

          {/* 워터마크 */}
          <div className="absolute bottom-3 left-2 text-amber-900/15 group-hover:text-amber-800/25 transition-colors -rotate-12">
            <Pickaxe size={80} strokeWidth={0.7} />
          </div>

          {/* 콘텐츠 */}
          <div className="relative z-10 flex flex-col items-center gap-3 px-3">
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 group-hover:bg-amber-500/25 group-hover:border-amber-400/50 transition-all">
              <Pickaxe size={28} />
            </div>
            <h2 className="text-base font-bold tracking-[0.12em] text-white group-hover:text-amber-100 transition-colors uppercase leading-tight text-center">
              자원<br />채굴
            </h2>
            <p className="text-[10px] text-slate-500 leading-relaxed text-center">
              소행성대에서<br />필요한 자원을<br />확보합니다
            </p>
            <div className="flex items-center gap-1 text-[9px] text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/25">
              <Zap size={8} className="fill-amber-400" />
              <span className="tracking-wider uppercase">Mining</span>
            </div>
          </div>

          {/* 하단 강조선 */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

      </div>
    </div>
  );
}
