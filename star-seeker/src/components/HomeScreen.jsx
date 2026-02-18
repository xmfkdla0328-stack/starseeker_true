import React, { useState, useEffect } from 'react';
import { Play, Users, Settings, Database, BookOpen, Sparkles } from 'lucide-react';

export default function HomeScreen({ onStart, onParty, onManage, onStorage, onRecord, onGacha, inventory }) {
  const [touchStart, setTouchStart] = useState(null);
  
  // [New] 자원 갯수 찾기 (데이터가 없으면 0으로 표시)
  // 1. 데이터 보강칩 (노란색/칩)
  const chipCount = inventory?.find(i => i.id === 'chip_basic')?.count || 0;
  // 2. 인과석 (파란색/스톤)
  const stoneCount = inventory?.find(i => i.id === 'causality_stone')?.count || 0;

  // 파티클 효과용 상태
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = prev.filter(p => p.life > 0).map(p => ({
          ...p,
          y: p.y - p.speed,
          life: p.life - 1,
          opacity: p.life / 50
        }));
        
        if (newParticles.length < 20) {
          newParticles.push({
            id: Math.random(),
            x: Math.random() * 100,
            y: 100,
            speed: Math.random() * 0.5 + 0.2,
            life: 50 + Math.random() * 50,
            opacity: 1
          });
        }
        return newParticles;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#0f172a] text-slate-100 animate-fade-in">
      
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow"></div>
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`, 
              opacity: p.opacity 
            }}
          />
        ))}
      </div>

      {/* 상단 정보 바 */}
      <div className="flex justify-between items-center p-6 z-10">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
             <span className="font-bold text-white text-lg">P</span>
           </div>
           <div className="flex flex-col">
             <span className="text-sm font-bold text-slate-100 tracking-wider">PLAYER</span>
             <span className="text-[10px] text-cyan-400 font-mono">Lv. 5 / RANK D</span>
           </div>
        </div>

        <div className="flex gap-2">
            {/* 데이터 보강칩 (노란색) */}
            <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-xs font-mono text-amber-300 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>
                {chipCount.toLocaleString()}
            </div>
            {/* 인과석 (파란색) */}
            <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
                {stoneCount.toLocaleString()}
            </div>
        </div>
      </div>

      {/* 메인 타이틀 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 -mt-20">
        <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-2">
          STAR<br/>SEEKER
        </h1>
        <p className="text-xs text-cyan-400 font-mono tracking-[0.5em] animate-pulse">
          PROJECT : INFINITY
        </p>
      </div>

      {/* 메인 메뉴 버튼들 */}
      <div className="flex flex-col gap-3 px-8 pb-12 z-10">
        <button 
          onClick={onStart}
          className="group relative w-full py-5 bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/30 rounded-xl transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="flex items-center justify-center gap-3">
            <Play className="fill-cyan-400 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-[0.2em] text-white group-hover:text-cyan-200">GAME START</span>
          </div>
        </button>

        <div className="grid grid-cols-4 gap-3">
           <MenuButton icon={Users} label="PARTY" onClick={onParty} color="text-violet-400" />
           <MenuButton icon={Settings} label="MANAGE" onClick={onManage} color="text-emerald-400" />
           <MenuButton icon={Database} label="STORAGE" onClick={onStorage} color="text-amber-400" />
           <MenuButton icon={BookOpen} label="ARCHIVE" onClick={onRecord} color="text-rose-400" />
        </div>
        
        {/* 가챠 버튼 추가 */}
        <button 
            onClick={onGacha}
            className="w-full py-3 mt-2 bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 border border-fuchsia-500/30 hover:border-fuchsia-400 rounded-lg flex items-center justify-center gap-2 group transition-all"
        >
            <Sparkles size={16} className="text-fuchsia-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold text-fuchsia-200 tracking-widest">WISH / GACHA</span>
        </button>
      </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, color }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-900/50 border border-white/5 hover:bg-slate-800 hover:border-white/20 rounded-xl transition-all active:scale-95"
    >
      <Icon size={20} className={color} />
      <span className="text-[10px] font-bold text-slate-400">{label}</span>
    </button>
  );
}