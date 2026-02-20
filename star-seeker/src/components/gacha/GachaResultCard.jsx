import React from 'react';

export default function GachaResultCard({ char, delayIdx }) {
    // 등급 체크
    const isHighRank = char.star >= 4;
    const isTopRank = char.star === 5; // 5성 전용 체크

    // [스타일 정의]

    // 1. 베이스 유리 패널 스타일 (공통)
    // bg-white/5: 아주 투명한 흰색 배경
    // backdrop-blur-md: 배경을 흐리게 해서 유리 느낌
    // border-white/10: 기본 테두리는 거의 안 보이게
    const baseGlassStyle = "bg-white/5 backdrop-blur-md border border-white/10";

    // 2. 5성 전용 외곽선 빛 번짐 효과
    // shadow-[0_0_25px_rgba(251,191,36,0.5)]: x=0, y=0, blur=25px, amber색상(반투명) -> 은은한 빛
    // border-amber-400/60: 테두리 자체도 금색으로
    // z-10: 빛나는 효과가 다른 카드들보다 위에 오도록
    const topRankGlowStyle = isTopRank
        ? "shadow-[0_0_25px_rgba(251,191,36,0.5)] border-amber-400/60 z-10 scale-[1.02]" // 살짝 더 커보이게 scale 추가
        : "shadow-sm group hover:bg-white/10 transition-colors"; // 일반 카드는 호버 시 살짝 밝아짐

    return (
        <div 
            className={`p-2 rounded-xl flex flex-row items-center gap-3 animate-fade-in-up relative overflow-hidden transition-all duration-500 ease-out
                ${baseGlassStyle}
                ${topRankGlowStyle}`}
            style={{ animationDelay: `${delayIdx * 50}ms` }}
        >
            {/* (기존의 내부 배경색 div는 무색 유리 느낌을 위해 제거했습니다) */}

            {/* 좌측: 캐릭터 썸네일 */}
            <div className={`w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-slate-800 to-black flex items-center justify-center relative z-20 shadow-lg overflow-hidden border transition-all duration-300
                ${isTopRank ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'border-white/10 group-hover:border-white/30'}`}>
                {char.listImage || char.image ? (
                    <img src={char.listImage || char.image} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                    <span className={`text-xl font-bold ${isHighRank ? 'text-amber-400' : 'text-white'}`}>
                        {char.role.charAt(0)}
                    </span>
                )}
            </div>
            
            {/* 우측: 텍스트 정보 */}
            <div className="flex-1 text-left relative z-20 min-w-0 pr-6">
                <div className={`text-xs font-bold truncate transition-colors ${isTopRank ? 'text-amber-100' : 'text-slate-200 group-hover:text-white'}`}>
                    {char.name}
                </div>
                <div className={`text-[10px] tracking-widest leading-none mt-1 ${isTopRank ? 'text-amber-300' : 'text-amber-500/80'}`}>
                    {'★'.repeat(char.star)}
                </div>
            </div>
            
            {/* 뱃지 */}
            {char.isDupe ? (
                <div className="absolute top-2 right-2 bg-black/80 text-[9px] text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 z-20 shadow-md font-mono">
                    +{char.coreReward}C
                </div>
            ) : (
                <div className="absolute top-2 right-2 bg-red-600/90 text-[9px] text-white px-1.5 py-0.5 rounded font-bold z-20 shadow-md border border-red-400/30">
                    NEW
                </div>
            )}

            {/* 5성 전용: 카드 내부를 은은하게 비추는 빛 (선택 사항 - 너무 과하면 제거 가능) */}
            {isTopRank && (
                 <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-200/5 pointer-events-none z-0 animate-pulse-subtle"></div>
            )}
        </div>
    );
}