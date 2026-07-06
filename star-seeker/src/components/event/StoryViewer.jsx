import React, { useState, useEffect } from 'react';
import { History, Sword, Zap, Brain, Shield, Heart } from 'lucide-react';
import useTypewriter from '../../hooks/event/useTypewriter'; 
import LogModal from './LogModal';

const STAT_CONFIG = [
  { key: 'str', label: '힘',   icon: <Sword  size={12} className="text-rose-400" /> },
  { key: 'agi', label: '민첩', icon: <Zap    size={12} className="text-amber-400" /> },
  { key: 'int', label: '지력', icon: <Brain  size={12} className="text-violet-400" /> },
  { key: 'wil', label: '의지', icon: <Shield size={12} className="text-emerald-400" /> },
  { key: 'chr', label: '매력', icon: <Heart  size={12} className="text-pink-400" /> },
];

// 포트레이트가 bg존과 대사창 경계에 걸쳐 나오는 사이즈 (px)
const PORTRAIT_SIZE = 88;
// bg존 높이 비율 (일러스트/배경을 더 크게 보이도록 상향)
const BG_RATIO = 0.45;

// 텍스트 내 {name} 플레이스홀더를 플레이어 코드 네임(닉네임)으로 치환
const applyNickname = (text, nickname) => {
  if (!text) return text;
  return text.replace(/\{name\}/g, nickname || '관측자');
};

