import React, { useState, useRef } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, Brain, Hexagon, Star, Lock, Hammer, HardDrive, Sparkles, Check } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/gameData';

// --- 노드 배치 및 효과 정의 ---
// 0, 3, 6, 9: Major (큰 노드) / 나머지: Minor (작은 노드)
const NODES_LAYOUT = [
    { index: 0, isMajor: true, statType: 'skillMult', value: 0.2, label: '필살기 위력 강화', subLabel: '+20%' },
    { index: 1, isMajor: false, statType: 'baseAtk', value: 10, label: '공격력 강화', subLabel: '+10' },
    { index: 2, isMajor: false, statType: 'baseDef', value: 5, label: '방어력 강화', subLabel: '+5' },
    { index: 3, isMajor: true, statType: 'normalMult', value: 0.1, label: '평타 위력 강화', subLabel: '+10%' },
    { index: 4, isMajor: false, statType: 'baseHp', value: 50, label: '체력 강화', subLabel: '+50' },
    { index: 5, isMajor: false, statType: 'baseAtk', value: 10, label: '공격력 강화', subLabel: '+10' },
    { index: 6, isMajor: true, statType: 'skillMult', value: 0.2, label: '필살기 위력 강화', subLabel: '+20%' },
    { index: 7, isMajor: false, statType: 'baseHp', value: 50, label: '체력 강화', subLabel: '+50' },
    { index: 8, isMajor: false, statType: 'baseSpd', value: 2, label: '속도 강화', subLabel: '+2' },
    { index: 9, isMajor: true, statType: 'normalMult', value: 0.1, label: '평타 위력 강화', subLabel: '+10%' },
    { index: 10, isMajor: false, statType: 'baseAtk', value: 10, label: '공격력 강화', subLabel: '+10' },
    { index: 11, isMajor: false, statType: 'baseDef', value: 5, label: '방어력 강화', subLabel: '+5' },
];

