import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ENEMY_CAUSALITY_TRIGGER } from '../../data/gameData';

export default function BattleEnemyZone({ enemy, enemyWarning }) {
  if (!enemy) return null;

  // [수정] flex-col을 사용하여 UI 요소들을 수직으로 배치하고, absolute 포지셔닝을 제거합니다.
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center gap-4 p-4 z-10 overflow-hidden">
      
      {/* 1. 몹 이름 및 hp 표기 */}
      <div className="w-4/5 max-w-md z-10">
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
      <div className={`relative z-0 w-64 h-64 transition-all duration-700 ${enemy.isCharging ? 'scale-110 drop-shadow-[0_0_30px_rgba(192,38,211,0.6)]' : 'drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]'}`}>
        <img src="https://placehold.co/256x256/2e1065/FFF?text=VOID" alt="Enemy" className="w-full h-full object-contain opacity-80 mix-blend-lighten mask-image-gradient"/>
        <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-xl -z-10 animate-pulse"></div>
      </div>

      {/* 3. 게이지 바 */}
      <div className="relative z-10 w-4/5 max-w-md space-y-2 backdrop-blur-sm bg-slate-900/30 p-2 rounded-lg border border-white/5">
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-slate-800/80 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${enemy.isCharging ? 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]' : 'bg-fuchsia-700'}`} style={{ width: `${Math.min(100, (enemy.causality / ENEMY_CAUSALITY_TRIGGER) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* 경고 오버레이 (기존과 동일, 전체를 덮음) */}
      {enemyWarning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-[2px] animate-pulse">
          <AlertTriangle className="text-rose-500 w-16 h-16 mb-4 drop-shadow-[0_0_20px_rgba(244,63,94,1)]" />
          <div className="px-6 py-3 bg-black/60 border border-rose-500/50 rounded-lg text-rose-400 font-bold text-xl tracking-wider shadow-[0_0_30px_rgba(244,63,94,0.3)] backdrop-blur-md">
            CAUSALITY SURGE DETECTED
          </div>
        </div>
      )}
    </div>
  );
}
