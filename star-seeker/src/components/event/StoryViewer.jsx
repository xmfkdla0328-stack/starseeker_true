import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import useTypewriter from '../../hooks/event/useTypewriter'; 
import LogModal from './LogModal';

export default function StoryViewer({ script, history, onNext, paused }) {
  const hasImage = !!script.characterImage;
  const [showLog, setShowLog] = useState(false);
  
  const { displayedText, isTyping, forceComplete } = useTypewriter(script.text || "");

  const effectKey = `${script.id}-${script.effect}`;

  // [Fix] 자동 넘김 로직: 타이머 무한 리셋 방지 및 대사 없는 연출 씬 대응
  useEffect(() => {
    let autoTimer;
    
    // 대사창이 숨겨진 연출 씬이거나, 타이핑이 끝났을 때만 타이머 작동 준비
    const isReadyToAuto = script.hideUI || !isTyping;

    if (isReadyToAuto && script.duration > 0 && !paused) {
        autoTimer = setTimeout(() => {
            onNext();
        }, script.duration);
    }
    
    return () => clearTimeout(autoTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, script.duration, paused, script.hideUI, script.id]); 

  const handleInteraction = (e) => {
    if (e) e.stopPropagation();
    if (paused) return;

    if (isTyping) forceComplete();
    else onNext();
  };

  const getTextStyle = () => {
    if (script.type === 'monologue') return 'font-serif text-slate-400 italic tracking-wide'; 
    if (script.type === 'question') return 'font-sans text-cyan-200 font-bold';
    return 'font-serif text-slate-100 font-bold tracking-wide leading-relaxed';
  };

  const renderStyledText = (text) => {
    if (!script.highlight || script.highlight.length === 0) return text;
    const regex = new RegExp(`(${script.highlight.join('|')})`, 'g');
    return text.split(regex).map((part, index) => {
        if (script.highlight.includes(part)) {
            return <span key={index} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse">{part}</span>;
        }
        return part;
    });
  };

  const getContainerAnimation = () => {
    if (script.effect === 'shake' || script.effect === 'flash_red_and_shake') return 'animate-shake';
    return '';
  };

  return (
    <div 
      key={`container-${script.id}`} 
      onClick={handleInteraction} 
      className={`w-full h-full relative overflow-hidden rounded-xl bg-black shadow-2xl border border-white/10 group select-none cursor-pointer ${getContainerAnimation()}`}
    >
      
      {showLog && <LogModal history={history} onClose={() => setShowLog(false)} />}

      {/* 1. 배경 레이어 */}
      <div className={`absolute inset-0 w-full h-full transition-colors duration-1000 z-0 
        ${script.bg === 'red_alert' ? 'bg-red-950' : script.bg === 'black' ? 'bg-black' : 'bg-slate-900'}
        ${script.effect === 'glitch' ? 'animate-glitch' : ''}`}
      >
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />
         
         {script.characterImage && !script.hideUI && ( 
            <div className={`absolute right-0 bottom-0 w-3/4 h-3/4 opacity-5 mix-blend-overlay pointer-events-none transition-opacity duration-500
                ${script.bg === 'black' ? 'opacity-0' : 'opacity-5'}`}>
                <img src={script.characterImage} className="w-full h-full object-cover mask-image-gradient grayscale" alt="" />
            </div>
         )}
      </div>

      {/* 2. 이펙트 레이어 */}
      <div key={effectKey} className="absolute inset-0 z-10 pointer-events-none">
          
          {script.effect === 'flash_red_and_shake' && (
              <div className="absolute inset-0 animate-flash-red mix-blend-overlay"></div>
          )}

          {script.effect === 'heartbeat' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <svg viewBox="0 0 800 200" className="w-full h-64 animate-scan-pass drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                    <path d="M0 100 H300 L320 80 L340 120 L360 40 L380 160 L400 60 L420 100 H800" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(239,68,68,0.2)_100%)] animate-pulse"></div>
            </div>
          )}

          {script.effect === 'heartbeat_fast' && (
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(220,38,38,0.4)_100%)] animate-heartbeat-fast mix-blend-screen"></div>
          )}

          {script.effect === 'warp_white' && (
            <div className="absolute inset-0 overflow-hidden z-50">
                <div className="warp-circle"></div>
                <div className="absolute inset-0 bg-white animate-fade-in opacity-0" style={{ animationDuration: '2s', animationDelay: '0.5s', animationFillMode: 'forwards' }}></div>
            </div>
          )}

          {/* [NEW] 인과력 발현 (검은 아우라) 연출 */}
          {script.effect === 'causality_manifest' && (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                <div className="causality-core"></div>
                <div className="causality-ripple ripple-delay-1"></div>
                <div className="causality-ripple ripple-delay-2"></div>
                <div className="causality-ripple ripple-delay-3"></div>
            </div>
          )}
      </div>

      {/* 3. UI 레이어 */}
      {!script.hideUI && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-8 pb-6 animate-fade-in">
            <div className="relative w-full max-w-4xl mx-auto">
                
                <div className={`absolute left-2 bottom-full translate-y-8 z-30 transition-all duration-500 ease-out origin-bottom-left 
                    ${hasImage && script.bg !== 'black' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    {script.characterImage && (
                        <div className={`w-24 h-24 md:w-28 md:h-28 rounded-lg border-2 border-white/15 bg-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden
                            ${script.effect === 'glitch' ? 'animate-glitch' : ''}`}>
                            <img src={script.characterImage} alt={script.speaker} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                    )}
                </div>

                {script.speaker && script.speaker !== '???' && (
                    <div className={`absolute z-20 bottom-full mb-[-2px] transition-all duration-500 ${hasImage && script.bg !== 'black' ? 'left-28 md:left-32' : 'left-2'}`}> 
                        <div className="bg-slate-900/80 border border-white/10 border-b-0 text-amber-400 text-xs md:text-sm font-bold px-5 py-2 rounded-t-lg shadow-lg tracking-wider backdrop-blur-md">
                            {script.speaker}
                        </div>
                    </div>
                )}

                <div className={`relative backdrop-blur-xl border rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.4)] min-h-[240px] flex flex-col justify-between transition-colors
                    ${script.bg === 'black' ? 'bg-black/80 border-white/5 rounded-tl-2xl' : 'bg-slate-950/60 border-white/10 rounded-tl-none group-hover:bg-slate-950/70'}`}>
                    
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    <button onClick={(e) => { e.stopPropagation(); setShowLog(true); }} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors z-40">
                        <History size={18} />
                    </button>

                    <div className={`transition-all duration-300 ${hasImage && script.bg !== 'black' ? 'pt-12' : 'pt-8'} flex-1`}>
                        <p className={`text-base md:text-lg leading-loose whitespace-pre-wrap text-shadow-sm ${getTextStyle()}`}>
                            {renderStyledText(displayedText)}
                            {isTyping && <span className="animate-pulse ml-1 inline-block w-1.5 h-4 bg-cyan-400 align-middle"></span>}
                        </p>
                    </div>

                    <div className="absolute bottom-3 right-4 animate-pulse">
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                            {isTyping ? '▶ skipping...' : '▶ touch'}
                        </span>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
}