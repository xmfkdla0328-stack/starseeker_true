import React from 'react';
import { Shield } from 'lucide-react';

export default function BattleAllyZone({ allies }) {
  return (
    // [Fix] pt-4 pb-2 로 위아래 간격을 조정하고, 하단의 컨트롤 존과 딱 붙도록 보더와 그림자를 설정했습니다.
    <div className="w-full px-2 pt-4 pb-2 grid grid-cols-4 gap-2 z-10 backdrop-blur-xl bg-slate-900/60 border-t border-white/10 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] relative">
      
      {/* 장식용 경계선 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      {allies.map((ally) => (
        <div 
          key={ally.id}
          id={`ally-target-${ally.id}`} 
          className={`relative flex flex-col items-center p-2 rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-black/40 transition-all shadow-lg ${ally.hp <= 0 ? 'opacity-30 grayscale' : 'hover:bg-white/10'}`}
        >
          {ally.shield > 0 && (
            <div className="absolute -top-2 z-20 flex items-center gap-0.5 text-[9px] font-bold text-cyan-200 bg-cyan-900/90 px-1.5 py-0.5 rounded-full border border-cyan-500/50 shadow-lg backdrop-blur-sm">
              <Shield size={8} className="fill-cyan-400" />
              {Math.floor(ally.shield)}
            </div>
          )}
          
          {/* [Fix] 크기를 w-8에서 w-14(모바일) ~ w-16(태블릿)으로 대폭 확장! */}
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden mb-2 border-2 ${ally.hp > 0 ? 'border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-rose-900'} relative bg-slate-800 flex-shrink-0`}>
            
            {/* [New] 캐릭터 이미지가 있으면 출력, 없으면 기존처럼 도트와 색상 출력 */}
            {ally.image ? (
               <img src={ally.image} alt={ally.name} className="w-full h-full object-cover" />
            ) : (
               <>
                 <div className={`absolute inset-0 bg-gradient-to-br ${ally.color || 'from-slate-500 to-slate-700'} opacity-60`}></div>
                 <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white/90 drop-shadow-md">{ally.name?.charAt(0) || ally.role?.charAt(0)}</span>
               </>
            )}
            
          </div>

          {/* HP Bar (두께 살짝 증가 h-1.5) */}
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full mb-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 shadow-[0_0_5px_rgba(52,211,153,0.5)]" style={{ width: `${(ally.hp / ally.maxHp) * 100}%` }} />
          </div>
          
          {/* Ult Bar */}
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 shadow-[0_0_5px_rgba(251,191,36,0.5)]" style={{ width: `${(ally.ultGauge / ally.maxUltGauge) * 100}%` }} />
          </div>
          
          {/* 캐릭터 이름 */}
          <span className="text-xs text-slate-200 mt-0.5 font-bold tracking-tight truncate w-full text-center drop-shadow-md">{ally.name}</span>
        </div>
      ))}
    </div>
  );
}