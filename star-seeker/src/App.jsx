import React, { useMemo, useCallback } from 'react';
import './App.css';

// Hooks
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

export default function App() {
  const nav = useGameNavigation();
  const data = useGameData();

  const handleContentSelect = (contentType) => {
    if (contentType === 'story') nav.goStorySelect();
    else if (contentType === 'mining') nav.goMiningSelect();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining'); 
  };

  const initialParty = useMemo(() => 
    data.partyList.map(p => data.roster.find(r => r.id === p.id)), 
    [data.partyList, data.roster]
  );
  
  const onGameEnd = useCallback((result) => nav.goResult(result), [nav]);

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
            onDirectMining={() => alert("준비 중")} 
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
      {nav.gameState === 'manage' && <ManagementScreen roster={data.roster} inventory={data.inventory} onUnlockNode={data.handleUnlockNode} onBack={nav.goHome} />}
      {nav.gameState === 'storage' && <StorageScreen inventory={data.inventory} onBack={nav.goHome} />}
      
      {/* [수정] GuideBook에 collectedKeywords 전달 */}
      {nav.gameState === 'guide' && <GuideBookScreen collectedKeywords={data.collectedKeywords} onBack={nav.goHome} />}
      
      {nav.gameState === 'gacha' && <GachaScreen roster={data.roster} setRoster={data.setRoster} inventory={data.inventory} setInventory={data.setInventory} onBack={nav.goHome} />}
      
      {/* [수정] EventScreen에 키워드 관련 props 전달 */}
      {nav.gameState === 'event' && (
        <EventScreen 
            onOptionSelected={data.handleOptionSelected} 
            onEventComplete={nav.goBattle} 
            onUnlockKeyword={data.handleUnlockKeyword}
            collectedKeywords={data.collectedKeywords}
            navigate={nav.goHome} // navigate prop 추가
        />
      )}
      
      {nav.gameState === 'active' && (
        <BattleScreen 
            userStats={data.userStats} 
            hpMultiplier={data.hpMultiplier} 
            initialParty={initialParty} 
            onGameEnd={onGameEnd} 
        />
      )}

      {(nav.gameState === 'win' || nav.gameState === 'lose') && (
        <div className="absolute inset-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
            <h2 className={`text-5xl font-thin tracking-[0.2em] mb-2 ${nav.gameState === 'win' ? 'text-amber-200' : 'text-rose-400'}`}>
                {nav.gameState === 'win' ? 'CLEARED' : 'FAILED'}
            </h2>
            <button onClick={nav.goHome} className="mt-8 px-8 py-3 bg-white/5 border border-white/20 text-white rounded-sm hover:bg-white/10 transition-colors">
                Return to Home
            </button>
        </div>
      )}
    </div>
  );
}