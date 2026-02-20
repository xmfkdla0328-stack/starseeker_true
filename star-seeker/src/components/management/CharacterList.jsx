import React, { useRef } from 'react';
import { ALL_CHARACTERS } from '../../data/characterData';

export default function CharacterList({ roster, selectedCharId, onSelect }) {
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
    isDragging.current = false;
  };

  const onMouseUp = () => {
    isDown.current = false;
  };

  const onMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 5) {
      isDragging.current = true;
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const handleCharClick = (charId) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    onSelect(charId);
  };

  const selectedChar = roster.find(c => c.id === selectedCharId) || roster[0];

  return (
    <div className="w-full py-4">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto px-6 gap-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none py-2"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {roster.map((char) => {
          const isSelected = char.id === selectedCharId;
          
          const staticData = ALL_CHARACTERS.find(c => c.id === char.id);
          const listImage = staticData?.listImage;

          return (
            <button
              key={char.id}
              onClick={() => handleCharClick(char.id)}
              onDragStart={(e) => e.preventDefault()}
              className={`flex-shrink-0 w-14 h-14 rounded-full border-2 relative overflow-hidden transition-all duration-300
                  ${isSelected
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-110 z-10'
                  : 'border-slate-600/50 hover:border-slate-400 opacity-70 hover:opacity-100 hover:scale-105' 
                }`}
            >
              {/* [수정] 배경 색상 변경: 원색 계열(char.color) -> 짙은 남색~검정 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black"></div>
              
              {/* 역할 아이콘 (이미지 로드 전 표시) */}
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white/90 drop-shadow-md">
                {char.role.charAt(0)}
              </span>

              {/* 얼굴 이미지 */}
              {listImage && (
                <img 
                    src={listImage} 
                    alt={char.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'} 
                />
              )}
              
              {/* 선택 시 광택 효과 */}
              {isSelected && <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/30 to-transparent mix-blend-overlay"></div>}
            </button>
          );
        })}
        <div className="w-4 flex-shrink-0"></div>
      </div>
      
      {/* 하단 텍스트 정보 */}
      <div className="text-center mt-2 animate-fade-in">
        <span className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg tracking-widest">
            {selectedChar.name}
        </span>
        <div className="flex items-center justify-center gap-2 text-[10px] text-cyan-400 font-mono mt-1 tracking-widest">
          <span className="px-1.5 py-0.5 bg-cyan-950/50 rounded border border-cyan-500/20">{selectedChar.role} CLASS</span>
          <span className="text-amber-400">{'★'.repeat(selectedChar.star)}</span>
        </div>
      </div>
    </div>
  );
}