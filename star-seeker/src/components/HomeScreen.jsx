import React from 'react';
import { User, Users, Cpu, BookOpen, Sparkles, Archive, ShoppingCart, Play } from 'lucide-react';

export default function HomeScreen({ onStart, onParty, onManage, onStorage }) { // onStorage 추가
  const navItems = [
    { id: 'party', icon: Users, label: '편성', color: 'text-blue-300', action: onParty },
    { id: 'manage', icon: Cpu, label: '관리', color: 'text-cyan-300', action: onManage },
    { id: 'record', icon: BookOpen, label: '기록', color: 'text-emerald-300', action: () => console.log("기록함: 준비중") },
    { id: 'gacha', icon: Sparkles, label: '연결', color: 'text-violet-300', action: () => console.log("가챠: 준비중") },
    { id: 'storage', icon: Archive, label: '창고', color: 'text-amber-300', action: onStorage }, // 연결!
    { id: 'shop', icon: ShoppingCart, label: '상점', color: 'text-rose-300', action: () => console.log("상점: 준비중") },
  ];

  return (
    // ... (이하 기존 코드와 동일) ...
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#0f172a] overflow-hidden font-sans border-x border-white/10 shadow-2xl text-slate-100 relative">
      
      {/* 배경 스타일 */}
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 0.8; transform: scale(1.2); } }
        .star { position: absolute; background: white; border-radius: 50%; animation: twinkle 3s infinite ease-in-out; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
        {[...Array(30)].map((_, i) => (
            <div key={i} className="star" style={{
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, animationDelay: `${Math.random() * 3}s`
            }}></div>
        ))}
      </div>

      <div className="relative z-10 flex justify-between items-start p-4">
        <button className="flex items-center gap-3 pl-1 pr-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full transition-all active:scale-95 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-white/20 shadow-lg group-hover:shadow-cyan-500/30 transition-shadow">
                <User size={16} className="text-white" />
            </div>
            <div className="flex flex-col items-start">
                <span className="text-[10px] text-cyan-200 font-bold tracking-wider">OBSERVER</span>
                <span className="text-xs text-slate-200 font-light">Lv.12 플레이어</span>
            </div>
        </button>

        <div className="flex gap-2">
            <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-xs font-mono text-amber-300 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>
                1,250
            </div>
            <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
                300
            </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center pb-20">
         <div className="mb-12 text-center animate-float">
            <div className="text-[10px] text-cyan-400 tracking-[0.5em] uppercase mb-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Project</div>
            <h1 className="text-5xl font-thin text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-widest">
                STAR<br/><span className="text-4xl">SEEKER</span>
            </h1>
         </div>

         <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl animate-pulse-ring"></div>
            <button 
                onClick={onStart}
                className="relative w-48 h-16 bg-gradient-to-r from-cyan-900/80 to-blue-900/80 hover:from-cyan-800 hover:to-blue-800 border border-cyan-500/50 rounded-full flex items-center justify-center gap-3 backdrop-blur-md shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_50px_rgba(34,211,238,0.6)]"
            >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <Play size={14} className="fill-white text-white ml-0.5" />
                </div>
                <span className="text-lg font-bold text-white tracking-widest drop-shadow-md">관측 개시</span>
            </button>
         </div>
      </div>

      <div className="relative z-20 px-4 pb-6 pt-2">
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => (
                <button 
                    key={item.id}
                    onClick={item.action}
                    className="flex-1 flex flex-col items-center justify-center py-2 gap-1.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors group relative"
                >
                    <item.icon size={20} className={`${item.color} opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-md`} />
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium tracking-tight transition-colors">{item.label}</span>
                    <div className="absolute top-1 w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-50 transition-opacity"></div>
                </button>
            ))}
        </div>
      </div>

    </div>
  );
}