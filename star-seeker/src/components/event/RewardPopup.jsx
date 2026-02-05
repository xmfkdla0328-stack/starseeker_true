import React from 'react';

export default function RewardPopup({ text, onConfirm }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in space-y-6 bg-[#0f172a] h-full p-6 rounded-xl border border-white/10">
      <div className="p-4 bg-black/20 rounded-lg border border-white/10 w-full">
        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
            {text}
        </p>
      </div>
      
      <button 
        onClick={onConfirm}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded shadow-lg transition-all"
      >
        확인 (이벤트 종료)
      </button>
    </div>
  );
}