import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, HardDrive, Sparkles, Hexagon, Cpu } from 'lucide-react';
import CharacterList from './management/CharacterList';
import UpgradePanel from './management/UpgradePanel';
import StatusPanel from './management/StatusPanel';
import { ALL_CHARACTERS } from '../data/characterData';
import ParticleBackground from './common/ParticleBackground'; 

// ----------------------------------------------------------------------
// [Sub Component] 상단 헤더 (유리 패널 스타일)
// ----------------------------------------------------------------------
const HeaderSection = ({ onBack, chipCount, coreCount }) => (
  <div className="flex-none flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/30 backdrop-blur-md z-30 shadow-lg relative">
    
    <div className="flex items-center gap-4">
      <button 
        onClick={onBack} 
        className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-widest text-lg drop-shadow-md">
            <Cpu size={18} />
            <span>관리</span>
        </div>
        <span className="text-[10px] text-cyan-600/80 font-mono tracking-wider pl-1">
            UNIT ADJUSTMENT
        </span>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
        <div className="flex gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                <HardDrive size={12} className="text-cyan-400" />
                <span className="text-cyan-100 font-bold">{chipCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-amber-100 font-bold">{coreCount}</span>
            </div>
        </div>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// [Sub Component] 탭 네비게이션
// ----------------------------------------------------------------------
const TabNavigation = ({ activeTab, onTabChange }) => (
  <div className="flex-none flex border-b border-white/10 bg-slate-900/40 backdrop-blur-sm z-20">
    <TabButton 
        isActive={activeTab === 'status'} 
        onClick={() => onTabChange('status')}
        label="상태 & 장비"
        colorClass="cyan"
    />
    <TabButton 
        isActive={activeTab === 'upgrade'} 
        onClick={() => onTabChange('upgrade')}
        label="강화"
        colorClass="amber"
    />
  </div>
);

const TabButton = ({ isActive, onClick, label, colorClass }) => {
    const activeStyles = colorClass === 'cyan' 
        ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30' 
        : 'text-amber-400 border-b-2 border-amber-400 bg-amber-950/30';
    
    return (
        <button 
            onClick={onClick}
            className={`flex-1 py-4 text-xs font-bold tracking-[0.15em] transition-all duration-300
                ${isActive ? activeStyles : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
        >
            {label}
        </button>
    );
}

// ----------------------------------------------------------------------
// [Main Component] Management Screen
// ----------------------------------------------------------------------
export default function ManagementScreen({ 
  roster, 
  inventory, 
  onUnlockNode, 
  onBack,
  equipmentList,
  onEquip,
  onUnequip,
  getFinalStats,
}) {
  const activeRoster = roster; 
  const activeInventory = inventory;
  
  const [selectedCharId, setSelectedCharId] = useState(activeRoster[0]?.id);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    if (!selectedCharId && activeRoster.length > 0) {
        setSelectedCharId(activeRoster[0].id);
    }
  }, [activeRoster, selectedCharId]);

  const selectedChar = useMemo(() => {
      const rosterChar = activeRoster.find(c => c.id === selectedCharId);
      if (!rosterChar) return null;
      const staticData = ALL_CHARACTERS.find(c => c.id === rosterChar.id);
      return {
          ...staticData, 
          ...rosterChar,
          image: rosterChar.image || staticData?.image
      };
  }, [activeRoster, selectedCharId]);

  const finalStats = useMemo(() => {
    if (!selectedChar || !getFinalStats) return null;
    return getFinalStats(selectedChar.id);
  }, [selectedChar, equipmentList, activeRoster, getFinalStats]);

  const chipCount = activeInventory.find(i => i.id === 'chip_basic')?.count || 0;
  const coreCount = activeInventory.find(i => i.id === 'core_essence')?.count || 0;

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white animate-fade-in overflow-hidden relative">
      
      <ParticleBackground color="bg-cyan-600" />

      <HeaderSection 
        onBack={onBack} 
        chipCount={chipCount} 
        coreCount={coreCount} 
      />

      <div className="flex-none z-20 bg-slate-900/60 backdrop-blur border-b border-white/10">
        <CharacterList 
          roster={activeRoster} 
          selectedCharId={selectedCharId} 
          onSelect={setSelectedCharId} 
        />
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden scrollbar-hide z-10">
        <div className="p-4 pb-20 min-h-full"> 
            
            {selectedChar && selectedChar.unlockedNodes && finalStats ? (
                <div className="flex flex-col gap-6 animate-slide-up-fade">
                    
                    {/* (Tab 1) Status & Equip */}
                    {activeTab === 'status' && (
                        <>
                            {/* [Fix] Portrait Card 크기 및 모양 변경: w-56(작게) + aspect-square(정사각형) */}
                            <div className="w-56 mx-auto aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative group bg-slate-900/80 mb-2 mt-4">
                                
                                <img 
                                    src={selectedChar.image} 
                                    alt={selectedChar.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => e.target.style.display = 'none'} 
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-90"></div>
                                
                                {/* [Fix] 텍스트 크기를 줄이고 가운데 정렬로 예쁘게 배치했습니다 */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-center justify-end">
                                    <div className="text-2xl font-black italic text-white tracking-tighter drop-shadow-xl">{selectedChar.name}</div>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-bold shadow-md">
                                            {selectedChar.role}
                                        </span>
                                        <div className="text-amber-400 text-[10px] drop-shadow-md">
                                            {'★'.repeat(selectedChar.star)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Equipment Panel */}
                            <StatusPanel 
                                character={selectedChar} 
                                finalStats={finalStats}
                                equipmentList={equipmentList}
                                onEquip={onEquip}
                                onUnequip={onUnequip}
                            />
                        </>
                    )}

                    {/* (Tab 2) Upgrade */}
                    {activeTab === 'upgrade' && (
                        <div className="animate-fade-in">
                            <UpgradePanel 
                                char={selectedChar} 
                                onUnlockNode={onUnlockNode}
                                chipCount={chipCount}
                                coreCount={coreCount}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
                    <Hexagon size={48} className="animate-spin text-slate-700" />
                    <span className="text-xs tracking-widest animate-pulse">LOADING DATA...</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}