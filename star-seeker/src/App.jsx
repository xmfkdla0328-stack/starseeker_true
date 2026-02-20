import React, { useState, useMemo, useCallback } from 'react';
import './App.css';

import useGameNavigation from './hooks/useGameNavigation';
import useGameData from './hooks/useGameData';
import GameRouter from './router/GameRouter'; 
import { EQUIP_SLOTS } from './data/equipmentData'; // [New] 장비 슬롯 정보 임포트

export default function App() {
  // 1. Hooks & Data
  const nav = useGameNavigation();
  const data = useGameData(); 

  // 2. Local State
  const [currentEnemyId, setCurrentEnemyId] = useState(null);
  
  // battleType: 'story' | 'mining_chip' | 'mining_stone' | 'mining_gear'
  const [battleType, setBattleType] = useState('story'); 
  const [battleRewards, setBattleRewards] = useState([]);

  // 3. Handlers

  // 컨텐츠 선택 (스토리 vs 채굴)
  const handleContentSelect = (contentType) => {
    if (contentType === 'story') nav.goStorySelect();
    else if (contentType === 'mining') nav.goMiningSelect();
  };

  // 직접 채굴 버튼 클릭 -> 미션 선택 화면으로 이동
  const handleDirectMining = () => {
    nav.goDirectMiningSelect();
  };

  // [New] 미션 선택 후 실제 전투 진입 로직
  const handleStartMiningBattle = (type) => {
      // 1. 적 ID 설정 (현재는 임시로 guardian 통일, 추후 타입별로 다르게 설정 가능)
      // 예: if (type === 'gear') enemyId = 'gear_boss';
      let enemyId = 'guardian';
      
      // 2. 전투 타입 설정 (종료 후 보상 지급을 위해 구분)
      let newBattleType = 'mining_chip';
      if (type === 'stone') newBattleType = 'mining_stone';
      else if (type === 'gear') newBattleType = 'mining_gear'; // 장비 파밍

      setCurrentEnemyId(enemyId);
      setBattleType(newBattleType);
      nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
  };

  // [Fix] 전투 종료 및 보상 지급 로직 (장비 파밍 추가)
  const onGameEnd = useCallback((result) => {
      if (result === 'win') {
          // A. 데이터 칩 채굴 (기본)
          if (battleType === 'mining_chip') {
              const rewardAmount = Math.floor(Math.random() * 2) + 4; // 4~5개
              data.addResource('chip_basic', rewardAmount);
              setBattleRewards([
                  { id: 'chip_basic', name: '데이터 보강칩', count: rewardAmount }
              ]);
          } 
          // B. 인과석 채굴 (고급)
          else if (battleType === 'mining_stone') {
              const rewardAmount = Math.floor(Math.random() * 2) + 1; // 1~2개
              data.addResource('causality_stone', rewardAmount);
              setBattleRewards([
                  { id: 'causality_stone', name: '인과석', count: rewardAmount }
              ]);
          }
          // C. [New] 장비 파밍 (데이터 중첩핵)
          else if (battleType === 'mining_gear') {
              const dropCount = Math.floor(Math.random() * 2) + 3; // 3~4개 드랍
              const newItems = [];
              const slotKeys = Object.keys(EQUIP_SLOTS);
              
              for (let i = 0; i < dropCount; i++) {
                  // 랜덤 슬롯 타입 결정 (Neural, Cortex, Auxiliary 중 하나)
                  const randomSlotKey = slotKeys[Math.floor(Math.random() * slotKeys.length)];
                  const slotType = EQUIP_SLOTS[randomSlotKey];
                  
                  // 장비 생성 및 인벤토리 추가 (hooks/useGameData -> useInventory)
                  const newItem = data.addEquipment(slotType); 
                  
                  // 결과창 표시용 데이터 구성
                  newItems.push({ 
                      id: newItem.id, 
                      name: newItem.name, 
                      count: 1, 
                      rarity: newItem.rarity 
                  });
              }
              setBattleRewards(newItems);
          }
          // D. 스토리 등 기타 전투 (보상 없음 or 별도 처리)
          else {
              setBattleRewards([]);
          }
      } else {
          setBattleRewards([]); // 패배 시 보상 없음
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
      handleStartMiningBattle,  
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