import React, { useState, useMemo, useCallback } from 'react';
import './App.css';

import useGameNavigation from './hooks/useGameNavigation';
import useGameData from './hooks/useGameData';

// Screens
import HomeScreen from './components/HomeScreen';
import SelectScreen from './components/SelectScreen';
import StorySelectScreen from './components/StorySelectScreen';
import EventScreen from './components/EventScreen';
import BattleScreen from './screens/BattleScreen'; 
import PartyScreen from './components/PartyScreen';
import ManagementScreen from './components/ManagementScreen';
import StorageScreen from './components/StorageScreen';
import GuideBookScreen from './components/GuideBookScreen';
import GachaScreen from './components/GachaScreen';
import ResourcesScreen from './components/ResourcesScreen';
import AutoResourcesScreen from './components/AutoResourcesScreen';

import BattleResultOverlay from './components/battle/BattleResultOverlay';

export default function App() {
  const nav = useGameNavigation();
  const data = useGameData(); 

  const [currentEnemyId, setCurrentEnemyId] = useState(null);
  const [battleType, setBattleType] = useState('story'); 
  
  // [New] 획득한 보상 목록을 저장할 State
  const [battleRewards, setBattleRewards] = useState([]);

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

  const initialParty = useMemo(() => 
    data.partyList.map(p => data.roster.find(r => r.id === p.id)), 
    [data.partyList, data.roster]
  );
  
  // [Fix] 전투 종료 시 보상 지급 로직 추가
  const onGameEnd = useCallback((result) => {
      if (result === 'win' && battleType === 'mining') {
          // 1. 보상 수량 랜덤 결정 (4 ~ 5개)
          const rewardAmount = Math.floor(Math.random() * 2) + 4; 
          
          // 2. 실제 인벤토리에 추가
          data.addResource('chip_basic', rewardAmount);
          
          // 3. 결과창에 보여줄 데이터 설정
          setBattleRewards([
              { id: 'chip_basic', name: '데이터 보강칩', count: rewardAmount }
          ]);
      } else {
          setBattleRewards([]); // 보상 없음 (패배 혹은 스토리 모드 등)
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

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden font-sans border-x border-white/10 shadow-2xl text-slate-100 selection:bg-cyan-500/30 relative">
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, animationDelay: `${Math.random() * 3}s` }}></div>
        ))}
      </div>

      {nav.gameState === 'home' && (
        <HomeScreen 
            onStart={nav.goSelect} 
            onParty={nav.goParty}
            onManage={nav.goManage}
            onStorage={nav.goStorage}
            onRecord={nav.goGuide}
            onGacha={nav.goGacha}
        />
      )}

      {nav.gameState === 'select' && <SelectScreen onSelectContent={handleContentSelect} onBack={nav.goHome} />}
      {nav.gameState === 'story_select' && <StorySelectScreen onSelectChapter={() => nav.goEvent()} onBack={nav.goSelect} />}
      
      {nav.gameState === 'mining_select' && (
        <ResourcesScreen 
            onBack={nav.goSelect} 
            onDirectMining={handleDirectMining} 
            onAutoMining={handleAutoMiningEntry} 
        />
      )}

      {nav.gameState === 'auto_mining' && (
        <AutoResourcesScreen 
            miningState={data.miningState}
            roster={data.roster}
            onAssignMiner={data.handleAssignMiner}
            onRemoveMiner={data.handleRemoveMiner}
            onCollectReward={data.handleCollectReward}
            onBack={nav.goMiningSelect}
        />
      )}
      
      {nav.gameState === 'party' && <PartyScreen currentParty={data.partyList} onUpdateParty={data.setPartyList} onBack={nav.goHome} />}
      
      {nav.gameState === 'manage' && (
        <ManagementScreen 
            roster={data.roster} 
            inventory={data.inventory} 
            onUnlockNode={data.handleUnlockNode} 
            equipmentList={data.equipmentList}
            onEquip={data.handleEquip}
            onUnequip={data.handleUnequip}
            getFinalStats={data.getFinalStats}
            addTestEquipments={data.addTestEquipments}
            onBack={nav.goHome} 
        />
      )}

      {nav.gameState === 'storage' && <StorageScreen inventory={data.inventory} onBack={nav.goHome} />}
      {nav.gameState === 'guide' && <GuideBookScreen collectedKeywords={data.collectedKeywords} onBack={nav.goHome} />}
      {nav.gameState === 'gacha' && <GachaScreen roster={data.roster} setRoster={data.setRoster} inventory={data.inventory} setInventory={data.setInventory} onBack={nav.goHome} />}
      
      {nav.gameState === 'event' && (
        <EventScreen 
            onOptionSelected={data.handleOptionSelected} 
            onEventComplete={handleEventComplete} 
            onUnlockKeyword={data.handleUnlockKeyword}
            collectedKeywords={data.collectedKeywords}
            navigate={nav.goHome} 
        />
      )}
      
      {nav.gameState === 'active' && (
        <BattleScreen 
            userStats={data.userStats} 
            hpMultiplier={data.hpMultiplier} 
            initialParty={initialParty} 
            onGameEnd={onGameEnd}
            enemyId={currentEnemyId} 
        />
      )}

      {(nav.gameState === 'win' || nav.gameState === 'lose') && (
        <BattleResultOverlay 
            result={nav.gameState}
            battleType={battleType}
            rewards={battleRewards} // [Fix] 계산된 보상 전달
            expGained={100} // 임시 경험치 (나중에 변수화 가능)
            onRetry={handleRetryBattle}
            onLeave={handleLeaveBattle}
        />
      )}
    </div>
  );
}