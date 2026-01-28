import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ENEMY_CAUSALITY_TRIGGER } from '../../data/gameData';

export default function BattleEnemyZone({ enemy, enemyWarning }) {
  if (!enemy) return null;

  return (
    <div className="relative flex-[4] flex flex-col items-center justify-end pb-6 z-10 overflow-hidden">
      {/* 상단 정보 */}
      <div className="absolute top-6 left-4 right-4 flex justify-between items-end border-b border-white/20 pb-1 z-20">
        <div className="flex flex-col">
          <span className="text-[10px] text-fuchsia-300 uppercase tracking-widest mb-1">Target Entity</span>
          <span className="text-lg font-light text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{enemy.name}</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-rose-400 tabular-nums">{Math.floor(enemy.hp)}</span>
          <span className="text-xs text-slate-400 ml-1">/ {enemy.maxHp} HP</span>
        </div>
      </div>

      {/* 경고 오버레이 */}
      {enemyWarning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-[2px] animate-pulse">
          <AlertTriangle className="text-rose-500 w-16 h-16 mb-4 drop-shadow-[0_0_20px_rgba(244,63,94,1)]" />
          <div className="px-6 py-3 bg-black/60 border border-rose-500/50 rounded-lg text-rose-400 font-bold text-xl tracking-wider shadow-[0_0_30px_rgba(244,63,94,0.3)] backdrop-blur-md">
            CAUSALITY SURGE DETECTED
          </div>
        </div>
      )}

      {/* 적 이미지 */}
      <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 z-0 w-80 h-80 transition-all duration-700 ${enemy.isCharging ? 'scale-110 drop-shadow-[0_0_30px_rgba(192,38,211,0.6)]' : 'drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]'}`}>
        <img src="https://placehold.co/256x256/2e1065/FFF?text=VOID" alt="Enemy" className="w-full h-full object-contain opacity-80 mix-blend-lighten mask-image-gradient"/>
        <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-xl -z-10 animate-pulse"></div>
      </div>

      {/* 게이지 바 */}
      <div className="relative z-20 w-4/5 mt-auto space-y-2 backdrop-blur-sm bg-slate-900/30 p-2 rounded-lg border border-white/5">
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-fuchsia-300 uppercase tracking-wider w-16 text-right">Singularity</span>
          <div className="flex-1 h-1 bg-slate-800/80 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${enemy.isCharging ? 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]' : 'bg-fuchsia-700'}`} style={{ width: `${Math.min(100, (enemy.causality / ENEMY_CAUSALITY_TRIGGER) * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}