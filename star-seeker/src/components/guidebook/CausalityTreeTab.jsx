import React, { useState } from 'react';
import { Lock, PlayCircle, CheckCircle2, X, FileText } from 'lucide-react';
import { STORY_CHAPTERS, STORY_NODES, STORY_EDGES } from '../../data/storyData';

export default function CausalityTreeTab({ visitedNodes = [] }) {
  const [selectedChapter, setSelectedChapter] = useState(STORY_CHAPTERS[0].id);
  
  // [NEW] 요약본을 볼 노드를 저장하는 상태 (null이면 팝업 닫힘)
  const [summaryNode, setSummaryNode] = useState(null);

  const nodes = STORY_NODES[selectedChapter] || [];
  const edges = STORY_EDGES[selectedChapter] || [];

  const isNodeVisited = (nodeId) => visitedNodes.includes(nodeId);
  const isNodeAvailable = (nodeId) => {
    if (isNodeVisited(nodeId)) return false; 
    const parentEdges = edges.filter(e => e.to === nodeId);
    if (parentEdges.length === 0) return true; 
    return parentEdges.some(e => isNodeVisited(e.from)); 
  };

  const handleNodeClick = (node, locked, visited) => {
    if (locked) {
      alert("아직 관측할 수 없는 미래입니다.");
      return;
    }
    if (!visited) {
      alert("진행 가능한 사건입니다. 작전 통제실(스토리 모드)에서 진입해 주세요.");
      return;
    }
    // 클리어한 노드(visited)일 경우에만 요약 팝업을 띄웁니다.
    setSummaryNode(node);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] animate-fade-in relative">
      
      {/* 챕터 선택기 */}
      <div className="flex-none overflow-x-auto flex gap-3 p-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-20 scrollbar-hide">
        {STORY_CHAPTERS.map(chap => (
          <button key={chap.id} onClick={() => setSelectedChapter(chap.id)}
            className={`px-4 py-2 text-xs font-bold tracking-widest rounded-lg border transition-all whitespace-nowrap
            ${selectedChapter === chap.id 
                ? 'bg-emerald-900/40 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
            {chap.title}
          </button>
        ))}
      </div>

      {/* 트리 캔버스 */}
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-[#020617] overflow-auto scrollbar-hide">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.05)_0%,transparent_70%)] pointer-events-none"></div>

        <div className="min-w-full min-h-full flex items-center justify-center p-10">
          <div className="relative w-[300px] h-[600px] my-auto">
            
            {/* 연결선 */}
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
                    stroke={isLineActive ? "#34d399" : "#334155"} // 요약본 탭은 에메랄드 톤 유지
                    strokeWidth={isLineActive ? "2" : "1"}
                    strokeDasharray={isLineActive ? "0" : "4 4"}
                    className="transition-colors duration-700"
                    style={{ filter: isLineActive ? 'drop-shadow(0 0 5px rgba(52,211,153,0.5))' : 'none' }}
                  />
                );
              })}
            </svg>

            {/* 노드 */}
            {nodes.map((node) => {
              const visited = isNodeVisited(node.id);
              const available = isNodeAvailable(node.id);
              const locked = !visited && !available;

              let nodeStyle = '';
              let icon = null;

              if (visited) {
                nodeStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-110';
                icon = <CheckCircle2 size={16} className="text-emerald-400" />;
              } else if (available) {
                nodeStyle = 'bg-slate-800 border-slate-500 text-slate-400';
                icon = <PlayCircle size={18} className="text-slate-400" />;
              } else {
                nodeStyle = 'bg-slate-900 border-slate-700 text-slate-600 opacity-60';
                icon = <Lock size={14} className="text-slate-600" />;
              }

              return (
                <div key={node.id}
                  className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full border flex flex-col items-center justify-center z-10 transition-all duration-300 cursor-pointer backdrop-blur-sm group ${nodeStyle}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => handleNodeClick(node, locked, visited)}
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

      {/* [NEW] 스토리 요약본 팝업 (Modal) */}
      {summaryNode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl w-full max-w-sm shadow-2xl relative flex flex-col overflow-hidden">
            {/* 상단 장식선 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-transparent"></div>
            
            <div className="flex justify-between items-center p-5 border-b border-white/5">
              <h3 className="text-emerald-400 font-bold flex items-center gap-2 tracking-widest">
                <FileText size={18} />
                사건 기록
              </h3>
              <button onClick={() => setSummaryNode(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="text-xl font-bold text-white mb-2">{summaryNode.title}</h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-black/40 p-4 rounded-lg border border-white/5 whitespace-pre-wrap min-h-[100px]">
                {/* 데이터에 summary가 없다면 임시 텍스트 출력 */}
                {summaryNode.summary || "데이터 손상. 요약본을 복구할 수 없습니다. \n(storyData.js에 summary 속성을 추가해주세요.)"}
              </p>
            </div>
            
            <div className="p-4 bg-slate-950/50 flex justify-end border-t border-white/5">
               <button onClick={() => setSummaryNode(null)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors">
                 닫기
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}