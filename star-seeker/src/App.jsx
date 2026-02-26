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
      // [Fix 1] UI에서 'core'나 'gear' 등 어떤 이름으로 넘어오든 확실하게 장비 파밍으로 연결!
      else if (type === 'gear' || type === 'core') newBattleType = 'mining_gear'; 

      setCurrentEnemyId(enemyId);
      setBattleType(newBattleType);
      nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
  };

  const onGameEnd = useCallback((result) => {
      if (result === 'win') {
          // A. 데이터 칩 채굴
          if (battleType === 'mining_chip') {
              const rewardAmount = Math.floor(Math.random() * 2) + 4; 
              data.addResource('chip_basic', rewardAmount);
              setBattleRewards([
                  { id: 'chip_basic', name: '데이터 보강칩', count: rewardAmount }
              ]);
          } 
          // B. 인과석 채굴
          else if (battleType === 'mining_stone') {
              const rewardAmount = Math.floor(Math.random() * 2) + 1; 
              data.addResource('causality_stone', rewardAmount);
              setBattleRewards([
                  { id: 'causality_stone', name: '인과석', count: rewardAmount }
              ]);
          }
          // C. [Fix 2] 장비 파밍 (데이터 중첩핵)
          else if (battleType === 'mining_gear') {
              const dropCount = Math.floor(Math.random() * 2) + 3; 
              const newItems = [];
              
              // [핵심 해결] 가챠 전용인 3번 슬롯(기억 세공)을 철저히 배제하고, 1번과 2번 칩만 드랍되도록 풀 제한!
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
      if (battleType.startsWith('mining')) {
          nav.goDirectMiningSelect(); 
      } else {
          nav.goHome(); 
      }
  };

  const initialParty = useMemo(() => 
    data.partyList.map(p => data.roster.find(r => r.id === p.id)), 
    [data.partyList, data.roster]
  );

  const battleState = { currentEnemyId, battleType, battleRewards };
  const handlers = {
      handleContentSelect,
      handleDirectMining,       
      handleStartMiningBattle,  
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