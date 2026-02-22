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
    
    {/* 좌측: 뒤로가기 + 타이틀 (창고 화면 스타일 적용) */}
    <div className="flex items-center gap-4">
      <button 
        onClick={onBack} 
        className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="flex flex-col">
        {/* 아이콘 + 메인 타이틀 */}
        <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-widest text-lg drop-shadow-md">
            <Cpu size={18} />
            <span>관리</span>
        </div>
        {/* 서브 타이틀 */}
        <span className="text-[10px] text-cyan-600/80 font-mono tracking-wider pl-1">
            UNIT ADJUSTMENT
        </span>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
        {/* 자원 표시줄 */}
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
        label="STATUS & EQUIP"
        colorClass="cyan"
    />
    <TabButton 
        isActive={activeTab === 'upgrade'} 
        onClick={() => onTabChange('upgrade')}
        label="NEURAL UPGRADE"
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
      
      {/* 1. 공통 배경 효과 */}
      <ParticleBackground color="bg-cyan-600" />

      {/* 2. Header */}
      <HeaderSection 
        onBack={onBack} 
        chipCount={chipCount} 
        coreCount={coreCount} 
      />

      {/* 3. Character List (유리 패널 컨테이너) */}
      <div className="flex-none z-20 bg-slate-900/60 backdrop-blur border-b border-white/10">
        <CharacterList 
          roster={activeRoster} 
          selectedCharId={selectedCharId} 
          onSelect={setSelectedCharId} 
        />
      </div>

      {/* 4. Tab Buttons */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 5. Main Content Area */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden scrollbar-hide z-10">
        <div className="p-4 pb-20 min-h-full"> 
            
            {selectedChar && selectedChar.unlockedNodes && finalStats ? (
                <div className="flex flex-col gap-6 animate-slide-up-fade">
                    
                    {/* (Tab 1) Status & Equip */}
                    {activeTab === 'status' && (
                        <>
                            {/* Portrait Card */}
                            <div className="w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative group bg-slate-900/80">
                                {/* 캐릭터 이미지 */}
                                <img 
                                    src={selectedChar.image} 
                                    alt={selectedChar.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => e.target.style.display = 'none'} 
                                />
                                {/* 하단 그라데이션 및 정보 */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-3xl font-black italic text-white tracking-tighter drop-shadow-xl">{selectedChar.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-bold">
                                                    {selectedChar.role}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">
                                                    Lv.{selectedChar.level}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-amber-400">
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