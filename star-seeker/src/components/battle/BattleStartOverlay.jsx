import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function BattleStartOverlay({ fading }) {
  return (
    <div className={`absolute inset-0 z-40 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* 붉은색 경고 배경 이펙트 */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 via-transparent to-red-900/40 animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center">
            
            {/* 경고 아이콘 및 텍스트 */}
            <div className="flex items-center gap-3 text-red-500 mb-2 animate-bounce">
                <AlertTriangle size={32} />
                <span className="text-xl font-bold tracking-[0.3em]">WARNING</span>
                <AlertTriangle size={32} />
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] scale-y-110">
                ENCOUNTER
            </h1>

            <div className="w-full h-px bg-red-500/50 my-6"></div>

            {/* [수정] 버튼 삭제 -> 자동 시작 알림 텍스트로 변경 */}
            <div className="text-red-400 font-mono text-sm tracking-[0.2em] animate-pulse">
                INITIATING BATTLE PROTOCOL...
            </div>

        </div>
    </div>
  );
}