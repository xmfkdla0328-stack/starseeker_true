import React from 'react';
import { Shield } from 'lucide-react';

export default function BattleAllyZone({ allies }) {
  // [수정] 기존 디자인 유지 + ID 추가
  return (
    <div className="flex-[1] px-2 grid grid-cols-4 gap-2 z-10 backdrop-blur-md bg-white/5 border-white/10">
      {allies.map((ally) => (
        <div 
          key={ally.id}
          // [New] 플로팅 텍스트 위치 타겟 ID
          id={`ally-target-${ally.id}`} 
          className={`relative flex flex-col items-center p-1 rounded-lg border border-white/5 bg-gradient-to-b from-white/5 to-transparent transition-all ${ally.hp <= 0 ? 'opacity-30 grayscale' : 'hover:bg-white/10'}`}
        >
          {ally.shield > 0 && (
            <div className="absolute -top-1.5 z-20 flex items-center gap-0.5 text-[8px] text-cyan-200 bg-cyan-900/80 px-1 py-0.5 rounded-full border border-cyan-500/30 shadow-lg backdrop-blur-sm">
              <Shield size={6} className="fill-cyan-400" />
              {Math.floor(ally.shield)}
            </div>
          )}
          
          <div className={`w-8 h-8 rounded-full overflow-hidden mb-1 border ${ally.hp > 0 ? 'border-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-rose-900'} relative bg-slate-800`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${ally.color} opacity-60`}></div>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90">{ally.role.charAt(0)}</span>
          </div>

          <div className="w-full h-1 bg-slate-700/50 rounded-full mb-0.5 overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-300 shadow-[0_0_5px_rgba(52,211,153,0.5)]" style={{ width: `${(ally.hp / ally.maxHp) * 100}%` }} />
          </div>
          
          <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 transition-all duration-300 shadow-[0_0_5px_rgba(251,191,36,0.5)]" style={{ width: `${(ally.ultGauge / ally.maxUltGauge) * 100}%` }} />
          </div>
          
          <span className="text-[9px] text-slate-300 mt-0.5 font-light tracking-tight">{ally.name}</span>
        </div>
      ))}
    </div>
  );
}