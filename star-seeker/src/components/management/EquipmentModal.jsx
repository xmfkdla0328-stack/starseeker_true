import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, Diamond, Cpu, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { EQUIP_SLOTS, STAT_TYPES } from '../../data/equipmentData';

const formatStat = (stat) => {
  if (!stat || !stat.type) return '';
  const statDef = STAT_TYPES[stat.type];
  if (!statDef) return `${stat.type} +${stat.value}`;
  let label = statDef.label;
  if (label === 'HP') label = '생명력';
  const suffix = statDef.isPercent ? '%' : '';
  return `${label} +${stat.value}${suffix}`;
};

const SORT_OPTIONS = [
  { key: 'default', label: '획득순' },
  { key: 'main_desc', label: '주 옵션 ↓' },
];

export default function EquipmentModal({
  isOpen, onClose,
  equipmentList, slotType, slotLabel,
  currentEquippedItem,
  onEquip
}) {
  const [sortKey, setSortKey] = useState('main_desc');

  if (!isOpen) return null;

  const isMemorySlot = slotType === EQUIP_SLOTS.SLOT_3;

  const availableItems = equipmentList
    .filter(item => item.slot === slotType && !item.isEquipped)
    .slice()
    .sort((a, b) => {
      if (sortKey === 'main_desc' && !isMemorySlot) {
        return (b.mainStat?.value ?? 0) - (a.mainStat?.value ?? 0);
      }
      return 0;
    });

  const slotIcon = isMemorySlot
    ? <Diamond size={16} className="text-violet-400" />
    : <Cpu size={16} className="text-cyan-400" />;

  const accentColor = isMemorySlot ? 'violet' : 'cyan';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-white/15 rounded-t-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center px-5 pt-5 pb-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {slotIcon}
              <span className="text-white font-bold tracking-wide text-base">
                {slotLabel ?? '장비'} 슬롯
              </span>
            </div>
            <span className={`text-[10px] font-mono tracking-widest text-${accentColor}-500/80 pl-6`}>
              AVAILABLE: {availableItems.length}개
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* 현재 장착 중 */}
        {currentEquippedItem && (
          <div className="mx-5 mb-3 p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">현재 장착</span>
            </div>
            <CurrentEquipCard item={currentEquippedItem} isMemory={isMemorySlot} />
          </div>
        )}

        {/* 정렬 탭 (칩 슬롯만) */}
        {!isMemorySlot && (
          <div className="flex gap-2 px-5 mb-3">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`flex items-center gap-1 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full border transition-all
                  ${sortKey === opt.key
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                <ArrowUpDown size={10} />
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* 구분선 */}
        <div className="h-px bg-white/8 mx-5 mb-3" />

        {/* 아이템 목록 */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {availableItems.length === 0 ? (
            <div className="text-center py-14 flex flex-col items-center gap-2">
              <span className="text-slate-400 text-sm font-semibold">사용 가능한 장비 없음</span>
              <span className="text-[10px] text-slate-600">자원 추출로 장비를 획득하세요.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {availableItems.map(item => (
                <EquipCard
                  key={item.id}
                  item={item}
                  isMemory={isMemorySlot}
                  accentColor={accentColor}
                  onEquip={() => onEquip(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EquipCard({ item, isMemory, accentColor, onEquip }) {
  const borderClass = accentColor === 'violet'
    ? 'border-violet-500/20 hover:border-violet-400/60 hover:bg-violet-900/20'
    : 'border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-900/15';
  const mainColor = accentColor === 'violet' ? 'text-violet-300' : 'text-amber-300';

  return (
    <button
      onClick={onEquip}
      className={`w-full text-left bg-white/4 border rounded-xl p-3 transition-all active:scale-95 ${borderClass}`}
    >
      {isMemory ? (
        <>
          <div className={`text-sm font-bold ${mainColor} leading-tight mb-1.5`}>
            {item.memorySkill}
          </div>
          <div className="text-[10px] text-slate-400 mb-2 leading-snug">
            {item.memoryEffect?.desc}
          </div>
          <div className={`text-[10px] font-bold tracking-widest uppercase text-${accentColor}-500 text-right`}>
            장착 →
          </div>
        </>
      ) : (
        <>
          <div className={`text-sm font-black ${mainColor} leading-tight`}>
            {formatStat(item.mainStat)}
          </div>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {item.subStats?.map((s, i) => (
              <span key={i} className="text-[10px] text-slate-400 leading-snug">
                · {formatStat(s)}
              </span>
            ))}
          </div>
          <div className={`text-[10px] font-bold tracking-widest uppercase text-${accentColor}-500 text-right mt-2`}>
            장착 →
          </div>
        </>
      )}
    </button>
  );
}

function CurrentEquipCard({ item, isMemory }) {
  if (isMemory) {
    return (
      <div className="text-xs text-slate-200">
        <span className="font-bold text-violet-200">{item.memorySkill}</span>
        <span className="text-slate-400 ml-2 text-[10px]">{item.memoryEffect?.desc}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-amber-200">{formatStat(item.mainStat)}</span>
      {item.subStats?.map((s, i) => (
        <span key={i} className="text-[10px] text-slate-400">· {formatStat(s)}</span>
      ))}
    </div>
  );
}
