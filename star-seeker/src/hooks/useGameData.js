import { useState, useEffect, useRef } from 'react';
import { INITIAL_USER_STATS, ALL_CHARACTERS } from '../data/gameData';
import useMining from './useMining';

export default function useGameData() {
  const [userStats, setUserStats] = useState(INITIAL_USER_STATS);
  const [hpMultiplier, setHpMultiplier] = useState(1.0);

  // 인벤토리
  const [inventory, setInventory] = useState([
    { id: 'chip_basic', count: 50 },
    { id: 'core_essence', count: 5 },
    { id: 'causality_stone', count: 0 }, 
  ]);

  const [roster, setRoster] = useState(() => 
    ALL_CHARACTERS.map(char => ({
      ...char,
      unlockedNodes: [],
      normalMult: 1.0,
      skillMult: 2.5
    }))
  );

  const [partyList, setPartyList] = useState(roster.slice(0, 4));

  // [New] 획득한 키워드 목록 (ID 문자열 배열)
  const [collectedKeywords, setCollectedKeywords] = useState([]);

  // --- useMining 훅 연결 ---
  const { miningState, handleAssignMiner, handleRemoveMiner, handleCollectReward } = useMining(setInventory);

  // --- 핸들러 ---

  // [New] 키워드 획득 함수
  const handleUnlockKeyword = (keywordId) => {
    setCollectedKeywords(prev => {
      if (prev.includes(keywordId)) return prev; // 이미 있으면 무시
      return [...prev, keywordId];
    });
  };

  const handleUnlockNode = (charId, nodeIndex, isMajor, nodeInfo) => {
    // ... (기존 로직 동일) ...
    const costItem = isMajor ? 'core_essence' : 'chip_basic';
    const costAmount = isMajor ? 1 : 5; 
    
    const hasResource = inventory.find(i => i.id === costItem && i.count >= costAmount);
    
    if (!hasResource) {
      alert(`재료가 부족합니다! (${isMajor ? '비물질 데이터 보강칩' : '데이터 보강칩'} 필요)`);
      return;
    }

    setInventory(prev => prev.map(item => 
      item.id === costItem ? { ...item, count: item.count - costAmount } : item
    ));

    setRoster(prev => prev.map(char => {
      if (char.id !== charId) return char;
      const currentVal = char[nodeInfo.statType] || 0;
      const updatedVal = currentVal + nodeInfo.value;
      return {
        ...char,
        [nodeInfo.statType]: updatedVal,
        unlockedNodes: [...char.unlockedNodes, nodeIndex]
      };
    }));

    setPartyList(prev => prev.map(p => p.id === charId ? roster.find(r => r.id === charId) : p));
  };

  const handleOptionSelected = ({ type, stat, value }) => {
    if (type === 'hp') setHpMultiplier(value);
    else if (type === 'stat') setUserStats(prev => ({ ...prev, [stat]: prev[stat] + value }));
  };

  return {
    userStats, hpMultiplier, inventory, roster, partyList, 
    miningState, 
    collectedKeywords, // export
    setInventory, setRoster, setPartyList,
    handleUnlockNode, handleOptionSelected,
    handleAssignMiner, handleRemoveMiner, handleCollectReward,
    handleUnlockKeyword // export
  };
}