import React from 'react';
import { ChevronLeft, Pickaxe, Bot, Zap, Clock, Database, ArrowRight } from 'lucide-react';

export default function ResourcesScreen({ onBack, onDirectMining, onAutoMining }) {
  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in p-6 h-full bg-[#0f172a] text-slate-100">
      
      {/* 1. 상단 헤더 */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-xs tracking-widest uppercase">Back</span>
        </button>
        <div className="flex items-center gap-2">
            <Database size={18} className="text-amber-400" />
            <h2 className="text-lg font-bold text-amber-100 tracking-[0.1em] drop-shadow-md">
                RESOURCE MINING
            </h2>
        </div>
        <div className="w-5" />
      </div>

      {/* 2. 채굴 방식 선택 카드 */}
      <div className="flex-1 flex flex-col gap-6 justify-center pb-10">
        
        {/* (1) 직접 채굴 (Active Mining) */}
        <button 
          onClick={onDirectMining}
          className="group relative w-full h-48 bg-gradient-to-r from-slate-900/60 to-amber-900/40 border border-white/10 hover:border-amber-400/50 rounded-2xl p-6 flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 overflow-hidden text-left"
        >
          {/* 배경 장식 */}
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-amber-500/10 blur-3xl group-hover:bg-amber-400/20 transition-all"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <Pickaxe size={24} />
                </div>
                <span className="text-xl font-bold text-white tracking-wider group-hover:text-amber-200 transition-colors">
                    직접 채굴
                </span>
            </div>
            <p className="text-xs text-slate-400 font-light pl-1 leading-relaxed">
              위험 구역에 직접 진입하여 전투를 수행합니다.<br/>
              <span className="text-amber-200/80">고효율 데이터 칩</span> 및 희귀 자원 획득 가능.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-3 mt-2">
            <div className="flex items-center gap-2 text-[10px] text-amber-400/80 font-mono">
                <Zap size={12} />
                <span>행동력 소모</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-300 group-hover:text-white transition-colors">
                <span>진입하기</span> <ArrowRight size={14} />
            </div>
          </div>
        </button>

        {/* (2) 자동 채굴 (Auto Mining) */}
        <button 
          onClick={onAutoMining}
          className="group relative w-full h-48 bg-gradient-to-r from-slate-900/60 to-cyan-900/40 border border-white/10 hover:border-cyan-400/50 rounded-2xl p-6 flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 overflow-hidden text-left"
        >
          {/* 배경 장식 */}
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-cyan-500/10 blur-3xl group-hover:bg-cyan-400/20 transition-all"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                    <Bot size={24} />
                </div>
                <span className="text-xl font-bold text-white tracking-wider group-hover:text-cyan-200 transition-colors">
                    자동 채굴
                </span>
            </div>
            <p className="text-xs text-slate-400 font-light pl-1 leading-relaxed">
              채굴 로봇 및 캐릭터를 파견하여 자원을 수급합니다.<br/>
              <span className="text-cyan-200/80">방치형 보상</span> 획득 가능.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-3 mt-2">
            <div className="flex items-center gap-2 text-[10px] text-cyan-400/80 font-mono">
                <Clock size={12} />
                <span>시간 소요</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-300 group-hover:text-white transition-colors">
                <span>관리하기</span> <ArrowRight size={14} />
            </div>
          </div>
        </button>

      </div>

      {/* 하단 시스템 메시지 */}
      <div className="mt-auto pt-4 text-center border-t border-white/5">
        <p className="text-[10px] text-slate-600 font-mono">
          SECTOR 9 - RESOURCE BELT ACCESS GRANTED
        </p>
      </div>
    </div>
  );
}