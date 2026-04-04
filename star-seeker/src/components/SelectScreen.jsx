import React from 'react';
import { Telescope, Pickaxe, ChevronLeft, Radio, Cpu } from 'lucide-react';

const CutCornerCard = ({ onClick, accentColor, children }) => {
  const clipPath = 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))';
  return (
    <button
      onClick={onClick}
      className={`group relative flex-1 flex flex-col overflow-hidden active:scale-[0.97] transition-all duration-200`}
      style={{ clipPath }}
    >
      {children}
      {/* 모서리 컷 장식선 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ clipPath }} xmlns="http://www.w3.org/2000/svg">
        <rect
          x="1" y="1"
          width="calc(100% - 2px)" height="calc(100% - 2px)"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          strokeOpacity="0.3"
          className="group-hover:[stroke-opacity:0.7] transition-all"
        />
      </svg>
    </button>
  );
};

export default function SelectScreen({ onSelectContent, onBack }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#030912] animate-fade-in overflow-hidden relative">

      {/* 배경 그리드 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(100,200,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 상단 헤더 */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft size={14} />
          <span className="text-[10px] tracking-widest font-mono uppercase">Back</span>
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] tracking-[0.5em] font-mono text-slate-500 uppercase">Operation</span>
          <span className="text-xs tracking-[0.3em] font-mono text-cyan-500/80 uppercase">Select</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[9px] font-mono text-slate-600 uppercase">Online</span>
        </div>
      </div>

      {/* 얇은 구분선 */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-cyan-900/60 to-transparent flex-shrink-0" />

      {/* 카드 영역 */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-4">
      <div className="flex w-full gap-4 h-[432px]">

        {/* 왼쪽: 행성 관측 */}
        <CutCornerCard onClick={() => onSelectContent('story')} accentColor="#22d3ee">
          <div className="absolute inset-0 bg-gradient-to-b from-[#060f20] to-[#030912] group-hover:from-[#091525] transition-all duration-300" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.04] transition-all duration-300" />

          {/* 광원 */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-cyan-600/15 blur-2xl group-hover:bg-cyan-500/25 transition-all duration-500" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-5 h-full">
            {/* 타입 뱃지 */}
            <div className="flex items-center gap-1.5 self-start">
              <Radio size={9} className="text-cyan-500" />
              <span className="text-[9px] font-mono tracking-widest text-cyan-500/80 uppercase">Survey</span>
            </div>

            {/* 아이콘 */}
            <div className="p-3.5 rounded-lg bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-950/80 transition-all">
              <Telescope size={30} strokeWidth={1.5} />
            </div>

            {/* 제목 */}
            <div className="text-center">
              <p className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-1">Mission Type</p>
              <h2 className="text-lg font-bold tracking-wider text-white group-hover:text-cyan-100 transition-colors leading-tight">
                행성<br />관측
              </h2>
            </div>

            {/* 설명 */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed font-light">
              미지의 좌표를<br />탐사하고 성운의<br />기억을 추적합니다
            </p>

            {/* 하단 태그 */}
            <div className="mt-auto flex items-center gap-2 text-xs font-mono text-cyan-500 border border-cyan-700/50 px-3 py-1.5 group-hover:border-cyan-500/70 group-hover:text-cyan-400 transition-all">
              <span className="w-2 h-2 bg-cyan-400 rounded-full" />
              MAIN STORY
            </div>
          </div>
        </CutCornerCard>

        {/* 오른쪽: 자원 채굴 */}
        <CutCornerCard onClick={() => onSelectContent('mining')} accentColor="#f59e0b">
          <div className="absolute inset-0 bg-gradient-to-b from-[#180d01] to-[#030912] group-hover:from-[#221202] transition-all duration-300" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.03] transition-all duration-300" />

          {/* 광원 */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-amber-600/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-5 h-full">
            {/* 타입 뱃지 */}
            <div className="flex items-center gap-1.5 self-start">
              <Cpu size={9} className="text-amber-500" />
              <span className="text-[9px] font-mono tracking-widest text-amber-500/80 uppercase">Mining</span>
            </div>

            {/* 아이콘 */}
            <div className="p-3.5 rounded-lg bg-amber-950/60 border border-amber-500/20 text-amber-400 group-hover:border-amber-400/40 group-hover:bg-amber-950/80 transition-all">
              <Pickaxe size={30} strokeWidth={1.5} />
            </div>

            {/* 제목 */}
            <div className="text-center">
              <p className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-1">Mission Type</p>
              <h2 className="text-lg font-bold tracking-wider text-white group-hover:text-amber-100 transition-colors leading-tight">
                자원<br />채굴
              </h2>
            </div>

            {/* 설명 */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed font-light">
              소행성대에서<br />필요한 자원을<br />확보합니다
            </p>

            {/* 하단 태그 */}
            <div className="mt-auto flex items-center gap-2 text-xs font-mono text-amber-500 border border-amber-700/50 px-3 py-1.5 group-hover:border-amber-500/70 group-hover:text-amber-400 transition-all">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              RESOURCE
            </div>
          </div>
        </CutCornerCard>

      </div>
      </div>

      {/* 하단 상태바 */}
      <div className="relative z-10 flex items-center justify-center gap-3 pb-5 flex-shrink-0">
        <span className="text-[9px] font-mono text-slate-700 tracking-widest uppercase">
          Awaiting Selection...
        </span>
      </div>

    </div>
  );
}
