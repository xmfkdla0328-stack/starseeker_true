import React from 'react';
import { Lock } from 'lucide-react';
import { ALL_KEYWORDS } from '../../data/keywordData';

export default function KeywordTab({ collectedKeywords }) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3 scrollbar-hide">
      {ALL_KEYWORDS.map((kw) => {
        // 실제 구현 시 collectedKeywords에 id가 있는지 확인
        const isUnlocked = !kw.isHidden; // || collectedKeywords.includes(kw.id)

        return (
          <div key={kw.id} className={`p-4 rounded-xl border flex flex-col gap-2 transition-all
              ${isUnlocked 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-black/40 border-white/5 opacity-50'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {kw.category}
                </span>
                <span className={`font-bold ${isUnlocked ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {isUnlocked ? kw.title : '???'}
                </span>
              </div>
              {!isUnlocked && <Lock size={14} className="text-slate-600" />}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isUnlocked ? kw.desc : '아직 관측되지 않은 데이터입니다.'}
            </p>
          </div>
        );
      })}
    </div>
  );
}