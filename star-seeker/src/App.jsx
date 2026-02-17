import React, { useState, useMemo, useCallback } from 'react';
import './App.css';

import useGameNavigation from './hooks/useGameNavigation';
import useGameData from './hooks/useGameData';
import GameRouter from './router/GameRouter'; // [New] 라우터 임포트

export default function App() {
  // 1. Hooks & Data
  const nav = useGameNavigation();
  const data = useGameData(); 

  // 2. Local State
  const [currentEnemyId, setCurrentEnemyId] = useState(null);
  const [battleType, setBattleType] = useState('story'); 
  const [battleRewards, setBattleRewards] = useState([]);

  // 3. Handlers
  const handleContentSelect = (contentType) => {
    if (contentType === 'story') nav.goStorySelect();
    else if (contentType === 'mining') nav.goMiningSelect();
  };

  const handleDirectMining = () => {
    setCurrentEnemyId('guardian'); 
    setBattleType('mining'); 
    nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
  };

  const onGameEnd = useCallback((result) => {
      if (result === 'win' && battleType === 'mining') {
          const rewardAmount = Math.floor(Math.random() * 2) + 4; 
          data.addResource('chip_basic', rewardAmount);
          setBattleRewards([
              { id: 'chip_basic', name: '데이터 보강칩', count: rewardAmount }
          ]);
      } else {
          setBattleRewards([]); 
      }
      nav.goResult(result);
  }, [nav, battleType, data]);

  const handleEventComplete = (nextAction) => {
    if (typeof nextAction === 'string' && nextAction.startsWith('battle:')) {
        const enemyId = nextAction.split(':')[1];
        setCurrentEnemyId(enemyId);
        setBattleType('story'); 
        nav.goBattle(); 
    } else {
        nav.goBattle(); 
    }
  };

  const handleRetryBattle = () => {
      nav.goBattle();
  };

  const handleLeaveBattle = () => {
      if (battleType === 'mining') {
          nav.goMiningSelect(); 
      } else {
          nav.goHome(); 
      }
  };

  // 4. Computed Data
  const initialParty = useMemo(() => 
    data.partyList.map(p => data.roster.find(r => r.id === p.id)), 
    [data.partyList, data.roster]
  );

  // 그룹화된 Prop 객체들
  const battleState = { currentEnemyId, battleType, battleRewards };
  const handlers = {
      handleContentSelect,
      handleDirectMining,
      handleAutoMiningEntry,
      onGameEnd,
      handleEventComplete,
      handleRetryBattle,
      handleLeaveBattle
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden font-sans border-x border-white/10 shadow-2xl text-slate-100 selection:bg-cyan-500/30 relative">
      
      {/* 배경 이펙트 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, animationDelay: `${Math.random() * 3}s` }}></div>
        ))}
      </div>

      {/* 라우터: 실제 화면 전환 담당 */}
      <GameRouter 
        nav={nav}
        data={data}
        battleState={battleState}
        handlers={handlers}
        initialParty={initialParty}
      />
      
    </div>
  );
}