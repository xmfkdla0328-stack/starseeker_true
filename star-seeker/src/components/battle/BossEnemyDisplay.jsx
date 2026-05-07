import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { ENEMY_CAUSALITY_TRIGGER } from '../../data/gameData';

/**
 * 보스급 적 단일 표시 컴포넌트.
 * 기존 BattleEnemyZone의 단일 적 레이아웃을 그대로 추출한 것.
 * (다중 적 지원 step 3a 리팩터: BattleEnemyZone → 라우터화하면서 분리)
 *
 * step 3b에서 다중 적 레이아웃이 추가되어도 보스 1마리 단독 케이스에서는
 * 이 컴포넌트만 그대로 사용해 기존 콘텐츠 시각이 100% 보존됨.
 */
export default function BossEnemyDisplay({ enemy, enemyWarning, showStatus = true, slotId = 'enemy-target-main' }) {
  const [circleActive, setCircleActive] = useState(false);

  useEffect(() => {
    if (enemy) {
      setCircleActive(true);
    }
  }, [enemy]);

  if (!enemy) return null;

  const isBreakout = showStatus && enemy.image;

  // [Step 5-1] 인과율 단계 계산: normal(<70%) → warn(70~99%) → charging(차징 중)
  // 풀스크린 오버레이 대신 보스 카드 자체(테두리/오라/게이지바)로 단계 표현.
  // ※ isBoss 가드: BattleEnemyZone이 보스 없는 라인업에서 첫 적을 fallback으로 이 컴포넌트에 태울 수
  //   있으므로, "보스만 WARNING" 정책을 컴포넌트 내부에서도 강제한다.
  const isBossEntity = !!enemy.isBoss;
  const causalityPct = (enemy.causality || 0) / ENEMY_CAUSALITY_TRIGGER * 100;
  const isCharging = isBossEntity && !!enemy.isCharging;
  const isWarn = isBossEntity && !isCharging && causalityPct >= 70;

  // 단계별 시각 토큰
  const stage = isCharging ? 'charging' : (isWarn ? 'warn' : 'normal');

  // [Step 5-1 v3] 색상 의미: 평소=화이트(중립) → 경고=보라(위협 임박) → 차징=빨강(위험 발동)
  const auraClass =
    stage === 'charging' ? 'bg-rose-500/40 animate-pulse'
    : stage === 'warn'   ? 'bg-fuchsia-500/30 animate-pulse'
    :                      'bg-white/10 animate-pulse';

  const borderClass =
    stage === 'charging' ? 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.85)] animate-[boss-shake_0.4s_ease-in-out_infinite]'
    : stage === 'warn'   ? 'border-fuchsia-500 shadow-[0_0_28px_rgba(232,121,249,0.6)] animate-pulse'
    :                      'border-slate-300/70 shadow-[0_0_20px_rgba(255,255,255,0.25)]';

  const overlayGradientFrom =
    stage === 'charging' ? 'from-rose-900/80'
    : stage === 'warn'   ? 'from-fuchsia-900/75'
    :                      'from-slate-700/70';

  const causalityBarClass =
    stage === 'charging' ? 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.85)]'
    : stage === 'warn'   ? 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.75)]'
    :                      'bg-slate-300';

  return (
    <div className="relative flex-1 flex flex-col items-center justify-between gap-4 p-4 z-10 overflow-hidden">
      
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
         {/* [Step 5-1 v4] WARNING 배지 — 원형 감옥(=보스 머리 위치) 바로 위에 띄움.
             정보 행(item 1) 아래의 안전 영역. */}
         {isCharging && (
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-950/90 border border-rose-500/70 shadow-[0_0_24px_rgba(244,63,94,0.7)] animate-pulse">
               <AlertTriangle className="text-rose-300" size={14} />
               <span className="text-rose-100 font-bold tracking-[0.25em] text-[11px]">
                 WARNING
               </span>
             </div>
           </div>
         )}
         <div id={slotId} className="relative w-64 h-64 flex items-center justify-center mt-4">
            
            {/* 후광 효과 (Aura) — [Step 5-1] 인과율 단계별 색상 */}
            <div className={`absolute inset-8 blur-3xl rounded-full ${auraClass}`} />
            
            {/* [Fix] transform-gpu 와 isolate 를 추가하여 사각형으로 깨지는 렌더링 버그 차단 */}
            {/* [Step 5-1] 테두리/글로우/흔들림이 인과율 단계를 표현 */}
            <div className={`absolute inset-10 rounded-full border-2 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden z-10 transform-gpu isolate transition-all duration-700
                ${isBreakout ? 'border-transparent bg-transparent shadow-none scale-125 opacity-0' : borderClass}
            `}>
               <div className={`absolute inset-0 bg-gradient-to-b ${overlayGradientFrom} to-black opacity-60 z-0`} />
               
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
             <span className={`text-[9px] font-mono text-right transition-colors duration-300 ${stage === 'charging' ? 'text-rose-300' : stage === 'warn' ? 'text-fuchsia-300' : 'text-slate-300'}`}>CAUSALITY</span>
             <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${causalityBarClass}`} style={{ width: `${Math.min(100, causalityPct)}%` }} />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
