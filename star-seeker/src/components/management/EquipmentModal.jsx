import React, { useEffect } from 'react';
import { X, ShieldCheck, Sparkles, Database } from 'lucide-react';
// [Fix 1] STAT_TYPES를 임포트하여 한글 라벨과 % 여부 데이터를 가져옵니다.
import { EQUIP_SLOTS, STAT_TYPES } from '../../data/equipmentData';

// [NEW] 스탯 객체를 받아서 "생명력 +6.2%" 형태의 예쁜 한글 텍스트로 변환하는 함수
const formatStat = (stat) => {
  if (!stat || !stat.type) return '';
  const statDef = STAT_TYPES[stat.type];
  if (!statDef) return `${stat.type} +${stat.value}`;
  
  // 'HP'를 '생명력'으로 바꿔주는 디테일 적용
  let label = statDef.label;
  if (label === 'HP') label = '생명력';
  
  // 퍼센트 스탯이면 뒤에 '%'를 붙임
  const suffix = statDef.isPercent ? '%' : '';
  return `${label} +${stat.value}${suffix}`;
};

export default function EquipmentModal({ isOpen, onClose, equipmentList, slotType, onEquip }) {
  // 모달 오픈 시 전체 인벤토리 확인용 (개발 편의성)
  useEffect(() => {
    if (isOpen) {
      console.log("🎒 [인벤토리 확인] 전체 보유 장비:", equipmentList);
    }
  }, [isOpen, equipmentList]);

  if (!isOpen) return null;

  const availableItems = equipmentList.filter(
    item => item.slot === slotType && !item.isEquipped
  );

  const isMemorySlot = slotType === EQUIP_SLOTS.SLOT_3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-slate-900 border border-white/20 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        
        {/* 헤더 한글화 */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-950/50 rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-widest">
            {isMemorySlot ? <Sparkles className="text-purple-400" size={20} /> : <ShieldCheck className="text-cyan-400" size={20} />}
            장비 선택
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24}/>
          </button>
        </div>

        {/* 장비 보유량 한글화 */}
        <div className="px-4 py-2 bg-slate-800/50 border-b border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-widest">
            <div className="flex items-center gap-1.5">
                <Database size={12} className="text-cyan-500" />
                <span>보유 중인 전체 장비</span>
            </div>
            <span className="text-cyan-300">{equipmentList.length} 개</span>
        </div>

        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {availableItems.length === 0 ? (
            <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-2">
              <span className="text-xs">이 슬롯에 장착할 수 있는 장비가 없습니다.</span>
              <span className="text-[10px] text-slate-600">다른 슬롯을 확인해 보세요.</span>
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
                    
                    {/* [Fix 2] 스탯 텍스트 렌더링 방식 전면 수정 */}
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
                        {/* 주 옵션 */}
                        <div className="text-xs text-amber-300 font-bold mt-1 tracking-wide">
                          주 옵션: {formatStat(item.mainStat)}
                        </div>
                        {/* 부 옵션 (리스트로 나열) */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] text-slate-500 font-bold">부 옵션:</span>
                          {item.subStats?.map((sub, idx) => (
                            <span key={idx} className="text-[10px] text-slate-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                              {formatStat(sub)}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* 장착 버튼 텍스트 한글화 */}
                  <div className={`text-xs px-3 py-1 rounded border font-bold tracking-widest
                    ${isMemoryGem ? 'bg-purple-900/30 text-purple-300 border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white' : 'bg-cyan-900/30 text-cyan-300 border-cyan-500/20 group-hover:bg-cyan-600 group-hover:text-white'}`}>
                    장착
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