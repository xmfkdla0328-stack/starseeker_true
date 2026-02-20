import { useState, useCallback } from 'react';
import { generateEquipment, EQUIP_SLOTS } from '../../data/equipmentData';

export default function useInventory() {
  // 1. 재료 인벤토리 (초기 인과석 1000개로 수정)
  const [inventory, setInventory] = useState([
    { id: 'chip_basic', count: 50 },
    { id: 'core_essence', count: 5 },
    { id: 'causality_stone', count: 1000 }, 
  ]);

  // 2. 장비 인벤토리 (고유 객체 리스트)
  const [equipmentList, setEquipmentList] = useState([]);

  // --- 재료 관련 헬퍼 ---
  const hasResource = useCallback((id, amount) => {
    const item = inventory.find(i => i.id === id);
    return item && item.count >= amount;
  }, [inventory]);

  const consumeResource = useCallback((id, amount) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, count: item.count - amount } : item
    ));
  }, []);

  const addResource = useCallback((id, amount) => {
    setInventory(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists) {
        return prev.map(i => i.id === id ? { ...i, count: i.count + amount } : i);
      }
      return [...prev, { id, count: amount }];
    });
  }, []);

  // --- 장비 관련 헬퍼 ---
  
  // 장비 획득 (생성하여 추가)
  const addEquipment = useCallback((slotType) => {
    const newItem = generateEquipment(slotType);
    setEquipmentList(prev => [...prev, newItem]);
    return newItem; // 획득 알림용 반환
  }, []);

  // 장비 삭제 (판매/분해 등)
  const removeEquipment = useCallback((equipId) => {
    setEquipmentList(prev => prev.filter(item => item.id !== equipId));
  }, []);

  // 장비 상태 업데이트 (장착/해제 시 사용)
  const updateEquipmentStatus = useCallback((equipId, isEquipped, charId = null) => {
    setEquipmentList(prev => prev.map(item => 
      item.id === equipId 
        ? { ...item, isEquipped, equippedBy: charId } 
        : item
    ));
  }, []);

  // 테스트용: 초기 장비 지급 함수
  const addTestEquipments = useCallback(() => {
    const newItems = [
      generateEquipment(EQUIP_SLOTS.SLOT_1),
      generateEquipment(EQUIP_SLOTS.SLOT_1),
      generateEquipment(EQUIP_SLOTS.SLOT_2),
      generateEquipment(EQUIP_SLOTS.SLOT_2),
    ];
    setEquipmentList(prev => [...prev, ...newItems]);
    console.log("Test Equipment Added:", newItems);
  }, []);

  return { 
    inventory, 
    setInventory, 
    equipmentList, 
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