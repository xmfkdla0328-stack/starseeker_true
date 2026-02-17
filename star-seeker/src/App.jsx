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

// [New] 새로 만든 결과 컴포넌트 임포트
import BattleResultOverlay from './components/battle/BattleResultOverlay';

export default function App() {
  const nav = useGameNavigation();
  const data = useGameData(); 

  const [currentEnemyId, setCurrentEnemyId] = useState(null);
  
  // [New] 전투 진입 경로를 기억하기 위한 상태 ('story' | 'mining')
  const [battleType, setBattleType] = useState('story'); 

  const handleContentSelect = (contentType) => {
    if (contentType === 'story') nav.goStorySelect();
    else if (contentType === 'mining') nav.goMiningSelect();
  };

  const handleDirectMining = () => {
    setCurrentEnemyId('guardian'); 
    setBattleType('mining'); // [New] 채굴 전투임을 명시
    nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
  };

  const initialParty = useMemo(() => 
    data.partyList.map(p => data.roster.find(r => r.id === p.id)), 
    [data.partyList, data.roster]
  );
  
  const onGameEnd = useCallback((result) => nav.goResult(result), [nav]);

  const handleEventComplete = (nextAction) => {
    if (typeof nextAction === 'string' && nextAction.startsWith('battle:')) {
        const enemyId = nextAction.split(':')[1];
        setCurrentEnemyId(enemyId);
        setBattleType('story'); // [New] 스토리 전투임을 명시
        nav.goBattle(); 
    } else {
        nav.goBattle(); 
    }
  };

  // [New] 재전투 핸들러 (적 ID 유지한 채 전투 화면 리로드)
  const handleRetryBattle = () => {
      // 깜빡임 연출을 위해 잠시 로딩 상태를 줄 수도 있지만, 여기선 바로 재진입
      nav.goBattle();
  };

  // [New] 나가기 핸들러
  const handleLeaveBattle = () => {
      if (battleType === 'mining') {
          nav.goMiningSelect(); // 채굴이면 채굴 선택창으로
      } else {
          nav.goHome(); // 스토리면 홈으로 (추후 다음 스토리 연결 로직 필요 시 수정)
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
      
      {/* 전투 화면 */}
      {nav.gameState === 'active' && (
        <BattleScreen 
            userStats={data.userStats} 
            hpMultiplier={data.hpMultiplier} 
            initialParty={initialParty} 
            onGameEnd={onGameEnd}
            enemyId={currentEnemyId} 
        />
      )}

      {/* [Fix] 전투 결과 화면 (Win/Lose 통합 관리) */}
      {(nav.gameState === 'win' || nav.gameState === 'lose') && (
        <BattleResultOverlay 
            result={nav.gameState}
            battleType={battleType}
            rewards={[{ id: 'chip', name: 'Data Chip', count: 50 }]} // 임시 보상 데이터 (추후 연동 필요)
            expGained={100} // 임시 경험치
            onRetry={handleRetryBattle}
            onLeave={handleLeaveBattle}
        />
      )}
    </div>
  );
}