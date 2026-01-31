import React, { useState } from 'react';
import { STORY_CHAPTERS, STORY_NODES, STORY_EDGES } from '../../data/storyData';

export default function CausalityTreeTab({ visitedNodes }) {
  const [selectedChapter, setSelectedChapter] = useState(STORY_CHAPTERS[0].id);
  const nodes = STORY_NODES[selectedChapter] || [];
  const edges = STORY_EDGES[selectedChapter] || [];

  // 노드 상태 확인
  const checkVisited = (nodeId) => {
    // 테스트용: 'node_start' 등은 기본적으로 방문 처리
    return ['node_start', 'node_1', 'node_2a', 'node_3'].includes(nodeId) || visitedNodes.includes(nodeId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 챕터 선택기 */}
      <div className="flex overflow-x-auto gap-2 p-3 border-b border-white/10 bg-black/20">
        {STORY_CHAPTERS.map(chap => (
          <button key={chap.id} onClick={() => setSelectedChapter(chap.id)}
            className={`px-3 py-1 text-xs rounded-full border transition-all whitespace-nowrap
            ${selectedChapter === chap.id ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            {chap.title}
          </button>
        ))}
      </div>

      {/* 트리 캔버스 */}
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-[#0b101b] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[300px] h-[500px]">
            {/* 연결선 (Edges) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {edges.map((edge, idx) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const isActive = checkVisited(fromNode.id) && checkVisited(toNode.id);

                return (
                  <line key={idx}
                    x1={`${fromNode.x}%`} y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`} y2={`${toNode.y}%`}
                    stroke={isActive ? "#34d399" : "#334155"}
                    strokeWidth={isActive ? "2" : "1"}
                    strokeDasharray={isActive ? "0" : "4 2"}
                    className="transition-colors duration-500"
                  />
                );
              })}
            </svg>

            {/* 노드 (Nodes) */}
            {nodes.map((node) => {
              const isVisited = checkVisited(node.id);
              return (
                <div key={node.id}
                  className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-center z-10 transition-all duration-300 cursor-pointer
                      ${isVisited
                      ? 'bg-emerald-900 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                      : 'bg-slate-900 border-slate-700 text-slate-600'}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => alert(`Node: ${node.title}`)}
                >
                  {node.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}