export default function StoryViewer({ script, history, onNext, onSkip, paused, userStats, partySkills, nickname }) {
  const hasPortrait = !!(script.characterImage && script.bg !== 'black' && !script.hideUI);
  const [showLog, setShowLog] = useState(false);

  const resolvedText = applyNickname(script.text || "", nickname);
  const resolvedSpeaker = applyNickname(script.speaker, nickname);

  const { displayedText, isTyping, forceComplete } = useTypewriter(resolvedText);
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
    return 'font-serif text-slate-100 tracking-wide leading-relaxed';
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

  // 포트레이트: bg존 경계를 중심으로 위아래에 걸치도록 배치
  // top = BG_RATIO * 100% - PORTRAIT_SIZE * 0.65 (65%가 bg존 안에 들어감)
  const portraitTopStyle = `calc(${BG_RATIO * 100}% - ${Math.round(PORTRAIT_SIZE * 0.65)}px)`;

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

        /* 카메라 워킹: 배경 하단에서 상단으로 초점 이동 후 전체 노출 */
        @keyframes bgCameraPan {
          0%   { transform: scale(1.7) translateY(-18%); }
          50%  { transform: scale(1.7) translateY(18%); }
          100% { transform: scale(1)   translateY(0); }
        }
        .animate-bg-camera-pan {
          transform-origin: center;
          animation: bgCameraPan 4.5s ease-in-out forwards;
        }
      `}</style>

      {showLog && <LogModal history={history} onClose={() => setShowLog(false)} />}

      {/* ── 전체화면 이펙트 (최상위) ─────────────────────────────── */}
      <div key={effectKey} className="absolute inset-0 z-50 pointer-events-none">
        {script.effect === 'blackout'   && <div className="absolute inset-0 bg-black z-[100]" />}
        {script.effect === 'warp_white' && <div className="absolute inset-0 z-[100]"><div className="warp-circle" /></div>}
      </div>

      {/* ── 캐릭터 포트레이트 (bg존/대사창 경계에 걸침) ─────────── */}
      {hasPortrait && (
        <div
          className="absolute left-3 z-30 pointer-events-none"
          style={{ top: portraitTopStyle }}
        >
          <div
            className="rounded-xl border-2 border-white/25 overflow-hidden bg-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.75)] ring-1 ring-cyan-500/20"
            style={{ width: PORTRAIT_SIZE, height: PORTRAIT_SIZE }}
          >
            <img
              src={script.characterImage}
              alt={script.speaker}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TOP ZONE: 배경 이미지 영역
          hideUI=true 시 → 전체화면 (CG 컷씬)
      ══════════════════════════════════════════════════════════ */}
      <div
        className={`relative flex-shrink-0 overflow-hidden ${getBgClass()} ${script.hideUI ? 'flex-1' : ''}`}
        style={!script.hideUI ? { height: `${BG_RATIO * 100}%` } : undefined}
      >
        {isBgImage && (
          <img
            key={script.effect === 'camera_pan_up' ? `pan-${script.id}` : 'bg-static'}
            src={script.bg}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover opacity-60 ${
              script.effect === 'camera_pan_up' ? 'animate-bg-camera-pan' : ''
            }`}
          />
        )}

        {script.centerImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-90 overflow-hidden">
            <img
              src={script.centerImage}
              alt="Event CG"
              className={`w-full h-full object-contain drop-shadow-[0_0_50px_rgba(220,38,38,0.4)] origin-bottom
                ${script.centerImageEffect === 'pan-up' ? 'animate-pan-up' : 'animate-fade-in scale-[1.25]'}`}
            />
          </div>
        )}

        {script.effect === 'glitch'              && <div className="absolute inset-0 animate-glitch z-20" />}
        {script.effect === 'flash_red_and_shake' && <div className="absolute inset-0 animate-flash-red mix-blend-overlay z-20" />}

        {script.effect === 'heartbeat' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-80 z-20">
            <svg viewBox="0 0 800 200" className="w-full h-24 animate-scan-pass drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              <path d="M0 100 H300 L320 80 L340 120 L360 40 L380 160 L400 60 L420 100 H800"
                fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(239,68,68,0.2)_100%)] animate-pulse" />
          </div>
        )}

        {script.effect === 'causality_manifest' && (
          <div className="absolute inset-0 flex items-center justify-center animate-fade-in z-20">
            <div className="causality-core" />
            <div className="causality-ripple ripple-delay-1" />
          </div>
        )}

        {/* 하단 경계 페이드 */}
        {!script.hideUI && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-transparent z-20" />
        )}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/50 to-transparent z-20" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM ZONE: 대사창 + Stat HUD + Skills HUD
      ══════════════════════════════════════════════════════════ */}
      {!script.hideUI && (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden min-h-0">

          {/* ── 대사 패널 ─────────────────────────────────────────── */}
          <div className="flex-1 px-3 pt-3 pb-2 min-h-0">
            <div className="h-full rounded-xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_30px_rgba(0,0,0,0.5)] relative flex flex-col overflow-hidden">
              {/* 상단 하이라이트 선 */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* 화자 이름 */}
              {resolvedSpeaker && resolvedSpeaker !== '???' && (
                <div
                  className="flex-shrink-0 px-4 pt-3 pb-1"
                  style={hasPortrait ? { paddingLeft: `${PORTRAIT_SIZE + 20}px` } : {}}
                >
                  <span className="text-amber-400 text-xs font-bold tracking-widest font-mono">
                    {resolvedSpeaker}
                  </span>
                  <div className="mt-0.5 h-[1px] bg-gradient-to-r from-amber-400/30 to-transparent" />
                </div>
              )}

              {/* 대사 텍스트 */}
              <div className="flex-1 overflow-hidden px-4 py-2">
                <p className={`text-base leading-loose whitespace-pre-wrap ${getTextStyle()}`}>
                  {renderStyledText(displayedText)}
                  {isTyping && (
                    <span className="animate-pulse ml-1 inline-block w-[3px] h-[1em] bg-cyan-400 align-middle rounded-sm" />
                  )}
                </p>
              </div>

              {/* 하단 바: LOG + 진행 힌트 */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-white/5">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowLog(true); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  <History size={13} />
                  <span className="text-[10px] font-mono tracking-widest">LOG</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (!paused && onSkip) onSkip(); }}
                  className="flex items-center gap-1.5 text-cyan-400/80 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/10"
                >
                  <span className="text-[11px] font-mono tracking-widest uppercase">▶ SKIP</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Stat HUD ──────────────────────────────────────────── */}
          {userStats && (
            <div className="flex-shrink-0 flex items-center justify-around px-3 py-2 bg-slate-900/80 border-t border-white/8">
              {STAT_CONFIG.map(({ key, label, icon }) => (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    {icon}
                    <span className="text-[11px] font-mono text-slate-400">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                    {userStats[key]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Skills HUD ────────────────────────────────────────── */}
          {partySkills && partySkills.length > 0 && (
            <div className="flex-shrink-0 border-t border-white/8 bg-[#060d18]">
              {/* 헤더 */}
              <div className="flex items-center gap-2 px-3 pt-1.5 pb-1">
                <div className="h-[1px] w-2 bg-cyan-500/60" />
                <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-600 uppercase">Acquired Skills</span>
                <div className="h-[1px] flex-1 bg-cyan-500/20" />
              </div>
              {/* 스킬 태그 목록 */}
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {partySkills.map(({ name, level }) => (
                  <div
                    key={name}
                    className="flex items-center gap-1 bg-slate-800/80 border border-cyan-900/60 px-2 py-0.5"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
                  >
                    <span className="text-[10px] font-mono text-slate-200 tracking-wide">{name}</span>
                    <span className="text-[9px] font-mono text-cyan-400/80 tracking-wider">·{level}단계</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
