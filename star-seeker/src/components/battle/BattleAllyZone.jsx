import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap } from 'lucide-react';

const ACTION_DURATION = 450; // ms — 글로우/스케일업 효과 지속

const ACTION_COLOR = {
  ult:    { ring: '0 0 18px 4px rgba(250,204,21,0.85), 0 0 30px rgba(250,204,21,0.5)', border: '#facc15' }, // 금색
  normal: { ring: '0 0 16px 3px rgba(34,211,238,0.8), 0 0 26px rgba(34,211,238,0.45)', border: '#22d3ee' }, // 시안
  heal:   { ring: '0 0 16px 3px rgba(52,211,153,0.8), 0 0 26px rgba(52,211,153,0.45)', border: '#34d399' }, // 초록
};

export default function BattleAllyZone({
  allies,
  events,
  // [Step 7-d] 수동 ult 발동 UI
  battleMode = 'auto',
  pendingUltAllyIds = null,
  onRequestUltimate,
}) {
  // 행동 중인 아군 ID → actionKind 매핑
  const [activeActors, setActiveActors] = useState({});
  const timersRef = useRef({});

  useEffect(() => {
    if (!events || events.length === 0) return;

    const actorEvents = events.filter(e => e.type === 'actor' && e.actorId != null);
    if (actorEvents.length === 0) return;

    setActiveActors(prev => {
      const next = { ...prev };
      actorEvents.forEach(e => { next[e.actorId] = e.actionKind || 'normal'; });
      return next;
    });

    actorEvents.forEach(e => {
      if (timersRef.current[e.actorId]) clearTimeout(timersRef.current[e.actorId]);
      timersRef.current[e.actorId] = setTimeout(() => {
        setActiveActors(prev => {
          const { [e.actorId]: _removed, ...rest } = prev;
          return rest;
        });
        delete timersRef.current[e.actorId];
      }, ACTION_DURATION);
    });
  }, [events]);

  // 언마운트 시 타이머 정리
  useEffect(() => () => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
  }, []);

  return (
    <div className="w-full px-2 pt-4 pb-2 grid grid-cols-4 gap-2 z-10 backdrop-blur-xl bg-slate-900/60 border-t border-white/10 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] relative">
      
      {/* 장식용 경계선 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      {allies.map((ally) => {
        const actionKind = activeActors[ally.id];
        const isActing = !!actionKind && ally.hp > 0;
        const colors = isActing ? ACTION_COLOR[actionKind] : null;

        // [Step 7-d] 수동 모드 ult 발동 UI 상태.
        // - ultReady: 게이지 가득 차고 살아있음
        // - isPending: 사용자가 발동 요청해둔 상태 (다음 턴에 발동 예정)
        // - clickable: 수동 모드 + ultReady → 초상화 클릭 가능 (이미 pending이어도 토글 해제용 클릭 허용)
        const ultReady = ally.hp > 0 && ally.ultGauge >= ally.maxUltGauge;
        const isPending = !!(pendingUltAllyIds && pendingUltAllyIds.has && pendingUltAllyIds.has(ally.id));
        const clickable = battleMode === 'manual' && ultReady && !!onRequestUltimate;

        const cellStyle = isActing ? {
          transform: 'scale(1.06)',
          boxShadow: colors.ring,
          borderColor: colors.border,
          transition: 'transform 120ms ease-out, box-shadow 120ms ease-out, border-color 120ms ease-out',
          zIndex: 20
        } : {
          transition: 'transform 250ms ease-out, box-shadow 250ms ease-out, border-color 250ms ease-out'
        };

        // [Step 7-d] 수동 ult 상태에 따른 보더 색상 (행동 중 글로우보다 우선순위 낮음).
        const ultBorderClass = !isActing && battleMode === 'manual'
          ? (isPending
              ? 'border-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.6)]'
              : ultReady
                ? 'border-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'border-white/10')
          : (!isActing ? 'border-white/10' : '');

        return (
          <div 
            key={ally.id}
            id={`ally-target-${ally.id}`} 
            style={cellStyle}
            onClick={clickable ? (e) => { e.stopPropagation(); onRequestUltimate(ally.id); } : undefined}
            role={clickable ? 'button' : undefined}
            className={`relative flex flex-col items-center p-2 rounded-xl border ${ultBorderClass} bg-gradient-to-b from-white/10 to-black/40 shadow-lg ${ally.hp <= 0 ? 'opacity-30 grayscale' : 'hover:bg-white/10'} ${clickable ? 'cursor-pointer' : ''}`}
          >
            {ally.shield > 0 && (
              <div className="absolute -top-2 z-20 flex items-center gap-0.5 text-[9px] font-bold text-cyan-200 bg-cyan-900/90 px-1.5 py-0.5 rounded-full border border-cyan-500/50 shadow-lg backdrop-blur-sm">
                <Shield size={8} className="fill-cyan-400" />
                {Math.floor(ally.shield)}
              </div>
            )}

            {/* [Step 7-d] 수동 모드에서만 표시되는 ult 상태 배지.
                READY: 클릭 가능, QUEUED: 다음 턴 발동 예정 (펄스). */}
            {battleMode === 'manual' && ultReady && (
              <div className={`absolute -top-2 right-1 z-20 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border shadow-lg backdrop-blur-sm ${
                isPending
                  ? 'text-amber-100 bg-amber-700/90 border-amber-300 animate-pulse'
                  : 'text-amber-200 bg-amber-900/90 border-amber-400/70'
              }`}>
                <Zap size={8} className="fill-amber-300" />
                {isPending ? 'QUEUED' : 'READY'}
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
        );
      })}
    </div>
  );
}
