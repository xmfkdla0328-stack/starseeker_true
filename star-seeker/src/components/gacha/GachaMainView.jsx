import React from 'react';
import { Hexagon } from 'lucide-react';

export default function GachaMainView({ onGacha }) {
    return (
        <div className="text-center space-y-8 animate-fade-in w-full">
            <div className="relative">
                <div className="absolute inset-0 bg-violet-500 blur-[100px] opacity-20"></div>
                <Hexagon size={120} className="text-violet-200 relative z-10 drop-shadow-[0_0_30px_rgba(167,139,250,0.5)] animate-float mx-auto" strokeWidth={0.5} />
            </div>
            
            <div>
                <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2">
                    ALTER<span className="text-violet-400">VOID</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono tracking-widest">
                    POSSIBILITY MATERIALIZATION SYSTEM
                </p>
            </div>

            <div className="flex gap-4 w-full max-w-sm px-4 mx-auto">
                <button 
                    onClick={() => onGacha(1)}
                    className="flex-1 py-4 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all flex flex-col items-center gap-1 group active:scale-95"
                >
                    <span className="text-sm font-bold text-white group-hover:text-violet-200">1 PULL</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Hexagon size={10} className="fill-violet-500 text-violet-500" />
                        <span>100</span>
                    </div>
                </button>
                
                <button 
                    onClick={() => onGacha(10)}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-br from-violet-900 to-fuchsia-900 border border-violet-500 hover:border-fuchsia-400 transition-all flex flex-col items-center gap-1 shadow-lg shadow-violet-900/30 active:scale-95 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="text-sm font-bold text-white relative z-10">10 PULL</span>
                    <div className="flex items-center gap-1 text-xs text-violet-200 relative z-10">
                        <Hexagon size={10} className="fill-violet-300 text-violet-300" />
                        <span>1,000</span>
                    </div>
                </button>
            </div>
        </div>
    );
}