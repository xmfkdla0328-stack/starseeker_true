import React, { useState } from 'react';
import { Activity, Shield, Zap, Heart, Crosshair, Cpu } from 'lucide-react';
import EquipmentSlot from './EquipmentSlot';
import EquipmentModal from './EquipmentModal';
import { EQUIP_SLOTS } from '../../data/equipmentData';

export default function StatusPanel({ 
  character, 
  equipmentList, 
  onEquip, 
  onUnequip, 
  finalStats 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [selectedSlotType, setSelectedSlotType] = useState(null);

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

  const stats = finalStats || character;

  return (
    // [Mod] 전체 패널: 불투명 배경 제거 -> 반투명 유리 효과
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col h-full animate-fade-in">
      
      {/* 타이틀 */}
      <h3 className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
        <Activity size={14} /> Unit Diagnostics
      </h3>

      {/* 1. 스탯 정보 (Grid) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatRow icon={<Heart size={14} className="text-rose-400" />} label="INTEGRITY (HP)" value={stats.hp} colorClass="border-rose-500/20 bg-rose-900/10" />
        <StatRow icon={<Zap size={14} className="text-amber-400" />} label="OUTPUT (ATK)" value={stats.atk} colorClass="border-amber-500/20 bg-amber-900/10" />
        <StatRow icon={<Shield size={14} className="text-emerald-400" />} label="ARMOR (DEF)" value={stats.def} colorClass="border-emerald-500/20 bg-emerald-900/10" />
        <StatRow icon={<Activity size={14} className="text-blue-400" />} label="MOBILITY (SPD)" value={stats.speed} colorClass="border-blue-500/20 bg-blue-900/10" />
        <StatRow icon={<Crosshair size={14} className="text-purple-400" />} label="PRECISION (CRIT)" value={`${stats.critRate}%`} colorClass="border-purple-500/20 bg-purple-900/10" />
        <StatRow icon={<Zap size={14} className="text-orange-400" />} label="CRIT.DMG" value={`${stats.critDmg}%`} colorClass="border-orange-500/20 bg-orange-900/10" />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-4"></div>

      {/* 2. 장비 슬롯 영역 */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Cpu size={14} /> Neural Interface
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

// [Mod] 스탯 행 디자인 개선
const StatRow = ({ icon, label, value, colorClass }) => (
  <div className={`flex items-center justify-between p-2.5 rounded-lg border ${colorClass} transition-all hover:bg-white/5`}>
    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold tracking-wider">
      {icon} <span>{label}</span>
    </div>
    <span className="text-white font-mono font-bold text-sm drop-shadow-md">{value}</span>
  </div>
);