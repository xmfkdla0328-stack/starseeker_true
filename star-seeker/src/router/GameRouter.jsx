import React from 'react';

// Screens
import HomeScreen from '../components/HomeScreen';
import SelectScreen from '../components/SelectScreen';
import StorySelectScreen from '../components/StorySelectScreen';
import EventScreen from '../components/EventScreen';
import BattleScreen from '../screens/BattleScreen'; 
import PartyScreen from '../components/PartyScreen';
import ManagementScreen from '../components/ManagementScreen';
import StorageScreen from '../components/StorageScreen';
import GuideBookScreen from '../components/GuideBookScreen';
import GachaScreen from '../components/GachaScreen';
import ResourcesScreen from '../components/ResourcesScreen';
import AutoResourcesScreen from '../components/AutoResourcesScreen';

import BattleResultOverlay from '../components/battle/BattleResultOverlay';

export default function GameRouter({ 
  nav, 
  data, 
  battleState, 
  handlers, 
  initialParty 
}) {
  const { currentEnemyId, battleType, battleRewards } = battleState;
  
  // 핸들러 구조분해 할당 (가독성을 위해)
  const {
    handleContentSelect,
    handleDirectMining,
    handleAutoMiningEntry,
    onGameEnd,
    handleEventComplete,
    handleRetryBattle,
    handleLeaveBattle
  } = handlers;

  return (
    <>
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

      {/* 전투 결과 화면 */}
      {(nav.gameState === 'win' || nav.gameState === 'lose') && (
        <BattleResultOverlay 
            result={nav.gameState}
            battleType={battleType}
            rewards={battleRewards}
            expGained={100}
            onRetry={handleRetryBattle}
            onLeave={handleLeaveBattle}
        />
      )}
    </>
  );
}