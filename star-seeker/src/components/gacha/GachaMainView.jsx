import React, { useState } from 'react';
import { Hexagon, Sparkles, Users } from 'lucide-react';

export default function GachaMainView({ onGacha }) {
    // 현재 활성화된 가챠 탭 상태 ('character' 또는 'equipment')
    const [activeTab, setActiveTab] = useState('character');

    const isChar = activeTab === 'character';

    return (
        <div className="text-center flex flex-col items-center justify-center animate-fade-in w-full h-full relative z-10">
            
            {/* 1. 탭 네비게이션 */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex bg-slate-900/80 p-1 rounded-full border border-white/10 backdrop-blur-md z-20">
                <button 
                    onClick={() => setActiveTab('character')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all 
                        ${isChar ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'text-slate-400 hover:text-white'}`}
                >
                    <Users size={14} /> CHARACTER
                </button>
                <button 
                    onClick={() => setActiveTab('equipment')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all 
                        ${!isChar ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]' : 'text-slate-400 hover:text-white'}`}
                >
                    <Sparkles size={14} /> MEMORY
                </button>
            </div>

            <div className="space-y-8 mt-12 w-full transition-all duration-500">
                {/* 2. 메인 로고 연출 (탭에 따라 색상 전환) */}
                <div className="relative">
                    <div className={`absolute inset-0 blur-[100px] opacity-20 transition-colors duration-700 
                        ${isChar ? 'bg-violet-500' : 'bg-cyan-500'}`}></div>
                    <Hexagon size={120} strokeWidth={0.5} 
                        className={`relative z-10 animate-float mx-auto transition-colors duration-700 
                        ${isChar ? 'text-violet-200 drop-shadow-[0_0_30px_rgba(167,139,250,0.5)]' : 'text-cyan-200 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]'}`} 
                    />
                </div>
                
                {/* 3. 타이틀 영역 (탭에 따라 텍스트/색상 전환) */}
                <div className="h-20 flex flex-col justify-center">
                    {isChar ? (
                        <>
                            <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2 animate-fade-in">
                                ALTER<span className="text-violet-400">VOID</span>
                            </h1>
                            <p className="text-xs text-slate-400 font-mono tracking-widest animate-fade-in">
                                POSSIBILITY MATERIALIZATION SYSTEM
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2 animate-fade-in">
                                MEMORY<span className="text-cyan-400">FORGE</span>
                            </h1>
                            <p className="text-xs text-slate-400 font-mono tracking-widest animate-fade-in">
                                ENGRAVING RECONSTRUCTION PROTOCOL
                            </p>
                        </>
                    )}
                </div>

                {/* 4. 가챠 버튼 영역 (onGacha에 count와 타입(activeTab)을 함께 전달) */}
                <div className="flex gap-4 w-full max-w-sm px-4 mx-auto">
                    {/* 1 PULL */}
                    <button 
                        onClick={() => onGacha(1, activeTab)}
                        className="flex-1 py-4 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all flex flex-col items-center gap-1 group active:scale-95"
                    >
                        <span className={`text-sm font-bold text-white transition-colors
                            ${isChar ? 'group-hover:text-violet-200' : 'group-hover:text-cyan-200'}`}>
                            1 PULL
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Hexagon size={10} className={isChar ? 'fill-violet-500 text-violet-500' : 'fill-cyan-500 text-cyan-500'} />
                            <span>{isChar ? '100' : '10'}</span>
                        </div>
                    </button>
                    
                    {/* 10 PULL */}
                    <button 
                        onClick={() => onGacha(10, activeTab)}
                        className={`flex-1 py-4 rounded-xl border transition-all flex flex-col items-center gap-1 active:scale-95 relative overflow-hidden group 
                            ${isChar 
                                ? 'bg-gradient-to-br from-violet-900 to-fuchsia-900 border-violet-500 hover:border-fuchsia-400 shadow-lg shadow-violet-900/30' 
                                : 'bg-gradient-to-br from-cyan-900 to-blue-900 border-cyan-500 hover:border-blue-400 shadow-lg shadow-cyan-900/30'}`}
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="text-sm font-bold text-white relative z-10">10 PULL</span>
                        <div className={`flex items-center gap-1 text-xs relative z-10 transition-colors
                            ${isChar ? 'text-violet-200' : 'text-cyan-200'}`}>
                            <Hexagon size={10} className={isChar ? 'fill-violet-300 text-violet-300' : 'fill-cyan-300 text-cyan-300'} />
                            <span>{isChar ? '1,000' : '100'}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}