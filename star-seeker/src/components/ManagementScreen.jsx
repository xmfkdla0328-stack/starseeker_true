import React, { useState, useMemo } from 'react'; // useMemo 추가 확인
import { ArrowLeft, RefreshCw } from 'lucide-react'; // 아이콘 추가
import CharacterList from './management/CharacterList';
import UpgradeNodeGraph from './management/UpgradeNodeGraph';
import UpgradePanel from './management/UpgradePanel';
import StatusPanel from './management/StatusPanel';
import useGameData from '../hooks/useGameData'; // [New] 훅 가져오기 (props 대신 직접 호출도 가능하지만, 구조상 props로 받는게 깔끔하다면 유지)

// App.jsx에서 props를 넉넉하게 내려주지 않았다면, 여기서 직접 useGameData를 불러도 됩니다.
// 여기서는 App.jsx 구조를 모르므로, 기존 props에 더해 필요한 것을 받는 구조로 가정하거나
// 안전하게 내부에서 useGameData를 호출하는 하이브리드 방식을 제안합니다.

export default function ManagementScreen({ 
  roster, 
  inventory, 
  onUnlockNode, 
  onBack,
  // [New] 아래 props들이 App.jsx에서 넘어와야 함. 안 넘어오면 내부에서 useGameData 호출 필요.
  // 하지만 리팩터링 했으므로 App.jsx 수정 없이 여기서 data 훅을 쓰는게 나을 수도 있음.
}) {
  // ★ 리팩터링된 데이터 훅 전체 호출 (가장 확실한 방법)
  const data = useGameData(); 
  // 실제로는 부모(App)에서 data를 뿌려주고 있을 수 있으니, 
  // 만약 roster가 props로 들어왔다면 그걸 쓰고, 아니면 data.roster를 쓰는 식으로 처리.
  
  const activeRoster = roster || data.roster;
  const activeInventory = inventory || data.inventory;
  
  const [selectedCharId, setSelectedCharId] = useState(activeRoster[0]?.id);
  const selectedChar = activeRoster.find(c => c.id === selectedCharId);

  // [New] 선택된 캐릭터의 최종 스탯 계산
  const finalStats = useMemo(() => {
    if (!selectedChar) return null;
    return data.getFinalStats(selectedChar.id);
  }, [selectedChar, data.equipmentList, data.roster]); // 의존성: 장비나 로스터가 바뀌면 재계산

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white animate-fade-in overflow-hidden">
      
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/50 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold tracking-widest text-cyan-400">MANAGEMENT</h2>
        </div>
        
        {/* [Test] 테스트 장비 생성 버튼 (개발용) */}
        <button 
            onClick={data.addTestEquipments}
            className="flex items-center gap-2 px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded text-xs text-purple-200 hover:bg-purple-800/50"
        >
            <RefreshCw size={12} /> Test Items
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 캐릭터 리스트 */}
        <div className="w-1/4 min-w-[200px] border-r border-white/10 bg-slate-900/30 overflow-y-auto">
          <CharacterList 
            roster={activeRoster} 
            selectedId={selectedCharId} 
            onSelect={setSelectedCharId} 
          />
        </div>

        {/* 중앙 & 우측: 상세 정보 */}
        <div className="flex-1 flex bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          {selectedChar && (
            <>
              {/* 중앙: 스탯 및 장비 패널 */}
              <div className="w-1/3 p-6 flex flex-col gap-4 border-r border-white/5 bg-slate-950/80 backdrop-blur-sm">
                
                {/* 캐릭터 이미지 (간단히) */}
                <div className="aspect-[4/5] w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                    <img 
                        src={selectedChar.image} 
                        alt={selectedChar.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                    <div className="absolute bottom-4 left-4">
                        <div className="text-2xl font-black italic text-white">{selectedChar.name}</div>
                        <div className="text-xs text-cyan-400 font-mono">{selectedChar.role} / {selectedChar.element}</div>
                    </div>
                </div>

                {/* [Mod] 스탯 패널에 장비 기능 연결 */}
                <div className="flex-1 min-h-0">
                    <StatusPanel 
                        character={selectedChar} 
                        finalStats={finalStats} // 계산된 스탯 전달
                        equipmentList={data.equipmentList}
                        onEquip={data.handleEquip}
                        onUnequip={data.handleUnequip}
                    />
                </div>
              </div>

              {/* 우측: 성장(노드) 패널 */}
              <div className="flex-1 flex flex-col relative overflow-hidden">
                <div className="flex-1 relative">
                    <UpgradeNodeGraph 
                        character={selectedChar} 
                        onNodeSelect={() => {}} // 그래프 인터랙션용 (필요시 구현)
                    />
                </div>
                <div className="h-1/3 min-h-[250px] border-t border-white/10 bg-slate-900/90 backdrop-blur-md p-6">
                    <UpgradePanel 
                        character={selectedChar} 
                        inventory={activeInventory} 
                        onUnlock={data.handleUnlockNode} // 여기서 data.handleUnlockNode 사용
                    />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}