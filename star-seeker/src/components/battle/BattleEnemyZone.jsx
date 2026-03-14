import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { ENEMY_CAUSALITY_TRIGGER } from '../../data/gameData';

export default function BattleEnemyZone({ enemy, enemyWarning, showStatus = true }) {
  const [introWarning, setIntroWarning] = useState(false);
  const [circleActive, setCircleActive] = useState(false);

  useEffect(() => {
    if (enemy && enemy.image) {
      // 0.2초에 띄우고 1.5초만에 빠르게 닫아 템포를 살립니다.
      const t1 = setTimeout(() => setIntroWarning(true), 200);
      const t2 = setTimeout(() => {
        setIntroWarning(false);
        setCircleActive(true);
      }, 1500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setCircleActive(true);
    }
  }, [enemy]);

  if (!enemy) return null;

  const isBreakout = showStatus && enemy.image;

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center gap-4 p-4 z-10 overflow-hidden">
      
      {/* 1. 몹 이름 및 hp 표기 */}
      <div className={`w-4/5 max-w-md z-10 transition-opacity duration-1000 ${showStatus ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between items-end border-b border-white/20 pb-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-fuchsia-300 uppercase tracking-widest mb-1">Target Entity</span>
            <span className="text-lg font-light text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{enemy.name}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-rose-400 tabular-nums">{Math.floor(enemy.hp)}</span>
            <span className="text-xs text-slate-400 ml-1">/ {enemy.maxHp} HP</span>
          </div>
        </div>
      </div>

      {/* 2. 원형 감옥 이펙트 */}
      <div className={`relative w-full flex items-center justify-center transition-all duration-500 z-0 ${enemy.hp <= 0 ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'} ${circleActive ? 'opacity-100' : 'opacity-0'}`}>
         <div id="enemy-target-main" className="relative w-64 h-64 flex items-center justify-center mt-4">
            
            {/* 후광 효과 (Aura) */}
            <div className={`absolute inset-8 bg-rose-500/20 blur-3xl rounded-full animate-pulse ${enemyWarning ? 'bg-fuchsia-500/40' : ''}`} />
            
            {/* [Fix] transform-gpu 와 isolate 를 추가하여 사각형으로 깨지는 렌더링 버그 차단 */}
            <div className={`absolute inset-10 rounded-full border-2 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden z-10 transform-gpu isolate transition-all duration-700
                ${isBreakout ? 'border-transparent bg-transparent shadow-none scale-125 opacity-0' : (enemyWarning ? 'border-fuchsia-500 shadow-[0_0_30px_rgba(232,121,249,0.6)]' : 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]')}
            `}>
               <div className={`absolute inset-0 bg-gradient-to-b ${enemyWarning ? 'from-fuchsia-900/80' : 'from-rose-900/80'} to-black opacity-60 z-0`} />
               
               {enemy.image ? (
                   <img 
                      src={enemy.image} 
                      alt="갇힌 보스" 
                      className={`absolute z-10 w-full h-full object-cover transition-opacity duration-300 ${isBreakout ? 'opacity-0' : 'opacity-100'}`} 
                   />
               ) : (
                   <span className="absolute text-5xl select-none grayscale opacity-80 z-10">👾</span>
               )}
            </div>
         </div>
      </div>

      {/* 거대 보스 이미지 레이어 */}
      {enemy.image && (
          <div className="absolute inset-x-0 bottom-0 top-12 pointer-events-none flex items-end justify-center z-[5]">
              <img 
                  src={enemy.image} 
                  alt={enemy.name} 
                  className={`w-[140%] max-h-full object-contain object-bottom drop-shadow-[0_0_30px_rgba(244,63,94,0.6)] transition-all duration-1000 ease-out origin-bottom
                      ${isBreakout ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-10'}
                  `}
              />
          </div>
      )}

      {/* 3. 게이지 바 */}
      <div className={`relative z-10 w-4/5 max-w-md space-y-2 backdrop-blur-sm bg-slate-900/50 p-3 rounded-lg border border-white/5 transition-opacity duration-1000 ${showStatus ? 'opacity-100' : 'opacity-0'} mt-2`}>
        {/* HP Bar */}
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-[2] flex flex-col gap-0.5">
             <span className="text-[9px] text-amber-500 font-mono flex items-center gap-1"><Zap size={8} /> SKILL CHARGE</span>
             <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(enemy.ultGauge / enemy.maxUltGauge) * 100}%` }} />
             </div>
          </div>
          <div className="flex-[1] flex flex-col gap-0.5">
             <span className="text-[9px] text-fuchsia-500 font-mono text-right">CAUSALITY</span>
             <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${enemy.isCharging ? 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]' : 'bg-fuchsia-700'}`} style={{ width: `${Math.min(100, (enemy.causality / ENEMY_CAUSALITY_TRIGGER) * 100)}%` }} />
             </div>
          </div>
        </div>
      </div>

      {/* [Fix] 뚝 끊기던 네모 박스 삭제 -> 화면 전체를 가로지르는 시네마틱 경고 배너 형태로 교체 */}
      {(introWarning || enemyWarning) && (
        <div className={`absolute inset-0 flex items-center justify-center z-50 pointer-events-none ${introWarning ? 'bg-red-950/20 backdrop-blur-sm animate-pulse' : 'bg-fuchsia-900/10 animate-pulse-fast'}`}>
          <div className={`w-full py-6 flex items-center justify-center gap-4 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)] border-y
            ${enemyWarning ? 'bg-fuchsia-950/80 border-fuchsia-500/50' : 'bg-red-950/80 border-red-500/40'}
          `}>
            <AlertTriangle className={enemyWarning ? 'text-fuchsia-500 animate-bounce' : 'text-red-500'} size={28} />
            <span className={`${enemyWarning ? 'text-fuchsia-200' : 'text-red-200'} font-black tracking-[0.3em] text-lg`}>
              {introWarning ? "WARNING: ENTITY DETECTED" : "WARNING: HIGH CAUSALITY"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}