import React from 'react';
import { Plus, X, Cpu, Hexagon } from 'lucide-react';
import { EQUIP_SLOTS } from '../../data/equipmentData';

export default function EquipmentSlot({ item, onClick, onUnequip, label }) {
  // 장착된 아이템이 3번 슬롯(기억 세공)인지 확인하는 플래그
  const isMemoryGem = item && item.slot === EQUIP_SLOTS.SLOT_3;

  return (
    <div className="relative group">
      {/* 슬롯 라벨 (Slot 1, Slot 2 등) */}
      <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">
        {label}
      </div>

      {item ? (
        // 장비가 있을 때
        <div 
          className={`w-full aspect-square bg-slate-800 border rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:bg-slate-700 transition-all shadow-lg
            ${isMemoryGem ? 'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'}`}
          onClick={onClick}
        >
          <div className="flex justify-between items-start">
            {/* 3번 슬롯은 보석(Hexagon) 아이콘, 나머지는 칩(Cpu) 아이콘 */}
            {isMemoryGem ? <Hexagon size={16} className="text-purple-400" /> : <Cpu size={16} className="text-cyan-400" />}
            
            <button 
              onClick={(e) => { e.stopPropagation(); onUnequip(); }}
              className="text-slate-500 hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
          <div>
            <div className="text-xs text-white font-bold truncate">{item.name}</div>
            
            {/* 데이터 형태에 따른 텍스트 렌더링 분기 */}
            {isMemoryGem ? (
              <div className="text-[10px] text-purple-300 font-bold truncate mt-0.5">
                {item.memorySkill}
              </div>
            ) : (
              <div className="text-[10px] text-cyan-300 mt-0.5">
                 {item.mainStat.type.split('_')[0]} +{item.mainStat.value}{item.mainStat.type.includes('PERCENT') ? '%' : ''}
              </div>
            )}
          </div>
        </div>
      ) : (
        // 장비가 없을 때 (빈 슬롯)
        <button 
          onClick={onClick}
          className="w-full aspect-square bg-slate-900/50 border border-white/10 rounded-lg flex flex-col items-center justify-center text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-950/20 transition-all"
        >
          <Plus size={24} />
          <span className="text-[10px] mt-1">EQUIP</span>
        </button>
      )}
    </div>
  );
}