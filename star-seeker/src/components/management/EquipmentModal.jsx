import React from 'react';
import { X, ShieldCheck, Sparkles } from 'lucide-react';
import { EQUIP_SLOTS } from '../../data/equipmentData';

export default function EquipmentModal({ isOpen, onClose, equipmentList, slotType, onEquip }) {
  if (!isOpen) return null;

  // 해당 슬롯 타입이고, 장착되지 않은 아이템만 필터링 (기존 로직 유지 - 아주 잘 되어 있습니다)
  const availableItems = equipmentList.filter(
    item => item.slot === slotType && !item.isEquipped
  );

  const isMemorySlot = slotType === EQUIP_SLOTS.SLOT_3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-slate-900 border border-white/20 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-950/50 rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {isMemorySlot ? <Sparkles className="text-purple-400" size={20} /> : <ShieldCheck className="text-cyan-400" size={20} />}
            SELECT EQUIPMENT
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
        </div>

        {/* 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {availableItems.length === 0 ? (
            <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-2">
              <span className="text-xs">No equipment available for this slot.</span>
            </div>
          ) : (
            availableItems.map(item => {
              const isMemoryGem = item.slot === EQUIP_SLOTS.SLOT_3;

              return (
                <div 
                  key={item.id}
                  onClick={() => onEquip(item)}
                  className={`bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer transition-all flex justify-between items-center group
                    ${isMemoryGem ? 'hover:bg-purple-900/20 hover:border-purple-500/50' : 'hover:bg-white/10 hover:border-cyan-500/50'}`}
                >
                  <div>
                    <div className={`text-sm font-bold transition-colors
                      ${isMemoryGem ? 'text-purple-100 group-hover:text-purple-300' : 'text-cyan-100 group-hover:text-cyan-400'}`}>
                      {item.name}
                    </div>
                    
                    {/* 데이터 형태에 따른 텍스트 렌더링 분기 */}
                    {isMemoryGem ? (
                      <>
                        <div className="text-xs text-purple-300 font-bold mt-1">
                          [ {item.memorySkill} ]
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] text-slate-300 bg-black/40 px-1.5 py-0.5 rounded border border-purple-500/30">
                            {item.memoryEffect.label}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs text-amber-300 font-mono mt-1">
                          Main: {item.mainStat?.type} +{item.mainStat?.value}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.subStats?.map((sub, idx) => (
                            <span key={idx} className="text-[10px] text-slate-400 bg-black/30 px-1.5 py-0.5 rounded">
                              {sub.type.split('_')[0]} +{sub.value}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className={`text-xs px-3 py-1 rounded border 
                    ${isMemoryGem ? 'bg-purple-900/30 text-purple-300 border-purple-500/20' : 'bg-cyan-900/30 text-cyan-300 border-cyan-500/20'}`}>
                    Equip
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}