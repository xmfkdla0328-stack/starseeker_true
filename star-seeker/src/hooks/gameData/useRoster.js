import { useState, useCallback } from 'react';
import { ALL_CHARACTERS } from '../../data/gameData'; 

export default function useRoster() {
  // 초기 상태에 equipped 배열 추가 ([slot1, slot2, slot3] - ID 저장용)
  const [roster, setRoster] = useState(() => 
    ALL_CHARACTERS.map(char => ({
      ...char,
      unlockedNodes: [],
      equipped: [null, null, null], // [New] 장비 슬롯 (Item ID 저장)
      normalMult: 1.0,
      skillMult: 2.5
    }))
  );

  const [partyList, setPartyList] = useState(roster.slice(0, 4));

  // 캐릭터 성장 (기존 유지)
  const enhanceCharacter = useCallback((charId, nodeIndex, nodeInfo) => {
    setRoster(prevRoster => {
      const newRoster = prevRoster.map(char => {
        if (char.id !== charId) return char;
        const currentVal = char[nodeInfo.statType] || 0;
        const updatedVal = currentVal + nodeInfo.value;
        return {
          ...char,
          [nodeInfo.statType]: updatedVal,
          unlockedNodes: [...char.unlockedNodes, nodeIndex]
        };
      });
      setPartyList(prevParty => prevParty.map(p => p.id === charId ? newRoster.find(r => r.id === charId) : p));
      return newRoster;
    });
  }, []);

  // [New] 장비 장착
  const equipItem = useCallback((charId, slotIndex, itemId) => {
    setRoster(prev => prev.map(char => {
      if (char.id !== charId) return char;
      const newEquipped = [...char.equipped];
      newEquipped[slotIndex] = itemId;
      return { ...char, equipped: newEquipped };
    }));
  }, []);

  // [New] 장비 해제
  const unequipItem = useCallback((charId, slotIndex) => {
    setRoster(prev => prev.map(char => {
      if (char.id !== charId) return char;
      const newEquipped = [...char.equipped];
      newEquipped[slotIndex] = null;
      return { ...char, equipped: newEquipped };
    }));
  }, []);

  return { roster, partyList, setRoster, setPartyList, enhanceCharacter, equipItem, unequipItem };
}