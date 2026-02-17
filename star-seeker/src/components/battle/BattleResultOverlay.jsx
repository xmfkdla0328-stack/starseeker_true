import React, { useState, useEffect } from 'react';
import { RefreshCw, DoorOpen, Package, Star, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';

// [Fix] ModalWrapper를 컴포넌트 외부로 이동 (리렌더링 시 재생성 방지)
const ModalWrapper = ({ children, title, icon: Icon, titleColor }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-6">
    <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
      {/* 상단 장식 효과 */}
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
  result,          // 'win' | 'lose'
  rewards = [],    // 획득한 아이템 목록
  expGained = 0,   // 획득 경험치
  battleType,      // 'story' | 'mining'
  onRetry,         // 재전투 핸들러
  onLeave          // 나가기 핸들러
}) {
  const [step, setStep] = useState('intro'); // 'intro' -> 'reward' -> 'action'

  // 1단계: 승리/패배 텍스트 연출 (1.5초 후 팝업으로 전환)
  useEffect(() => {
    if (step === 'intro') {
      const timer = setTimeout(() => {
        if (result === 'win') setStep('reward');
        else setStep('action'); // 패배 시 보상 단계 건너뜀
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, result]);

  // 1. Intro 화면 (텍스트 연출)
  if (step === 'intro') {
    return (
      <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in pointer-events-none">
        <h1 className={`text-5xl font-black tracking-[0.3em] italic transform -skew-x-12 animate-scale-bounce
          ${result === 'win' 
            ? 'text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]' 
            : 'text-rose-600 drop-shadow-[0_0_25px_rgba(225,29,72,0.5)]'}`}>
          {result === 'win' ? 'VICTORY' : 'DEFEAT'}
        </h1>
      </div>
    );
  }

  // 2. 보상 팝업 (Reward) - 승리 시에만 등장
  if (step === 'reward') {
    return (
      <ModalWrapper 
        title="BATTLE RESULTS" 
        icon={Trophy} 
        titleColor="text-amber-400"
      >
        <div className="space-y-4 mb-6">
          {/* 경험치 섹션 */}
          <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                <span className="text-xs text-slate-400">획득 경험치</span>
            </div>
            <span className="text-sm font-bold text-white font-mono">+{expGained} EXP</span>
          </div>

          {/* 아이템 섹션 */}
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

        <button 
          onClick={() => setStep('action')}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-900/50 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={16} />
          확인
        </button>
      </ModalWrapper>
    );
  }

  // 3. 행동 선택 (Action) - 재전투/나가기
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

        <div className="flex gap-3">
            {/* 나가기 버튼 */}
            <button 
                onClick={onLeave}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
                <DoorOpen size={16} />
                {battleType === 'story' ? '다음으로' : '나가기'}
            </button>

            {/* 재전투 버튼 (채굴 모드일 때만 표시) */}
            {battleType === 'mining' && (
                <button 
                    onClick={onRetry}
                    className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-900/50 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw size={16} />
                    재전투
                </button>
            )}
        </div>
      </ModalWrapper>
    );
  }
  
  return null;
}