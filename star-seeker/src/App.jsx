import React, { useState, useMemo, useCallback } from 'react';
import './App.css';

import useGameNavigation from './hooks/useGameNavigation';
import useGameData from './hooks/useGameData';
import GameRouter from './router/GameRouter'; 

export default function App() {
  const nav = useGameNavigation();
  const data = useGameData(); 

  const [currentEnemyId, setCurrentEnemyId] = useState(null);
  
  // battleType: 'story' | 'mining_chip' | 'mining_stone'
  const [battleType, setBattleType] = useState('story'); 
  const [battleRewards, setBattleRewards] = useState([]);

  // --- Handlers ---

  const handleContentSelect = (contentType) => {
    if (contentType === 'story') nav.goStorySelect();
    else if (contentType === 'mining') nav.goMiningSelect();
  };

  // [Mod] 직접 채굴 버튼 클릭 -> 선택 화면으로 이동
  const handleDirectMining = () => {
    nav.goDirectMiningSelect();
  };

  // [New] 미션 선택 후 실제 전투 진입
  const handleStartMiningBattle = (type) => {
      // 1. 타입에 따라 적 ID 설정 (현재는 동일하게 guardian, 추후 분리 가능)
      const enemyId = type === 'chip' ? 'guardian' : 'guardian'; 
      setCurrentEnemyId(enemyId);

      // 2. 전투 타입 설정 (보상 구분을 위해)
      setBattleType(type === 'chip' ? 'mining_chip' : 'mining_stone');

      // 3. 전투 화면 이동
      nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
  };

  // [Mod] 전투 종료 및 보상 지급
  const onGameEnd = useCallback((result) => {
      if (result === 'win') {
          // A. 데이터 칩 채굴 보상
          if (battleType === 'mining_chip') {
              const rewardAmount = Math.floor(Math.random() * 2) + 4; // 4~5개
              data.addResource('chip_basic', rewardAmount);
              setBattleRewards([{ id: 'chip_basic', name: '데이터 보강칩', count: rewardAmount }]);
          } 
          // B. 인과석 채굴 보상
          else if (battleType === 'mining_stone') {
              const rewardAmount = Math.floor(Math.random() * 2) + 1; // 1~2개
              data.addResource('causality_stone', rewardAmount);
              setBattleRewards([{ id: 'causality_stone', name: '인과석', count: rewardAmount }]);
          }
          // C. 스토리 등 기타
          else {
              setBattleRewards([]);
          }
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
      // 채굴 관련 전투였다면 다시 미션 선택 창으로 돌아가게 함
      if (battleType.startsWith('mining')) {
          nav.goDirectMiningSelect(); 
      } else {
          nav.goHome(); 
      }
  };

  // ... (나머지 useMemo 등 기존 코드 유지) ...
  const initialParty = useMemo(() => 
    data.partyList.map(p => data.roster.find(r => r.id === p.id)), 
    [data.partyList, data.roster]
  );

  const battleState = { currentEnemyId, battleType, battleRewards };
  
  const handlers = {
      handleContentSelect,
      handleDirectMining,       // -> goDirectMiningSelect
      handleStartMiningBattle,  // [New] -> goBattle
      handleAutoMiningEntry,
      onGameEnd,
      handleEventComplete,
      handleRetryBattle,
      handleLeaveBattle
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden font-sans border-x border-white/10 shadow-2xl text-slate-100 selection:bg-cyan-500/30 relative">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, animationDelay: `${Math.random() * 3}s` }}></div>
        ))}
      </div>

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