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
        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fade-in" 
        onClick={(e) => e.stopPropagation()} 
    >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-2 text-slate-300">
                <History size={18} />
                <span className="font-bold tracking-widest text-sm">LOG</span>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
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