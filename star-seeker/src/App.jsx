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
  
  // [NEW] 스토리 체인을 위해, 전투 후 넘어갈 다음 이벤트 ID를 기억합니다.
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
      setNextEventId(null); // 채굴은 다음 스토리가 없으므로 null
      nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
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
      
      nav.goResult(result);
  }, [nav, battleType, data]);

  const handleEventComplete = (nextAction) => {
    if (typeof nextAction === 'string' && nextAction.startsWith('battle:')) {
        // nextAction 분해: 'battle:보스ID:다음스토리ID'
        const parts = nextAction.split(':');
        const enemyId = parts[1];
        const nextEvtId = parts[2] || null; // 3번째 값이 있으면 저장, 없으면 null

        setCurrentEnemyId(enemyId);
        setBattleType('story'); 
        setNextEventId(nextEvtId); // [NEW] 상태에 저장
        nav.goBattle(); 
    } else {
        nav.goBattle(); 
    }
  };

  const handleRetryBattle = () => {
      nav.goBattle();
  };

  // [Fix] 전투 후 나가기(또는 다음 스토리로) 핸들러
  const handleLeaveBattle = () => {
      if (battleType === 'story' && nextEventId) {
          // 다음 이벤트가 지정되어 있다면, 이벤트 화면으로 이동시킴
          nav.goEvent(nextEventId); // (참고: GameRouter에서 activeEventId를 받도록 프롭스를 하나 더 뚫어줘야 할 수 있지만, 지금은 기본 goEvent 호출)
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

  // [NEW] isStoryChain 플래그를 오버레이에 전달하기 위해 battleState에 추가
  const battleState = { 
      currentEnemyId, 
      battleType, 
      battleRewards,
      isStoryChain: !!nextEventId // 다음 스토리가 있는지 여부 (boolean)
  };
  
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
        // [NEW] App에서 들고 있는 다음 스토리 ID를 라우터로 넘겨줌
        activeEventId={nextEventId || 'prologue'} 
      />
    </div>
  );
}