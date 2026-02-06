import React from 'react';
import { Hand, ArrowRight, Lock, Key } from 'lucide-react';

export default function ChoicePanel({ choices, onSelect, collectedKeywords = [] }) {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-4 animate-fade-in bg-[#0f172a] h-full p-6 rounded-xl border border-white/10">
      <p className="text-slate-400 text-sm italic text-center mb-4">선택의 기로</p>
      
      {choices.map((choice) => {
        // [New] 조건 확인 로직
        let isLocked = false;
        let lockReason = "";

        if (choice.condition) {
            if (choice.condition.type === 'keyword') {
                if (!collectedKeywords.includes(choice.condition.id)) {
                    isLocked = true;
                    lockReason = `키워드 [${choice.condition.name || '???'}] 필요`;
                }
            }
        }

        return (
            <button 
                key={choice.id}
                onClick={() => !isLocked && onSelect(choice)}
                disabled={isLocked}
                className={`w-full py-4 px-6 border rounded-lg text-left transition-all group relative overflow-hidden
                    ${isLocked 
                        ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }
                    ${!isLocked && choice.type === 'risk' ? 'hover:border-cyan-500/50' : ''}
                    ${!isLocked && choice.type === 'safe' ? 'hover:border-emerald-500/50' : ''}
                `}
            >
                <div className="flex items-center justify-between relative z-10">
                    <span className={`font-bold ${
                        isLocked ? 'text-slate-500' :
                        choice.type === 'risk' ? 'text-cyan-200 group-hover:text-cyan-100' : 
                        'text-emerald-200 group-hover:text-emerald-100'
                    }`}>
                        {choice.text}
                    </span>
                    
                    {/* 아이콘 표시 */}
                    {isLocked ? (
                        <Lock size={16} className="text-slate-600" />
                    ) : choice.type === 'risk' ? (
                        <Hand size={16} className="text-slate-500 group-hover:text-cyan-400" />
                    ) : (
                        <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400" />
                    )}
                </div>

                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500 group-hover:text-slate-400 block">
                        {isLocked ? lockReason : (choice.type === 'risk' ? choice.riskText : choice.safeText)}
                    </span>
                    {/* 잠금 상태일 때 열쇠 아이콘 힌트 */}
                    {isLocked && <Key size={12} className="text-slate-700" />}
                </div>
            </button>
        );
      })}
    </div>
  );
}