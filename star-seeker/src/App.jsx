import React, { useState } from 'react';
import './App.css';
import { INITIAL_USER_STATS, ALL_CHARACTERS } from './data/gameData';
import HomeScreen from './components/HomeScreen';
import SelectScreen from './components/SelectScreen';
import StorySelectScreen from './components/StorySelectScreen';
import EventScreen from './components/EventScreen';
import BattleScreen from './components/BattleScreen';
import PartyScreen from './components/PartyScreen';
import ManagementScreen from './components/ManagementScreen';
import StorageScreen from './components/StorageScreen';

export default function App() {
  const [gameState, setGameState] = useState('home'); 
  const [userStats, setUserStats] = useState(INITIAL_USER_STATS);
  const [hpMultiplier, setHpMultiplier] = useState(1.0);

  const [inventory, setInventory] = useState([
    { id: 'chip_basic', count: 50 },   // 데이터 보강칩
    { id: 'core_essence', count: 5 },  // 비물질 데이터 보강칩
  ]);

  // 보유 캐릭터 상태
  const [roster, setRoster] = useState(() => 
    ALL_CHARACTERS.map(char => ({
      ...char,
      unlockedNodes: [],
      // [중요] 스킬 배율 초기값 설정
      normalMult: 1.0,
      skillMult: 2.5
    }))
  );

  const [partyList, setPartyList] = useState(roster.slice(0, 4));

  // --- [수정된 강화 로직] ---
  // nodeInfo: { statType: 'baseAtk' | 'skillMult' 등, value: 증가량 }
  const handleUnlockNode = (charId, nodeIndex, isMajor, nodeInfo) => {
    // 1. 재료 확인
    const costItem = isMajor ? 'core_essence' : 'chip_basic';
    const costAmount = isMajor ? 1 : 5; 

    const hasResource = inventory.find(i => i.id === costItem && i.count >= costAmount);
    
    if (!hasResource) {
      alert(`재료가 부족합니다! (${isMajor ? '비물질 데이터 보강칩' : '데이터 보강칩'} 필요)`);
      return;
    }

    // 2. 재료 소모
    setInventory(prev => prev.map(item => 
      item.id === costItem ? { ...item, count: item.count - costAmount } : item
    ));

    // 3. 캐릭터 스탯 강화 (전달받은 정보 기반)
    setRoster(prev => prev.map(char => {
      if (char.id !== charId) return char;

      // 기존 스탯 + 증가량
      // 소수점 합산 오차 방지를 위해 배율 등은 적절히 처리 (여기서는 단순 합산)
      const currentVal = char[nodeInfo.statType] || 0;
      const updatedVal = currentVal + nodeInfo.value;

      return {
        ...char,
        [nodeInfo.statType]: updatedVal, // 동적 스탯 업데이트
        unlockedNodes: [...char.unlockedNodes, nodeIndex]
      };
    }));

    setPartyList(prev => prev.map(p => p.id === charId ? roster.find(r => r.id === charId) : p));
  };

  const handleStartObservation = () => setGameState('select');
  const handleOpenParty = () => setGameState('party');
  const handleOpenManage = () => setGameState('manage');
  const handleOpenStorage = () => setGameState('storage');
  const handleBackToHome = () => setGameState('home');
  const handleBackToSelect = () => setGameState('select');

  const handleContentSelect = (contentType) => {
    if (contentType === 'story') setGameState('story_select');
    else if (contentType === 'mining') alert("준비 중입니다.");
  };

  const handleChapterSelect = (chapterId) => setGameState('event');

  const handleOptionSelected = ({ type, stat, value }) => {
    if (type === 'hp') setHpMultiplier(value);
    else if (type === 'stat') setUserStats(prev => ({ ...prev, [stat]: prev[stat] + value }));
  };

  const handleEventComplete = () => setGameState('active');
  const handleGameEnd = (result) => setGameState(result);

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden font-sans border-x border-white/10 shadow-2xl text-slate-100 selection:bg-cyan-500/30 relative">
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 0.8; transform: scale(1.2); } }
        .star { position: absolute; background: white; border-radius: 50%; animation: twinkle 3s infinite ease-in-out; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-image-linear-gradient { mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent); }
        .mask-image-gradient { mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, animationDelay: `${Math.random() * 3}s` }}></div>
        ))}
      </div>

      {gameState === 'home' && <HomeScreen onStart={handleStartObservation} onParty={handleOpenParty} onManage={handleOpenManage} onStorage={handleOpenStorage} />}
      {gameState === 'manage' && <ManagementScreen roster={roster} inventory={inventory} onUnlockNode={handleUnlockNode} onBack={handleBackToHome} />}
      {gameState === 'storage' && <StorageScreen inventory={inventory} onBack={handleBackToHome} />}
      {gameState === 'party' && <PartyScreen currentParty={partyList} onUpdateParty={setPartyList} onBack={handleBackToHome} />}
      {gameState === 'select' && <SelectScreen onSelectContent={handleContentSelect} onBack={handleBackToHome} />}
      {gameState === 'story_select' && <StorySelectScreen onSelectChapter={handleChapterSelect} onBack={handleBackToSelect} />}
      {gameState === 'event' && <EventScreen onOptionSelected={handleOptionSelected} onEventComplete={handleEventComplete} />}
      {gameState === 'active' && <BattleScreen userStats={userStats} hpMultiplier={hpMultiplier} initialParty={partyList.map(p => roster.find(r => r.id === p.id))} onGameEnd={handleGameEnd} />}
      
      {(gameState === 'win' || gameState === 'lose') && (
        <div className="absolute inset-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
            <h2 className={`text-5xl font-thin tracking-[0.2em] mb-2 ${gameState === 'win' ? 'text-amber-200' : 'text-rose-400'}`}>{gameState === 'win' ? 'CLEARED' : 'FAILED'}</h2>
            <button onClick={() => setGameState('home')} className="mt-8 px-8 py-3 bg-white/5 border border-white/20 text-white rounded-sm hover:bg-white/10 transition-colors">Return to Home</button>
        </div>
      )}
    </div>
  );
}