import React, { useState } from 'react';
import { ChevronLeft, Bot, HardDrive, Hexagon } from 'lucide-react';

// Sub Components
import MiningZone from './mining/MiningZone';
import CharacterSelector from './mining/CharacterSelector';

export default function AutoResourcesScreen({ miningState, roster, onAssignMiner, onRemoveMiner, onCollectReward, onBack }) {
  const [targetSlot, setTargetSlot] = useState(null); // { type: 'chips'|'stones', index: 0 }

  const closeSelector = () => setTargetSlot(null);

  // 배치 가능한 캐릭터 목록 생성
  const getAvailableMiners = () => {
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
          title="데이터 보강칩 원재료 채굴" 
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
        <CharacterSelector 
            availableMiners={getAvailableMiners()}
            onSelect={handleCharSelect}
            onClose={closeSelector}
        />
      )}
    </div>
  );
}