import React from 'react';
import { Plus, X, Cpu } from 'lucide-react';

export default function EquipmentSlot({ item, onClick, onUnequip, label }) {
  return (
    <div className="relative group">
      {/* 슬롯 라벨 (Slot 1, Slot 2 등) */}
      <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">
        {label}
      </div>

      {item ? (
        // 장비가 있을 때
        <div 
          className="w-full aspect-square bg-slate-800 border border-cyan-500/50 rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:bg-slate-700 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          onClick={onClick}
        >
          <div className="flex justify-between items-start">
            <Cpu size={16} className="text-cyan-400" />
            <button 
              onClick={(e) => { e.stopPropagation(); onUnequip(); }}
              className="text-slate-500 hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
          <div>
            <div className="text-xs text-white font-bold truncate">{item.name}</div>
            <div className="text-[10px] text-cyan-300">
               {/* 메인 스탯 표시 (예: ATK +30) */}
               {item.mainStat.type.split('_')[0]} +{item.mainStat.value}{item.mainStat.type.includes('PERCENT') ? '%' : ''}
            </div>
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