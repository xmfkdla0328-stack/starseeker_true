import React, { useState } from 'react';
import { ChevronLeft, HardDrive, Sparkles, Hexagon } from 'lucide-react';
import CharacterList from './management/CharacterList';
import StatusPanel from './management/StatusPanel';
import UpgradePanel from './management/UpgradePanel';

export default function ManagementScreen({ roster, inventory, onUnlockNode, onBack }) {
  // roster 데이터가 없는 경우를 대비한 안전장치
  if (!roster || roster.length === 0) return <div className="text-white">No Character Data</div>;

  const [selectedCharId, setSelectedCharId] = useState(roster[0].id);
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'upgrade'

  // 선택된 캐릭터 데이터 (roster에서 조회)
  const selectedChar = roster.find(c => c.id === selectedCharId) || roster[0];

  // 보유 재료 수량 (UpgradePanel에 전달하지 않고 여기서 확인 후 전달해도 되고, 아래처럼 패널에 넘겨도 됨)
  const chipCount = inventory.find(i => i.id === 'chip_basic')?.count || 0;
  const coreCount = inventory.find(i => i.id === 'core_essence')?.count || 0;

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] text-slate-100">
      
      {/* 1. 상단 헤더 & 자원 표시 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3 text-xs font-mono">
            {/* 데이터 보강칩 */}
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-white/5">
                <HardDrive size={12} className="text-cyan-400" />
                <span className="text-cyan-200">{chipCount}</span>
            </div>
            {/* 비물질 데이터 보강칩 */}
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-white/5">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-amber-200">{coreCount}</span>
            </div>
        </div>
      </div>

      {/* 2. 캐릭터 목록 (분리된 컴포넌트 사용) */}
      <CharacterList 
        roster={roster} 
        selectedCharId={selectedCharId} 
        onSelect={setSelectedCharId} 
      />

      {/* 3. 탭 버튼 */}
      <div className="flex border-b border-white/10">
        <button 
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors
                ${activeTab === 'status' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}
        >
            STATUS
        </button>
        <button 
            onClick={() => setActiveTab('upgrade')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors
                ${activeTab === 'upgrade' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-900/10' : 'text-slate-500 hover:text-slate-300'}`}
        >
            UPGRADE
        </button>
      </div>

      {/* 4. 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* 배경 장식 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Hexagon size={300} className="text-white animate-spin-slow" />
        </div>

        {activeTab === 'status' ? (
            <StatusPanel char={selectedChar} />
        ) : (
            <UpgradePanel 
                char={selectedChar} 
                onUnlockNode={onUnlockNode}
                chipCount={chipCount}
                coreCount={coreCount}
            />
        )}
      </div>
    </div>
  );
}