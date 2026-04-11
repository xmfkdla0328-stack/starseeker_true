import React, { useState, useEffect } from 'react';
import { Play, Users, Settings, Database, BookOpen, Sparkles } from 'lucide-react';

// [Fix] 프롭스(Props)에 방금 만든 levelInfo를 추가로 받아옵니다!
export default function HomeScreen({ onStart, onParty, onManage, onStorage, onRecord, onGacha, inventory, levelInfo }) {
  const [touchStart, setTouchStart] = useState(null);
  
  const chipCount = inventory?.find(i => i.id === 'chip_basic')?.count || 0;
  const stoneCount = inventory?.find(i => i.id === 'causality_stone')?.count || 0;

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

  // [NEW] 데이터가 아직 안 넘어왔을 때를 대비한 안전 장치 (기본값 Lv.1 / EXP 0)
  const currentLevel = levelInfo?.level || 1;
  const currentExp = levelInfo?.exp || 0;

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
             {/* [Fix] 더미 데이터를 지우고 실제 레벨과 경험치(EXP)를 출력합니다! */}
             <span className="text-[10px] text-cyan-400 font-mono tracking-widest">
                LV.{currentLevel} <span className="text-slate-500 mx-1">|</span> EXP {currentExp}
             </span>
           </div>
        </div>

        <div className="flex gap-2">
            <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-xs font-mono text-amber-300 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>
                {chipCount.toLocaleString()}
            </div>
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

      {/* 하단 커맨드 패널 */}
      <div className="relative px-5 pb-10 z-10">

        {/* 패널 상단 장식선 */}
        <div className="relative flex items-center gap-2 mb-4">
          <div className="w-2 h-2 border-l border-t border-white/25" />
          <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
          <span className="text-[8px] font-mono tracking-[0.4em] text-slate-600">SYSTEM INTERFACE</span>
          <div className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
          <div className="w-2 h-2 border-r border-t border-white/25" />
        </div>

        <div className="flex flex-col gap-2">

          {/* GAME START */}
          <button
            onClick={onStart}
            className="group relative w-full rounded overflow-hidden active:scale-[0.98] transition-all duration-200"
            style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 0 30px rgba(6,182,212,0.06) inset' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}>
                <Play size={15} className="fill-cyan-400 text-cyan-400 ml-0.5" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[8px] font-mono tracking-[0.3em] text-cyan-500/60">PRIMARY ACTION</span>
                <span className="text-sm font-bold tracking-[0.2em] text-white font-mono">GAME START</span>
              </div>
              <div className="ml-auto text-cyan-500/40 text-lg font-thin">›</div>
            </div>
          </button>

          {/* 서브 4버튼 */}
          <div className="grid grid-cols-4 gap-1.5">
            <MenuButton icon={Users} label="PARTY" onClick={onParty} />
            <MenuButton icon={Settings} label="MANAGE" onClick={onManage} />
            <MenuButton icon={Database} label="STORAGE" onClick={onStorage} />
            <MenuButton icon={BookOpen} label="ARCHIVE" onClick={onRecord} />
          </div>

          {/* WISH / GACHA */}
          <button
            onClick={onGacha}
            className="group relative w-full rounded overflow-hidden active:scale-[0.98] transition-all duration-200"
            style={{ background: 'rgba(49,10,76,0.7)', border: '1px solid rgba(192,132,252,0.2)', boxShadow: '0 0 30px rgba(168,85,247,0.04) inset' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}>
                <Sparkles size={15} className="text-fuchsia-400" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[8px] font-mono tracking-[0.3em] text-fuchsia-400/50">LIMITED GACHA</span>
                <span className="text-sm font-bold tracking-[0.2em] text-fuchsia-100 font-mono">WISH / GACHA</span>
              </div>
              <div className="ml-auto text-fuchsia-500/40 text-lg font-thin">›</div>
            </div>
          </button>

        </div>

        {/* 패널 하단 장식선 */}
        <div className="relative flex items-center gap-2 mt-4">
          <div className="w-2 h-2 border-l border-b border-white/25" />
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="w-2 h-2 border-r border-b border-white/25" />
        </div>

      </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 py-4 rounded active:scale-95 transition-all duration-150 relative overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="absolute top-0 left-1/3 right-1/3 h-px bg-white/10" />
      <Icon size={17} className="text-slate-300" />
      <span className="text-[8px] font-mono tracking-widest text-slate-500">{label}</span>
    </button>
  );
}