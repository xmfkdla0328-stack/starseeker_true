import React from 'react';
import { Star, Lock, Check } from 'lucide-react';

// 노드 데이터 정의
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

export default function UpgradeNodeGraph({ char, onNodeClick, onNodeHover }) {
  const unlockedNodes = char.unlockedNodes || [];

  // 원형 좌표 계산
  const nodes = NODES_LAYOUT.map((layout) => {
    const angle = (layout.index * 30 - 90) * (Math.PI / 180);
    const radius = 110;
    return {
      ...layout,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  return (
    <div className="relative w-[300px] h-[300px] flex items-center justify-center">
      {/* 배경 연결선 (SVG) */}
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

      {/* 중앙 캐릭터 아이콘 */}
      <div className="absolute z-20 w-24 h-24 rounded-full border-4 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-900">
        <div className={`w-full h-full bg-gradient-to-br ${char.color} opacity-80 flex items-center justify-center`}>
          <span className="text-3xl font-bold text-white">{char.role.charAt(0)}</span>
        </div>
      </div>

      {/* 노드 버튼들 */}
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
            onClick={() => onNodeClick(node)}
            onMouseEnter={() => onNodeHover(node)}
            onMouseLeave={() => onNodeHover(null)}
          >
            {isUnlocked ? (
              node.isMajor ? <Star size={20} className="text-white fill-white" /> : <CheckIcon />
            ) : (
              node.isMajor ? <Lock size={16} className="text-slate-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);