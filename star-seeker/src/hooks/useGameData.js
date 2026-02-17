import { useCallback } from 'react';
import useInventory from './gameData/useInventory';
import useRoster from './gameData/useRoster';
import usePlayer from './gameData/usePlayer';
import useMining from './useMining';
import { STAT_TYPES } from '../data/equipmentData';

export default function useGameData() {
  // 1. 각 기능별 Hook 호출
  const { 
    inventory, equipmentList, setInventory, 
    hasResource, consumeResource, addResource, // [Fix] addResource 내보내기
    addEquipment, removeEquipment, updateEquipmentStatus, addTestEquipments 
  } = useInventory();
  
  const { roster, partyList, setRoster, setPartyList, enhanceCharacter, equipItem, unequipItem } = useRoster();
  
  const { userStats, hpMultiplier, collectedKeywords, unlockKeyword, updateOption } = usePlayer();
  
  const { miningState, handleAssignMiner, handleRemoveMiner, handleCollectReward } = useMining(setInventory);

  // [Core Logic] 최종 스탯 계산 함수 (기본 + 강화 + 장비)
  const getFinalStats = useCallback((charId) => {
    const char = roster.find(c => c.id === charId);
    if (!char) return null;

    // 1. [기본 스탯] + [노드 강화 스탯] 합산 (= 순수 캐릭터 스펙)
    const baseStats = {
        hp: (char.hp || 0) + (char.baseHp || 0),
        atk: (char.atk || 0) + (char.baseAtk || 0),
        def: (char.def || 0) + (char.baseDef || 0),
        speed: (char.speed || 0) + (char.baseSpd || 0),
        critRate: (char.critRate || 0), 
        critDmg: (char.critDmg || 0)
    };

    // 2. 장착된 장비 스탯 집계
    const items = char.equipped
        .map(id => equipmentList.find(e => e.id === id))
        .filter(Boolean);

    let percentBonuses = { hp: 0, atk: 0, def: 0 };
    let flatBonuses = { hp: 0, atk: 0, def: 0, speed: 0, critRate: 0, critDmg: 0 };

    items.forEach(item => {
        const allStats = [item.mainStat, ...item.subStats];
        allStats.forEach(stat => {
            const typeKey = stat.type;
            const value = stat.value || 0;
            
            if (typeKey === 'HP_PERCENT') percentBonuses.hp += value;
            else if (typeKey === 'HP_FLAT') flatBonuses.hp += value;
            else if (typeKey === 'ATK_PERCENT') percentBonuses.atk += value;
            else if (typeKey === 'ATK_FLAT') flatBonuses.atk += value;
            else if (typeKey === 'DEF_PERCENT') percentBonuses.def += value;
            else if (typeKey === 'DEF_FLAT') flatBonuses.def += value;
            else if (typeKey === 'SPEED') flatBonuses.speed += value;
            else if (typeKey === 'CRIT_RATE') flatBonuses.critRate += value;
            else if (typeKey === 'CRIT_DMG') flatBonuses.critDmg += value;
        });
    });

    // 3. 최종 계산: (순수 스펙 * 퍼센트 보너스) + 장비 깡스탯
    const finalStats = {
        hp: Math.floor(baseStats.hp * (1 + percentBonuses.hp / 100) + flatBonuses.hp),
        atk: Math.floor(baseStats.atk * (1 + percentBonuses.atk / 100) + flatBonuses.atk),
        def: Math.floor(baseStats.def * (1 + percentBonuses.def / 100) + flatBonuses.def),
        speed: baseStats.speed + flatBonuses.speed,
        critRate: baseStats.critRate + flatBonuses.critRate,
        critDmg: baseStats.critDmg + flatBonuses.critDmg
    };

    return { ...char, ...finalStats };
  }, [roster, equipmentList]);

  // 장비 장착 핸들러
  const handleEquip = (charId, slotIndex, item) => {
    const char = roster.find(c => c.id === charId);
    if (!char) return;

    const oldItemId = char.equipped[slotIndex];
    if (oldItemId) {
        handleUnequip(charId, slotIndex);
    }

    updateEquipmentStatus(item.id, true, charId);
    equipItem(charId, slotIndex, item.id);
  };

  // 장비 해제 핸들러
  const handleUnequip = (charId, slotIndex) => {
    const char = roster.find(c => c.id === charId);
    if (!char) return;

    const itemId = char.equipped[slotIndex];
    if (itemId) {
        updateEquipmentStatus(itemId, false, null);
        unequipItem(charId, slotIndex);
    }
  };

  // 노드 해금 핸들러
  const handleUnlockNode = (charId, nodeIndex, isMajor, nodeInfo) => {
    const costItem = isMajor ? 'core_essence' : 'chip_basic';
    const costAmount = isMajor ? 1 : 5; 
    
    if (!hasResource(costItem, costAmount)) {
      alert(`재료가 부족합니다!`);
      return;
    }

    consumeResource(costItem, costAmount);
    enhanceCharacter(charId, nodeIndex, nodeInfo);
  };

  return {
    // Data Exports
    userStats, hpMultiplier, inventory, roster, partyList, miningState, collectedKeywords,
    equipmentList, 
    
    // State Setters
    setInventory, setRoster, setPartyList,
    
    // Handlers
    handleUnlockNode, 
    handleOptionSelected: updateOption,
    handleAssignMiner, handleRemoveMiner, handleCollectReward,
    handleUnlockKeyword: unlockKeyword, 
    
    // [New] 자원 추가 핸들러 노출
    addResource,

    // Equipment & Stats Handlers
    addEquipment, removeEquipment, addTestEquipments,
    handleEquip, handleUnequip, getFinalStats
  };
}