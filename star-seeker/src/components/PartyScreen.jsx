import React from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/gameData';

export default function PartyScreen({ currentParty, onUpdateParty, onBack }) {
  
  // 캐릭터가 현재 파티에 포함되어 있는지 확인
  const isInParty = (charId) => currentParty.some(c => c.id === charId);

  // 캐릭터 선택/해제 로직
  const toggleCharacter = (character) => {
    if (isInParty(character.id)) {
      // 이미 파티에 있으면 제거
      const newParty = currentParty.filter(c => c.id !== character.id);
      onUpdateParty(newParty);
    } else {
      // 파티에 없으면 추가 (최대 4명)
      if (currentParty.length < 4) {
        onUpdateParty([...currentParty, character]);
      } else {
        alert("파티 정원이 가득 찼습니다. (최대 4명)");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in p-4 h-full">
      
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="text-xs tracking-widest uppercase">BACK</span>
        </button>
        <h2 className="text-lg font-bold text-blue-100 tracking-widest drop-shadow-md">SQUAD FORMATION</h2>
        <div className="flex items-center gap-1 text-xs font-mono text-cyan-400">
            <span className="text-lg font-bold">{currentParty.length}</span>
            <span className="text-slate-500">/4</span>
        </div>
      </div>

      {/* 1. 상단: 현재 파티 슬롯 (Visual) */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[0, 1, 2, 3].map((idx) => {
            const member = currentParty[idx];
            return (
                <div key={idx} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all
                    ${member 
                        ? 'border-blue-500/50 bg-slate-900/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                        : 'border-white/5 bg-black/20 border-dashed'
                    }`}
                    onClick={() => member && toggleCharacter(member)}
                >
                    {member ? (
                        <>
                            <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-40`}></div>
                            <span className="relative z-10 text-2xl font-bold text-white drop-shadow-md">{member.role.charAt(0)}</span>
                            <span className="relative z-10 text-[10px] text-white/90 mt-1 font-bold">{member.name}</span>
                            <div className="absolute top-1 right-1 z-10 bg-black/60 rounded-full p-0.5">
                                <RefreshCw size={8} className="text-slate-400" />
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-slate-600 font-mono">EMPTY</span>
                    )}
                </div>
            );
        })}
      </div>

      {/* 구분선 및 필터(모양만) */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
        <span className="text-xs text-slate-300 font-bold tracking-wider">ROSTER ARCHIVE</span>
        <div className="flex-1 h-px bg-white/10 ml-2"></div>
      </div>

      {/* 2. 하단: 전체 캐릭터 리스트 (스크롤) */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-2">
        {ALL_CHARACTERS.map((char) => {
            const selected = isInParty(char.id);
            return (
                <button 
                    key={char.id} 
                    onClick={() => toggleCharacter(char)}
                    className={`w-full flex items-center p-3 rounded-lg border transition-all duration-200 group
                        ${selected 
                            ? 'bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/30' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                >
                    {/* 초상화 */}
                    <div className={`w-12 h-12 rounded-lg mr-4 flex items-center justify-center bg-gradient-to-br ${char.color} shadow-inner`}>
                        <span className="text-lg font-bold text-white/90">{char.role.charAt(0)}</span>
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold text-sm ${selected ? 'text-blue-300' : 'text-slate-200'}`}>
                                {char.name}
                            </span>
                            {selected && <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">DEPLOYED</span>}
                        </div>
                        
                        {/* 스탯 요약 */}
                        <div className="flex gap-3 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-0.5"><Heart size={10} className="text-rose-400"/> {char.baseHp}</span>
                            <span className="flex items-center gap-0.5"><Sword size={10} className="text-amber-400"/> {char.baseAtk}</span>
                            <span className="flex items-center gap-0.5"><Shield size={10} className="text-emerald-400"/> {char.baseDef}</span>
                            <span className="flex items-center gap-0.5"><Zap size={10} className="text-violet-400"/> {char.baseSpd}</span>
                        </div>
                    </div>
                </button>
            );
        })}
      </div>

      {/* 저장 버튼 (사실 실시간 반영되지만 UX상 확인 버튼) */}
      <div className="absolute bottom-6 left-6 right-6">
        <button 
            onClick={onBack}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
            <Save size={18} />
            <span>CONFIRM SQUAD</span>
        </button>
      </div>

    </div>
  );
}