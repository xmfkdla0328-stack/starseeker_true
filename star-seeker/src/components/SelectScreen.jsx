import React from 'react';
import { Telescope, Pickaxe, ChevronLeft, Star, AlertCircle } from 'lucide-react';
// [New] 배경 효과 컴포넌트 임포트
import ParticleBackground from './common/ParticleBackground';

export default function SelectScreen({ onSelectContent, onBack }) {
  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in p-6 bg-[#0f172a] overflow-hidden h-full">
      
      {/* [New] 배경 효과 적용 (색상을 약간 다르게 하고 싶다면 color="bg-indigo-400" 처럼 변경 가능) */}
      <ParticleBackground color="bg-indigo-400" />

      {/* 상단 헤더: 뒤로가기 및 타이틀 */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-xs tracking-widest uppercase">Back</span>
        </button>
        <div className="w-5" /> {/* 레이아웃 균형용 빈공간 */}
      </div>

      {/* 메인 컨텐츠 선택 영역 */}
      <div className="flex-1 flex flex-col gap-4 justify-center relative z-10">
        
        {/* 1. 행성 관측 (스토리) 버튼 */}
        <button 
          onClick={() => onSelectContent('story')}
          className="group relative w-full h-40 bg-gradient-to-r from-indigo-900/60 to-cyan-900/40 border border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 overflow-hidden backdrop-blur-sm"
        >
          {/* 버튼 자체 배경 효과 */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-500/20 blur-3xl group-hover:bg-cyan-400/30 transition-all"></div>

          <div className="relative z-10 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                    <Telescope size={24} />
                </div>
                <span className="text-xl font-bold text-white tracking-wider group-hover:text-cyan-200 transition-colors">행성 관측</span>
            </div>
            <p className="text-xs text-slate-400 font-light text-left pl-1 leading-relaxed">
              미지의 좌표를 탐사하고<br/>
              성운의 기억을 추적합니다.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-500 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
                <Star size={10} className="fill-cyan-500" />
                <span>메인 스토리 진행</span>
            </div>
          </div>
        </button>

        {/* 2. 자원 채굴 (파밍) 버튼 */}
        <button 
          onClick={() => onSelectContent('mining')}
          className="group relative w-full h-40 bg-gradient-to-r from-slate-900/60 to-amber-900/40 border border-white/10 hover:border-amber-400/50 rounded-2xl p-6 flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 overflow-hidden backdrop-blur-sm"
        >
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/10 blur-3xl group-hover:bg-amber-400/20 transition-all"></div>

          <div className="relative z-10 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <Pickaxe size={24} />
                </div>
                <span className="text-xl font-bold text-white tracking-wider group-hover:text-amber-200 transition-colors">자원 채굴</span>
            </div>
            <p className="text-xs text-slate-400 font-light text-left pl-1 leading-relaxed">
              소행성대에서 필요한 자원을<br/>
              확보합니다.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-500 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/20">
                <AlertCircle size={10} />
                <span>자원 수급 구역</span>
            </div>
          </div>
        </button>

      </div>

      {/* 하단 장식용 텍스트 */}
      <div className="mt-auto pt-6 text-center relative z-10">
        <p className="text-[10px] text-slate-600 font-mono">
          SYSTEM STATUS: WAITING FOR COMMAND...
        </p>
      </div>
    </div>
  );
}