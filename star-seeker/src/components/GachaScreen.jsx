import React, { useState } from 'react';
import { ChevronLeft, Hexagon } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/characterData'; 
import { generateEquipment, EQUIP_SLOTS } from '../data/equipmentData';

import GachaMainView from './gacha/GachaMainView';
import GachaIntroView from './gacha/GachaIntroView';
import GachaRevealView from './gacha/GachaRevealView'; 
import GachaResultView from './gacha/GachaResultView';

// --- 가챠 설정 상수 ---
const DROP_RATES = {
    '5_STAR': 0.03, // 5성 캐릭터 3%
    '4_STAR': 0.05, // 4성 캐릭터 5%
    'FRAGMENT': 0.92 // 기억 파편 92%
};

const GACHA_COST = 100; // [Fix] 누락되었던 캐릭터 가챠 비용 상수 추가
const EQUIP_GACHA_COST = 10; // 기억 세공 1뽑당 파편 비용

// --- 헤더 컴포넌트 ---
const GachaHeader = ({ onBack, stoneCount, fragmentCount }) => (
    <div className="flex items-center justify-between p-4 z-20">
        <button 
            onClick={onBack} 
            className="p-2 text-slate-400 hover:text-white transition-colors"
        >
            <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
            {/* 기억 파편 (하늘색) */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-cyan-500/30 shadow-inner">
                <Hexagon size={14} className="text-cyan-400 fill-cyan-400/20" />
                <span className="text-cyan-100 font-bold font-mono text-xs">{fragmentCount.toLocaleString()}</span>
            </div>
            {/* 인과석 (보라색) */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-violet-500/30 shadow-inner">
                <Hexagon size={14} className="text-violet-400 fill-violet-400/20" />
                <span className="text-violet-100 font-bold font-mono text-xs">{stoneCount.toLocaleString()}</span>
            </div>
        </div>
    </div>
);

export default function GachaScreen({ roster, setRoster, inventory, setInventory, consumeResource, addEquipment, onBack }) {
  const [viewState, setViewState] = useState('main'); 
  const [results, setResults] = useState([]); 

  const stoneCount = inventory.find(i => i.id === 'causality_stone')?.count || 0;
  const fragmentCount = inventory.find(i => i.id === 'memory_fragment')?.count || 0;

  const handleGacha = (count, type = 'character') => {
    
    // ==========================================
    // 1. [기억 세공] 장비 뽑기 로직
    // ==========================================
    if (type === 'equipment') {
        const totalCost = count * EQUIP_GACHA_COST;
        if (fragmentCount < totalCost) {
            alert(`기억 파편이 부족합니다! (필요: ${totalCost}, 보유: ${fragmentCount})`);
            return;
        }

        consumeResource('memory_fragment', totalCost);

        const newResults = [];
        for (let i = 0; i < count; i++) {
            const newEquip = generateEquipment(EQUIP_SLOTS.SLOT_3);
            if (addEquipment) addEquipment(newEquip);

            newResults.push({
                id: newEquip.id,
                name: "기억 세공",
                isItem: true,
                star: 5,
                desc: `[${newEquip.memorySkill}] ${newEquip.memoryEffect.label}`
            });
        }

        setResults(newResults);
        setViewState('intro'); 
        return;
    }

    // ==========================================
    // 2. [캐릭터] 가챠 로직
    // ==========================================
    const totalCost = count * GACHA_COST; // 이제 여기서 에러가 나지 않습니다.
    if (stoneCount < totalCost) {
        alert(`인과석이 부족합니다! (필요: ${totalCost}, 보유: ${stoneCount})`);
        return;
    }

    consumeResource('causality_stone', totalCost);

    const newResults = [];
    const newRoster = [...roster];
    
    let earnedCores = 0; 
    let earnedFragments = 0; 

    for (let i = 0; i < count; i++) {
        const rand = Math.random();
        
        if (rand < DROP_RATES['5_STAR'] + DROP_RATES['4_STAR']) {
            const rank = rand < DROP_RATES['5_STAR'] ? 5 : 4;
            let pool = ALL_CHARACTERS.filter(c => c.star === rank);
            if (!pool || pool.length === 0) pool = ALL_CHARACTERS; 

            const pickedChar = pool[Math.floor(Math.random() * pool.length)];
            const isDupe = newRoster.some(c => c.id === pickedChar.id);
            
            if (isDupe) {
                const coreReward = pickedChar.star >= 5 ? 2 : 1;
                earnedCores += coreReward;
                newResults.push({ ...pickedChar, isDupe: true, coreReward });
            } else {
                newRoster.push({ ...pickedChar, level: 1, exp: 0, equipped: [null, null, null], unlockedNodes: [] });
                newResults.push({ ...pickedChar, isDupe: false, isNew: true });
            }
        } else {
            earnedFragments += 1;
            newResults.push({ 
                id: `fragment_${Date.now()}_${i}`, 
                name: "기억 파편", 
                isItem: true,  
                star: 3,       
                desc: "기억 세공을 제작하기 위한 신비한 파편"
            });
        }
    }

    setRoster(newRoster);
    
    if (earnedCores > 0 || earnedFragments > 0) {
        setInventory(prev => {
            let updated = [...prev];
            if (earnedCores > 0) {
                const coreIdx = updated.findIndex(i => i.id === 'core_essence');
                if (coreIdx >= 0) updated[coreIdx] = { ...updated[coreIdx], count: updated[coreIdx].count + earnedCores };
                else updated.push({ id: 'core_essence', count: earnedCores });
            }
            if (earnedFragments > 0) {
                const fragIdx = updated.findIndex(i => i.id === 'memory_fragment');
                if (fragIdx >= 0) updated[fragIdx] = { ...updated[fragIdx], count: updated[fragIdx].count + earnedFragments };
                else updated.push({ id: 'memory_fragment', count: earnedFragments });
            }
            return updated;
        });
    }

    setResults(newResults);
    setViewState('intro'); 
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

      {(viewState === 'main' || viewState === 'result') && (
          <GachaHeader onBack={onBack} stoneCount={stoneCount} fragmentCount={fragmentCount} />
      )}

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {viewState === 'intro' && (
            <GachaIntroView 
                onComplete={() => setViewState('reveal')} 
                onSkip={() => setViewState('reveal')} 
            />
        )}
        {viewState === 'reveal' && (
            <GachaRevealView results={results} onComplete={() => setViewState('result')} />
        )}
        {viewState === 'result' && (
            <GachaResultView results={results} onConfirm={() => setViewState('main')} />
        )}
        {viewState === 'main' && (
            <GachaMainView onGacha={handleGacha} />
        )}
      </div>
    </div>
  );
}