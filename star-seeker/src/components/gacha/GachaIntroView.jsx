import React, { useEffect, useState } from 'react';
import { FastForward, Crosshair } from 'lucide-react';

export default function GachaIntroView({ onComplete, onSkip }) {
    // 'aiming' (탐색) -> 'found' (빛 맺힘) -> 'flash' (빛 번짐)
    const [phase, setPhase] = useState('aiming');

    useEffect(() => {
        // 1.5초 후: 중앙에 빛이 맺힘
        const foundTimer = setTimeout(() => setPhase('found'), 1500);
        
        // 2.8초 후: 빛이 화면 전체로 팡 터짐
        const flashTimer = setTimeout(() => setPhase('flash'), 2800);
        
        // 3.5초 후: 연출 완전 종료 및 다음 화면 이동
        const endTimer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => {
            clearTimeout(foundTimer);
            clearTimeout(flashTimer);
            clearTimeout(endTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    return (
        <div 
            className="absolute inset-0 z-50 bg-[#020617] flex items-center justify-center overflow-hidden animate-fade-in cursor-pointer"
            onClick={onSkip} 
        >
            {/* 1. 우주 배경 */}
            <div 
                className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 transition-transform duration-[4000ms] ease-out"
                style={{ transform: phase !== 'aiming' ? 'scale(1.5)' : 'scale(1)' }}
            ></div>

            {/* 2. 망원경 조준선 */}
            <div className={`absolute inset-0 pointer-events-none z-20 flex items-center justify-center transition-opacity duration-700 ${phase === 'flash' ? 'opacity-0' : 'opacity-40'}`}>
                <div className="w-[120%] h-[1px] bg-cyan-500/50 absolute"></div>
                <div className="h-[120%] w-[1px] bg-cyan-500/50 absolute"></div>
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-cyan-500/50 absolute shadow-[inset_0_0_50px_rgba(6,182,212,0.2)]"></div>
                <Crosshair size={40} className="text-cyan-400 animate-spin-slow" />
            </div>

            {/* 비네팅 */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle,transparent_20%,#000_100%)]"></div>

            {/* 3. 빛 연출 (수정됨: 단순 원형 -> 정교한 렌즈 플레어 스타) */}
            <div className="relative z-30 flex items-center justify-center pointer-events-none">
                
                {/* 1단계: 타겟 발견 시 중앙에 맺히는 세련된 별빛 */}
                {/* 컨테이너: 등장 시 스케일과 함께 살짝 회전(rotate)하며 나타나도록 연출 */}
                <div 
                    className={`absolute flex items-center justify-center transition-all duration-[1000ms] ease-out
                        ${phase === 'aiming' ? 'opacity-0 scale-0 rotate-45' : 'opacity-100 scale-100 rotate-0'}`}
                >
                    {/* 중앙 코어: 아주 밝고 푸른빛이 감도는 핵 */}
                    <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff,0_0_25px_#0ff,0_0_50px_#00f] animate-pulse-fast z-10"></div>
                    
                    {/* 가로 빛줄기 (Lens Flare Horizontal) */}
                    <div className="absolute w-32 h-[1px] bg-gradient-to-r from-transparent via-cyan-100 to-transparent opacity-70"></div>
                    
                    {/* 세로 빛줄기 (Lens Flare Vertical) */}
                    <div className="absolute h-32 w-[1px] bg-gradient-to-b from-transparent via-cyan-100 to-transparent opacity-70"></div>
                    
                    {/* 보조 빛 번짐 (Subtle Glow) */}
                    <div className="absolute w-16 h-16 bg-cyan-500/20 blur-xl rounded-full animate-pulse-subtle"></div>
                </div>
                
                {/* 2단계: 화면을 완전히 덮어버리는 거대한 플래시 (화이트아웃) */}
                <div 
                    className={`absolute w-10 h-10 bg-white rounded-full blur-[20px] transition-all duration-[600ms] ease-in
                        ${phase === 'flash' ? 'opacity-100 scale-[150]' : 'opacity-0 scale-1'}`}
                ></div>
            </div>

            {/* 4. 시스템 텍스트 */}
            <div className={`absolute bottom-24 z-20 text-center transition-opacity duration-300 ${phase === 'flash' ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-cyan-400 font-mono text-sm tracking-[0.4em] animate-pulse">
                    {phase === 'aiming' ? 'OBSERVING COORDINATES...' : 'ASTRAL SIGNAL DETECTED!'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-2 tracking-widest opacity-80">
                    TAP ANYWHERE TO SKIP
                </p>
            </div>

            {/* 5. 스킵 버튼 */}
            <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onSkip(); 
                }}
                className={`absolute top-6 right-6 z-30 flex items-center gap-1 px-4 py-2 bg-black/40 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white transition-all active:scale-95 shadow-lg
                    ${phase === 'flash' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <span className="tracking-widest font-bold">SKIP</span>
                <FastForward size={14} />
            </button>
        </div>
    );
}