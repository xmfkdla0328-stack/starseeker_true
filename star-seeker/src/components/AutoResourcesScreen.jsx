import React, { useState, useEffect } from 'react';
import { ChevronLeft, Pickaxe, Bot, User, Plus, HardDrive, Hexagon, X } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/gameData';

export default function AutoResourcesScreen({ miningState, roster, onAssignMiner, onRemoveMiner, onCollectReward, onBack }) {
  const [targetSlot, setTargetSlot] = useState(null); // { type: 'chips'|'stones', index: 0 }

  // 캐릭터 선택 모달 닫기
  const closeSelector = () => setTargetSlot(null);

  // 배치 가능한 캐릭터 목록 (이미 다른 슬롯에 배치된 캐릭터 제외 로직은 추후 고도화 가능)
  // 현재는 단순하게 전체 로스터를 보여주되, 배치된 상태 표시
  const getAvailableMiners = () => {
    // 이미 배치된 캐릭터 ID 목록
    const assignedIds = [
      ...miningState.chips.miners,
      ...miningState.stones.miners
    ].filter(id => id !== null);

    return roster.map(char => ({
      ...char,
      isAssigned: assignedIds.includes(char.id)
    }));
  };

  const handleCharSelect = (charId) => {
    if (targetSlot) {
      onAssignMiner(targetSlot.type, targetSlot.index, charId);
      closeSelector();
    }
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in p-0 h-full bg-[#0f172a] text-slate-100">
      
      {/* 1. 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="text-xs tracking-widest uppercase">Back</span>
        </button>
        <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-widest">
            <Bot size={18} />
            <span>AUTO MINING</span>
        </div>
        <div className="w-6" />
      </div>

      {/* 2. 메인 컨텐츠 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* 구역 1: 데이터 보강칩 */}
        <MiningZone 
          title="데이터 보강칩 원재료 채굴 및 제작" 
          icon={HardDrive} 
          iconColor="text-cyan-400"
          zoneData={miningState.chips}
          roster={roster}
          onSlotClick={(idx) => setTargetSlot({ type: 'chips', index: idx })}
          onRemove={(idx) => onRemoveMiner('chips', idx)}
          onCollect={() => onCollectReward('chips')}
        />

        {/* 구역 2: 인과석 */}
        <MiningZone 
          title="인과석 채굴" 
          icon={Hexagon} 
          iconColor="text-violet-400"
          zoneData={miningState.stones}
          roster={roster}
          onSlotClick={(idx) => setTargetSlot({ type: 'stones', index: idx })}
          onRemove={(idx) => onRemoveMiner('stones', idx)}
          onCollect={() => onCollectReward('stones')}
        />

      </div>

      {/* 3. 캐릭터 선택 모달 (오버레이) */}
      {targetSlot && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col animate-fade-in">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900">
                <h3 className="text-white font-bold">채굴 요원 배치</h3>
                <button onClick={closeSelector}><X size={24} className="text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 content-start">
                {getAvailableMiners().map(char => (
                    <button 
                        key={char.id}
                        onClick={() => !char.isAssigned && handleCharSelect(char.id)}
                        disabled={char.isAssigned}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all
                            ${char.isAssigned 
                                ? 'border-slate-700 bg-black/40 opacity-50 grayscale cursor-not-allowed' 
                                : 'border-slate-600 bg-slate-800 hover:border-cyan-400 hover:bg-slate-700'
                            }`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${char.color} opacity-60`}></div>
                        <span className="relative z-10 text-xl font-bold text-white drop-shadow-md">{char.role.charAt(0)}</span>
                        {char.isAssigned && <span className="absolute bottom-1 text-[8px] bg-red-900/80 text-red-200 px-1 rounded">배치중</span>}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

// --- [Sub Component] 채굴 구역 카드 ---
function MiningZone({ title, icon: Icon, iconColor, zoneData, roster, onSlotClick, onRemove, onCollect }) {
    const activeMinersCount = zoneData.miners.filter(id => id !== null).length;
    const isMining = activeMinersCount > 0;
    
    // 보여주기용 누적량 (소수점 버림)
    const displayAmount = Math.floor(zoneData.accrued);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            {/* 활성화 시 배경 효과 */}
            {isMining && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${iconColor}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-100">{title}</h3>
                        <p className="text-xs text-slate-400 font-mono">
                            {isMining ? 'MINING IN PROGRESS...' : 'STATUS: IDLE'}
                        </p>
                    </div>
                </div>
                
                {/* 수령 버튼 */}
                <button 
                    onClick={onCollect}
                    disabled={displayAmount < 1}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all
                        ${displayAmount >= 1 
                            ? 'bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-bounce' 
                            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                    수령: {displayAmount}
                </button>
            </div>

            {/* 슬롯 영역 */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                {zoneData.miners.map((minerId, idx) => {
                    const miner = minerId ? roster.find(c => c.id === minerId) : null;
                    return (
                        <div key={idx} className="aspect-[3/4] rounded-xl border border-dashed border-slate-600 bg-black/20 flex flex-col items-center justify-center relative group">
                            {miner ? (
                                <>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${miner.color} opacity-30 rounded-xl`}></div>
                                    <span className="relative z-10 text-2xl font-bold text-white drop-shadow-md mb-1">{miner.role.charAt(0)}</span>
                                    <span className="relative z-10 text-[9px] text-slate-300 truncate w-full text-center px-1">{miner.name}</span>
                                    
                                    {/* 해제 버튼 (Hover시 표시) */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                                        className="absolute top-1 right-1 z-20 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                                    >
                                        <X size={10} />
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => onSlotClick(idx)}
                                    className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors rounded-xl"
                                >
                                    <Plus size={24} className="mb-1" />
                                    <span className="text-[9px]">배치</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 효율 정보 */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono relative z-10">
                <span>효율: {isMining ? '1개 / 1시간' : '0개 / 1시간'}</span>
                <span>배치됨: {activeMinersCount}/3</span>
            </div>
        </div>
    );
}