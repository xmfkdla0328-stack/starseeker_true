import React from 'react';
import { X } from 'lucide-react';

export default function CharacterSelector({ availableMiners, onSelect, onClose }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col animate-fade-in">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900">
            <h3 className="text-white font-bold">채굴 요원 배치</h3>
            <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 content-start">
            {availableMiners.map(char => (
                <button 
                    key={char.id}
                    onClick={() => !char.isAssigned && onSelect(char.id)}
                    disabled={char.isAssigned}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all
                        ${char.isAssigned 
                            ? 'border-slate-700 bg-black/40 opacity-50 grayscale cursor-not-allowed' 
                            : 'border-slate-600 bg-slate-800 hover:border-cyan-400 hover:bg-slate-700'
                        }`}
                >
                    {char.image ? (
                        <img src={char.image} alt={char.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${char.color} opacity-60`}></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                    <span className="absolute bottom-1 left-0 right-0 z-10 text-[8px] text-slate-200 truncate text-center px-0.5 drop-shadow-md">{char.name}</span>
                    {char.isAssigned && <span className="absolute top-1 left-0 right-0 z-20 text-[7px] bg-red-900/80 text-red-200 px-1 text-center">배치중</span>}
                </button>
            ))}
        </div>
    </div>
  );
}