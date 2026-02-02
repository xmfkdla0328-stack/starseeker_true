import React from 'react';
import { Sword, Shield, Zap, Sparkles, Brain, Heart } from 'lucide-react';

export default function BattleControlZone({ playerCausality, buffs, userStats, onUseSkill }) {
  // [수정] 최상위 div에서 flex-1 클래스 제거
  return (
    <div className="p-3 flex flex-col z-20 backdrop-blur-md bg-[#0f172a]/80 border-t border-white/10 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)] min-h-0">
      
      {/* 인과력 게이지 */}
      <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
        <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-wider text-sm drop-shadow-md">
          <Sparkles size={14} className="animate-pulse" />
          <span>CAUSALITY</span>
        </div>
        <div className="flex-1 mx-3 h-3 bg-slate-800/50 rounded-sm overflow-hidden border border-white/10 relative group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDFoMXYxSDF6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300 relative shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${Math.min(100, playerCausality)}%` }}>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-200">{Math.floor(playerCausality)}<span className="text-slate-500">/100</span></span>
      </div>

      {/* 스킬 버튼 */}
      <div className="flex gap-3 flex-1 mb-3 min-h-0">
        <button onClick={() => onUseSkill('atk')} className={`flex-1 flex flex-col items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 group ${buffs.atk.active ? 'border-rose-500/50 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95'}`}>
          <Sword size={18} className={`mb-1 transition-colors ${buffs.atk.active ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-300'}`} />
          <span className={`text-[10px] font-bold tracking-wide ${buffs.atk.active ? 'text-rose-200' : 'text-slate-300 group-hover:text-white'}`}>ATTACK</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{buffs.atk.active ? `${(buffs.atk.timeLeft/1000).toFixed(1)}s` : '10 CP'}</span>
        </button>
        <button onClick={() => onUseSkill('shield')} className={`flex-1 flex flex-col items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 group ${buffs.shield.active ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95'}`}>
          <Shield size={18} className={`mb-1 transition-colors ${buffs.shield.active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
          <span className={`text-[10px] font-bold tracking-wide ${buffs.shield.active ? 'text-cyan-200' : 'text-slate-300 group-hover:text-white'}`}>DEFENSE</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{buffs.shield.active ? `${(buffs.shield.timeLeft/1000).toFixed(1)}s` : '20 CP'}</span>
        </button>
        <button onClick={() => onUseSkill('speed')} className={`flex-1 flex flex-col items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 group ${buffs.speed.active ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95'}`}>
          <Zap size={18} className={`mb-1 transition-colors ${buffs.speed.active ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'}`} />
          <span className={`text-[10px] font-bold tracking-wide ${buffs.speed.active ? 'text-amber-200' : 'text-slate-300 group-hover:text-white'}`}>HASTE</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{buffs.speed.active ? `${(buffs.speed.timeLeft/1000).toFixed(1)}s` : '30 CP'}</span>
        </button>
      </div>

      {/* 스탯 정보 */}
      <div className="flex justify-between items-center bg-black/40 rounded px-4 py-2 text-[10px] text-slate-400 border border-white/5 font-mono flex-shrink-0">
        <div className="flex items-center gap-1.5"><Sword size={10} className="text-rose-400" /> {userStats.str}</div>
        <div className="flex items-center gap-1.5"><Zap size={10} className="text-amber-400" /> {userStats.agi}</div>
        <div className="flex items-center gap-1.5"><Brain size={10} className="text-violet-400" /> {userStats.int}</div>
        <div className="flex items-center gap-1.5"><Shield size={10} className="text-emerald-400" /> {userStats.wil}</div>
        <div className="flex items-center gap-1.5"><Heart size={10} className="text-pink-400" /> {userStats.chr}</div>
      </div>
    </div>
  );
}
