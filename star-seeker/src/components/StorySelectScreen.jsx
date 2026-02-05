import React from 'react';
import { Book, Lock, ChevronLeft, Play, Star, Map } from 'lucide-react';

export default function StorySelectScreen({ onSelectChapter, onBack }) {
  // 챕터 데이터 목록
  const chapters = [
    {
      id: 'prologue',
      title: '서장: 누구를 위하여 종은 울리나?',
      subTitle: 'Prologue: For Whom the Bell Tolls',
      description: '우리는 아주 오래도록 기다려왔어.',
      isLocked: false, // 진입 가능
      level: 1,
    },
    {
      id: 'chapter1',
      title: '1장: 삶의 증명은 남겨진 자의 몫',
      subTitle: 'Chapter 1: Proof of Life',
      description: '유적 심층부에서 마주한 것은 잊혀진 기록들과 과거의 망령들. 진실에 다가갈수록 어둠은 짙어집니다.',
      isLocked: true, // 진입 불가 (잠김)
      level: 15,
    }
  ];

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in p-6">
      
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-xs tracking-widest uppercase">Back</span>
        </button>
        <div className="flex items-center gap-2">
            <Book size={18} className="text-cyan-300" />
            <h2 className="text-lg font-bold text-cyan-100 tracking-[0.1em] drop-shadow-md">
            STORY ARCHIVE
            </h2>
        </div>
        <div className="w-5" />
      </div>

      {/* 챕터 리스트 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-10">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            disabled={chapter.isLocked}
            onClick={() => !chapter.isLocked && onSelectChapter(chapter.id)}
            className={`w-full relative group text-left rounded-xl border p-5 transition-all duration-300
              ${chapter.isLocked 
                ? 'bg-black/40 border-white/5 opacity-60 cursor-not-allowed grayscale' 
                : 'bg-gradient-to-r from-slate-900/60 to-cyan-900/20 border-white/10 hover:border-cyan-400/50 hover:bg-white/5 active:scale-[0.98]'
              }
            `}
          >
            {/* 잠금 아이콘 오버레이 (잠김 상태일 때만) */}
            {chapter.isLocked && (
                <div className="absolute right-4 top-4 text-slate-500">
                    <Lock size={20} />
                </div>
            )}

            {/* 활성화 상태일 때 배경 효과 */}
            {!chapter.isLocked && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 group-hover:opacity-30 transition-opacity rounded-xl pointer-events-none"></div>
            )}

            <div className="relative z-10">
                {/* 챕터 태그 */}
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border 
                        ${chapter.isLocked 
                            ? 'bg-slate-800 text-slate-500 border-slate-700' 
                            : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30 group-hover:border-cyan-400'
                        }`}>
                        {chapter.isLocked ? `REQ Lv.${chapter.level}` : 'UNLOCKED'}
                    </span>
                    {!chapter.isLocked && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-200 animate-pulse">
                            <Star size={10} className="fill-amber-200" />
                            <span>NEW</span>
                        </div>
                    )}
                </div>

                {/* 제목 */}
                <h3 className={`text-lg font-bold mb-0.5 ${chapter.isLocked ? 'text-slate-500' : 'text-white group-hover:text-cyan-100'}`}>
                    {chapter.title}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-3">
                    {chapter.subTitle}
                </p>

                {/* 설명 */}
                <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-2">
                    {chapter.description}
                </p>

                {/* 진입 버튼 UI (활성화 시) */}
                {!chapter.isLocked && (
                    <div className="mt-4 flex justify-end">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors bg-cyan-900/30 px-3 py-1.5 rounded-lg border border-cyan-500/20 group-hover:border-cyan-400/50">
                            <span>관측 시작</span>
                            <Play size={12} className="fill-cyan-300" />
                        </div>
                    </div>
                )}
            </div>
          </button>
        ))}
      </div>

      {/* 하단 장식 */}
      <div className="pt-4 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600">
            <Map size={12} />
            <span>SECTOR 7 - UNCHARTED SPACE</span>
        </div>
      </div>
    </div>
  );
}