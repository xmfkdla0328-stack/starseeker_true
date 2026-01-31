import React from 'react';
import { Shield, Sword, Heart, Zap, Brain, Star, Lock } from 'lucide-react';

export default function StatusPanel({ char }) {
  const efficiencyPercent = Math.round((char.efficiency || 1.0) * 100);
  const normalMult = (char.normalMult || 1.0).toFixed(1);
  const skillMult = (char.skillMult || 2.5).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
        <h3 className="text-xs text-slate-400 mb-2 font-mono">BIO-DATA</h3>
        <p className="text-sm text-slate-200 leading-relaxed font-light">
          "{char.desc}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Heart} label="MAX HP" value={char.baseHp} color="text-rose-400" />
        <StatCard icon={Sword} label="ATK" value={char.baseAtk} color="text-amber-400" />
        <StatCard icon={Shield} label="DEF" value={char.baseDef} color="text-emerald-400" />
        <StatCard icon={Zap} label="SPD" value={char.baseSpd} color="text-violet-400" />
        <StatCard icon={Brain} label="Efficiency" value={`${efficiencyPercent}%`} color="text-cyan-400" />
        <StatCard icon={Star} label="Star Rank" value={`${char.star} ★`} color="text-yellow-400" />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 p-2 bg-white/5 rounded border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 block">평타 배율</span>
          <span className="text-sm font-mono text-slate-200">x{normalMult}</span>
        </div>
        <div className="flex-1 p-2 bg-white/5 rounded border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 block">필살기 배율</span>
          <span className="text-sm font-mono text-slate-200">x{skillMult}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs text-slate-400 mb-3 font-mono">EQUIPMENT SLOTS</h3>
        <div className="flex gap-4 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-16 h-16 bg-black/40 border border-white/10 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-slate-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded bg-black/30 ${color}`}>
          <Icon size={14} />
        </div>
        <span className="text-[10px] text-slate-400 font-bold tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-mono text-white">{value}</span>
    </div>
  );
}