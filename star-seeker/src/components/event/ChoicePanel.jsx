import React from 'react';
import { Hand, ArrowRight } from 'lucide-react';

export default function ChoicePanel({ choices, onSelect }) {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-4 animate-fade-in">
      <p className="text-slate-400 text-sm italic text-center mb-2">분기점</p>
      
      {choices.map((choice) => (
        <button 
            key={choice.id}
            onClick={() => onSelect(choice)}
            className={`w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group
                ${choice.type === 'risk' ? 'hover:border-cyan-500/50' : 'hover:border-emerald-500/50'}`}
        >
            <div className="flex items-center justify-between">
                <span className={`font-bold ${choice.type === 'risk' ? 'text-cyan-200 group-hover:text-cyan-100' : 'text-emerald-200 group-hover:text-emerald-100'}`}>
                    {choice.text}
                </span>
                {choice.type === 'risk' ? (
                    <Hand size={16} className="text-slate-500 group-hover:text-cyan-400" />
                ) : (
                    <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400" />
                )}
            </div>
            <span className="text-xs text-slate-500 group-hover:text-slate-400 mt-1 block">
                {choice.type === 'risk' ? choice.riskText : choice.safeText}
            </span>
        </button>
      ))}
    </div>
  );
}