import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, RefreshCw, HardDrive, Sparkles, Hexagon } from 'lucide-react';
import CharacterList from './management/CharacterList';
import UpgradePanel from './management/UpgradePanel';
import StatusPanel from './management/StatusPanel';
// import useGameData from '../hooks/useGameData'; // [Delete] 훅 임포트 제거

export default function ManagementScreen({ 
  roster, 
  inventory, 
  onUnlockNode, 
  onBack,
  // [New] App.jsx에서 받아오는 Props
  equipmentList,
  onEquip,
  onUnequip,
  getFinalStats,
  addTestEquipments
}) {
  // const data = useGameData(); // [Delete] 내부 훅 호출 삭제 (이것이 원인이었음)
  
  // Props를 직접 사용
  const activeRoster = roster; 
  const activeInventory = inventory;
  
  const [selectedCharId, setSelectedCharId] = useState(activeRoster[0]?.id);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    if (!selectedCharId && activeRoster.length > 0) {
        setSelectedCharId(activeRoster[0].id);
    }
  }, [activeRoster, selectedCharId]);

  const selectedChar = activeRoster.find(c => c.id === selectedCharId);

  const finalStats = useMemo(() => {
    if (!selectedChar || !getFinalStats) return null; // getFinalStats 방어 코드
    return getFinalStats(selectedChar.id);
  }, [selectedChar, equipmentList, activeRoster, getFinalStats]);

  const chipCount = activeInventory.find(i => i.id === 'chip_basic')?.count || 0;
  const coreCount = activeInventory.find(i => i.id === 'core_essence')?.count || 0;

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white animate-fade-in overflow-hidden">
      
      {/* 1. 상단 헤더 */}
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
                onClick={addTestEquipments} 
                className="flex items-center gap-2 px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded text-xs text-purple-200 hover:bg-purple-800/50"
            >
                <RefreshCw size={12} /> Test
            </button>
        </div>
      </div>

      {/* 2. 캐릭터 리스트 */}
      <div className="flex-none z-10 bg-slate-900/80 backdrop-blur border-b border-white/10">
        <CharacterList 
          roster={activeRoster} 
          selectedCharId={selectedCharId} 
          onSelect={setSelectedCharId} 
        />
      </div>

      {/* 3. 탭 버튼 */}
      <div className="flex-none flex border-b border-white/10 bg-slate-900/50">
        <button 
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors
                ${activeTab === 'status' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
            STATUS & EQUIP
        </button>
        <button 
            onClick={() => setActiveTab('upgrade')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors
                ${activeTab === 'upgrade' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-900/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
            UPGRADE
        </button>
      </div>

      {/* 4. 메인 컨텐츠 */}
      <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="absolute inset-0 overflow-y-auto p-4 pb-20"> 
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
                <Hexagon size={300} className="text-white animate-spin-slow" />
            </div>

            {selectedChar && selectedChar.unlockedNodes && finalStats ? (
                <div className="relative z-10">
                    {activeTab === 'status' && (
                        <div className="min-h-[400px] animate-fade-in flex flex-col gap-4">
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

                    {activeTab === 'upgrade' && (
                        <div className="animate-fade-in min-h-[500px]">
                            {/* [Fix] 이제 onUnlockNode는 App.jsx에서 넘어온 함수를 사용하므로 State가 동기화됨 */}
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