import React, { useState } from 'react';
import { 
  Activity, Shield, Zap, Heart, Crosshair, Cpu, 
  Book, Utensils, Search, MessageSquare, ShieldCheck, 
  Wrench, ZapOff, Sparkles, Flame, Eye, Calculator 
} from 'lucide-react';
import EquipmentSlot from './EquipmentSlot';
import EquipmentModal from './EquipmentModal';
import { EQUIP_SLOTS } from '../../data/equipmentData';

// [NEW] 스킬 이름별 아이콘 매칭 헬퍼
const getSkillIcon = (skillName) => {
  const iconMap = {
    '요리': <Utensils size={12} />,
    '채집': <Flame size={12} />,
    '관찰': <Eye size={12} />,
    '카리스마': <Sparkles size={12} />,
    '직감': <Zap size={12} />,
    '계산': <Calculator size={12} />,
    '화술': <MessageSquare size={12} />,
    '리더쉽': <ShieldCheck size={12} />,
    '유혹': <Heart size={12} />,
    '괴력': <Zap size={12} />,
    '만능': <Sparkles size={12} />,
    '제조': <Wrench size={12} />,
    '수호': <Shield size={12} />,
    '분석': <Search size={12} />,
    '탐색': <Search size={12} />,
    '교섭': <MessageSquare size={12} />,
  };
  return iconMap[skillName] || <Book size={12} />;
};

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
    { label: '공격계', type: EQUIP_SLOTS.SLOT_1 },
    { label: '방어계', type: EQUIP_SLOTS.SLOT_2 },
    { label: '기억계', type: EQUIP_SLOTS.SLOT_3 },
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

  // finalStats가 있으면 사용하고, 없으면 기본 character 사용
  const stats = finalStats || character;
  // useGameData에서 합산된 스킬 리스트 추출
  const storySkills = stats.skills || [];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col h-full animate-fade-in">
      
      {/* 1. 타이틀 & 스탯 정보 */}
      <h3 className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
        <Activity size={14} /> 개체 상태
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatRow icon={<Heart size={14} className="text-rose-400" />} label="생명력 (HP)" value={stats.hp} colorClass="border-rose-500/20 bg-rose-900/10" />
        <StatRow icon={<Zap size={14} className="text-amber-400" />} label="공격력 (ATK)" value={stats.atk} colorClass="border-amber-500/20 bg-amber-900/10" />
        <StatRow icon={<Shield size={14} className="text-emerald-400" />} label="방어력 (DEF)" value={stats.def} colorClass="border-emerald-500/20 bg-emerald-900/10" />
        <StatRow icon={<Activity size={14} className="text-blue-400" />} label="속도 (SPD)" value={stats.speed} colorClass="border-blue-500/20 bg-blue-900/10" />
        <StatRow icon={<Crosshair size={14} className="text-purple-400" />} label="치명타 확률 (CRIT)" value={`${stats.critRate}%`} colorClass="border-purple-500/20 bg-purple-900/10" />
        <StatRow icon={<Zap size={14} className="text-orange-400" />} label="치명타 피해 (CRIT.DMG)" value={`${stats.critDmg}%`} colorClass="border-orange-500/20 bg-orange-900/10" />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-2"></div>

      {/* [NEW] 2. 스토리 스킬 섹션 */}
      <div className="mb-6">
        <h3 className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Sparkles size={14} /> 보유 기능
        </h3>
        <div className="flex flex-wrap gap-2">
          {storySkills.length > 0 ? (
            storySkills.map((skill, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] font-bold shadow-sm animate-slide-up-fade"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {getSkillIcon(skill)}
                <span>{skill}</span>
              </div>
            ))
          ) : (
            <span className="text-slate-500 text-[10px] italic">보유한 스토리 스킬이 없습니다.</span>
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-2"></div>

      {/* 3. 장비 슬롯 영역 */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Cpu size={14} /> 장비 착용
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

const StatRow = ({ icon, label, value, colorClass }) => (
  <div className={`flex items-center justify-between p-2.5 rounded-lg border ${colorClass} transition-all hover:bg-white/5`}>
    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold tracking-wider">
      {icon} <span>{label}</span>
    </div>
    <span className="text-white font-mono font-bold text-sm drop-shadow-md">{value}</span>
  </div>
);