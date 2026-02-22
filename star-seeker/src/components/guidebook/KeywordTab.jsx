import React from 'react';
import { Lock } from 'lucide-react';
import { ALL_KEYWORDS } from '../../data/keywordData';

export default function KeywordTab({ collectedKeywords }) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3 scrollbar-hide">
      {ALL_KEYWORDS.map((kw) => {
        // 1. 실제 유저가 스토리를 통해 이 키워드를 획득했는지 검사
        const isUnlocked = collectedKeywords.includes(kw.id);

        // 2. 미획득 상태 + 완전 숨김(스포일러) 처리된 키워드라면 아예 렌더링하지 않음
        if (!isUnlocked && kw.isHidden) {
            return null;
        }

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
                {/* 획득 시 원래 이름, 미획득 시 '???' 로 가림 */}
                <span className={`font-bold ${isUnlocked ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {isUnlocked ? kw.title : '???'}
                </span>
              </div>
              {/* 미획득 시 자물쇠 아이콘 표시 */}
              {!isUnlocked && <Lock size={14} className="text-slate-600" />}
            </div>
            
            {/* 획득 시 설명 출력, 미획득 시 안내 문구 */}
            <p className="text-xs text-slate-400 leading-relaxed">
              {isUnlocked ? kw.desc : '아직 관측되지 않은 데이터입니다.'}
            </p>
          </div>
        );
      })}
    </div>
  );
}