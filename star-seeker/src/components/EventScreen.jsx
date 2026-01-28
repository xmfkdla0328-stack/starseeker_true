import React, { useState } from 'react';
import { Scroll, Hand, ArrowRight, AlertTriangle } from 'lucide-react';

export default function EventScreen({ onOptionSelected, onEventComplete }) {
  const [eventPhase, setEventPhase] = useState(0); // 0: 선택, 1: 결과(터치), 2: 결과(무시), 3: 조우

  const handleChoice = (choice) => {
    if (choice === 'touch') {
      // 부모 컴포넌트(App)에 페널티 적용 요청
      onOptionSelected({ type: 'hp', value: 0.9 });
      setEventPhase(1);
    } else {
      // 부모 컴포넌트(App)에 스탯 상승 요청
      onOptionSelected({ type: 'stat', stat: 'int', value: 1 });
      setEventPhase(2);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 space-y-6 animate-fade-in">
      <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4 text-amber-200">
          <Scroll size={20} />
          <span className="font-bold tracking-widest text-sm">EVENT LOG</span>
        </div>

        {eventPhase === 0 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-slate-300 leading-relaxed">
              어두운 통로를 지나던 중, <span className="text-cyan-300 font-bold">기묘한 빛을 내뿜는 비석</span>을 발견했습니다. 
              표면에는 알 수 없는 고대 문자가 새겨져 있으며, 미세한 진동이 느껴집니다.
            </p>
            <p className="text-slate-400 text-sm italic">만져보시겠습니까?</p>
            
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={() => handleChoice('touch')}
                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-200 font-bold group-hover:text-cyan-100">기묘한 비석을 만져본다.</span>
                  <Hand size={16} className="text-slate-500 group-hover:text-cyan-400" />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-400 mt-1 block">호기심이 당신을 이끕니다...</span>
              </button>

              <button 
                onClick={() => handleChoice('ignore')}
                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 font-bold group-hover:text-emerald-100">만지지 않고 지나간다.</span>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400" />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-400 mt-1 block">지능 +1</span>
              </button>
            </div>
          </div>
        )}

        {eventPhase === 1 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-rose-300 leading-relaxed">
              손을 대자마자 끔찍한 오한이 전신을 휘감습니다!<br/>
              <br/>
              "......!!"<br/>
              <br/>
              이상하게도 뭔가 생명력이 빠져나가는 느낌이 듭니다... 
              당신은 서둘러 손을 떼고 비석을 지나쳤습니다.
            </p>
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-200 text-sm text-center">
              파티원 전체 HP -10%
            </div>
            <button 
              onClick={() => setEventPhase(3)}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              다음으로
            </button>
          </div>
        )}

        {eventPhase === 2 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-emerald-300 leading-relaxed">
              당신은 냉철한 판단으로 비석을 무시하고 지나갑니다.<br/>
              불필요한 위험을 감수할 필요는 없으니까요.<br/>
              <br/>
              현명한 판단이었습니다. 머리가 한결 맑아지는 기분입니다.
            </p>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-200 text-sm text-center">
              지능(INT) +1 상승
            </div>
            <button 
              onClick={() => setEventPhase(3)}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              다음으로
            </button>
          </div>
        )}

        {eventPhase === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center my-4">
              <AlertTriangle size={48} className="text-fuchsia-500 animate-pulse" />
            </div>
            <p className="text-white text-lg font-bold text-center leading-relaxed">
              공허의 감시자가 나타났다!<br/>
              <span className="text-sm font-normal text-slate-400">상대하고 지나가야 할 것 같습니다.</span>
            </p>
            
            <button 
              onClick={onEventComplete}
              className="w-full py-4 bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 text-white font-bold rounded shadow-lg shadow-rose-900/50 border border-rose-500 transition-all hover:scale-[1.02]"
            >
              전투 개시 (BATTLE START)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}