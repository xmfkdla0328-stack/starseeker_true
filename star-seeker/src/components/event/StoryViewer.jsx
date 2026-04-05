import React, { useState, useEffect } from 'react';
import { History, Sword, Zap, Brain, Shield, Heart } from 'lucide-react';
import useTypewriter from '../../hooks/event/useTypewriter'; 
import LogModal from './LogModal';

const STAT_CONFIG = [
  { key: 'str', label: '힘',   icon: <Sword  size={10} className="text-rose-400" /> },
  { key: 'agi', label: '민첩', icon: <Zap    size={10} className="text-amber-400" /> },
  { key: 'int', label: '지력', icon: <Brain  size={10} className="text-violet-400" /> },
  { key: 'wil', label: '의지', icon: <Shield size={10} className="text-emerald-400" /> },
  { key: 'chr', label: '매력', icon: <Heart  size={10} className="text-pink-400" /> },
];

export default function StoryViewer({ script, history, onNext, paused, userStats }) {
  const hasImage = !!script.characterImage;
  const [showLog, setShowLog] = useState(false);
  
  const { displayedText, isTyping, forceComplete } = useTypewriter(script.text || "");

  const effectKey = `${script.id}-${script.effect}`;

  useEffect(() => {
    let autoTimer;
    const isReadyToAuto = script.hideUI || !isTyping;
    if (isReadyToAuto && script.duration > 0 && !paused) {
      autoTimer = setTimeout(() => { onNext(); }, script.duration);
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

  const getBgClass = () => {
    if (script.bg === 'red_alert') return 'bg-red-950';
    if (script.bg === 'black') return 'bg-black';
    return 'bg-slate-900';
  };

  const isBgImage = script.bg && script.bg.startsWith('/');

  return (
    <div 
      key={`container-${script.id}`} 
      onClick={handleInteraction} 
      className={`w-full h-full relative flex flex-col overflow-hidden rounded-xl shadow-2xl border border-white/10 group select-none cursor-pointer ${getContainerAnimation()}`}
    >
      <style>{`
        @keyframes panUp {
          0%   { transform: scale(1.7) translateY(10%); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: scale(1.25) translateY(0); opacity: 1; }
        }
        .animate-pan-up { animation: panUp 3.5s ease-out forwards; }
      `}</style>

      {showLog && <LogModal history={history} onClose={() => setShowLog(false)} />}

      {/* === 전체화면 이펙트 (warp_white / blackout) — 항상 최상위 === */}
      <div key={effectKey} className="absolute inset-0 z-50 pointer-events-none">
        {script.effect === 'blackout' && <div className="absolute inset-0 bg-black z-[100]" />}
        {script.effect === 'warp_white' && (
          <div className="absolute inset-0 z-[100]">
            <div className="warp-circle" />
          </div>
        )}
      </div>

      {/* =====================================================
          TOP ZONE: 배경 이미지 영역
          - hideUI=true 시 → 전체 화면 (CG 연출)
          - 일반 시 → 1/3 height
      ===================================================== */}
      <div
        className={`relative flex-shrink-0 overflow-hidden transition-all duration-500 ${getBgClass()} ${script.hideUI ? 'flex-1' : ''}`}
        style={!script.hideUI ? { height: '33%' } : undefined}
      >
        {/* 배경 이미지 (경로가 /로 시작할 때) */}
        {isBgImage && (
          <img src={script.bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}

        {/* CG 이미지 */}
        {script.centerImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-90 overflow-hidden">
            <img
              src={script.centerImage}
              alt="Event CG"
              className={`w-full h-full object-contain drop-shadow-[0_0_50px_rgba(220,38,38,0.4)] origin-bottom
                ${script.centerImageEffect === 'pan-up' ? 'animate-pan-up' : 'animate-fade-in scale-[1.25]'}
              `}
            />
          </div>
        )}

        {/* 이펙트: glitch */}
        {script.effect === 'glitch' && <div className="absolute inset-0 animate-glitch z-20" />}

        {/* 이펙트: flash_red */}
        {script.effect === 'flash_red_and_shake' && <div className="absolute inset-0 animate-flash-red mix-blend-overlay z-20" />}

        {/* heartbeat ECG */}
        {script.effect === 'heartbeat' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-80 z-20">
            <svg viewBox="0 0 800 200" className="w-full h-32 animate-scan-pass drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              <path d="M0 100 H300 L320 80 L340 120 L360 40 L380 160 L400 60 L420 100 H800" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(239,68,68,0.2)_100%)] animate-pulse" />
          </div>
        )}

        {/* causality_manifest */}
        {script.effect === 'causality_manifest' && (
          <div className="absolute inset-0 flex items-center justify-center animate-fade-in z-20">
            <div className="causality-core" />
            <div className="causality-ripple ripple-delay-1" />
          </div>
        )}

        {/* 하단 그라디언트 — 대사창으로 자연스럽게 이어짐 */}
        {!script.hideUI && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-transparent z-30" />
        )}
        {/* 상단 어두운 처리 */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/50 to-transparent z-30" />
      </div>

      {/* =====================================================
          BOTTOM ZONE: stat HUD + 대사창 (hideUI=false 때만 렌더)
      ===================================================== */}
      {!script.hideUI && (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative min-h-0">

          {/* Stat HUD */}
          {userStats && (
            <div className="flex-shrink-0 flex items-center justify-center gap-4 px-4 py-1.5 bg-slate-900/70 border-b border-white/5">
              {STAT_CONFIG.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  {icon}
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 font-bold">{userStats[key]}</span>
                </div>
              ))}
            </div>
          )}

          {/* 대화창 영역 */}
          <div className="relative z-20 flex-1 flex flex-col p-4 pb-5 animate-fade-in min-h-0">
            <div className="relative w-full max-w-4xl mx-auto flex-1 flex flex-col justify-end">

              {/* 캐릭터 썸네일 */}
              <div className={`absolute left-2 bottom-full translate-y-8 z-30 transition-all duration-500 ease-out origin-bottom-left 
                ${hasImage && script.bg !== 'black' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                {script.characterImage && (
                  <div className="w-20 h-20 rounded-lg border-2 border-white/15 bg-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                    <img src={script.characterImage} alt={script.speaker} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* 화자 이름 */}
              {script.speaker && script.speaker !== '???' && (
                <div className={`absolute z-20 bottom-full mb-[-2px] transition-all duration-500 ${hasImage && script.bg !== 'black' ? 'left-24' : 'left-2'}`}>
                  <div className="bg-slate-900/80 border border-white/10 border-b-0 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-t-lg shadow-lg tracking-wider backdrop-blur-md">
                    {script.speaker}
                  </div>
                </div>
              )}

              {/* 대사창 */}
              <div className={`relative backdrop-blur-xl border rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-colors flex-1
                ${script.bg === 'black' ? 'bg-black/80 border-white/5 rounded-tl-2xl' : 'bg-slate-950/60 border-white/10 rounded-tl-none group-hover:bg-slate-950/70'}`}>

                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <button
                  onClick={(e) => { e.stopPropagation(); setShowLog(true); }}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors z-40"
                >
                  <History size={15} />
                </button>

                <div className={`transition-all duration-300 ${hasImage && script.bg !== 'black' ? 'pt-9' : 'pt-5'} flex-1`}>
                  <p className={`text-sm leading-loose whitespace-pre-wrap text-shadow-sm z-30 relative ${getTextStyle()}`}>
                    {renderStyledText(displayedText)}
                    {isTyping && <span className="animate-pulse ml-1 inline-block w-1.5 h-4 bg-cyan-400 align-middle" />}
                  </p>
                </div>

                <div className="absolute bottom-2 right-4 animate-pulse">
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                    {isTyping ? '▶ skipping...' : '▶ touch'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
