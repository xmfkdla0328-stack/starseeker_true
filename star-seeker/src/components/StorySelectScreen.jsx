import React from 'react';
import { Book, Lock, ChevronLeft, Play, Star, Signal } from 'lucide-react';

const chapters = [
  {
    id: 'prologue',
    tag: 'PROLOGUE',
    title: '서장: 누구를 위하여 종은 울리나?',
    subTitle: 'For Whom the Bell Tolls',
    description: '수 없이 많은 나의 시체 위에서.',
    isLocked: false,
    level: 1,
  },
  {
    id: 'chapter1',
    tag: 'CHAPTER 01',
    title: '1장: 삶의 증명은 남겨진 자의 몫',
    subTitle: 'Proof of Life',
    description: '유적 심층부에서 마주한 것은 잊혀진 기록들과 과거의 망령들. 진실에 다가갈수록 어둠은 짙어집니다.',
    isLocked: true,
    level: 15,
  },
];

export default function StorySelectScreen({ onSelectChapter, onBack }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#030912] animate-fade-in overflow-hidden relative">

      {/* 배경 그리드 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(100,200,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 헤더 */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft size={14} />
          <span className="text-[10px] tracking-widest font-mono uppercase">Back</span>
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] tracking-[0.5em] font-mono text-slate-500 uppercase">Story</span>
          <span className="text-xs tracking-[0.3em] font-mono text-cyan-500/80 uppercase">Archive</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Signal size={11} className="text-slate-600" />
          <span className="text-[9px] font-mono text-slate-600 uppercase">Sector 7</span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-cyan-900/60 to-transparent flex-shrink-0" />

      {/* 챕터 리스트 */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide px-5 py-5 space-y-4">
        {chapters.map((chapter) => {
          const clipPath = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))';
          return (
            <button
              key={chapter.id}
              disabled={chapter.isLocked}
              onClick={() => !chapter.isLocked && onSelectChapter(chapter.id)}
              className={`w-full relative text-left transition-all duration-200
                ${chapter.isLocked ? 'opacity-50 cursor-not-allowed' : 'group active:scale-[0.98]'}
              `}
              style={{ clipPath }}
            >
              {/* 배경 */}
              <div className={`absolute inset-0 transition-all duration-300
                ${chapter.isLocked
                  ? 'bg-[#0a0c12]'
                  : 'bg-gradient-to-r from-[#060f20] to-[#030912] group-hover:from-[#0c1e38]'
                }`}
              />

              {/* 상단 컬러 라인 */}
              <div className={`absolute top-0 left-0 right-0 h-[1.5px]
                ${chapter.isLocked
                  ? 'bg-slate-700/40'
                  : 'bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent'
                }`}
              />

              {/* 테두리 SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ clipPath }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1" y="1"
                  width="calc(100% - 2px)" height="calc(100% - 2px)"
                  fill="none"
                  stroke={chapter.isLocked ? '#334155' : '#164e63'}
                  strokeWidth="1"
                  className={chapter.isLocked ? '' : 'group-hover:[stroke:#0e7490] transition-all'}
                />
              </svg>

              {/* 호버 틴트 */}
              {!chapter.isLocked && (
                <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.04] transition-all duration-300" />
              )}

              {/* 콘텐츠 */}
              <div className="relative z-10 p-5">
                {/* 상단 태그 행 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono tracking-widest px-2 py-0.5 border
                      ${chapter.isLocked
                        ? 'text-slate-600 border-slate-700/50 bg-slate-900/40'
                        : 'text-cyan-500 border-cyan-700/50 bg-cyan-950/50 group-hover:border-cyan-600/70 group-hover:text-cyan-400'
                      }`}
                    >
                      {chapter.tag}
                    </span>
                    {!chapter.isLocked && (
                      <div className="flex items-center gap-1 text-[9px] text-amber-400 font-mono">
                        <Star size={8} className="fill-amber-400" />
                        <span className="tracking-widest">NEW</span>
                      </div>
                    )}
                  </div>
                  {chapter.isLocked
                    ? <Lock size={14} className="text-slate-600" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  }
                </div>

                {/* 제목 */}
                <h3 className={`text-base font-bold leading-snug mb-1
                  ${chapter.isLocked ? 'text-slate-600' : 'text-white group-hover:text-cyan-100 transition-colors'}`}
                >
                  {chapter.title}
                </h3>

                {/* 서브타이틀 */}
                <p className="text-[10px] font-mono tracking-widest uppercase mb-3
                  text-slate-600">
                  {chapter.subTitle}
                </p>

                {/* 설명 */}
                <p className={`text-xs leading-relaxed font-light line-clamp-2
                  ${chapter.isLocked ? 'text-slate-700' : 'text-slate-500'}`}
                >
                  {chapter.description}
                </p>

                {/* 하단 액션 / 잠금 안내 */}
                <div className="mt-4 flex justify-between items-center">
                  {chapter.isLocked ? (
                    <span className="text-[10px] font-mono text-slate-600 tracking-widest uppercase">
                      REQ LV.{chapter.level} — Locked
                    </span>
                  ) : (
                    <>
                      <span className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">
                        Available
                      </span>
                      <div className="flex items-center gap-2 text-sm font-mono font-bold
                        text-cyan-400 bg-cyan-950/60 border border-cyan-700/50 px-3 py-1.5
                        group-hover:border-cyan-500/70 group-hover:text-cyan-300 transition-all">
                        <span className="tracking-wider uppercase">관측 시작</span>
                        <Play size={12} className="fill-cyan-400 group-hover:fill-cyan-300" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 하단 상태바 */}
      <div className="relative z-10 flex items-center justify-center pb-5 flex-shrink-0">
        <span className="text-[9px] font-mono text-slate-700 tracking-widest uppercase">
          Awaiting Selection...
        </span>
      </div>

    </div>
  );
}
