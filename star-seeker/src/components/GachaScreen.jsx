import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Hexagon } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/characterData'; 
import GachaMainView from './gacha/GachaMainView';
import GachaResultView from './gacha/GachaResultView';

const DROP_RATES = {
    '5_STAR': 0.02, 
    '4_STAR': 0.08, 
    '3_STAR': 0.30, 
    '2_STAR': 0.60  
};
const GACHA_COST = 100;

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

    // 연출 타이머
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

      {/* 3. 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {isAnimating ? (
            /* (1) 연출 중 화면 */
            <div className="text-center animate-pulse w-full">
                <Sparkles size={64} className="text-violet-400 mx-auto mb-4 animate-spin-slow" />
                <h2 className="text-2xl font-bold text-white tracking-widest">CONNECTING TO VOID...</h2>
            </div>
        ) : showResult ? (
            /* (2) 결과 화면 (컴포넌트로 분리됨) */
            <GachaResultView 
                results={results} 
                onConfirm={() => setShowResult(false)} 
            />
        ) : (
            /* (3) 기본 대기 화면 (컴포넌트로 분리됨) */
            <GachaMainView 
                onGacha={handleGacha} 
            />
        )}
      </div>
    </div>
  );
}