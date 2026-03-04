import React, { useState, useMemo, useCallback } from 'react';
import './App.css';

import useGameNavigation from './hooks/useGameNavigation';
import useGameData from './hooks/useGameData';
import GameRouter from './router/GameRouter'; 
import { EQUIP_SLOTS, generateEquipment } from './data/equipmentData'; 

export default function App() {
  const nav = useGameNavigation();
  const data = useGameData(); 

  const [currentEnemyId, setCurrentEnemyId] = useState(null);
  const [battleType, setBattleType] = useState('story'); 
  const [battleRewards, setBattleRewards] = useState([]);
  
  const [nextEventId, setNextEventId] = useState(null);

  const handleContentSelect = (contentType) => {
    if (contentType === 'story') nav.goStorySelect();
    else if (contentType === 'mining') nav.goMiningSelect();
  };

  const handleDirectMining = () => {
    nav.goDirectMiningSelect();
  };

  const handleStartMiningBattle = (type) => {
      let enemyId = 'guardian';
      
      let newBattleType = 'mining_chip';
      if (type === 'stone') newBattleType = 'mining_stone';
      else if (type === 'gear' || type === 'core') newBattleType = 'mining_gear'; 

      setCurrentEnemyId(enemyId);
      setBattleType(newBattleType);
      setNextEventId(null); 
      nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
  };

  // [NEW] 사건의 지평선(인과의 나무)에서 노드를 클릭했을 때 스토리를 시작하는 함수
  const handleStartStoryEvent = (eventId) => {
      setNextEventId(eventId); 
      nav.goEvent();           
  };

  const onGameEnd = useCallback((result) => {
      if (result === 'win') {
          if (battleType === 'mining_chip') {
              const rewardAmount = Math.floor(Math.random() * 2) + 4; 
              data.addResource('chip_basic', rewardAmount);
              setBattleRewards([{ id: 'chip_basic', name: '데이터 보강칩', count: rewardAmount }]);
          } 
          else if (battleType === 'mining_stone') {
              const rewardAmount = Math.floor(Math.random() * 2) + 1; 
              data.addResource('causality_stone', rewardAmount);
              setBattleRewards([{ id: 'causality_stone', name: '인과석', count: rewardAmount }]);
          }
          else if (battleType === 'mining_gear') {
              const dropCount = Math.floor(Math.random() * 2) + 3; 
              const newItems = [];
              const miningSlotKeys = ['SLOT_1', 'SLOT_2'];
              
              for (let i = 0; i < dropCount; i++) {
                  const randomSlotKey = miningSlotKeys[Math.floor(Math.random() * miningSlotKeys.length)];
                  const slotType = EQUIP_SLOTS[randomSlotKey];
                  
                  const generatedItem = generateEquipment(slotType); 
                  data.addEquipment(generatedItem); 
                  
                  newItems.push({ 
                      id: generatedItem.id, 
                      name: generatedItem.name, 
                      count: 1, 
                      rarity: generatedItem.rarity 
                  });
              }
              setBattleRewards(newItems);
          }
          else {
              setBattleRewards([]);
          }
      } else {
          setBattleRewards([]); 
      }
      
      // 스토리 모드 클리어 시 진행도 저장
      if (result === 'win' && battleType === 'story' && nextEventId) {
          data.completeStoryNode && data.completeStoryNode(nextEventId);
      }
      
      nav.goResult(result);
  }, [nav, battleType, data, nextEventId]);

  const handleEventComplete = (nextAction) => {
    if (typeof nextAction === 'string' && nextAction.startsWith('battle:')) {
        const parts = nextAction.split(':');
        const enemyId = parts[1];
        const nextEvtId = parts[2] || null; 

        setCurrentEnemyId(enemyId);
        setBattleType('story'); 
        setNextEventId(nextEvtId); 
        nav.goBattle(); 
    } else {
        nav.goBattle(); 
    }
  };

  const handleRetryBattle = () => {
      nav.goBattle();
  };

  const handleLeaveBattle = () => {
      if (battleType === 'story' && nextEventId) {
          nav.goEvent(); 
      } 
      else if (battleType.startsWith('mining')) {
          nav.goDirectMiningSelect(); 
      } 
      else {
          nav.goHome(); 
      }
  };

  const initialParty = useMemo(() => 
    data.partyList.map(p => data.roster.find(r => r.id === p.id)), 
    [data.partyList, data.roster]
  );

  const battleState = { 
      currentEnemyId, 
      battleType, 
      battleRewards,
      isStoryChain: !!nextEventId 
  };
  
  const handlers = {
      handleContentSelect,
      handleDirectMining,       
      handleStartMiningBattle,  
      handleAutoMiningEntry,
      handleStartStoryEvent, // 핸들러 전달
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
        activeEventId={nextEventId || 'evt_prologue_start'} 
      />
    </div>
  );
}