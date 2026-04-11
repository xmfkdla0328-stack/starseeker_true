import React, { useState } from 'react';
import { Sword, Shield, Zap, Sparkles, Brain, Heart, X } from 'lucide-react';

const STAT_INFO = {
  str: {
    label: '힘', sub: 'STR',
    effect: 'ATK', effectLabel: '전 파티원 공격력',
    color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-950/60',
    Icon: Sword,
  },
  agi: {
    label: '민첩', sub: 'AGI',
    effect: 'SPD', effectLabel: '전 파티원 행동속도',
    color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-950/60',
    Icon: Zap,
  },
  int: {
    label: '지력', sub: 'INT',
    effect: '인과력', effectLabel: '인과력 획득량',
    color: 'text-violet-400', border: 'border-violet-500/50', bg: 'bg-violet-950/60',
    Icon: Brain,
  },
  wil: {
    label: '의지', sub: 'WIL',
    effect: 'DEF', effectLabel: '전 파티원 방어력',
    color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-950/60',
    Icon: Shield,
  },
  chr: {
    label: '매력', sub: 'CHR',
    effect: 'HP', effectLabel: '전 파티원 최대 HP',
    color: 'text-pink-400', border: 'border-pink-500/50', bg: 'bg-pink-950/60',
    Icon: Heart,
  },
};

const STAT_ORDER = ['str', 'agi', 'int', 'wil', 'chr'];

export default function BattleControlZone({ playerCausality, buffs, userStats, onUseSkill }) {
  const [activeStat, setActiveStat] = useState(null);

  const handleStatClick = (e, key) => {
    e.stopPropagation();
    setActiveStat(prev => (prev === key ? null : key));
  };

  const info = activeStat ? STAT_INFO[activeStat] : null;
  const val  = activeStat ? userStats[activeStat] : 0;
  const bonus = val * 1; // +1% per point → val%

  return (
    <div
      className="p-3 flex flex-col z-20 backdrop-blur-md bg-[#0f172a]/80 border-t border-white/10 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)] min-h-0"
      onClick={() => setActiveStat(null)}
    >
      {/* 인과력 게이지 */}
      <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
        <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-wider text-sm drop-shadow-md">
          <Sparkles size={14} className="animate-pulse" />
          <span>CAUSALITY</span>
        </div>
        <div className="flex-1 mx-3 h-3 bg-slate-800/50 rounded-sm overflow-hidden border border-white/10 relative group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDFoMXYxSDF6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300 relative shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${Math.min(100, playerCausality)}%` }}>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-200">{Math.floor(playerCausality)}<span className="text-slate-500">/100</span></span>
      </div>

      {/* 스킬 버튼 */}
      <div className="flex gap-3 flex-1 mb-3 min-h-0">
        <button onClick={() => onUseSkill('atk')} className={`flex-1 flex flex-col items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 group ${buffs.atk.active ? 'border-rose-500/50 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95'}`}>
          <Sword size={18} className={`mb-1 transition-colors ${buffs.atk.active ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-300'}`} />
          <span className={`text-[10px] font-bold tracking-wide ${buffs.atk.active ? 'text-rose-200' : 'text-slate-300 group-hover:text-white'}`}>ATTACK</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{buffs.atk.active ? `${(buffs.atk.timeLeft/1000).toFixed(1)}s` : '10 CP'}</span>
        </button>
        <button onClick={() => onUseSkill('shield')} className={`flex-1 flex flex-col items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 group ${buffs.shield.active ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95'}`}>
          <Shield size={18} className={`mb-1 transition-colors ${buffs.shield.active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
          <span className={`text-[10px] font-bold tracking-wide ${buffs.shield.active ? 'text-cyan-200' : 'text-slate-300 group-hover:text-white'}`}>DEFENSE</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{buffs.shield.active ? `${(buffs.shield.timeLeft/1000).toFixed(1)}s` : '20 CP'}</span>
        </button>
        <button onClick={() => onUseSkill('speed')} className={`flex-1 flex flex-col items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 group ${buffs.speed.active ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95'}`}>
          <Zap size={18} className={`mb-1 transition-colors ${buffs.speed.active ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'}`} />
          <span className={`text-[10px] font-bold tracking-wide ${buffs.speed.active ? 'text-amber-200' : 'text-slate-300 group-hover:text-white'}`}>HASTE</span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{buffs.speed.active ? `${(buffs.speed.timeLeft/1000).toFixed(1)}s` : '30 CP'}</span>
        </button>
      </div>

      {/* 스탯 바 + 툴팁 */}
      <div className="relative flex-shrink-0">

        {/* 툴팁 팝업 */}
        {activeStat && info && (
          <div
            className={`absolute bottom-full mb-2 left-0 right-0 z-50 animate-fade-in
              ${info.bg} border ${info.border} backdrop-blur-xl rounded-lg shadow-[0_0_24px_rgba(0,0,0,0.6)]`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className={`flex items-center justify-between px-3 py-2 border-b border-white/10`}>
              <div className="flex items-center gap-2">
                <info.Icon size={13} className={info.color} />
                <span className={`text-xs font-bold font-mono tracking-wider ${info.color}`}>
                  {info.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{info.sub}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold font-mono ${info.color}`}>{val}</span>
                <button
                  onClick={() => setActiveStat(null)}
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* 내용 */}
            <div className="px-3 py-2.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-slate-500 font-mono tracking-wider mb-0.5">
                  {info.effectLabel}
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  {info.effect} 보정
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-mono mb-0.5">현재 보너스</div>
                <div className={`text-lg font-bold font-mono ${info.color}`}>
                  +{bonus}%
                </div>
              </div>
            </div>

            {/* 하단 힌트 */}
            <div className="px-3 pb-2">
              <div className="h-[1px] bg-white/5 mb-1.5" />
              <span className="text-[9px] font-mono text-slate-600 tracking-wider">
                1포인트 = +1% · 선택지를 통해 상승
              </span>
            </div>
          </div>
        )}

        {/* 스탯 정보 바 */}
        <div className="flex justify-between items-center bg-black/40 rounded px-2 py-2 border border-white/5 font-mono">
          {STAT_ORDER.map(key => {
            const s = STAT_INFO[key];
            const isActive = activeStat === key;
            return (
              <button
                key={key}
                onClick={e => handleStatClick(e, key)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all duration-150
                  ${isActive
                    ? `${s.bg} ${s.border} border ring-1 ring-white/10`
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
              >
                <s.Icon size={10} className={s.color} />
                <span className={`text-[10px] ${isActive ? s.color : 'text-slate-400'}`}>
                  {userStats[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
