import React, { useMemo, useState } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, Save, UserPlus, Users, Lock } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/gameData';
import ParticleBackground from './common/ParticleBackground';

const ROLE_FILTERS = ['전체', 'EXECUTOR', 'PATHFINDER', 'SUSTAINER', 'KEEPER'];

const STAR_BAR   = { 5: 'bg-amber-400',  4: 'bg-violet-500' };
const STAR_TEXT  = { 5: 'text-amber-400', 4: 'text-violet-400' };

function normalizeRole(role) {
  return role?.toUpperCase() ?? '';
}

// ----------------------------------------------------------------------
// [Sub] 파티 슬롯 카드
// ----------------------------------------------------------------------
const PartySlot = ({ member, index, isActive, onClick }) => {
  const role = normalizeRole(member?.role);
  const starText = STAR_TEXT[member?.star] ?? 'text-cyan-400';

  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-[3/4] rounded-xl border transition-all duration-200 overflow-hidden group flex flex-col items-center justify-center
        ${isActive
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-[1.03]'
          : member
            ? 'border-cyan-500/40 bg-slate-900/60 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
            : 'border-white/10 bg-white/5 hover:border-cyan-500/40 hover:bg-white/10 border-dashed'
        }`}
    >
      {member ? (
        <>
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              onError={(e) => e.target.style.display = 'none'}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-40`} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

          {isActive && (
            <div className="absolute inset-0 border-2 border-cyan-400 rounded-xl animate-pulse pointer-events-none" />
          )}

          <div className="absolute bottom-2 left-0 right-0 px-2 text-center">
            <div className={`text-[9px] font-bold tracking-wider mb-0.5 ${starText}`}>
              {role}
            </div>
            <div className="text-xs font-bold text-white truncate drop-shadow-md">
              {member.name}
            </div>
          </div>

          <div className="absolute top-1 left-1.5 text-[9px] font-mono text-white/25">
            0{index + 1}
          </div>

          <div className={`absolute top-1 right-1 text-[9px] font-mono px-1 rounded ${isActive ? 'bg-cyan-500 text-white' : 'bg-black/50 text-white/40'}`}>
            {isActive ? 'SEL' : '✕'}
          </div>
        </>
      ) : (
        <div className={`flex flex-col items-center gap-2 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
          {isActive
            ? <div className="flex flex-col items-center gap-1"><div className="w-6 h-6 rounded-full border-2 border-cyan-400 flex items-center justify-center"><span className="text-[10px] font-bold text-cyan-400">{index + 1}</span></div><span className="text-[9px] tracking-widest font-mono">SELECT</span></div>
            : <><UserPlus size={20} /><span className="text-[9px] tracking-widest font-mono">EMPTY</span></>
          }
        </div>
      )}
    </button>
  );
};

// ----------------------------------------------------------------------
// [Sub] 로스터 리스트 아이템
// ----------------------------------------------------------------------
const RosterItem = ({ char, slotIndex, isInParty, isDisabled, isTargetSlot, onSelect }) => {
  const role = normalizeRole(char.role);
  const barColor = STAR_BAR[char.star] ?? 'bg-cyan-500';

  return (
    <button
      onClick={() => !isDisabled && onSelect(char)}
      disabled={isDisabled}
      className={`w-full flex items-center p-3 rounded-xl border transition-all duration-150 relative overflow-hidden
        ${isDisabled
          ? 'opacity-30 cursor-not-allowed bg-slate-900/20 border-white/5'
          : isTargetSlot
            ? 'bg-cyan-950/50 border-cyan-400/70 shadow-[inset_0_0_20px_rgba(34,211,238,0.12)]'
            : isInParty
              ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[inset_0_0_12px_rgba(34,211,238,0.07)]'
              : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/20'
        }`}
    >
      {/* 역할 컬러 왼쪽 바 */}
      {!isDisabled && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor} ${isInParty || isTargetSlot ? 'opacity-100' : 'opacity-30'} rounded-l-xl`} />
      )}

      {/* 캐릭터 썸네일 */}
      <div className={`w-12 h-12 rounded-lg ml-1 mr-3 flex-shrink-0 relative overflow-hidden bg-slate-800 border ${isTargetSlot ? 'border-cyan-400/60' : isInParty ? 'border-cyan-500/30' : 'border-white/10'}`}>
        {char.image ? (
          <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${char.color} flex items-center justify-center`}>
            <span className="text-lg font-bold text-white/90">{char.role.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* 캐릭터 정보 */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`font-bold text-sm truncate ${isTargetSlot ? 'text-cyan-100' : isInParty ? 'text-cyan-200' : 'text-slate-300'}`}>
            {char.name}
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {isDisabled && <Lock size={11} className="text-slate-500" />}
            {isTargetSlot && (
              <span className="text-[9px] bg-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/40 font-bold tracking-wider">
                → {slotIndex + 1}번
              </span>
            )}
            {isInParty && !isTargetSlot && (
              <span className="text-[9px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/25 font-bold tracking-wider">
                ACTIVE
              </span>
            )}
            <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold tracking-wider text-slate-400 border-white/15 bg-white/5">
              {role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-0.5"><Heart size={9} className="text-rose-400" /> {char.baseHp}</span>
          <span className="flex items-center gap-0.5"><Sword size={9} className="text-amber-400" /> {char.baseAtk}</span>
          <span className="flex items-center gap-0.5"><Shield size={9} className="text-emerald-400" /> {char.baseDef}</span>
          <span className="flex items-center gap-0.5"><Zap size={9} className="text-violet-400" /> {char.baseSpd}</span>
        </div>
      </div>
    </button>
  );
};

// ----------------------------------------------------------------------
// [Main] PartyScreen
// ----------------------------------------------------------------------
export default function PartyScreen({ currentParty, onUpdateParty, onBack }) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [roleFilter, setRoleFilter] = useState('전체');

  const isInParty = (charId) => currentParty.some(c => c.id === charId);

  const partySlotOf = (charId) => currentParty.findIndex(c => c.id === charId);

  const handleSlotClick = (idx) => {
    if (selectedSlotIndex === idx) {
      setSelectedSlotIndex(null);
      return;
    }
    setSelectedSlotIndex(idx);
  };

  const handleRosterSelect = (character) => {
    const charPartyIdx = partySlotOf(character.id);
    const newParty = [...currentParty];

    if (selectedSlotIndex !== null) {
      // 선택 모드: 해당 슬롯에 캐릭터를 배치
      if (charPartyIdx !== -1) {
        // 이미 파티에 있는 캐릭터 → 현재 위치와 선택 슬롯을 교환
        const displaced = newParty[selectedSlotIndex];
        newParty[selectedSlotIndex] = character;
        if (displaced) {
          newParty[charPartyIdx] = displaced;
        } else {
          newParty.splice(charPartyIdx, 1);
        }
      } else {
        // 파티에 없는 캐릭터 → 선택 슬롯에 배치
        newParty[selectedSlotIndex] = character;
      }
      onUpdateParty(newParty.filter(Boolean));
      setSelectedSlotIndex(null);
    } else {
      // 선택 모드 아님: 토글 (파티에 있으면 제거)
      if (charPartyIdx !== -1) {
        onUpdateParty(currentParty.filter(c => c.id !== character.id));
      }
      // 파티에 없고 선택 모드도 아니면 → 아무 동작 없음 (슬롯을 먼저 선택해야 함)
    }
  };

  const filteredCharacters = useMemo(() => {
    if (roleFilter === '전체') return ALL_CHARACTERS;
    return ALL_CHARACTERS.filter(c => normalizeRole(c.role) === roleFilter);
  }, [roleFilter]);

  const totalCombatPower = useMemo(() => {
    return currentParty.reduce((acc, char) => acc + (char.baseAtk + char.baseDef + char.baseHp / 10), 0);
  }, [currentParty]);

  const partyFull = currentParty.length >= 4;

  const isSelectionMode = selectedSlotIndex !== null;

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in bg-[#0f172a] h-full overflow-hidden">
      <ParticleBackground color="bg-cyan-500" />

      {/* 헤더 */}
      <div className="relative z-20 flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-cyan-100 font-bold tracking-widest text-lg drop-shadow-md">
              <Users size={18} />
              <span>파티 편성</span>
            </div>
            <span className="text-[10px] text-cyan-500/80 font-mono tracking-wider pl-1">
              TOTAL CP: {Math.floor(totalCombatPower)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono">
          <span className={`text-lg font-bold ${partyFull ? 'text-rose-400' : 'text-cyan-400'}`}>
            {currentParty.length}
          </span>
          <span className="text-slate-500">/4</span>
        </div>
      </div>

      {/* 파티 슬롯 */}
      <div className="relative z-10 p-4 pb-2">
        <div className="grid grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map((idx) => (
            <PartySlot
              key={idx}
              index={idx}
              member={currentParty[idx]}
              isActive={selectedSlotIndex === idx}
              onClick={() => handleSlotClick(idx)}
            />
          ))}
        </div>

        {/* 선택 모드 안내 메시지 */}
        <div className={`mt-2.5 text-center text-[11px] font-mono transition-all duration-200 ${isSelectionMode ? 'text-cyan-400' : 'text-slate-600'}`}>
          {isSelectionMode
            ? `▼ ${selectedSlotIndex + 1}번 슬롯 — 아래에서 배치할 캐릭터를 선택하세요`
            : '슬롯을 탭하여 캐릭터를 선택하세요'}
        </div>
      </div>

      {/* 로스터 영역 */}
      <div className="flex-1 relative z-10 flex flex-col min-h-0 bg-slate-950/40 backdrop-blur-md border-t border-white/10 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

        {/* 역할 필터 탭 */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 overflow-x-auto no-scrollbar flex-shrink-0">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setRoleFilter(filter)}
              className={`flex-shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-lg border transition-all duration-150
                ${roleFilter === filter
                  ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-transparent border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 스크롤 리스트 */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2 pt-1">
          {filteredCharacters.map((char) => {
            const inParty = isInParty(char.id);
            const slotIdx = partySlotOf(char.id);
            const isTargetSlot = isSelectionMode && inParty && slotIdx === selectedSlotIndex;
            const isDisabled = partyFull && !inParty && !isSelectionMode;

            return (
              <RosterItem
                key={char.id}
                char={char}
                slotIndex={slotIdx}
                isInParty={inParty}
                isDisabled={isDisabled}
                isTargetSlot={isTargetSlot}
                onSelect={handleRosterSelect}
              />
            );
          })}
          {filteredCharacters.length === 0 && (
            <div className="flex items-center justify-center py-12 text-slate-600 text-xs font-mono tracking-wider">
              해당 역할의 캐릭터가 없습니다
            </div>
          )}
        </div>

        {/* 확정 버튼 */}
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
