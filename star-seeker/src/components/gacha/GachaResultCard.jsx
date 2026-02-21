import React from 'react';
import { Hexagon } from 'lucide-react'; // [NEW] 아이템용 아이콘 임포트

export default function GachaResultCard({ char, delayIdx }) {
    // 등급 및 타입 체크
    const isHighRank = char.star >= 4;
    const isTopRank = char.star === 5; 
    const isItem = char.isItem; // [NEW] 파편 아이템 여부 체크

    // [스타일 정의]

    // 1. 베이스 유리 패널 스타일 (공통)
    const baseGlassStyle = "bg-white/5 backdrop-blur-md border border-white/10";

    // 2. 5성 전용 외곽선 빛 번짐 효과 (아이템은 5성이 없지만 확실히 하기 위해 !isItem 추가)
    const topRankGlowStyle = isTopRank && !isItem
        ? "shadow-[0_0_25px_rgba(251,191,36,0.5)] border-amber-400/60 z-10 scale-[1.02]" 
        : "shadow-sm group hover:bg-white/10 transition-colors"; 

    return (
        <div 
            className={`p-2 rounded-xl flex flex-row items-center gap-3 animate-fade-in-up relative overflow-hidden transition-all duration-500 ease-out
                ${baseGlassStyle}
                ${topRankGlowStyle}`}
            style={{ animationDelay: `${delayIdx * 50}ms` }}
        >
            {/* 좌측: 캐릭터 썸네일 or 아이템 아이콘 */}
            <div className={`w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-slate-800 to-black flex items-center justify-center relative z-20 shadow-lg overflow-hidden border transition-all duration-300
                ${isTopRank && !isItem ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 
                  isItem ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 
                  'border-white/10 group-hover:border-white/30'}`}>
                
                {/* [Branch] 파편 렌더링 vs 캐릭터 렌더링 */}
                {isItem ? (
                    <Hexagon size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                ) : char.listImage || char.image ? (
                    <img src={char.listImage || char.image} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                    <span className={`text-xl font-bold ${isHighRank ? 'text-amber-400' : 'text-white'}`}>
                        {char.role ? char.role.charAt(0) : '?'}
                    </span>
                )}
            </div>
            
            {/* 우측: 텍스트 정보 */}
            <div className="flex-1 text-left relative z-20 min-w-0 pr-6">
                <div className={`text-xs font-bold truncate transition-colors 
                    ${isTopRank && !isItem ? 'text-amber-100' : 
                      isItem ? 'text-cyan-100' : 'text-slate-200 group-hover:text-white'}`}>
                    {char.name}
                </div>
                {/* 캐릭터는 별점, 아이템은 전용 텍스트 */}
                <div className={`text-[10px] tracking-widest leading-none mt-1 
                    ${isTopRank && !isItem ? 'text-amber-300' : 
                      isItem ? 'text-cyan-400/70 font-mono' : 'text-amber-500/80'}`}>
                    {isItem ? 'MATERIAL' : '★'.repeat(char.star)}
                </div>
            </div>
            
            {/* 뱃지 분기 처리 */}
            {isItem ? (
                <div className="absolute top-2 right-2 bg-slate-900/80 text-[9px] text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 z-20 shadow-md font-mono">
                    ITEM
                </div>
            ) : char.isDupe ? (
                <div className="absolute top-2 right-2 bg-black/80 text-[9px] text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 z-20 shadow-md font-mono">
                    +{char.coreReward}C
                </div>
            ) : (
                <div className="absolute top-2 right-2 bg-red-600/90 text-[9px] text-white px-1.5 py-0.5 rounded font-bold z-20 shadow-md border border-red-400/30">
                    NEW
                </div>
            )}

            {/* 5성 전용: 카드 내부를 은은하게 비추는 빛 (기존 연출 유지) */}
            {isTopRank && !isItem && (
                 <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-200/5 pointer-events-none z-0 animate-pulse-subtle"></div>
            )}
        </div>
    );
}