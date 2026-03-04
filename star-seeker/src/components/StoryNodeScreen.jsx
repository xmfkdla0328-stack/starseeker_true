import React, { useState } from 'react';
import { ChevronLeft, Lock, PlayCircle, CheckCircle2, Map } from 'lucide-react';
import { STORY_CHAPTERS, STORY_NODES, STORY_EDGES } from '../data/storyData';

export default function StoryNodeScreen({ 
  onBack, 
  clearedNodes = [], 
  onSelectStory 
}) {
  const [selectedChapter, setSelectedChapter] = useState(STORY_CHAPTERS[0].id);
  const nodes = STORY_NODES[selectedChapter] || [];
  const edges = STORY_EDGES[selectedChapter] || [];

  // 노드 상태 판별 로직 (CausalityTreeTab과 동일)
  const isNodeVisited = (nodeId) => clearedNodes.includes(nodeId);
  const isNodeAvailable = (nodeId) => {
    if (isNodeVisited(nodeId)) return false; 
    const parentEdges = edges.filter(e => e.to === nodeId);
    if (parentEdges.length === 0) return true; 
    return parentEdges.some(e => isNodeVisited(e.from)); 
  };

  const handleNodeClick = (node, locked) => {
    if (locked) {
      alert("이전 인과를 먼저 관측해야 합니다.");
      return;
    }
    // [Fix] 노드에 연결된 실제 스토리 ID(eventId)를 우선적으로 찾아서 넘겨줍니다!
    const targetEventId = node.eventId || node.id;
    onSelectStory(targetEventId); 
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-[#0f172a] text-slate-100 animate-fade-in z-20 absolute inset-0">
      
      {/* 1. 상단 헤더 */}
      <div className="flex-none flex items-center p-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-30 shadow-lg">
        <button onClick={onBack} className="p-1 mr-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
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
            className={`px-4 py-2 text-xs font-bold tracking-widest rounded-lg border transition-all whitespace-nowrap
            ${selectedChapter === chap.id 
                ? 'bg-cyan-900/40 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
            {chap.title}
          </button>
        ))}
      </div>

      {/* 3. 트리 캔버스 (스크롤 가능하도록 구조 변경) */}
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-[#020617] overflow-auto scrollbar-hide">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none"></div>

        {/* 캔버스를 화면 정중앙에 배치하면서 스크롤 공간 확보 */}
        <div className="min-w-full min-h-full flex items-center justify-center p-10">
          <div className="relative w-[300px] h-[600px] my-auto">
            
            {/* 연결선 (Edges) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {edges.map((edge, idx) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
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

            {/* 노드 (Nodes) */}
            {nodes.map((node) => {
              const visited = isNodeVisited(node.id);
              const available = isNodeAvailable(node.id);
              const locked = !visited && !available;

              let nodeStyle = '';
              let icon = null;

              if (visited) {
                nodeStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]';
                icon = <CheckCircle2 size={16} className="text-emerald-400" />;
              } else if (available) {
                nodeStyle = 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.6)] animate-pulse border-2';
                icon = <PlayCircle size={18} className="text-cyan-300" />;
              } else {
                nodeStyle = 'bg-slate-900 border-slate-700 text-slate-600 opacity-60';
                icon = <Lock size={14} className="text-slate-600" />;
              }

              return (
                <div key={node.id}
                  className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full border flex flex-col items-center justify-center z-10 transition-all duration-300 cursor-pointer backdrop-blur-sm group hover:scale-110 ${nodeStyle}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => handleNodeClick(node, locked)}
                >
                  <div className="mb-0.5">{icon}</div>
                  <div className="text-[10px] font-bold tracking-tighter whitespace-nowrap px-1 max-w-[60px] overflow-hidden text-ellipsis text-center leading-tight">
                    {locked ? '???' : node.title}
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