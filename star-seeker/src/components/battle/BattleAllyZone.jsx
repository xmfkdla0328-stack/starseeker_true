// star-seeker/src/components/battle/BattleAllyZone.jsx
// 아군 카드 그리드 컨테이너. 카드 자체 렌더는 AllyCard.jsx로 분리됨.
import React, { useEffect, useRef, useState } from 'react';
import AllyCard from './AllyCard';

const ACTION_DURATION = 450; // ms — 카드 스케일업 효과 지속

export default function BattleAllyZone({
  allies,
  events,
  battleMode = 'auto',
  pendingUltAllyIds = null,
  onRequestUltimate,
  onInspectAlly,
}) {
  // 행동 중인 아군 ID → actionKind 매핑.
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
        const isPending = !!(pendingUltAllyIds && pendingUltAllyIds.has && pendingUltAllyIds.has(ally.id));
        return (
          <AllyCard
            key={ally.id}
            ally={ally}
            actionKind={activeActors[ally.id]}
            battleMode={battleMode}
            isPending={isPending}
            onRequestUltimate={onRequestUltimate}
            onInspect={onInspectAlly}
          />
        );
      })}
    </div>
  );
}
