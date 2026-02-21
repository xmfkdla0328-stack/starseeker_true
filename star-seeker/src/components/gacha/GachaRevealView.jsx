import React, { useState } from 'react';
import { FastForward, Star, Hexagon } from 'lucide-react';

export default function GachaRevealView({ results, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animKey, setAnimKey] = useState(0); 

    const currentChar = results[currentIndex];

    // 화면 터치 시: 바로 다음 캐릭터로 넘기기
    const handleNext = () => {
        if (currentIndex < results.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setAnimKey(prev => prev + 1);
        } else {
            onComplete(); // 끝까지 다 봤으면 결과창으로
        }
    };

    // 스킵 버튼 클릭 시: 다음 5성이나 NEW 캐릭터를 찾아 점프
    const handleSkip = (e) => {
        e.stopPropagation(); 
        
        let targetIndex = results.length; 
        for (let i = currentIndex + 1; i < results.length; i++) {
            // [Mod] 아이템(파편)이 아니면서, 5성이거나 중복이 아닌(NEW) 캐릭터일 때 스톱
            if (!results[i].isItem && (results[i].star === 5 || !results[i].isDupe)) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex < results.length) {
            setCurrentIndex(targetIndex);
            setAnimKey(prev => prev + 1);
        } else {
            onComplete(); 
        }
    };

    const isHighRank = currentChar.star >= 4;
    const isTopRank = currentChar.star === 5;
    const isItem = currentChar.isItem; // 파편 여부 확인

    return (
        <div 
            className="absolute inset-0 z-40 bg-[#0f172a] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            onClick={handleNext}
        >
            {/* 등급별 배경 오라(Aura) 효과 */}
            <div className={`absolute inset-0 opacity-30 transition-colors duration-300
                ${isTopRank ? 'bg-[radial-gradient(circle,rgba(251,191,36,0.3)_0%,transparent_70%)]' : 
                  isHighRank && !isItem ? 'bg-[radial-gradient(circle,rgba(167,139,250,0.3)_0%,transparent_70%)]' : 
                  'bg-[radial-gradient(circle,rgba(56,189,248,0.15)_0%,transparent_70%)]'}`} 
            />

            {/* 빛이 정교하게 퍼져나가는 (Light spreading out) 등장 이펙트 */}
            <div key={`burst-${animKey}`} className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_150px_80px_rgba(255,255,255,0.8)] animate-[ping_0.5s_ease-out_forwards] opacity-0"></div>
            </div>

            {/* 카드 및 정보 표시 영역 */}
            <div key={animKey} className="relative z-10 flex flex-col items-center animate-fade-in-up">
                
                {/* 5성 전용 뒤쪽 후광 효과 */}
                {isTopRank && !isItem && (
                    <div className="absolute inset-0 bg-amber-400 blur-[80px] opacity-20 animate-pulse pointer-events-none"></div>
                )}

                {/* 카드 컨테이너 */}
                <div className={`w-48 h-64 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border shadow-2xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center relative transition-transform duration-300
                    ${isTopRank ? 'border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.6)] scale-105' : 
                      isHighRank && !isItem ? 'border-violet-400/80 shadow-[0_0_30px_rgba(167,139,250,0.3)]' : 
                      isItem ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' :
                      'border-slate-600 shadow-lg'}`}>
                    
                    {/* [Branch] 파편 렌더링 vs 캐릭터 렌더링 */}
                    {isItem ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/80 relative">
                            {/* 파편 아이콘 애니메이션 */}
                            <Hexagon size={64} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-[spin_10s_linear_infinite]" />
                            <Hexagon size={32} className="text-cyan-200 absolute rotate-90" />
                            <span className="text-cyan-300/80 mt-6 text-xs font-mono tracking-widest text-center px-4 leading-relaxed">
                                {currentChar.desc}
                            </span>
                            <div className="absolute top-3 right-3 bg-black/80 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/50 text-xs font-bold font-mono shadow-md">
                                ITEM
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 기존 캐릭터 이미지 렌더링 */}
                            {currentChar.image ? (
                                <img src={currentChar.image} alt={currentChar.name} className="w-full h-full object-cover opacity-90" />
                            ) : (
                                <span className={`text-6xl font-bold ${isTopRank ? 'text-amber-400' : isHighRank ? 'text-violet-400' : 'text-slate-400'}`}>
                                    {currentChar.role.charAt(0)}
                                </span>
                            )}

                            {/* 뉴 / 코어 뱃지 */}
                            {currentChar.isDupe ? (
                                <div className="absolute top-3 right-3 bg-black/80 text-amber-400 px-3 py-1 rounded-full border border-amber-500/50 text-xs font-bold font-mono shadow-md">
                                    +{currentChar.coreReward} CORE
                                </div>
                            ) : (
                                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full border border-red-400/50 text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                                    NEW
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 하단 이름 및 별 렌더링 */}
                <div className="mt-8 text-center relative z-10">
                    <h2 className={`text-3xl font-bold tracking-wider mb-2 drop-shadow-lg
                        ${isItem ? 'text-cyan-100' : 'text-white'}`}>
                        {currentChar.name}
                    </h2>
                    
                    {/* 파편은 별 대신 부가 설명 텍스트, 캐릭터는 기존처럼 별 표시 */}
                    {isItem ? (
                        <div className="text-cyan-400/60 font-mono text-sm tracking-[0.2em]">
                            MATERIAL
                        </div>
                    ) : (
                        <div className="flex justify-center gap-1">
                            {Array.from({ length: currentChar.star }).map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={24} 
                                    className={`${isTopRank ? 'text-amber-300 fill-amber-300 animate-pulse' : 'text-amber-500 fill-amber-500'}`} 
                                    style={{ animationDelay: `${i * 100}ms` }} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 진행 안내 텍스트 */}
            <div className="absolute bottom-12 text-slate-400 text-sm tracking-[0.3em] animate-pulse">
                TAP TO CONTINUE
            </div>

            {/* 스킵 버튼 */}
            <button 
                onClick={handleSkip}
                className="absolute top-6 right-6 z-50 flex items-center gap-1 px-4 py-2 bg-black/40 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white transition-all active:scale-95 shadow-lg"
            >
                <span className="tracking-widest font-bold">SKIP</span>
                <FastForward size={14} />
            </button>
        </div>
    );
}