import { useState, useCallback } from 'react';

// --- 초기 인벤토리 설정 ---
const initialInventory = [
  { id: 'chip_basic', name: '데이터 보강칩', count: 10, type: 'material' },
  { id: 'core_essence', name: '데이터 중첩핵', count: 5, type: 'material' },
  { id: 'causality_stone', name: '인과석', count: 2000, type: 'currency' }, // [Test] 2,000개로 상향
  { id: 'memory_fragment', name: '기억 파편', count: 0, type: 'material' }, // 장비 가챠용 재화
];

export default function useInventory() {
  const [inventory, setInventory] = useState(initialInventory);
  const [equipmentList, setEquipmentList] = useState([]); // 보유 장비 리스트

  // 자원 보유 확인
  const hasResource = useCallback((id, amount) => {
    const item = inventory.find(i => i.id === id);
    return item && item.count >= amount;
  }, [inventory]);

  // 자원 소모
  const consumeResource = useCallback((id, amount) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, count: Math.max(0, item.count - amount) } : item
    ));
  }, []);

  // 자원 획득
  const addResource = useCallback((id, amount) => {
    setInventory(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists) {
        return prev.map(item => item.id === id ? { ...item, count: item.count + amount } : item);
      }
      return [...prev, { id, count: amount }];
    });
  }, []);

  // --- 장비 관련 핸들러 ---

  // 장비 추가 (가챠/전투 보상)
  const addEquipment = useCallback((newEquip) => {
    setEquipmentList(prev => [...prev, newEquip]);
    return newEquip;
  }, []);

  // 장비 삭제
  const removeEquipment = useCallback((equipId) => {
    setEquipmentList(prev => prev.filter(e => e.id !== equipId));
  }, []);

  // 장비 장착 상태 업데이트
  const updateEquipmentStatus = useCallback((equipId, isEquipped, charId) => {
    setEquipmentList(prev => prev.map(e => 
      e.id === equipId ? { ...e, isEquipped, equippedBy: charId } : e
    ));
  }, []);

  // 테스트용 장비 세트 추가 (필요 시 호출)
  const addTestEquipments = useCallback((equips) => {
    setEquipmentList(prev => [...prev, ...equips]);
  }, []);

  return {
    inventory,
    equipmentList,
    setInventory,
    setEquipmentList,
    hasResource,
    consumeResource,
    addResource,
    addEquipment,
    removeEquipment,
    updateEquipmentStatus,
    addTestEquipments
  };
}