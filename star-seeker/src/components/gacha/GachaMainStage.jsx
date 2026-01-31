import React from 'react';
import { Hexagon, Sparkles, Repeat, X } from 'lucide-react';

export default function GachaMainStage({ isAnimating, result, onResetResult }) {
  return (
    <div className="flex-1 relative flex items-center justify-center">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-20'}`}>
        <Hexagon size={400} className={`text-violet-500/20 ${isAnimating ? 'animate-spin-slow' : ''}`} strokeWidth={0.5} />
      </div>

      {/* 1. 대기 상태 텍스트 */}
      {!result && !isAnimating && (
        <div className="text-center space-y-2 animate-pulse">
          <h3 className="text-2xl font-light text-violet-200 tracking-[0.2em]">WAITING FOR CONNECTION</h3>
          <p className="text-xs text-slate-500">데이터 스트림을 연결하여 관측 대상을 확보하십시오.</p>
        </div>
      )}

      {/* 2. 소환 연출 (로딩) */}
      {isAnimating && (
        <div className="text-center space-y-4 z-20">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-2 border-violet-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-cyan-400 animate-spin-slow"></div>
          </div>
          <p className="text-violet-300 font-mono text-sm tracking-widest blink">ESTABLISHING LINK...</p>
        </div>
      )}

      {/* 3. 결과 화면 (오버레이) */}
      {result && !isAnimating && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-6 tracking-wider">
            <span className="text-violet-400">CONNECTION</span> SUCCESSFUL
          </h3>

          <div className="grid grid-cols-5 gap-3 mb-8 w-full max-w-lg">
            {result.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-slate-900 
                                ${item.type === 'char' ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-slate-600'}`}>

                  {item.type === 'char' ? (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.data.color}`}></div>
                      <span className="relative z-10 text-lg font-bold text-white drop-shadow-md">{item.data.role.charAt(0)}</span>
                      {/* 신규 뱃지 */}
                      <div className="absolute top-0 right-0 bg-red-500 text-[8px] px-1 font-bold text-white">NEW</div>
                    </>
                  ) : (
                    <>
                      {/* 중복 -> 코어 변환 */}
                      <div className="absolute inset-0 bg-violet-900/50"></div>
                      <Sparkles size={20} className="relative z-10 text-violet-300" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Repeat size={16} className="text-white/80" />
                      </div>
                    </>
                  )}
                </div>
                <span className={`text-[9px] text-center truncate w-full ${item.type === 'char' ? 'text-amber-200' : 'text-slate-400'}`}>
                  {item.type === 'char' ? item.data.name : '데이터 칩'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onResetResult}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
}