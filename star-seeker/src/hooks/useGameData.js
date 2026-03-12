import { useCallback } from 'react';
import useInventory from './gameData/useInventory';
import useRoster from './gameData/useRoster';
import usePlayer from './gameData/usePlayer';
import useMining from './useMining';

export default function useGameData() {
  const { 
    inventory, equipmentList, setInventory, 
    hasResource, consumeResource, addResource,
    addEquipment, removeEquipment, updateEquipmentStatus, addTestEquipments 
  } = useInventory();
  
  const { roster, partyList, setRoster, setPartyList, enhanceCharacter, equipItem, unequipItem } = useRoster();
  
  // [Fix] levelInfo, addExp, 그리고 누락되었던 clearedNodes와 completeStoryNode를 제대로 받아옵니다!
  const { 
    userStats, hpMultiplier, collectedKeywords, clearedNodes, levelInfo, 
    unlockKeyword, updateOption, completeStoryNode, addExp 
  } = usePlayer();
  
  const { miningState, handleAssignMiner, handleRemoveMiner, handleCollectReward } = useMining(setInventory);

  // [Core Logic] 최종 스탯 계산 함수 (기본 + 강화 + 장비)
  const getFinalStats = useCallback((charId) => {
    const char = roster.find(c => c.id === charId);
    if (!char) return null;

    const baseStats = {
        hp: (char.hp || 0) + (char.baseHp || 0),
        atk: (char.atk || 0) + (char.baseAtk || 0),
        def: (char.def || 0) + (char.baseDef || 0),
        speed: (char.speed || 0) + (char.baseSpd || 0),
        critRate: (char.critRate || 0), 
        critDmg: (char.critDmg || 0)
    };

    const items = char.equipped
        .map(id => equipmentList.find(e => e.id === id))
        .filter(Boolean);

    let percentBonuses = { hp: 0, atk: 0, def: 0 };
    let flatBonuses = { hp: 0, atk: 0, def: 0, speed: 0, critRate: 0, critDmg: 0 };
    
    let addedMemorySkills = [];
    let activeMemoryEffects = [];

    items.forEach(item => {
        if (item.memorySkill) addedMemorySkills.push(item.memorySkill);
        if (item.memoryEffect) activeMemoryEffects.push(item.memoryEffect);

        const allStats = [];
        if (item.mainStat) allStats.push(item.mainStat);
        if (item.subStats) allStats.push(...item.subStats);

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

    const finalStats = {
        hp: Math.floor(baseStats.hp * (1 + percentBonuses.hp / 100) + flatBonuses.hp),
        atk: Math.floor(baseStats.atk * (1 + percentBonuses.atk / 100) + flatBonuses.atk),
        def: Math.floor(baseStats.def * (1 + percentBonuses.def / 100) + flatBonuses.def),
        speed: baseStats.speed + flatBonuses.speed,
        critRate: baseStats.critRate + flatBonuses.critRate,
        critDmg: baseStats.critDmg + flatBonuses.critDmg
    };

    const combinedSkills = Array.from(new Set([...(char.skills || []), ...addedMemorySkills]));

    return { 
        ...char, 
        ...finalStats, 
        skills: combinedSkills,               
        memoryEffects: activeMemoryEffects    
    };
  }, [roster, equipmentList]);

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

  const handleUnequip = (charId, slotIndex) => {
    const char = roster.find(c => c.id === charId);
    if (!char) return;

    const itemId = char.equipped[slotIndex];
    if (itemId) {
        updateEquipmentStatus(itemId, false, null);
        unequipItem(charId, slotIndex);
    }
  };

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
    userStats, hpMultiplier, inventory, roster, partyList, miningState, collectedKeywords,
    equipmentList, 
    clearedNodes, // [Fix] 추가 완료
    levelInfo,    // [NEW] 레벨 데이터 내보내기 완료
    setInventory, setRoster, setPartyList,
    handleUnlockNode, 
    handleOptionSelected: updateOption,
    handleAssignMiner, handleRemoveMiner, handleCollectReward,
    handleUnlockKeyword: unlockKeyword, 
    completeStoryNode, // [Fix] 추가 완료
    addExp,            // [NEW] 경험치 획득 함수 내보내기 완료
    addResource, consumeResource, 
    addEquipment, removeEquipment, addTestEquipments,
    handleEquip, handleUnequip, getFinalStats
  };
}