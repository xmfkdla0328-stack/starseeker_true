import React, { useMemo } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, Save, UserPlus, X, AlertCircle } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/gameData'; // 데이터 경로 확인 필요
import ParticleBackground from './common/ParticleBackground';

// ----------------------------------------------------------------------
// [Sub Component] 파티 슬롯 카드
// ----------------------------------------------------------------------
const PartySlot = ({ member, onClick, index }) => {
  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-[3/4] rounded-xl border transition-all duration-300 overflow-hidden group flex flex-col items-center justify-center
        ${member 
          ? 'border-cyan-500/50 bg-slate-900/60 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 border-dashed'
        }`}
    >
      {member ? (
        <>
          {/* 캐릭터 이미지 or 심볼 */}
          {member.image ? (
            <img 
                src={member.image} 
                alt={member.name} 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                onError={(e) => e.target.style.display = 'none'} 
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-40 group-hover:opacity-50 transition-opacity`}></div>
          )}
          
          {/* 그라데이션 오버레이 (텍스트 가독성용) */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

          {/* 캐릭터 정보 */}
          <div className="absolute bottom-2 left-0 right-0 px-2 text-center">
             <div className="text-[10px] text-cyan-400 font-bold tracking-wider mb-0.5">
                {member.role.toUpperCase()}
             </div>
             <div className="text-sm font-bold text-white truncate shadow-black drop-shadow-md">
                {member.name}
             </div>
          </div>

          {/* 제거 버튼 (Hover 시 등장) */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-1">
            <X size={12} className="text-rose-400" />
          </div>

          {/* 슬롯 번호 (장식) */}
          <div className="absolute top-1 left-2 text-[10px] font-mono text-white/30">
            0{index + 1}
          </div>
        </>
      ) : (
        /* 빈 슬롯 상태 */
        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-cyan-400 transition-colors">
            <UserPlus size={24} />
            <span className="text-[10px] tracking-widest font-mono">EMPTY</span>
        </div>
      )}
    </button>
  );
};

// ----------------------------------------------------------------------
// [Sub Component] 로스터 리스트 아이템
// ----------------------------------------------------------------------
const RosterItem = ({ char, isSelected, onToggle }) => {
    return (
        <button 
            onClick={() => onToggle(char)}
            className={`w-full flex items-center p-3 rounded-xl border transition-all duration-200 relative overflow-hidden group
                ${isSelected 
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]' 
                    : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/20'
                }`}
        >
            {/* 선택 시 좌측 인디케이터 */}
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>}

            {/* 초상화/아이콘 */}
            <div className={`w-12 h-12 rounded-lg mr-4 flex-shrink-0 relative overflow-hidden bg-slate-800 border ${isSelected ? 'border-cyan-500/30' : 'border-white/10'}`}>
                {char.image ? (
                    <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${char.color} flex items-center justify-center`}>
                        <span className="text-lg font-bold text-white/90">{char.role.charAt(0)}</span>
                    </div>
                )}
            </div>

            {/* 정보 영역 */}
            <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-sm truncate ${isSelected ? 'text-cyan-100' : 'text-slate-300'}`}>
                        {char.name}
                    </span>
                    {isSelected && (
                        <span className="flex-shrink-0 text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold tracking-wider">
                            ACTIVE
                        </span>
                    )}
                </div>
                
                {/* 스탯 그리드 */}
                <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Heart size={10} className="text-rose-400"/> {char.baseHp}</span>
                    <span className="flex items-center gap-1"><Sword size={10} className="text-amber-400"/> {char.baseAtk}</span>
                    <span className="flex items-center gap-1"><Shield size={10} className="text-emerald-400"/> {char.baseDef}</span>
                    <span className="flex items-center gap-1"><Zap size={10} className="text-violet-400"/> {char.baseSpd}</span>
                </div>
            </div>
        </button>
    );
};


// ----------------------------------------------------------------------
// [Main Component] PartyScreen
// ----------------------------------------------------------------------
export default function PartyScreen({ currentParty, onUpdateParty, onBack }) {
  
  const isInParty = (charId) => currentParty.some(c => c.id === charId);

  const toggleCharacter = (character) => {
    if (isInParty(character.id)) {
      const newParty = currentParty.filter(c => c.id !== character.id);
      onUpdateParty(newParty);
    } else {
      if (currentParty.length < 4) {
        onUpdateParty([...currentParty, character]);
      } else {
        // alert 대신 UI적인 피드백을 주는 것이 좋지만, 일단은 유지
        alert("파티 정원이 가득 찼습니다. (최대 4명)");
      }
    }
  };

  // 파티 전투력 합산 (단순 예시)
  const totalCombatPower = useMemo(() => {
      return currentParty.reduce((acc, char) => acc + (char.baseAtk + char.baseDef + char.baseHp/10), 0);
  }, [currentParty]);

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in bg-[#0f172a] h-full overflow-hidden">
      
      {/* 1. 배경 효과 적용 */}
      <ParticleBackground color="bg-cyan-500" />

      {/* 2. 헤더 */}
      <div className="relative z-20 flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/30 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="text-xs tracking-widest uppercase">BACK</span>
        </button>
        <div className="text-center">
            <h2 className="text-lg font-bold text-cyan-100 tracking-widest drop-shadow-md">SQUAD FORMATION</h2>
            <p className="text-[10px] text-cyan-500/80 font-mono tracking-wider">CP: {Math.floor(totalCombatPower)}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono">
            <span className={`text-lg font-bold ${currentParty.length === 4 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {currentParty.length}
            </span>
            <span className="text-slate-500">/4</span>
        </div>
      </div>

      {/* 3. 상단: 파티 슬롯 영역 */}
      <div className="relative z-10 p-4">
        <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((idx) => (
                <PartySlot 
                    key={idx} 
                    index={idx}
                    member={currentParty[idx]} 
                    onClick={() => currentParty[idx] && toggleCharacter(currentParty[idx])}
                />
            ))}
        </div>
      </div>

      {/* 4. 하단: 로스터 리스트 영역 (유리 패널 컨테이너) */}
      <div className="flex-1 relative z-10 flex flex-col min-h-0 bg-slate-950/40 backdrop-blur-md border-t border-white/10 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* 리스트 헤더 */}
        <div className="flex items-center gap-2 p-4 pb-2">
            <div className="w-1 h-4 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            <span className="text-xs text-slate-300 font-bold tracking-wider">ROSTER ARCHIVE</span>
            <div className="flex-1 h-px bg-white/10 ml-2"></div>
        </div>

        {/* 스크롤 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 pb-24">
            {ALL_CHARACTERS.map((char) => (
                <RosterItem 
                    key={char.id}
                    char={char}
                    isSelected={isInParty(char.id)}
                    onToggle={toggleCharacter}
                />
            ))}
        </div>

        {/* 하단 확정 버튼 (Floating) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
            <button 
                onClick={onBack}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2 transition-all active:scale-95 group"
            >
                <Save size={18} className="group-hover:animate-bounce" />
                <span className="tracking-widest">CONFIRM SQUAD</span>
            </button>
        </div>
      </div>

    </div>
  );
}