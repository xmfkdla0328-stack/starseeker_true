import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { ENEMY_CAUSALITY_TRIGGER } from '../../data/gameData';

export default function BattleEnemyZone({ enemy, enemyWarning, showStatus = true }) {
  if (!enemy) return null;

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

      {/* 2. 적 이미지 */}
      <div className={`relative z-0 transition-all duration-500 ${enemy.hp <= 0 ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
         <div 
            // [New] 적 데미지 텍스트 위치 타겟 ID
            id="enemy-target-main"
            className="relative w-48 h-48 flex items-center justify-center"
         >
            {/* Aura Effect */}
            <div className={`absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse ${enemyWarning ? 'bg-fuchsia-500/40' : ''}`} />
            
            {/* Main Enemy Circle */}
            <div className={`w-32 h-32 rounded-full border-2 ${enemyWarning ? 'border-fuchsia-500 shadow-[0_0_30px_rgba(232,121,249,0.6)]' : 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]'} bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden`}>
               <div className={`w-full h-full bg-gradient-to-b ${enemyWarning ? 'from-fuchsia-900/80 to-black' : 'from-rose-900/80 to-black'} opacity-80`} />
               <span className="absolute text-4xl select-none grayscale opacity-80">👾</span>
            </div>
         </div>
      </div>

      {/* 3. 게이지 바 */}
      <div className={`relative z-10 w-4/5 max-w-md space-y-2 backdrop-blur-sm bg-slate-900/30 p-3 rounded-lg border border-white/5 transition-opacity duration-1000 ${showStatus ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* HP Bar */}
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
        </div>

        <div className="flex items-center gap-3">
          {/* Ult Gauge */}
          <div className="flex-[2] flex flex-col gap-0.5">
             <span className="text-[9px] text-amber-500 font-mono flex items-center gap-1">
                <Zap size={8} /> SKILL CHARGE
             </span>
             <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(enemy.ultGauge / enemy.maxUltGauge) * 100}%` }} />
             </div>
          </div>

          {/* Causality Gauge */}
          <div className="flex-[1] flex flex-col gap-0.5">
             <span className="text-[9px] text-fuchsia-500 font-mono text-right">CAUSALITY</span>
             <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${enemy.isCharging ? 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]' : 'bg-fuchsia-700'}`} style={{ width: `${Math.min(100, (enemy.causality / ENEMY_CAUSALITY_TRIGGER) * 100)}%` }} />
             </div>
          </div>
        </div>
      </div>

      {/* 경고 오버레이 */}
      {enemyWarning && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-pulse-fast bg-fuchsia-900/10">
          <div className="bg-black/80 border border-fuchsia-500/50 px-6 py-3 rounded-sm flex items-center gap-3 backdrop-blur-md">
            <AlertTriangle className="text-fuchsia-500" size={24} />
            <span className="text-fuchsia-200 font-bold tracking-[0.2em] text-sm">WARNING: HIGH CAUSALITY</span>
          </div>
        </div>
      )}
    </div>
  );
}