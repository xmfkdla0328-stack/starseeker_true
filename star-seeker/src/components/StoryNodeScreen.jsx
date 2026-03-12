import React, { useState } from 'react';
import { ChevronLeft, Lock, PlayCircle, CheckCircle2, Map } from 'lucide-react';
import { STORY_CHAPTERS, STORY_NODES, STORY_EDGES } from '../data/storyData';

export default function StoryNodeScreen({ 
  onBack, 
  clearedNodes = [], 
  onSelectStory 
}) {
  const [selectedChapter, setSelectedChapter] = useState(STORY_CHAPTERS[0].id);
  const rawNodes = STORY_NODES[selectedChapter] || [];
  const rawEdges = STORY_EDGES[selectedChapter] || [];

  const isNodeVisited = (nodeId) => clearedNodes.includes(nodeId);
  const isTutorialCleared = isNodeVisited('node_start');

  let displayNodes = rawNodes;
  let displayEdges = rawEdges;

  if (selectedChapter === 'prologue' && !isTutorialCleared) {
      displayNodes = rawNodes
          .filter(n => n.id === 'node_start')
          .map(n => ({ ...n, x: 50, y: 50 })); 
      displayEdges = []; 
  }
  
  const isNodeAvailable = (nodeId) => {
    if (isNodeVisited(nodeId)) return false; 
    
    const nodeData = rawNodes.find(n => n.id === nodeId);
    if (nodeData && nodeData.requires) {
        const hasMetRequirements = nodeData.requires.every(reqId => isNodeVisited(reqId));
        if (!hasMetRequirements) return false; 
    }

    const parentEdges = rawEdges.filter(e => e.to === nodeId);
    if (parentEdges.length === 0) return true; 
    return parentEdges.some(e => isNodeVisited(e.from)); 
  };

  const handleNodeClick = (node, locked) => {
    if (locked) {
      alert("이전 인과를 먼저 관측해야 합니다.");
      return;
    }
    const targetEventId = node.eventId || node.id;
    onSelectStory(targetEventId, node.id); 
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-[#0f172a] text-slate-100 animate-fade-in z-20 absolute inset-0">
      
      {/* 1. 상단 헤더 */}
      <div className="flex-none flex items-center p-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-30 shadow-lg">
        <button onClick={onBack} className="p-1 mr-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-widest text-lg drop-shadow-md">
            <Map size={18} />
            <span>사건의 지평선</span>
          </div>
          <span className="text-[10px] text-cyan-600/80 font-mono tracking-wider pl-1">
            CAUSALITY BRANCH
          </span>
        </div>
      </div>

      {/* 2. 챕터 선택기 */}
      <div className="flex-none overflow-x-auto flex gap-3 p-3 border-b border-white/10 bg-black/40 backdrop-blur-md z-20 scrollbar-hide">
        {STORY_CHAPTERS.map(chap => (
          <button key={chap.id} onClick={() => setSelectedChapter(chap.id)}
            className={`px-4 py-2 text-xs font-bold tracking-widest rounded-lg border transition-all whitespace-nowrap active:scale-95
            ${selectedChapter === chap.id 
                ? 'bg-cyan-900/40 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
            {chap.title}
          </button>
        ))}
      </div>

      {/* 3. 트리 캔버스 */}
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-[#020617] overflow-auto scrollbar-hide">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none"></div>

        <div className="min-w-full min-h-full flex items-center justify-center p-10">
          <div className="relative w-[300px] h-[600px] my-auto">
            
            {/* 연결선 (Edges) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {displayEdges.map((edge, idx) => {
                const fromNode = rawNodes.find(n => n.id === edge.from);
                const toNode = rawNodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const isLineActive = isNodeVisited(fromNode.id) && (isNodeVisited(toNode.id) || isNodeAvailable(toNode.id));

                return (
                  <line key={idx}
                    x1={`${fromNode.x}%`} y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`} y2={`${toNode.y}%`}
                    stroke={isLineActive ? "#22d3ee" : "#334155"} 
                    strokeWidth={isLineActive ? "2" : "1"}
                    strokeDasharray={isLineActive ? "0" : "4 4"}
                    className="transition-colors duration-700"
                    style={{ filter: isLineActive ? 'drop-shadow(0 0 5px rgba(34,211,238,0.5))' : 'none' }}
                  />
                );
              })}
            </svg>

            {/* [NEW] 개편된 노드 (Nodes) UI */}
            {displayNodes.map((node) => {
              const visited = isNodeVisited(node.id);
              const available = isNodeAvailable(node.id);
              const locked = !visited && !available;

              let nodeStyle = { circle: '', text: '' };
              let icon = null;

              // [디자인 개편] 원형 아이콘 스타일과 아래 글래스모피즘 텍스트 박스 스타일 분리
              if (visited) {
                nodeStyle.circle = 'bg-emerald-900/50 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
                nodeStyle.text = 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
                icon = <CheckCircle2 size={18} className="text-emerald-400" />;
              } else if (available) {
                nodeStyle.circle = 'bg-cyan-900/50 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-pulse border-2';
                nodeStyle.text = 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200';
                icon = <PlayCircle size={20} className="text-cyan-300" />;
              } else {
                nodeStyle.circle = 'bg-slate-900/50 border-slate-700 opacity-60';
                nodeStyle.text = 'bg-slate-900/70 border-slate-800 text-slate-500 opacity-80';
                icon = <Lock size={16} className="text-slate-600" />;
              }

              return (
                <div key={node.id}
                  // 전체를 감싸는 컨테이너: 마우스 호버 시 전체가 함께 커집니다 (scale-110)
                  // 좌표를 -50% -50% 이동시켜 정확한 중앙 정렬
                  className="absolute flex flex-col items-center gap-2.5 z-10 transition-transform duration-500 ease-out cursor-pointer group hover:scale-110"
                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={() => handleNodeClick(node, locked)}
                >
                  {/* 1. 노드 원형 (크기를 w-12 h-12로 조금 작고 단단하게 줄임) */}
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-500 ${nodeStyle.circle}`}>
                    {icon}
                  </div>
                  
                  {/* 2. 노드 이름 패널 (글래스모피즘, 글자 잘림 방지) */}
                  <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md border shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-500 ${nodeStyle.text}`}>
                    {/* whitespace-nowrap으로 제목이 길어도 한 줄로 쭉 뻗게 유지합니다. */}
                    <div className="text-[11px] font-bold tracking-widest whitespace-nowrap text-center">
                      {locked ? '???' : node.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}