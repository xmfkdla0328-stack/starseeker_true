import React from 'react';
import GachaResultCard from './GachaResultCard';

export default function GachaResultView({ results, onConfirm }) {
    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-center text-lg font-bold text-white mb-4 tracking-widest border-b border-white/10 pb-3 shrink-0">
                ACQUISITION RESULT
            </h2>
            
            <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                <div className="grid grid-cols-2 gap-2">
                    {results.map((char, idx) => (
                        <GachaResultCard key={idx} char={char} delayIdx={idx} />
                    ))}
                </div>
            </div>
            
            {/* 결과 확인 버튼 */}
            <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-30 pointer-events-none">
                <button 
                    onClick={onConfirm}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] pointer-events-auto active:scale-95"
                >
                    CONFIRM
                </button>
            </div>
        </div>
    );
}