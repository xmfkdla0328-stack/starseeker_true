import React, { useEffect, useRef } from 'react';
import { History, X } from 'lucide-react';

export default function LogModal({ history, onClose }) {
  const logEndRef = useRef(null);

  // 열릴 때 스크롤 하단 이동
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div 
        // [핵심] absolute 대신 fixed를 사용하여 화면 최상단(z-9999)으로 끌어올립니다.
        // left-1/2, -translate-x-1/2, max-w-md 조합으로 앱의 기존 틀(비율)을 절대 벗어나지 않게 고정합니다.
        className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[9999] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in" 
        onClick={(e) => e.stopPropagation()} 
    >
        <div className="flex items-center justify-between p-4 pt-5 border-b border-white/10 bg-slate-900/90 shadow-md">
            <div className="flex items-center gap-2 text-slate-300">
                <History size={18} />
                <span className="font-bold tracking-widest text-sm">LOG</span>
            </div>
            
            {/* 닫기 버튼 디자인을 조금 더 눈에 띄게 버튼 형태로 보강했습니다 */}
            <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white transition-all active:scale-95"
            >
                <X size={20} />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-20">
            {history.length === 0 ? (
                <div className="text-center text-slate-600 text-sm mt-10">기록된 대화가 없습니다.</div>
            ) : (
                history.map((log, idx) => (
                    <div key={idx} className="flex flex-col gap-1 border-b border-white/5 pb-4 last:border-0">
                        {log.speaker && log.speaker !== '???' && (
                            <span className="text-xs font-bold text-amber-500/80 mb-0.5">
                                {log.speaker}
                            </span>
                        )}
                        <p className={`text-sm leading-relaxed ${log.type === 'monologue' ? 'text-slate-500 italic font-serif' : 'text-slate-300'}`}>
                            {log.text}
                        </p>
                    </div>
                ))
            )}
            <div ref={logEndRef} />
        </div>
    </div>
  );
}