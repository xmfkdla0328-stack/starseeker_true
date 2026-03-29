import React, { useState } from 'react';
import { ChevronLeft, Archive, HardDrive, Database, FileText, Sparkles, Cpu, Coins, Shield, Zap, BookOpen, Diamond } from 'lucide-react';
import { ALL_ITEMS } from '../data/gameData';
import { STAT_TYPES } from '../data/equipmentData';
import ParticleBackground from './common/ParticleBackground';

export default function StorageScreen({ inventory, equipmentList = [], onBack }) {
  const [selectedItemId, setSelectedItemId] = useState(null);

  // 일반 아이템 (재료/통화)
  const userItems = inventory.map(slot => {
    const itemData = ALL_ITEMS[slot.id] || {
      name: slot.name || 'Unknown Item',
      type: 'material',
      rarity: slot.rarity || 'common',
      desc: '데이터베이스에 정보가 없는 아이템입니다.',
      iconType: 'database'
    };
    return { ...itemData, count: slot.count, id: slot.id };
  });

  // 장비 아이템 변환
  const equipmentItems = equipmentList.map(equip => ({
    id: equip.id,
    name: equip.name,
    iconType: equip.slot === 'slot_3' ? 'diamond' : 'gear',
    rarity: equip.slot === 'slot_3' ? 'epic' : 'rare',
    type: 'equipment',
    count: 1,
    isEquipment: true,
    isEquipped: equip.isEquipped,
    equippedBy: equip.equippedBy,
    slot: equip.slot,
    mainStat: equip.mainStat,
    subStats: equip.subStats,
    memorySkill: equip.memorySkill,
    memoryEffect: equip.memoryEffect,
  }));

  const allItems = [...userItems, ...equipmentItems];
  const selectedItem = selectedItemId ? allItems.find(i => i.id === selectedItemId) : null;

  // 아이콘 렌더링
  const renderIcon = (type, colorClass) => {
    switch (type) {
      case 'chip':   return <HardDrive size={24} className={colorClass} />;
      case 'core':
      case 'star':   return <Sparkles size={24} className={colorClass} />;
      case 'coins':  return <Coins size={24} className={colorClass} />;
      case 'file':   return <FileText size={24} className={colorClass} />;
      case 'gear':   return <Cpu size={24} className={colorClass} />;
      case 'memory': return <BookOpen size={24} className={colorClass} />;
      case 'diamond': return <Diamond size={24} className={colorClass} />;
      default:       return <Database size={24} className={colorClass} />;
    }
  };

  // 등급별 색상
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case 'epic':      return 'text-violet-400 border-violet-500/50 bg-violet-500/10';
      case 'rare':      return 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10';
      default:          return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  };

  // 스탯 포맷
  const formatStat = (stat) => {
    if (!stat) return '';
    const info = STAT_TYPES[stat.type];
    if (!info) return '';
    return `${info.label} +${info.isPercent ? stat.value + '%' : stat.value}`;
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] text-slate-100 overflow-hidden">
      
      {/* 배경 */}
      <ParticleBackground color="bg-amber-500" />

      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/30 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-amber-400 font-bold tracking-widest text-lg drop-shadow-md">
              <Archive size={18} />
              <span>창고</span>
            </div>
            <span className="text-[10px] text-amber-600/80 font-mono tracking-wider pl-1">
              CAPACITY: {allItems.length} / ∞
            </span>
          </div>
        </div>
        <div className="w-6" />
      </div>

      {/* 아이템 그리드 */}
      <div className="flex-1 overflow-y-auto p-4 z-10">
        <div className="grid grid-cols-4 gap-3">
          {allItems.map((item, idx) => {
            const isSelected = selectedItemId === item.id;
            const rarityStyle = getRarityColor(item.rarity);
            const borderColor = rarityStyle.split(' ').find(c => c.startsWith('border-')) || 'border-white/10';

            return (
              <button
                key={item.id || idx}
                onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200
                  ${isSelected
                    ? 'border-amber-400 bg-amber-900/40 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105 z-10'
                    : `bg-slate-900/40 hover:bg-slate-800/60 ${borderColor}`
                  }`}
              >
                {renderIcon(item.iconType, isSelected ? 'text-amber-200 drop-shadow-md' : rarityStyle.split(' ')[0])}

                {/* 장착 중 표시 */}
                {item.isEquipped && (
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                )}

                {/* 수량 배지 (재료/통화만) */}
                {!item.isEquipment && item.count > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white border border-white/10">
                    {item.count}
                  </div>
                )}
              </button>
            );
          })}

          {/* 빈 슬롯 */}
          {[...Array(Math.max(4, 12 - allItems.length))].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-xl border border-white/5 bg-white/5" />
          ))}
        </div>
      </div>

      {/* 상세 정보 패널 */}
      <div className={`relative z-20 border-t border-white/10 bg-slate-950/60 backdrop-blur-md transition-all duration-300 ease-out overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
        ${selectedItem ? 'h-48 p-5 opacity-100' : 'h-0 p-0 opacity-0'}`}>

        {selectedItem && (
          <div className="flex gap-5 h-full animate-slide-up-fade">
            {/* 아이콘 */}
            <div className={`w-28 h-full rounded-xl border-2 flex items-center justify-center bg-black/40 flex-shrink-0 shadow-inner ${getRarityColor(selectedItem.rarity)}`}>
              {renderIcon(selectedItem.iconType, "w-14 h-14 drop-shadow-lg")}
            </div>

            {/* 텍스트 정보 */}
            <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
              <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-white text-base tracking-wide drop-shadow-md leading-tight">{selectedItem.name}</h3>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getRarityColor(selectedItem.rarity)}`}>
                      {selectedItem.rarity}
                    </span>
                    {selectedItem.isEquipped && (
                      <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold tracking-wider">
                        장착 중
                      </span>
                    )}
                  </div>
                </div>

                {/* 장비 스탯 표시 */}
                {selectedItem.isEquipment ? (
                  <div className="space-y-0.5">
                    {selectedItem.mainStat && (
                      <div className="flex items-center gap-1">
                        <Zap size={10} className="text-amber-400 flex-shrink-0" />
                        <span className="text-xs text-amber-300 font-semibold">{formatStat(selectedItem.mainStat)}</span>
                      </div>
                    )}
                    {selectedItem.subStats?.map((s, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Shield size={10} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-300">{formatStat(s)}</span>
                      </div>
                    ))}
                    {selectedItem.memorySkill && (
                      <div className="flex items-center gap-1">
                        <BookOpen size={10} className="text-violet-400 flex-shrink-0" />
                        <span className="text-xs text-violet-300">스토리 스킬: {selectedItem.memorySkill}</span>
                      </div>
                    )}
                    {selectedItem.memoryEffect && (
                      <div className="flex items-center gap-1">
                        <Zap size={10} className="text-violet-400 flex-shrink-0" />
                        <span className="text-xs text-violet-300">{selectedItem.memoryEffect.desc}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed font-light">{selectedItem.desc}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-4 mt-auto">
                <div className="text-xs text-slate-500 font-mono">
                  TYPE: <span className="text-slate-300 uppercase">{itemTypeToLabel(selectedItem.type)}</span>
                </div>
                {!selectedItem.isEquipment && (
                  <div className="text-xs text-slate-500 font-mono">
                    QTY: <span className="text-white font-bold text-sm">{selectedItem.count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function itemTypeToLabel(type) {
  if (type === 'material')  return 'Material';
  if (type === 'currency')  return 'Currency';
  if (type === 'equipment') return 'Equipment';
  return 'Unknown';
}