export default function ManagementScreen({ roster, inventory, onUnlockNode, onBack }) {
  if (!roster || roster.length === 0) return <div>No Character Data</div>;

  const [selectedCharId, setSelectedCharId] = useState(roster[0].id);
  const [activeTab, setActiveTab] = useState('status'); 
  
  // 드래그 스크롤
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const selectedChar = roster.find(c => c.id === selectedCharId) || roster[0];
  const chipCount = inventory.find(i => i.id === 'chip_basic')?.count || 0;
  const coreCount = inventory.find(i => i.id === 'core_essence')?.count || 0;

  const onMouseDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const onMouseLeave = () => { isDown.current = false; isDragging.current = false; };
  const onMouseUp = () => { isDown.current = false; };
  const onMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 5) {
        isDragging.current = true;
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };
  const handleCharClick = (charId) => {
    if (isDragging.current) { isDragging.current = false; return; }
    setSelectedCharId(charId);
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] text-slate-100">
      {/* 1. 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3 text-xs font-mono">
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-white/5">
                <HardDrive size={12} className="text-cyan-400" />
                <span className="text-cyan-200">{chipCount}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-white/5">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-amber-200">{coreCount}</span>
            </div>
        </div>
      </div>

      {/* 2. 캐릭터 리스트 */}
      <div className="w-full bg-white/5 border-b border-white/10 py-3">
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto px-4 gap-3 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
        >
            {roster.map((char) => {
                const isSelected = char.id === selectedCharId;
                return (
                    <button 
                        key={char.id}
                        onClick={() => handleCharClick(char.id)}
                        onDragStart={(e) => e.preventDefault()}
                        className={`flex-shrink-0 w-14 h-14 rounded-full border-2 relative overflow-hidden transition-transform duration-200
                            ${isSelected ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110' : 'border-slate-600 opacity-60 grayscale hover:opacity-100'}`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${char.color}`}></div>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white/90 drop-shadow-md">{char.role.charAt(0)}</span>
                    </button>
                );
            })}
            <div className="w-4 flex-shrink-0"></div> 
        </div>
        <div className="text-center mt-1">
            <span className="text-lg font-bold text-white tracking-widest drop-shadow-lg">{selectedChar.name}</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                {selectedChar.role} CLASS • {'★'.repeat(selectedChar.star)}
            </p>
        </div>
      </div>

      {/* 3. 탭 버튼 */}
      <div className="flex border-b border-white/10">
        <button onClick={() => setActiveTab('status')} className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors ${activeTab === 'status' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}>STATUS</button>
        <button onClick={() => setActiveTab('upgrade')} className={`flex-1 py-3 text-sm font-bold tracking-wider transition-colors ${activeTab === 'upgrade' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-900/10' : 'text-slate-500 hover:text-slate-300'}`}>UPGRADE</button>
      </div>

      {/* 4. 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4 relative">
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

function StatusPanel({ char }) {
    const efficiencyPercent = Math.round((char.efficiency || 1.0) * 100);
    // [수정] 현재 적용된 실제 배율도 표시 (기본값 대비 증가량 확인용)
    const normalMult = (char.normalMult || 1.0).toFixed(1);
    const skillMult = (char.skillMult || 2.5).toFixed(1);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <h3 className="text-xs text-slate-400 mb-2 font-mono">BIO-DATA</h3>
                <p className="text-sm text-slate-200 leading-relaxed font-light">"{char.desc}"</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Heart} label="MAX HP" value={char.baseHp} color="text-rose-400" />
                <StatCard icon={Sword} label="ATK" value={char.baseAtk} color="text-amber-400" />
                <StatCard icon={Shield} label="DEF" value={char.baseDef} color="text-emerald-400" />
                <StatCard icon={Zap} label="SPD" value={char.baseSpd} color="text-violet-400" />
                <StatCard icon={Brain} label="Efficiency" value={`${efficiencyPercent}%`} color="text-cyan-400" />
                <StatCard icon={Star} label="Star Rank" value={`${char.star} ★`} color="text-yellow-400" />
            </div>
            {/* 배율 정보 추가 */}
            <div className="flex gap-2">
                <div className="flex-1 p-2 bg-white/5 rounded border border-white/5 text-center">
                    <span className="text-[10px] text-slate-400 block">평타 배율</span>
                    <span className="text-sm font-mono text-slate-200">x{normalMult}</span>
                </div>
                <div className="flex-1 p-2 bg-white/5 rounded border border-white/5 text-center">
                    <span className="text-[10px] text-slate-400 block">필살기 배율</span>
                    <span className="text-sm font-mono text-slate-200">x{skillMult}</span>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded bg-black/30 ${color}`}><Icon size={14} /></div>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider">{label}</span>
            </div>
            <span className="text-sm font-mono text-white">{value}</span>
        </div>
    );
}

// --- [UpgradePanel] ---
function UpgradePanel({ char, onUnlockNode, chipCount, coreCount }) {
    const unlockedNodes = char.unlockedNodes || [];
    const [selectedNodeInfo, setSelectedNodeInfo] = useState(null); // 클릭한 노드 정보 (모달용)
    const [previewNodeInfo, setPreviewNodeInfo] = useState(null);   // 미리보기용 정보 (하단 패널용)

    const nodes = NODES_LAYOUT.map((layout) => {
        const angle = (layout.index * 30 - 90) * (Math.PI / 180);
        const radius = 110;
        return { 
            ...layout,
            x: Math.cos(angle) * radius, 
            y: Math.sin(angle) * radius,
        };
    });

    const handleNodeClick = (node) => {
        if (unlockedNodes.includes(node.index)) return; // 이미 해금됨
        setSelectedNodeInfo(node); // 모달 띄우기
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
        <div className="flex flex-col items-center justify-center py-10 animate-fade-in relative h-full">
            
            {/* 강화 모달창 */}
            {selectedNodeInfo && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-6">
                    <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Hammer size={18} className="text-amber-400" /> 
                            노드 활성화
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                <span className="text-xs text-slate-400 block mb-1">소모 재료</span>
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    {selectedNodeInfo.isMajor 
                                        ? <><Sparkles size={14} className="text-amber-400"/> 비물질 데이터 보강칩 <span className="text-amber-400 font-bold">x1</span></>
                                        : <><HardDrive size={14} className="text-cyan-400"/> 데이터 보강칩 <span className="text-cyan-400 font-bold">x5</span></>
                                    }
                                </div>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                <span className="text-xs text-slate-400 block mb-1">강화 효과</span>
                                <div className="text-sm font-bold text-white">
                                    {selectedNodeInfo.label} <span className="text-emerald-400 ml-1">{selectedNodeInfo.subLabel}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setSelectedNodeInfo(null)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                            >
                                취소
                            </button>
                            <button 
                                onClick={handleConfirmUnlock}
                                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-900/50 transition-colors"
                            >
                                활성화
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 원형 그래프 */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                    {nodes.map((node) => (
                        <line 
                            key={`line-${node.index}`}
                            x1="50%" y1="50%" 
                            x2={`calc(50% + ${node.x}px)`} 
                            y2={`calc(50% + ${node.y}px)`}
                            stroke={unlockedNodes.includes(node.index) ? "#fbbf24" : "rgba(255,255,255,0.1)"}
                            strokeWidth="1"
                            className="transition-colors duration-500"
                        />
                    ))}
                    <circle cx="50%" cy="50%" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </svg>

                <div className="absolute z-20 w-24 h-24 rounded-full border-4 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-900">
                    <div className={`w-full h-full bg-gradient-to-br ${char.color} opacity-80 flex items-center justify-center`}>
                        <span className="text-3xl font-bold text-white">{char.role.charAt(0)}</span>
                    </div>
                </div>

                {nodes.map((node) => {
                    const isUnlocked = unlockedNodes.includes(node.index);
                    return (
                        <button
                            key={node.index}
                            className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300 z-30 cursor-pointer
                                ${node.isMajor ? 'w-12 h-12' : 'w-8 h-8'}
                                ${isUnlocked 
                                    ? 'bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110' 
                                    : 'bg-slate-900 border-slate-600 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                }
                            `}
                            style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                            onClick={() => handleNodeClick(node)}
                            onMouseEnter={() => setPreviewNodeInfo(node)} // 마우스 오버 시 정보 표시
                            onMouseLeave={() => setPreviewNodeInfo(null)}
                        >
                            {isUnlocked ? (
                                node.isMajor ? <Star size={20} className="text-white fill-white" /> : <Check size={14} className="text-white" />
                            ) : (
                                node.isMajor ? <Lock size={16} className="text-slate-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 하단 설명 패널 (미리보기) */}
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