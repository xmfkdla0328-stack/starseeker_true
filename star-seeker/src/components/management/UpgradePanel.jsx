import React, { useState } from 'react';
import { Hammer } from 'lucide-react';
import UpgradeNodeGraph from './UpgradeNodeGraph';
import UpgradeConfirmationModal from './UpgradeConfirmationModal';

export default function UpgradePanel({ char, onUnlockNode, chipCount, coreCount }) {
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [previewNodeInfo, setPreviewNodeInfo] = useState(null);

  const handleNodeClick = (node) => {
    if (char.unlockedNodes?.includes(node.index)) return; // 이미 해금된 노드는 클릭 무시
    setSelectedNodeInfo(node);
  };

  const handleConfirmUnlock = () => {
    if (!selectedNodeInfo) return;
    const node = selectedNodeInfo;

    // 재료 부족 체크 로직
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
    <div className="flex flex-col items-center justify-center py-10 animate-fade-in relative h-full">
      
      {/* 1. 강화 확인 모달 (조건부 렌더링) */}
      {selectedNodeInfo && (
        <UpgradeConfirmationModal 
          nodeInfo={selectedNodeInfo}
          onConfirm={handleConfirmUnlock}
          onCancel={() => setSelectedNodeInfo(null)}
        />
      )}

      {/* 2. 노드 그래프 (Visual) */}
      <UpgradeNodeGraph 
        char={char} 
        onNodeClick={handleNodeClick} 
        onNodeHover={setPreviewNodeInfo} 
      />

      {/* 3. 하단 설명 패널 (미리보기) */}
      <div className="mt-8 w-full p-4 bg-black/40 border border-white/5 rounded-xl text-center min-h-[80px] flex flex-col justify-center">
        {previewNodeInfo ? (
          <div className="animate-fade-in">
            <h4 className="text-cyan-400 text-sm font-bold mb-1">
              {previewNodeInfo.label} <span className="text-white">{previewNodeInfo.subLabel}</span>
            </h4>
            <p className="text-xs text-slate-500 font-mono">
              {previewNodeInfo.isMajor ? '특수 강화 노드 (비물질 칩 필요)' : '기초 스탯 강화 노드 (보강칩 필요)'}
            </p>
          </div>
        ) : (
          <div>
            <h4 className="text-slate-500 text-sm font-bold mb-1 flex items-center justify-center gap-2">
              <Hammer size={14} /> 강화 대기중
            </h4>
            <p className="text-xs text-slate-600">
              노드에 마우스를 올리거나 선택하여 정보를 확인하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}