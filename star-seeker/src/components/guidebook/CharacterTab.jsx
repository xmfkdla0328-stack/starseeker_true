import React, { useState } from 'react';
import { Lock, Star, Heart } from 'lucide-react';
import { ALL_CHARACTERS } from '../../data/gameData';

export default function CharacterTab() {
  const [selectedCharId, setSelectedCharId] = useState(ALL_CHARACTERS[0].id);
  const selectedChar = ALL_CHARACTERS.find(c => c.id === selectedCharId);

  // 임시 인연도 레벨 (추후 App.jsx에서 props로 받아오도록 확장 가능)
  const currentBondLevel = 2; 

  return (
    <div className="h-full flex flex-col">
      {/* 상단 캐릭터 선택 (가로 스크롤) */}
      <div className="flex-shrink-0 p-3 border-b border-white/5 bg-black/20">
        <div className="flex overflow-x-auto gap-3 scrollbar-hide">
          {ALL_CHARACTERS.map(char => (
            <button key={char.id} onClick={() => setSelectedCharId(char.id)} 
              className={`flex-shrink-0 w-12 h-12 rounded-full border-2 overflow-hidden transition-all
              ${selectedCharId === char.id ? 'border-emerald-400 scale-110' : 'border-slate-700 opacity-60'}`}>
              <div className={`w-full h-full bg-gradient-to-br ${char.color} flex items-center justify-center`}>
                <span className="text-sm font-bold text-white">{char.role.charAt(0)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
        {/* 프로필 헤더 */}
        <div className="flex items-end justify-between border-b border-white/10 pb-2">
          <div>
            <h3 className="text-2xl font-bold text-white">{selectedChar.name}</h3>
            <p className="text-xs text-slate-400">{selectedChar.role} CLASS • {'★'.repeat(selectedChar.star)}</p>
          </div>
          <div className="flex items-center gap-1 text-pink-400 text-xs font-bold bg-pink-900/20 px-2 py-1 rounded-full border border-pink-500/30">
            <Heart size={10} className="fill-pink-400" /> Lv.{currentBondLevel}
          </div>
        </div>

        {/* 프로필 상세 */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <ProfileItem label="나이" value={selectedChar.profile?.age} />
          <ProfileItem label="신장" value={selectedChar.profile?.height} />
          <ProfileItem label="취미" value={selectedChar.profile?.hobby} />
          <ProfileItem label="좋아하는 것" value={selectedChar.profile?.like} />
          <ProfileItem label="싫어하는 것" value={selectedChar.profile?.dislike} />
        </div>

        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed italic">
          "{selectedChar.desc}"
        </div>

        {/* 인연 스토리 */}
        <div>
          <h4 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
            <Star size={14} /> 인연 스토리
          </h4>
          <div className="space-y-2">
            {selectedChar.bondStories?.map((story) => {
              const isUnlocked = currentBondLevel >= story.unlockLevel;
              return (
                <div key={story.id} className={`p-3 rounded-lg border transition-all
                    ${isUnlocked ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-black/40 border-white/5'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-bold ${isUnlocked ? 'text-emerald-100' : 'text-slate-600'}`}>
                      {story.title}
                    </span>
                    {!isUnlocked && <span className="text-[10px] text-slate-600 flex items-center gap-1"><Lock size={10}/> 인연 Lv.{story.unlockLevel}</span>}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {isUnlocked ? story.desc : '아직 열람할 수 없는 기억입니다.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}