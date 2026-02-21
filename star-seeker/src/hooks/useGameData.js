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
  const { userStats, hpMultiplier, collectedKeywords, unlockKeyword, updateOption } = usePlayer();
  const { miningState, handleAssignMiner, handleRemoveMiner, handleCollectReward } = useMining(setInventory);

  // [Core Logic] 최종 스탯 계산 함수 (기본 + 강화 + 장비)
  const getFinalStats = useCallback((charId) => {
    const char = roster.find(c => c.id === charId);
    if (!char) return null;

    // 1. [기본 스탯] + [노드 강화 스탯] 합산
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
    
    // [NEW] 기억 세공 효과 저장용 배열
    let addedMemorySkills = [];
    let activeMemoryEffects = [];

    items.forEach(item => {
        // [NEW] 3번 슬롯(기억 세공) 데이터 처리
        if (item.memorySkill) addedMemorySkills.push(item.memorySkill);
        if (item.memoryEffect) activeMemoryEffects.push(item.memoryEffect);

        // 기존 1, 2번 슬롯 스탯 배열화 (기억 세공은 mainStat이 없으므로 안전하게 방어 코드 작성)
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

    // 3. 최종 계산: (순수 스펙 * 퍼센트 보너스) + 장비 깡스탯
    const finalStats = {
        hp: Math.floor(baseStats.hp * (1 + percentBonuses.hp / 100) + flatBonuses.hp),
        atk: Math.floor(baseStats.atk * (1 + percentBonuses.atk / 100) + flatBonuses.atk),
        def: Math.floor(baseStats.def * (1 + percentBonuses.def / 100) + flatBonuses.def),
        speed: baseStats.speed + flatBonuses.speed,
        critRate: baseStats.critRate + flatBonuses.critRate,
        critDmg: baseStats.critDmg + flatBonuses.critDmg
    };

    // [NEW] 기본 스킬 배열에 장비로 얻은 스킬을 합치고, 중복된 스킬은 하나로 합침(Set 활용)
    const combinedSkills = Array.from(new Set([...(char.skills || []), ...addedMemorySkills]));

    return { 
        ...char, 
        ...finalStats, 
        skills: combinedSkills,               // 업데이트된 스토리 스킬 배열
        memoryEffects: activeMemoryEffects    // 전투 로직에서 읽어갈 버프 배열
    };
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
    userStats, hpMultiplier, inventory, roster, partyList, miningState, collectedKeywords,
    equipmentList, 
    setInventory, setRoster, setPartyList,
    handleUnlockNode, 
    handleOptionSelected: updateOption,
    handleAssignMiner, handleRemoveMiner, handleCollectReward,
    handleUnlockKeyword: unlockKeyword, 
    addResource, consumeResource, 
    addEquipment, removeEquipment, addTestEquipments,
    handleEquip, handleUnequip, getFinalStats
  };
}