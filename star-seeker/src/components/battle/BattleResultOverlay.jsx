import React, { useState, useEffect } from 'react';
import { RefreshCw, DoorOpen, Package, Star, Trophy, AlertTriangle, CheckCircle2, Home, ArrowRight } from 'lucide-react';

const ModalWrapper = ({ children, title, icon: Icon, titleColor }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-6">
    <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${titleColor === 'text-rose-400' ? 'from-rose-500 to-transparent' : 'from-amber-400 to-transparent'}`} />
      
      <h3 className={`text-lg font-bold ${titleColor} mb-6 flex items-center gap-2 tracking-wider`}>
        <Icon size={20} />
        {title}
      </h3>
      {children}
    </div>
  </div>
);

export default function BattleResultOverlay({ 
  result,          
  rewards = [],    
  expGained = 0,   
  battleType,      
  isStoryChain,    // [NEW] App에서 넘어온 스토리 연전 여부
  onRetry,         
  onLeave,
  onHome           
}) {
  const [step, setStep] = useState('intro'); 

  useEffect(() => {
    if (step === 'intro') {
      const timer = setTimeout(() => {
        if (result === 'win') setStep('reward');
        else setStep('action'); 
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, result]);

  if (step === 'intro') {
    const isWin = result === 'win';
    return (
      <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center animate-fade-in pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <div className={`h-px w-20 ${isWin ? 'bg-amber-400/70' : 'bg-rose-500/70'}`} />
          <span className={`text-[0.55rem] font-semibold tracking-[0.5em] uppercase ${isWin ? 'text-amber-400' : 'text-rose-400'}`}>
            {isWin ? 'OPERATION COMPLETE' : 'MISSION FAILED'}
          </span>
          <h1
            className={`text-4xl font-black tracking-[0.12em] ${isWin ? 'text-white' : 'text-rose-200'}`}
            style={{ textShadow: isWin
              ? '0 0 24px rgba(251,191,36,0.35)'
              : '0 0 24px rgba(225,29,72,0.45)'
            }}
          >
            {isWin ? '전투 승리' : '전투 패배'}
          </h1>
          <div className={`h-px w-20 ${isWin ? 'bg-amber-400/70' : 'bg-rose-500/70'}`} />
        </div>
      </div>
    );
  }

  if (step === 'reward') {
    return (
      <ModalWrapper 
        title="BATTLE RESULTS" 
        icon={Trophy} 
        titleColor="text-amber-400"
      >
        <div className="space-y-4 mb-6">
          <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                <span className="text-xs text-slate-400">획득 경험치</span>
            </div>
            <span className="text-sm font-bold text-white font-mono">+{expGained} EXP</span>
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-cyan-400" />
                <span className="text-xs text-slate-400">획득 아이템</span>
            </div>
            
            {rewards.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                    {rewards.map((item, idx) => (
                        <div key={idx} className="aspect-square bg-slate-800 border border-white/10 rounded flex flex-col items-center justify-center relative group hover:border-cyan-500/50 transition-colors">
                            <div className="text-xl">📦</div>
                            <span className="absolute bottom-0.5 right-1 text-[10px] font-mono text-cyan-200">x{item.count}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-xs text-slate-600 text-center py-2 italic">획득한 아이템이 없습니다.</div>
            )}
          </div>
        </div>

        {/* [NEW] 스토리 체인 상태일 경우, 버튼 디자인과 로직을 분기합니다. */}
        {isStoryChain && battleType === 'story' ? (
            <button 
                onClick={onLeave} // 3단계(action)를 건너뛰고 바로 다음 스토리로 진입!
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/50 transition-colors flex items-center justify-center gap-2"
            >
                <ArrowRight size={16} />
                다음 스토리로
            </button>
        ) : (
            <button 
                onClick={() => setStep('action')}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-900/50 transition-colors flex items-center justify-center gap-2"
            >
                <CheckCircle2 size={16} />
                확인
            </button>
        )}
      </ModalWrapper>
    );
  }

  if (step === 'action') {
    const isWin = result === 'win';
    
    return (
      <ModalWrapper 
        title={isWin ? "OPERATION COMPLETE" : "MISSION FAILED"} 
        icon={isWin ? CheckCircle2 : AlertTriangle}
        titleColor={isWin ? "text-emerald-400" : "text-rose-400"}
      >
        <div className="text-center mb-6">
            <p className="text-sm text-slate-300 leading-relaxed">
                전투가 종료되었습니다.<br/>
                다음 작업을 선택해 주세요.
            </p>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={onRetry}
                className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-900/50 transition-colors flex flex-col items-center justify-center gap-1.5"
            >
                <RefreshCw size={16} />
                <span>다시하기</span>
            </button>

            <button 
                onClick={onLeave}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1.5"
            >
                <DoorOpen size={16} />
                <span>나가기</span>
            </button>

            <button 
                onClick={onHome}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1.5"
            >
                <Home size={16} />
                <span>홈으로</span>
            </button>
        </div>
      </ModalWrapper>
    );
  }
  
  return null;
}