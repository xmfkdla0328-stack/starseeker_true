import React, { useRef, useState } from 'react';
import { ALL_CHARACTERS } from '../../data/characterData';

export default function CharacterList({ roster, selectedCharId, onSelect }) {
  // 드래그 스크롤 로직
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
    <div className="w-full bg-white/5 border-b border-white/10 py-3">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto px-4 gap-3 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
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
              // [수정] 미선택 시 흑백(grayscale) 및 투명도(opacity-60) 제거
              // 선택된 캐릭터의 파란색 발광 효과만 유지하고, 미선택은 기본 테두리만 남김
              className={`flex-shrink-0 w-14 h-14 rounded-full border-2 relative overflow-hidden transition-transform duration-200
                  ${isSelected
                  ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110'
                  : 'border-slate-600' 
                }`}
            >
              {/* 1. 기본 배경 (Fallback) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${char.color}`}></div>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white/90 drop-shadow-md">
                {char.role.charAt(0)}
              </span>

              {/* 2. 얼굴 이미지 */}
              {listImage && (
                <img 
                    src={listImage} 
                    alt={char.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'} 
                />
              )}
            </button>
          );
        })}
        <div className="w-4 flex-shrink-0"></div>
      </div>
      <div className="text-center mt-1">
        <span className="text-lg font-bold text-white tracking-widest drop-shadow-lg">{selectedChar.name}</span>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
          {selectedChar.role} CLASS • {'★'.repeat(selectedChar.star)}
        </p>
      </div>
    </div>
  );
}