import React, { useState } from 'react';
import { Hammer, Info } from 'lucide-react';
import UpgradeNodeGraph from './UpgradeNodeGraph';
import UpgradeConfirmationModal from './UpgradeConfirmationModal';

export default function UpgradePanel({ char, onUnlockNode, chipCount, coreCount }) {
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [previewNodeInfo, setPreviewNodeInfo] = useState(null);

  const handleNodeClick = (node) => {
    if (char.unlockedNodes?.includes(node.index)) return; 
    setSelectedNodeInfo(node);
  };

  const handleConfirmUnlock = () => {
    if (!selectedNodeInfo) return;
    const node = selectedNodeInfo;

    if (node.isMajor) {
      if (coreCount >= 1) {
        onUnlockNode(char.id, node.index, true, { statType: node.statType, value: node.value });
        setSelectedNodeInfo(null);
      } else {
        alert("비물질 데이터 보강칩이 부족합니다.");
      }
    } else {
      if (chipCount >= 5) {
        onUnlockNode(char.id, node.index, false, { statType: node.statType, value: node.value });
        setSelectedNodeInfo(null);
      } else {
        alert("데이터 보강칩이 부족합니다.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 animate-fade-in relative h-full">
      
      {/* 1. 강화 확인 모달 */}
      {selectedNodeInfo && (
        <UpgradeConfirmationModal 
          nodeInfo={selectedNodeInfo}
          onConfirm={handleConfirmUnlock}
          onCancel={() => setSelectedNodeInfo(null)}
        />
      )}

      {/* 2. 노드 그래프 (배경 없이 띄움) */}
      {/* UpgradeNodeGraph 내부에서도 배경색이 있다면 제거 필요 (투명 배경 권장) */}
      <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
        <UpgradeNodeGraph 
            char={char} 
            onNodeClick={handleNodeClick} 
            onNodeHover={setPreviewNodeInfo} 
        />
      </div>

      {/* 3. 하단 설명 패널 (유리 패널 스타일) */}
      <div className="mt-4 w-full p-5 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl text-center min-h-[100px] flex flex-col justify-center shadow-lg relative overflow-hidden">
        {/* 장식용 빛 효과 */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

        {previewNodeInfo ? (
          <div className="animate-fade-in">
            <h4 className="text-cyan-400 text-sm font-bold mb-1 tracking-wider">
              {previewNodeInfo.label} <span className="text-white ml-1">{previewNodeInfo.subLabel}</span>
            </h4>
            <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-[10px] rounded border ${previewNodeInfo.isMajor ? 'bg-amber-900/30 border-amber-500/30 text-amber-200' : 'bg-cyan-900/30 border-cyan-500/30 text-cyan-200'}`}>
                    {previewNodeInfo.isMajor ? 'MAJOR NODE' : 'MINOR NODE'}
                </span>
                <p className="text-xs text-slate-400 font-mono">
                {previewNodeInfo.isMajor ? '(Require Core Essence)' : '(Require Data Chip)'}
                </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-70">
            <h4 className="text-slate-400 text-sm font-bold flex items-center gap-2">
              <Info size={16} /> AWAITING INPUT
            </h4>
            <p className="text-[10px] text-slate-500 tracking-wider">
              SELECT A NODE TO VIEW DETAILS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}