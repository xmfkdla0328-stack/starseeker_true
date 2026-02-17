import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, RefreshCw, HardDrive, Sparkles, Hexagon } from 'lucide-react';
import CharacterList from './management/CharacterList';
import UpgradePanel from './management/UpgradePanel';
import StatusPanel from './management/StatusPanel';
import { ALL_CHARACTERS } from '../data/characterData';

// ----------------------------------------------------------------------
// [Sub Component] 상단 헤더 (타이틀 + 자원 표시 + 테스트 버튼)
// ----------------------------------------------------------------------
const HeaderSection = ({ onBack, chipCount, coreCount, onTest }) => (
  <div className="flex-none flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/50 z-20">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-bold tracking-widest text-cyan-400">MANAGEMENT</h2>
    </div>
    
    <div className="flex items-center gap-4">
        <div className="flex gap-3 text-xs font-mono mr-4">
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-white/5">
                <HardDrive size={12} className="text-cyan-400" />
                <span className="text-cyan-200">{chipCount}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-white/5">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-amber-200">{coreCount}</span>
            </div>
        </div>
        <button 
            onClick={onTest} 
            className="flex items-center gap-2 px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded text-xs text-purple-200 hover:bg-purple-800/50"
        >
            <RefreshCw size={12} /> Test
        </button>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// [Sub Component] 탭 네비게이션
// ----------------------------------------------------------------------
const TabNavigation = ({ activeTab, onTabChange }) => (
  <div className="flex-none flex border-b border-white/10 bg-slate-900/50">
    <button 
        onClick={() => onTabChange('status')}
        className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors
            ${activeTab === 'status' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
    >
        STATUS & EQUIP
    </button>
    <button 
        onClick={() => onTabChange('upgrade')}
        className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors
            ${activeTab === 'upgrade' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-900/20' : 'text-slate-500 hover:text-slate-300'}`}
    >
        UPGRADE
    </button>
  </div>
);

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
  addTestEquipments
}) {
  const activeRoster = roster; 
  const activeInventory = inventory;
  
  const [selectedCharId, setSelectedCharId] = useState(activeRoster[0]?.id);
  const [activeTab, setActiveTab] = useState('status');

  // 첫 진입 시 선택된 캐릭터가 없으면 첫 번째 캐릭터 선택
  useEffect(() => {
    if (!selectedCharId && activeRoster.length > 0) {
        setSelectedCharId(activeRoster[0].id);
    }
  }, [activeRoster, selectedCharId]);

  // 선택된 캐릭터 데이터 병합 (동적 상태 + 정적 데이터)
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

  // 최종 스탯 계산
  const finalStats = useMemo(() => {
    if (!selectedChar || !getFinalStats) return null;
    return getFinalStats(selectedChar.id);
  }, [selectedChar, equipmentList, activeRoster, getFinalStats]);

  const chipCount = activeInventory.find(i => i.id === 'chip_basic')?.count || 0;
  const coreCount = activeInventory.find(i => i.id === 'core_essence')?.count || 0;

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white animate-fade-in overflow-hidden">
      
      {/* 1. Header */}
      <HeaderSection 
        onBack={onBack} 
        chipCount={chipCount} 
        coreCount={coreCount} 
        onTest={addTestEquipments} 
      />

      {/* 2. Character List */}
      <div className="flex-none z-10 bg-slate-900/80 backdrop-blur border-b border-white/10">
        <CharacterList 
          roster={activeRoster} 
          selectedCharId={selectedCharId} 
          onSelect={setSelectedCharId} 
        />
      </div>

      {/* 3. Tab Buttons */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 4. Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="absolute inset-0 overflow-y-auto p-4 pb-20"> 
            
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
                <Hexagon size={300} className="text-white animate-spin-slow" />
            </div>

            {selectedChar && selectedChar.unlockedNodes && finalStats ? (
                <div className="relative z-10">
                    {/* (Tab 1) Status & Equip */}
                    {activeTab === 'status' && (
                        <div className="min-h-[400px] animate-fade-in flex flex-col gap-4">
                            {/* Character Portrait Card */}
                            <div className="w-full max-w-sm mx-auto aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group bg-slate-900">
                                <img 
                                    src={selectedChar.image} 
                                    alt={selectedChar.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.style.display = 'none'} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                                <div className="absolute bottom-4 left-4">
                                    <div className="text-2xl font-black italic text-white">{selectedChar.name}</div>
                                    <div className="text-xs text-cyan-400 font-mono">{selectedChar.role} / {selectedChar.element}</div>
                                </div>
                            </div>

                            <StatusPanel 
                                character={selectedChar} 
                                finalStats={finalStats}
                                equipmentList={equipmentList}
                                onEquip={onEquip}
                                onUnequip={onUnequip}
                            />
                        </div>
                    )}

                    {/* (Tab 2) Upgrade */}
                    {activeTab === 'upgrade' && (
                        <div className="animate-fade-in min-h-[500px]">
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
                <div className="flex h-full items-center justify-center text-slate-500">
                    Loading data...
                </div>
            )}
        </div>
      </div>
    </div>
  );
}