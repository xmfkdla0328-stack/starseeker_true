import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Hexagon } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/characterData'; 

const DROP_RATES = {
    '5_STAR': 0.02, // 2%
    '4_STAR': 0.08, // 8%
    '3_STAR': 0.30, // 30%
    '2_STAR': 0.60  // 60%
};

const GACHA_COST = 100;

// ----------------------------------------------------------------------
// [Sub Component] 1. 상단 헤더
// ----------------------------------------------------------------------
const GachaHeader = ({ onBack, isAnimating, stoneCount }) => (
    <div className="flex items-center justify-between p-4 z-20">
        <button 
            onClick={onBack} 
            disabled={isAnimating}
            className={`p-2 transition-colors ${isAnimating ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
        >
            <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-violet-500/30">
            <Hexagon size={16} className="text-violet-400 fill-violet-400/20" />
            <span className="text-violet-100 font-bold font-mono text-sm">{stoneCount.toLocaleString()}</span>
        </div>
    </div>
);

// ----------------------------------------------------------------------
// [Sub Component] 2. 기본 가챠 진입 화면
// ----------------------------------------------------------------------
const GachaMainView = ({ onGacha }) => (
    <div className="text-center space-y-8 animate-fade-in">
        <div className="relative">
            <div className="absolute inset-0 bg-violet-500 blur-[100px] opacity-20"></div>
            <Hexagon size={120} className="text-violet-200 relative z-10 drop-shadow-[0_0_30px_rgba(167,139,250,0.5)] animate-float" strokeWidth={0.5} />
        </div>
        
        <div>
            <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2">
                ALTER<span className="text-violet-400">VOID</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest">
                POSSIBILITY MATERIALIZATION SYSTEM
            </p>
        </div>

        <div className="flex gap-4 w-full max-w-sm px-4 mx-auto">
            <button 
                onClick={() => onGacha(1)}
                className="flex-1 py-4 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all flex flex-col items-center gap-1 group active:scale-95"
            >
                <span className="text-sm font-bold text-white group-hover:text-violet-200">1 PULL</span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Hexagon size={10} className="fill-violet-500 text-violet-500" />
                    <span>100</span>
                </div>
            </button>
            
            <button 
                onClick={() => onGacha(10)}
                className="flex-1 py-4 rounded-xl bg-gradient-to-br from-violet-900 to-fuchsia-900 border border-violet-500 hover:border-fuchsia-400 transition-all flex flex-col items-center gap-1 shadow-lg shadow-violet-900/30 active:scale-95 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="text-sm font-bold text-white relative z-10">10 PULL</span>
                <div className="flex items-center gap-1 text-xs text-violet-200 relative z-10">
                    <Hexagon size={10} className="fill-violet-300 text-violet-300" />
                    <span>1,000</span>
                </div>
            </button>
        </div>
    </div>
);

// ----------------------------------------------------------------------
// [Sub Component] 3. 결과 개별 카드 (가로형 컴팩트로 수정)
// ----------------------------------------------------------------------
const GachaResultCard = ({ char, delayIdx }) => (
    <div 
        className={`p-2 rounded-xl border flex flex-row items-center gap-3 animate-fade-in-up relative overflow-hidden
            ${char.star >= 4 ? 'bg-amber-900/40 border-amber-500/50' : 'bg-slate-800/40 border-slate-600/50'}`}
        style={{ animationDelay: `${delayIdx * 50}ms` }} /* 등장 속도도 조금 빠르게 조정 */
    >
        {/* 등급 배경광 */}
        <div className={`absolute inset-0 opacity-20 ${char.star >= 4 ? 'bg-amber-500' : 'bg-transparent'}`}></div>

        {/* 좌측: 캐릭터 썸네일 */}
        <div className="w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-slate-700 to-black flex items-center justify-center relative z-10 shadow-lg overflow-hidden border border-white/10">
            {char.listImage || char.image ? (
                <img src={char.listImage || char.image} alt={char.name} className="w-full h-full object-cover" />
            ) : (
                <span className={`text-xl font-bold ${char.star >= 4 ? 'text-amber-400' : 'text-white'}`}>
                    {char.role.charAt(0)}
                </span>
            )}
        </div>
        
        {/* 우측: 텍스트 정보 */}
        <div className="flex-1 text-left relative z-10 min-w-0 pr-6"> {/* 뱃지 공간을 위해 우측 여백 확보 */}
            <div className="text-xs font-bold text-white truncate">{char.name}</div>
            <div className="text-[10px] text-amber-400 tracking-widest leading-none mt-1">
                {'★'.repeat(char.star)}
            </div>
        </div>
        
        {/* 중복/신규 뱃지 (우측 상단으로 통일) */}
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

// ----------------------------------------------------------------------
// [Sub Component] 4. 전체 결과창
// ----------------------------------------------------------------------
const GachaResultView = ({ results, onConfirm }) => (
    <div className="w-full h-full flex flex-col">
        <h2 className="text-center text-lg font-bold text-white mb-4 tracking-widest border-b border-white/10 pb-3 shrink-0">
            ACQUISITION RESULT
        </h2>
        {/* 그리드 간격을 줄여서 세로 공간 확보 */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
            <div className="grid grid-cols-2 gap-2">
                {results.map((char, idx) => (
                    <GachaResultCard key={idx} char={char} delayIdx={idx} />
                ))}
            </div>
        </div>
        {/* 결과 확인 버튼 */}
        <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-30 pointer-events-none">
            <button 
                onClick={onConfirm}
                className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] pointer-events-auto active:scale-95"
            >
                CONFIRM
            </button>
        </div>
    </div>
);

// ----------------------------------------------------------------------
// [Main Component] Gacha Screen
// ----------------------------------------------------------------------
export default function GachaScreen({ roster, setRoster, inventory, setInventory, consumeResource, onBack }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [results, setResults] = useState([]); 
  const [showResult, setShowResult] = useState(false);

  const stoneCount = inventory.find(i => i.id === 'causality_stone')?.count || 0;

  const handleGacha = (count) => {
    const totalCost = count * GACHA_COST;
    if (stoneCount < totalCost) {
        alert(`인과석이 부족합니다! (필요: ${totalCost}, 보유: ${stoneCount})`);
        return;
    }

    consumeResource('causality_stone', totalCost);

    const newResults = [];
    const newRoster = [...roster];
    let earnedCores = 0; 

    for (let i = 0; i < count; i++) {
        const rand = Math.random();
        let rank = 2;
        
        if (rand < DROP_RATES['5_STAR']) rank = 5;
        else if (rand < DROP_RATES['5_STAR'] + DROP_RATES['4_STAR']) rank = 4;
        else if (rand < DROP_RATES['5_STAR'] + DROP_RATES['4_STAR'] + DROP_RATES['3_STAR']) rank = 3;
        else rank = 2;

        let pool = ALL_CHARACTERS.filter(c => c.star === rank);
        
        if (!pool || pool.length === 0) {
            pool = ALL_CHARACTERS.filter(c => c.star === 1 || c.star === 2);
            if (pool.length === 0) pool = ALL_CHARACTERS;
        }

        const pickedChar = pool[Math.floor(Math.random() * pool.length)];
        const isDupe = newRoster.some(c => c.id === pickedChar.id);
        
        if (isDupe) {
            const coreReward = pickedChar.star >= 5 ? 2 : 1;
            earnedCores += coreReward;
            newResults.push({ ...pickedChar, isDupe: true, coreReward });
        } else {
            newRoster.push({ ...pickedChar, level: 1, exp: 0, equipped: [null, null, null], unlockedNodes: [] });
            newResults.push({ ...pickedChar, isDupe: false });
        }
    }

    setRoster(newRoster);
    if (earnedCores > 0) {
        setInventory(prev => {
            const exists = prev.find(i => i.id === 'core_essence');
            if (exists) {
                return prev.map(i => i.id === 'core_essence' ? { ...i, count: i.count + earnedCores } : i);
            }
            return [...prev, { id: 'core_essence', count: earnedCores }];
        });
    }

    setResults(newResults);
    setIsAnimating(true);
    setShowResult(false);

    setTimeout(() => {
        setIsAnimating(false);
        setShowResult(true);
    }, 2000); 
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] overflow-hidden">
      
      {/* 1. 배경 이펙트 */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

      {/* 2. 상단 헤더 */}
      <GachaHeader 
        onBack={onBack} 
        isAnimating={isAnimating} 
        stoneCount={stoneCount} 
      />

      {/* 3. 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {isAnimating ? (
            /* (1) 연출 중 화면 */
            <div className="text-center animate-pulse">
                <Sparkles size={64} className="text-violet-400 mx-auto mb-4 animate-spin-slow" />
                <h2 className="text-2xl font-bold text-white tracking-widest">CONNECTING TO VOID...</h2>
            </div>
        ) : showResult ? (
            /* (2) 결과 화면 */
            <GachaResultView 
                results={results} 
                onConfirm={() => setShowResult(false)} 
            />
        ) : (
            /* (3) 기본 대기 화면 */
            <GachaMainView 
                onGacha={handleGacha} 
            />
        )}
      </div>
    </div>
  );
}