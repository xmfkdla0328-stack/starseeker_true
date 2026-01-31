import React from 'react';

export default function GachaControls({ isAnimating, hasResult, onSummon }) {
  const isDisabled = isAnimating || hasResult;

  return (
    <div className="p-6 pb-10 bg-gradient-to-t from-black/80 to-transparent z-20">
      <div className="flex gap-4 max-w-sm mx-auto">
        {/* 1회 소환 */}
        <button
          onClick={() => onSummon(1)}
          disabled={isDisabled}
          className="flex-1 group relative h-16 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-violet-400 rounded-xl flex flex-col items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm font-bold text-white group-hover:text-violet-200">1회 연결</span>
          <span className="text-[10px] text-slate-400">무료 (Test)</span>
        </button>

        {/* 10회 소환 */}
        <button
          onClick={() => onSummon(10)}
          disabled={isDisabled}
          className="flex-1 group relative h-16 bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 hover:from-violet-800 hover:to-fuchsia-800 border border-violet-500 hover:border-violet-300 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-violet-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-bounce">
            SR 확정
          </div>
          <span className="text-sm font-bold text-white group-hover:text-white drop-shadow-md">10회 연결</span>
          <span className="text-[10px] text-violet-200">무료 (Test)</span>
        </button>
      </div>
    </div>
  );
}