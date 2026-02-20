import React from 'react';
import { ArrowLeft, HardDrive, Hexagon, Swords, AlertTriangle, Cpu } from 'lucide-react';
import ParticleBackground from '../common/ParticleBackground';

export default function DirectMiningSelectScreen({ onBack, onSelectStage }) {
  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in p-6 h-full bg-[#0f172a] text-slate-100 overflow-hidden">
      
      {/* 배경 효과 */}
      <ParticleBackground color="bg-cyan-600" />

      {/* 헤더 */}
      <div className="relative z-10 flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="text-xs tracking-widest uppercase">Back</span>
        </button>
        <div className="flex items-center gap-2">
            <Swords size={18} className="text-red-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-widest">MISSION SELECT</h2>
        </div>
        <div className="w-5" />
      </div>

      {/* 미션 선택 카드 목록 */}
      <div className="relative z-10 flex-1 flex flex-col gap-4 overflow-y-auto pb-10">
        
        {/* 1. 데이터 응집체 추출 (칩 보상) */}
        <button 
            onClick={() => onSelectStage('chip')}
            className="group relative w-full bg-slate-900/60 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 rounded-xl p-5 text-left transition-all hover:bg-slate-800/80 active:scale-98"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500/30 transition-colors">
                        <HardDrive size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-200">데이터 응집체 추출</h3>
                        <p className="text-xs text-slate-400">Recommended Lv. 10</p>
                    </div>
                </div>
                <div className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[10px] text-cyan-400 font-mono">
                    일반 등급
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500">주요 보상</span>
                <div className="flex items-center gap-1 text-xs text-cyan-200">
                    <HardDrive size={12} />
                    <span>데이터 보강칩 x4~5</span>
                </div>
            </div>
        </button>

        {/* 2. 인과 응집체 추출 (인과석 보상) */}
        <button 
            onClick={() => onSelectStage('stone')}
            className="group relative w-full bg-slate-900/60 backdrop-blur-sm border border-violet-500/30 hover:border-violet-400 rounded-xl p-5 text-left transition-all hover:bg-slate-800/80 active:scale-98"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-violet-500/20 text-violet-300 group-hover:bg-violet-500/30 transition-colors">
                        <Hexagon size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-violet-200">인과 응집체 추출</h3>
                        <p className="text-xs text-slate-400">Recommended Lv. 20</p>
                    </div>
                </div>
                <div className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[10px] text-violet-400 font-mono flex items-center gap-1">
                    <AlertTriangle size={10} /> 고난이도
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500">주요 보상</span>
                <div className="flex items-center gap-1 text-xs text-violet-200">
                    <Hexagon size={12} />
                    <span>인과석 x1~2</span>
                </div>
            </div>
        </button>

        {/* 3. [New] 데이터 중첩핵 추출 (장비 보상) */}
        <button 
            onClick={() => onSelectStage('gear')}
            className="group relative w-full bg-slate-900/60 backdrop-blur-sm border border-emerald-500/30 hover:border-emerald-400 rounded-xl p-5 text-left transition-all hover:bg-slate-800/80 active:scale-98"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 transition-colors">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-200">데이터 중첩핵 추출</h3>
                        <p className="text-xs text-slate-400">Recommended Lv. 15</p>
                    </div>
                </div>
                <div className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[10px] text-emerald-400 font-mono">
                    장비 파밍
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500">주요 보상</span>
                <div className="flex items-center gap-1 text-xs text-emerald-200">
                    <Cpu size={12} />
                    <span>랜덤 장비 x3~4</span>
                </div>
            </div>
        </button>

      </div>
    </div>
  );
}