import React, { useState } from 'react';
import { Activity, Shield, Zap, Heart, Crosshair } from 'lucide-react';
import EquipmentSlot from './EquipmentSlot';
import EquipmentModal from './EquipmentModal';
import { EQUIP_SLOTS } from '../../data/equipmentData';

export default function StatusPanel({ 
  character, 
  equipmentList, 
  onEquip, 
  onUnequip, 
  finalStats // [New] 부모로부터 계산된 최종 스탯을 받음
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [selectedSlotType, setSelectedSlotType] = useState(null);

  // 슬롯 정의 (인덱스 순서대로 매핑)
  const slots = [
    { label: 'Neural', type: EQUIP_SLOTS.SLOT_1 },
    { label: 'Cortex', type: EQUIP_SLOTS.SLOT_2 },
    { label: 'Auxiliary', type: EQUIP_SLOTS.SLOT_3 },
  ];

  const handleSlotClick = (index, type) => {
    setSelectedSlotIndex(index);
    setSelectedSlotType(type);
    setModalOpen(true);
  };

  const handleEquipItem = (item) => {
    onEquip(character.id, selectedSlotIndex, item);
    setModalOpen(false);
  };

  // 표시할 스탯 (최종 스탯 기준)
  const stats = finalStats || character; // fallback

  return (
    <div className="bg-slate-900/50 rounded-xl p-5 border border-white/10 h-full flex flex-col">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <Activity size={14} /> Status Overview
      </h3>

      {/* 1. 스탯 정보 (최종 수치 표시) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatRow icon={<Heart size={14} className="text-rose-400" />} label="HP" value={stats.hp} />
        <StatRow icon={<Zap size={14} className="text-amber-400" />} label="ATK" value={stats.atk} />
        <StatRow icon={<Shield size={14} className="text-emerald-400" />} label="DEF" value={stats.def} />
        <StatRow icon={<Activity size={14} className="text-blue-400" />} label="SPD" value={stats.speed} />
        <StatRow icon={<Crosshair size={14} className="text-purple-400" />} label="CRIT" value={`${stats.critRate}%`} />
        <StatRow icon={<Zap size={14} className="text-orange-400" />} label="C.DMG" value={`${stats.critDmg}%`} />
      </div>

      <div className="h-[1px] bg-white/10 w-full my-2"></div>

      {/* 2. 장비 슬롯 영역 */}
      <div className="flex-1">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
          Equipment
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot, idx) => {
            const equippedItemId = character.equipped[idx];
            const equippedItem = equippedItemId ? equipmentList.find(e => e.id === equippedItemId) : null;

            return (
              <EquipmentSlot 
                key={idx}
                label={slot.label}
                item={equippedItem}
                onClick={() => handleSlotClick(idx, slot.type)}
                onUnequip={() => onUnequip(character.id, idx)}
              />
            );
          })}
        </div>
      </div>

      {/* 장비 선택 모달 */}
      <EquipmentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        equipmentList={equipmentList}
        slotType={selectedSlotType}
        onEquip={handleEquipItem}
      />
    </div>
  );
}

const StatRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between bg-black/20 p-2 rounded">
    <div className="flex items-center gap-2 text-slate-400 text-xs">
      {icon} <span>{label}</span>
    </div>
    <span className="text-white font-mono font-bold text-sm">{value}</span>
  </div>
);