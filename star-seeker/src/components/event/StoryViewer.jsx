import React, { useState, useRef, useEffect } from 'react';
import { User, History, X } from 'lucide-react';

export default function StoryViewer({ script, history, onNext }) {
  const hasImage = !!script.characterImage;
  
  // 로그 모달 상태 관리
  const [showLog, setShowLog] = useState(false);
  const logEndRef = useRef(null);

  // [검토 완료] 자동 넘김 타이머 로직 (Auto Advance)
  useEffect(() => {
    let timer;
    // script에 duration 속성이 있고, 0보다 크면 타이머 가동
    if (script.duration > 0) {
        timer = setTimeout(() => {
            onNext(); // 시간이 지나면 다음 씬으로 넘어감
        }, script.duration);
    }
    // 컴포넌트가 언마운트되거나 script가 바뀌면 타이머 정리
    return () => {
        if (timer) clearTimeout(timer);
    };
  }, [script, onNext]);

  // 로그 스크롤
  useEffect(() => {
    if (showLog && logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showLog]);

  // 텍스트 스타일 결정
  const getTextStyle = () => {
    if (script.type === 'monologue') {
        return 'font-serif text-slate-400 italic tracking-wide'; 
    }
    if (script.type === 'question') {
        return 'font-sans text-cyan-200 font-bold';
    }
    return 'font-sans text-slate-100 font-medium';
  };

  const renderLogModal = () => (
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
                onClick={() => setShowLog(false)}
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
                        {log.speaker && (
                            <span className="text-xs font-bold text-amber-500/80 mb-0.5">
                                {log.speaker}
                            </span>
                        )}
                        <p className={`text-sm leading-relaxed ${log.type === 'system' ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                            {log.text}
                        </p>
                    </div>
                ))
            )}
            <div ref={logEndRef} />
        </div>
    </div>
  );

  return (
    <div 
      onClick={onNext} 
      className="w-full h-full relative overflow-hidden rounded-xl bg-black shadow-2xl border border-white/10 group select-none cursor-pointer"
    >
      
      {showLog && renderLogModal()}

      {/* 1. 배경 레이어 */}
      <div className={`absolute inset-0 w-full h-full transition-colors duration-1000 z-0
          ${script.bg === 'red_alert' ? 'bg-red-950' : 
            script.bg === 'black' ? 'bg-black' : 
            'bg-slate-900'}`} 
      >
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />
         
         {script.characterImage && !script.hideUI && ( 
            <div className="absolute right-0 bottom-0 w-3/4 h-3/4 opacity-5 mix-blend-overlay pointer-events-none">
                <img 
                    src={script.characterImage} 
                    className="w-full h-full object-cover mask-image-gradient grayscale" 
                    alt=""
                />
            </div>
         )}

         {/* 심장 박동 효과 */}
         {script.effect === 'heartbeat' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-80">
                <svg viewBox="0 0 800 200" className="w-full h-64 animate-scan-pass drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                    <path 
                        d="M0 100 H300 L320 80 L340 120 L360 40 L380 160 L400 60 L420 100 H800" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(239,68,68,0.2)_100%)] animate-pulse"></div>
            </div>
         )}
      </div>

      {/* 2. 하단 대사창 레이어 (UI) - hideUI 체크 */}
      {!script.hideUI && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-8 pb-6 animate-fade-in">
            
            <div className="relative w-full max-w-4xl mx-auto">
                
                {/* [A] 캐릭터 초상화 */}
                <div className={`absolute left-2 bottom-full translate-y-8 z-30 transition-all duration-500 ease-out origin-bottom-left
                    ${hasImage ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    {script.characterImage ? (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg border-2 border-white/15 bg-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                            <img 
                                src={script.characterImage} 
                                alt={script.speaker} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }} 
                            />
                        </div>
                    ) : null}
                </div>

                {/* [B] 화자 이름표 */}
                {script.speaker && script.speaker !== '???' && (
                    <div className={`absolute z-20 bottom-full mb-[-2px] transition-all duration-500
                        ${hasImage ? 'left-28 md:left-32' : 'left-2'}`}> 
                        <div className="bg-slate-900/80 border border-white/10 border-b-0 text-amber-400 text-xs md:text-sm font-bold px-5 py-2 rounded-t-lg shadow-lg tracking-wider backdrop-blur-md">
                            {script.speaker}
                        </div>
                    </div>
                )}

                {/* [C] 텍스트 박스 */}
                <div className="relative bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl rounded-tl-none p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.4)] min-h-[240px] flex flex-col justify-between transition-colors group-hover:bg-slate-950/70">
                    
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    {/* 로그 버튼 */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            setShowLog(true);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors z-40"
                        title="지난 대사 보기"
                    >
                        <History size={18} />
                    </button>

                    {/* 대사 텍스트 */}
                    <div className={`transition-all duration-300 ${hasImage ? 'pt-2' : ''} flex-1`}>
                        <p className={`text-base md:text-lg leading-loose whitespace-pre-wrap animate-fade-in text-shadow-sm ${getTextStyle()}`}>
                            {script.text}
                        </p>
                    </div>

                    {/* 우측 하단 터치 안내 */}
                    <div className="absolute bottom-3 right-4 animate-pulse">
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                            ▶ touch
                        </span>
                    </div>
                </div>
            </div>
          </div>
      )}

    </div>
  );
}