import React, { useState } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/gameData';
import GachaMainStage from './gacha/GachaMainStage';
import GachaControls from './gacha/GachaControls';

export default function GachaScreen({ roster, setRoster, inventory, setInventory, onBack }) {
  const [result, setResult] = useState(null); // 소환 결과 배열
  const [isAnimating, setIsAnimating] = useState(false);

  // 소환 로직
  const handleSummon = (count) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setResult(null);

    // 연출을 위한 지연 (1.5초 후 결과 처리)
    setTimeout(() => {
      const newResults = [];
      let coresGained = 0;
      const newChars = [];

      for (let i = 0; i < count; i++) {
        const randomChar = ALL_CHARACTERS[Math.floor(Math.random() * ALL_CHARACTERS.length)];
        
        // 중복 체크 (로스터에 있거나, 이번 뽑기 목록에 이미 나왔거나)
        const isDuplicate = roster.some(c => c.id === randomChar.id) || newChars.some(c => c.id === randomChar.id);

        if (isDuplicate) {
          // 중복이면 코어 획득
          newResults.push({ type: 'core', data: randomChar });
          coresGained += 1;
        } else {
          // 신규 캐릭터
          newResults.push({ type: 'char', data: randomChar });
          newChars.push({ 
            ...randomChar, 
            unlockedNodes: [],
            normalMult: 1.0,
            skillMult: 2.5
          });
        }
      }

      // 상태 업데이트
      if (newChars.length > 0) {
        setRoster(prev => [...prev, ...newChars]);
      }
      if (coresGained > 0) {
        setInventory(prev => prev.map(item => 
          item.id === 'core_essence' 
            ? { ...item, count: item.count + coresGained } 
            : item
        ));
      }

      setResult(newResults);
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] text-slate-100 overflow-hidden">
      
      {/* 1. 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 text-violet-300 font-bold tracking-widest">
            <Sparkles size={18} />
            <span>DATA LINK</span>
        </div>
        <div className="w-6" />
      </div>

      {/* 2. 메인 스테이지 (연출) */}
      <GachaMainStage 
        isAnimating={isAnimating}
        result={result}
        onResetResult={() => setResult(null)}
      />

      {/* 3. 컨트롤러 (버튼) */}
      <GachaControls 
        isAnimating={isAnimating}
        hasResult={!!result}
        onSummon={handleSummon}
      />

    </div>
  );
}