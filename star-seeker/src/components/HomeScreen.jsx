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

      {/* 하단 메뉴 — 유리 패널 */}
      <div className="px-4 pb-8 z-10 flex flex-col gap-2">

        {/* GAME START */}
        <button
          onClick={onStart}
          className="relative rounded-xl overflow-hidden active:scale-[0.98] transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.13) 0%, rgba(2,20,40,0.6) 100%)',
            border: '1px solid rgba(6,182,212,0.55)',
            boxShadow: '0 0 24px rgba(6,182,212,0.1)'
          }}
        >
          <div className="absolute -top-6 left-8 w-28 h-16 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center px-4 py-[14px] gap-4">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.5)' }}
            >
              <Play size={18} className="fill-cyan-300 text-cyan-300 ml-0.5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-mono tracking-[0.4em] text-cyan-400/60 mb-0.5">✦ ENGAGE MISSION</span>
              <span className="text-[15px] font-bold tracking-[0.18em] text-white">GAME START</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.9)] animate-pulse" />
              <span className="text-[8px] font-mono tracking-widest text-cyan-500/60">READY</span>
            </div>
          </div>
        </button>

        {/* 서브 5버튼 — 한 줄 */}
        <div className="grid grid-cols-5 gap-1.5">
          <MenuButton icon={Users}    label="PARTY"   onClick={onParty} />
          <MenuButton icon={Settings} label="MANAGE"  onClick={onManage} />
          <MenuButton icon={Database} label="STORAGE" onClick={onStorage} />
          <MenuButton icon={BookOpen} label="ARCHIVE" onClick={onRecord} />
          <GachaButton onClick={onGacha} />
        </div>

      </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl active:scale-95 transition-all duration-150"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.22)',
        minHeight: '60px',
      }}
    >
      <Icon size={16} className="text-slate-200" />
      <span className="text-[7px] font-mono tracking-wider text-slate-500 leading-none">{label}</span>
    </button>
  );
}

function GachaButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl active:scale-95 transition-all duration-150 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(168,85,247,0.18) 0%, rgba(40,5,60,0.5) 100%)',
        border: '1px solid rgba(192,132,252,0.55)',
        minHeight: '60px',
      }}
    >
      <div className="absolute inset-0 bg-fuchsia-500/5 pointer-events-none" />
      <Sparkles size={16} className="text-fuchsia-300" />
      <span className="text-[7px] font-mono tracking-wider text-fuchsia-400/80 leading-none">GACHA</span>
    </button>
  );
}