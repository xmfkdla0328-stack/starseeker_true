import React, { useMemo } from 'react';
import './App.css';

import useGameNavigation from './hooks/useGameNavigation';
import useGameData from './hooks/useGameData';
import useGameFlow from './hooks/useGameFlow';
import GameRouter from './router/GameRouter';

export default function App() {
  const nav = useGameNavigation();
  const data = useGameData();

  // 전투/이벤트 등 게임 흐름 관련 state와 핸들러는 useGameFlow 훅으로 분리되어 있습니다.
  const { battleState, handlers, nextEventId } = useGameFlow(nav, data);

  const initialParty = useMemo(
    () => data.partyList.map(p => data.getFinalStats(p.id)).filter(Boolean),
    [data.partyList, data.getFinalStats]
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="flex flex-col h-[100dvh] max-h-[900px] w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden font-sans border-x border-white/10 shadow-2xl text-slate-100 selection:bg-cyan-500/30 relative">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        <GameRouter
          nav={nav}
          data={data}
          battleState={battleState}
          handlers={handlers}
          initialParty={initialParty}
          activeEventId={nextEventId || 'evt_prologue_start'}
        />
      </div>
    </div>
  );
}
