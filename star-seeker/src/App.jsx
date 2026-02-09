import React, { useState, useMemo, useCallback } from 'react';
import './App.css';

// Hooks
import useGameNavigation from './hooks/useGameNavigation';
import useGameData from './hooks/useGameData';

// Screens (컴포넌트 임포트)
import HomeScreen from './components/HomeScreen';
import SelectScreen from './components/SelectScreen';
import StorySelectScreen from './components/StorySelectScreen';
import EventScreen from './components/EventScreen';
import BattleScreen from './screens/BattleScreen'; // screens 폴더 확인
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

  // [New] 현재 전투의 적 ID 관리
  const [currentEnemyId, setCurrentEnemyId] = useState(null);

  // --- 중간 핸들러 ---
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

  // [New] 스토리 완료 및 전투 진입 핸들러
  const handleEventComplete = (nextAction) => {
    // nextAction이 'battle:tutorial_boss' 형태일 경우 처리
    if (typeof nextAction === 'string' && nextAction.startsWith('battle:')) {
        const enemyId = nextAction.split(':')[1];
        setCurrentEnemyId(enemyId); // 적 ID 설정
        nav.goBattle(); // 전투 화면으로 이동
    } else {
        nav.goBattle(); // 기본 전투 (Fallback)
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden font-sans border-x border-white/10 shadow-2xl text-slate-100 selection:bg-cyan-500/30 relative">
      
      {/* 배경 레이어 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, animationDelay: `${Math.random() * 3}s` }}></div>
        ))}
      </div>

      {/* --- 화면 라우팅 --- */}
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
      
      {/* 자원 채굴 선택 화면 */}
      {nav.gameState === 'mining_select' && (
        <ResourcesScreen 
            onBack={nav.goSelect} 
            onDirectMining={() => alert("준비 중")} 
            onAutoMining={handleAutoMiningEntry} 
        />
      )}

      {/* 자동 채굴 화면 */}
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
      {nav.gameState === 'guide' && <GuideBookScreen collectedKeywords={data.collectedKeywords} onBack={nav.goHome} />}
      {nav.gameState === 'gacha' && <GachaScreen roster={data.roster} setRoster={data.setRoster} inventory={data.inventory} setInventory={data.setInventory} onBack={nav.goHome} />}
      
      {/* 이벤트 화면 연결 */}
      {nav.gameState === 'event' && (
        <EventScreen 
            onOptionSelected={data.handleOptionSelected} 
            onEventComplete={handleEventComplete} 
            onUnlockKeyword={data.handleUnlockKeyword}
            collectedKeywords={data.collectedKeywords}
            navigate={nav.goHome} 
        />
      )}
      
      {/* 전투 화면 연결 */}
      {nav.gameState === 'active' && (
        <BattleScreen 
            userStats={data.userStats} 
            hpMultiplier={data.hpMultiplier} 
            initialParty={initialParty} 
            onGameEnd={onGameEnd}
            enemyId={currentEnemyId} // 적 ID 전달
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