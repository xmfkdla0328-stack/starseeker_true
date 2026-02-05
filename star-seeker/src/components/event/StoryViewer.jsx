import React, { useState, useRef, useEffect } from 'react';
import { User, History, X } from 'lucide-react'; // History 아이콘 추가

export default function StoryViewer({ script, history, onNext }) {
  const hasImage = !!script.characterImage;
  
  // [추가] 로그 모달 상태 관리
  const [showLog, setShowLog] = useState(false);
  const logEndRef = useRef(null);

  // 로그 창 열릴 때 스크롤 최하단으로 이동
  useEffect(() => {
    if (showLog && logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showLog]);

  // 로그 모달 렌더링 함수
  const renderLogModal = () => (
    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
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
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {history.map((log, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                    {log.speaker && (
                        <span className="text-xs font-bold text-amber-500/80 mb-0.5">
                            {log.speaker}
                        </span>
                    )}
                    <p className={`text-sm leading-relaxed ${log.type === 'system' ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                        {log.text}
                    </p>
                </div>
            ))}
            <div ref={logEndRef} />
        </div>
    </div>
  );

  return (
    <div 
      onClick={onNext} 
      className="w-full h-full relative overflow-hidden rounded-xl bg-black shadow-2xl border border-white/10 group select-none cursor-pointer"
    >
      
      {/* --- [추가] 로그 모달 --- */}
      {showLog && renderLogModal()}

      {/* 1. 배경 레이어 */}
      <div className={`absolute inset-0 w-full h-full transition-colors duration-1000 z-0
          ${script.bg === 'red_alert' ? 'bg-red-950' : 
            script.bg === 'black' ? 'bg-black' : 
            'bg-slate-900'}`} 
      >
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />
         
         {script.characterImage && (
            <div className="absolute right-0 bottom-0 w-3/4 h-3/4 opacity-5 mix-blend-overlay pointer-events-none">
                <img 
                    src={script.characterImage} 
                    className="w-full h-full object-cover mask-image-gradient grayscale" 
                    alt=""
                />
            </div>
         )}
      </div>

      {/* 2. 하단 대사창 레이어 */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-8 pb-6">
        
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
                ) : (
                   null
                )}
            </div>

            {/* [B] 화자 이름표 */}
            {script.speaker && (
                <div className={`absolute z-20 bottom-full mb-[-2px] transition-all duration-500
                    ${hasImage ? 'left-28 md:left-32' : 'left-2'}`}> 
                    <div className="bg-slate-900/80 border border-white/10 border-b-0 text-amber-400 text-xs md:text-sm font-bold px-5 py-2 rounded-t-lg shadow-lg tracking-wider backdrop-blur-md">
                        {script.speaker}
                    </div>
                </div>
            )}

            {/* [C] 텍스트 박스 */}
            <div className="relative bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl rounded-tl-none p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.4)] min-h-[240px] flex flex-col justify-between transition-colors group-hover:bg-slate-950/70">
                
                {/* 상단 하이라이트 라인 */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {/* --- [추가] 로그 버튼 (우측 상단) --- */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // 부모의 onNext 실행 방지
                        setShowLog(true);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors z-40"
                    title="지난 대사 보기"
                >
                    <History size={18} />
                </button>

                {/* 대사 텍스트 */}
                <div className={`transition-all duration-300 ${hasImage ? 'pt-2' : ''} flex-1`}>
                    <p className={`text-base md:text-lg leading-loose whitespace-pre-wrap animate-fade-in font-medium text-shadow-sm
                        ${script.type === 'question' ? 'text-cyan-200 italic' : 'text-slate-100'}`}>
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

    </div>
  );
}