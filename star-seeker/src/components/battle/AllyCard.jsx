import React from 'react';
import { Shield } from 'lucide-react';

/**
 * 단일 아군 카드 — 초상화/HP/ult 게이지/이름/실드 배지/ult 오버레이를 렌더한다.
 * BattleAllyZone에서 분리되어 추후 클릭→버프 인스펙터 등 카드 단위 상호작용을
 * 깔끔하게 추가할 수 있도록 함.
 *
 * Props:
 *  - ally: 아군 객체
 *  - actionKind: 'normal'|'heal'|'ult'|undefined — 현재 행동 중이면 종류
 *  - battleMode: 'auto'|'manual'
 *  - isPending: 수동 모드에서 ult 발동 큐잉됨
 *  - onRequestUltimate(allyId): 수동 모드에서 ult 요청 콜백
 *  - onInspect(allyId): (옵션) 카드 클릭 시 인스펙터 호출 — ult clickable이 아닐 때만 작동
 */
export default function AllyCard({
  ally,
  actionKind,
  battleMode = 'auto',
  isPending = false,
  onRequestUltimate,
  onInspect,
}) {
  const isActing = !!actionKind && ally.hp > 0;
  const ultReady = ally.hp > 0 && ally.ultGauge >= ally.maxUltGauge;
  const ultClickable = battleMode === 'manual' && ultReady && !!onRequestUltimate;

  // [Step 7-e] 행동 중에도 글로우/보더 변경 없이 스케일만으로 피드백.
  //   ult 발동 시에만 살짝 더 크게(1.08) 강조해 일반 공격(1.04)과 구분.
  const cellStyle = isActing ? {
    transform: actionKind === 'ult' ? 'scale(1.08)' : 'scale(1.04)',
    transition: 'transform 120ms ease-out',
    zIndex: 20,
  } : {
    transition: 'transform 250ms ease-out',
  };

  // [Step 7-d/7-e] ult 준비 상태에 따른 보더+글로우 — 카드 글로우는 'ult 준비됨' 전용 신호.
  const ultBorderClass = battleMode === 'manual'
    ? (isPending
        ? 'border-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.6)]'
        : ultReady
          ? 'border-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
          : 'border-white/10')
    : 'border-white/10';

  // 클릭 동작 우선순위: 수동 ult 요청 > 인스펙터 호출.
  const handleClick = ultClickable
    ? (e) => { e.stopPropagation(); onRequestUltimate(ally.id); }
    : (onInspect && ally.hp > 0
        ? (e) => { e.stopPropagation(); onInspect(ally.id); }
        : undefined);
  const isClickable = !!handleClick;

  return (
    <div
      id={`ally-target-${ally.id}`}
      style={cellStyle}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      className={`relative flex flex-col items-center p-2 rounded-xl border ${ultBorderClass} bg-gradient-to-b from-white/10 to-black/40 shadow-lg ${ally.hp <= 0 ? 'opacity-30 grayscale' : 'hover:bg-white/10'} ${isClickable ? 'cursor-pointer' : ''}`}
    >
      {ally.shield > 0 && (
        <div className="absolute -top-2 z-20 flex items-center gap-0.5 text-[9px] font-bold text-cyan-200 bg-cyan-900/90 px-1.5 py-0.5 rounded-full border border-cyan-500/50 shadow-lg backdrop-blur-sm">
          <Shield size={8} className="fill-cyan-400" />
          {Math.floor(ally.shield)}
        </div>
      )}

      {/* 초상화 */}
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden mb-2 border-2 ${ally.hp > 0 ? 'border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-rose-900'} relative bg-slate-800 flex-shrink-0`}>
        {ally.image ? (
          <img src={ally.image} alt={ally.name} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${ally.color || 'from-slate-500 to-slate-700'} opacity-60`} />
            <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white/90 drop-shadow-md">
              {ally.name?.charAt(0) || ally.role?.charAt(0)}
            </span>
          </>
        )}

        {/* [Step 7-e] 수동 모드 ult 상태 오버레이 — READY (흰색) / QUEUED (amber-300 + pulse). */}
        {battleMode === 'manual' && ultReady && (
          <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.7)_70%,rgba(0,0,0,0.55)_100%)] ${
            isPending ? 'animate-pulse' : ''
          }`}>
            <span className={`text-[9px] md:text-[10px] font-black tracking-[0.06em] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] ${
              isPending ? 'text-amber-300' : 'text-white'
            }`}>
              {isPending ? 'QUEUED' : 'READY'}
            </span>
          </div>
        )}
      </div>

      {/* HP Bar */}
      <div className="w-full h-1.5 bg-slate-800/80 rounded-full mb-1 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 shadow-[0_0_5px_rgba(52,211,153,0.5)]"
          style={{ width: `${(ally.hp / ally.maxHp) * 100}%` }}
        />
      </div>

      {/* Ult Bar */}
      <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-1">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 shadow-[0_0_5px_rgba(251,191,36,0.5)]"
          style={{ width: `${(ally.ultGauge / ally.maxUltGauge) * 100}%` }}
        />
      </div>

      <span className="text-xs text-slate-200 mt-0.5 font-bold tracking-tight truncate w-full text-center drop-shadow-md">
        {ally.name}
      </span>
    </div>
  );
}
