import React from 'react';

export default function GachaResultCard({ char, delayIdx }) {
    // 5성 여부에 따른 스타일 분기 (나중에 이 부분에 파티클 이펙트 등을 추가하기 좋습니다)
    const isHighRank = char.star >= 4;
    const isTopRank = char.star === 5; // 5성 전용 체크

    return (
        <div 
            className={`p-2 rounded-xl border flex flex-row items-center gap-3 animate-fade-in-up relative overflow-hidden
                ${isHighRank ? 'bg-amber-900/40 border-amber-500/50' : 'bg-slate-800/40 border-slate-600/50'}`}
            style={{ animationDelay: `${delayIdx * 50}ms` }}
        >
            {/* 등급 배경광 */}
            <div className={`absolute inset-0 opacity-20 ${isHighRank ? 'bg-amber-500' : 'bg-transparent'}`}></div>

            {/* 좌측: 캐릭터 썸네일 */}
            <div className={`w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-slate-700 to-black flex items-center justify-center relative z-10 shadow-lg overflow-hidden border 
                ${isTopRank ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'border-white/10'}`}>
                {char.listImage || char.image ? (
                    <img src={char.listImage || char.image} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                    <span className={`text-xl font-bold ${isHighRank ? 'text-amber-400' : 'text-white'}`}>
                        {char.role.charAt(0)}
                    </span>
                )}
            </div>
            
            {/* 우측: 텍스트 정보 */}
            <div className="flex-1 text-left relative z-10 min-w-0 pr-6">
                <div className="text-xs font-bold text-white truncate">{char.name}</div>
                <div className={`text-[10px] tracking-widest leading-none mt-1 ${isTopRank ? 'text-amber-300 animate-pulse' : 'text-amber-400'}`}>
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
        </div>
    );
}