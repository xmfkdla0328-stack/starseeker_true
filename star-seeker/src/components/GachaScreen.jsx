import React, { useState } from 'react';
import { ChevronLeft, Hexagon } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/characterData'; 
import GachaMainView from './gacha/GachaMainView';
import GachaIntroView from './gacha/GachaIntroView';
import GachaRevealView from './gacha/GachaRevealView'; // [신규 추가]
import GachaResultView from './gacha/GachaResultView';

const DROP_RATES = {
    '5_STAR': 0.02, 
    '4_STAR': 0.08, 
    '3_STAR': 0.30, 
    '2_STAR': 0.60  
};
const GACHA_COST = 100;

const GachaHeader = ({ onBack, stoneCount }) => (
    <div className="flex items-center justify-between p-4 z-20">
        <button 
            onClick={onBack} 
            className="p-2 text-slate-400 hover:text-white transition-colors"
        >
            <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-violet-500/30 shadow-inner">
            <Hexagon size={16} className="text-violet-400 fill-violet-400/20" />
            <span className="text-violet-100 font-bold font-mono text-sm">{stoneCount.toLocaleString()}</span>
        </div>
    </div>
);

export default function GachaScreen({ roster, setRoster, inventory, setInventory, consumeResource, onBack }) {
  // [흐름 변경] 'main' -> 'intro' -> 'reveal' -> 'result'
  const [viewState, setViewState] = useState('main'); 
  const [results, setResults] = useState([]); 

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
    setViewState('intro'); // 인트로 연출 시작
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] overflow-hidden">
      
      {/* 배경 이펙트 */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

      {/* 헤더 (인트로, 리빌 중에는 숨김) */}
      {(viewState === 'main' || viewState === 'result') && (
          <GachaHeader onBack={onBack} stoneCount={stoneCount} />
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {viewState === 'intro' && (
            <GachaIntroView 
                // 인트로가 끝나거나 스킵하면 바로 하나씩 까보기(reveal) 화면으로
                onComplete={() => setViewState('reveal')} 
                onSkip={() => setViewState('reveal')} 
            />
        )}

        {viewState === 'reveal' && (
            <GachaRevealView 
                results={results}
                // 다 까보면 결과창(result)으로
                onComplete={() => setViewState('result')} 
            />
        )}

        {viewState === 'result' && (
            <GachaResultView 
                results={results} 
                onConfirm={() => setViewState('main')} 
            />
        )}

        {viewState === 'main' && (
            <GachaMainView 
                onGacha={handleGacha} 
            />
        )}
        
      </div>
    </div>
  );
}