import { useState, useEffect, useRef } from 'react';
import { INITIAL_USER_STATS, ALL_CHARACTERS } from '../data/gameData';

export default function useGameData() {
  const [userStats, setUserStats] = useState(INITIAL_USER_STATS);
  const [hpMultiplier, setHpMultiplier] = useState(1.0);

  // 인벤토리 (초기값에 인과석 추가)
  const [inventory, setInventory] = useState([
    { id: 'chip_basic', count: 50 },
    { id: 'core_essence', count: 5 },
    { id: 'causality_stone', count: 0 }, // [추가] 인과석
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

  // --- [추가] 자동 채굴 상태 ---
  const [miningState, setMiningState] = useState({
    chips: { miners: [null, null, null], accrued: 0 }, // 데이터 칩
    stones: { miners: [null, null, null], accrued: 0 } // 인과석
  });

  // --- [추가] 채굴 타이머 로직 (1초마다 갱신) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setMiningState(prev => {
        const newState = { ...prev };
        
        // 칩 채굴: 하나라도 배치되어 있으면 시간당 1개 (초당 1/3600개)
        // 테스트를 위해 속도 100배 (36초당 1개)로 설정: 1 / 36
        const chipMiners = prev.chips.miners.filter(id => id !== null).length;
        if (chipMiners > 0) {
            newState.chips.accrued += (1 / 36); // [TEST SPEED] 실제는 3600
        }

        // 인과석 채굴
        const stoneMiners = prev.stones.miners.filter(id => id !== null).length;
        if (stoneMiners > 0) {
            newState.stones.accrued += (1 / 36); // [TEST SPEED]
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- 채굴 관리 핸들러 ---
  const handleAssignMiner = (type, slotIndex, charId) => {
    setMiningState(prev => {
      const newMiners = [...prev[type].miners];
      // 이미 다른 슬롯에 있다면 제거 (중복 배치 방지)
      // (여기선 UI에서 막지만 안전장치로 한번 더)
      if (newMiners.includes(charId)) return prev;
      
      newMiners[slotIndex] = charId;
      return {
        ...prev,
        [type]: { ...prev[type], miners: newMiners }
      };
    });
  };

  const handleRemoveMiner = (type, slotIndex) => {
    setMiningState(prev => {
      const newMiners = [...prev[type].miners];
      newMiners[slotIndex] = null;
      return {
        ...prev,
        [type]: { ...prev[type], miners: newMiners }
      };
    });
  };

  const handleCollectReward = (type) => {
    setMiningState(prev => {
      const amount = Math.floor(prev[type].accrued);
      if (amount <= 0) return prev;

      // 인벤토리에 추가
      const itemId = type === 'chips' ? 'chip_basic' : 'causality_stone';
      setInventory(currInv => {
        const exists = currInv.find(i => i.id === itemId);
        if (exists) {
            return currInv.map(i => i.id === itemId ? { ...i, count: i.count + amount } : i);
        } else {
            return [...currInv, { id: itemId, count: amount }];
        }
      });

      return {
        ...prev,
        [type]: { ...prev[type], accrued: prev[type].accrued - amount }
      };
    });
  };

  // --- 기존 강화 로직 ---
  const handleUnlockNode = (charId, nodeIndex, isMajor, nodeInfo) => {
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
    userStats, hpMultiplier, inventory, roster, partyList, miningState,
    setInventory, setRoster, setPartyList,
    handleUnlockNode, handleOptionSelected,
    handleAssignMiner, handleRemoveMiner, handleCollectReward
  };
}