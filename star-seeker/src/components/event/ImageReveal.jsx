import React, { useState, useRef } from 'react';

// 텍스트 내 {name} 플레이스홀더를 코드 네임(닉네임)으로 치환
const applyNickname = (text, nickname) => {
  if (!text) return text;
  return text.replace(/\{name\}/g, nickname || '관측자');
};

// 외형 확인 등 단일 이미지를 보여주는 인터랙티브 컷씬.
// - 처음엔 어둡게 표시되고, 마우스를 올리거나 터치하면 원본 밝기로 드러남
// - 클릭/터치하면 다음 장면으로 진행
export default function ImageReveal({ scene, onNext, paused, nickname }) {
  const [revealed, setRevealed] = useState(false);
  // 터치 환경: 첫 탭은 밝게 드러내기만 하고(자동 진행 방지), 두 번째 탭에서 다음으로 진행
  const justRevealedByTouch = useRef(false);

  const caption = applyNickname(scene.text, nickname);
  const speaker = applyNickname(scene.speaker, nickname);

  const handleTouchStart = () => {
    if (!revealed) {
      justRevealedByTouch.current = true;
      setRevealed(true);
    }
  };

  const handleClick = () => {
    if (paused) return;
    // 방금 터치로 이미지를 드러낸 탭이라면 이번 탭은 진행하지 않고 소비
    if (justRevealedByTouch.current) {
      justRevealedByTouch.current = false;
      return;
    }
    if (onNext) onNext();
  };

  return (
    <div
      className="relative w-full h-full bg-black flex items-start justify-center overflow-hidden cursor-pointer select-none"
      onClick={handleClick}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onTouchStart={handleTouchStart}
    >
      <img
        src={scene.image}
        alt=""
        draggable={false}
        className={`max-w-full max-h-[92%] object-contain object-top transition-all duration-700 ease-out ${
          revealed ? 'brightness-100 opacity-100 scale-100' : 'brightness-[0.2] opacity-70 scale-[0.98]'
        }`}
      />

      {/* 상단 힌트: 아직 드러나지 않았을 때만 */}
      <div
        className={`absolute top-5 left-0 right-0 flex justify-center transition-opacity duration-500 pointer-events-none ${
          revealed ? 'opacity-0' : 'opacity-70'
        }`}
      >
        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-cyan-300 animate-pulse">
          ▷ 터치하여 확인
        </span>
      </div>

      {/* 하단 캡션 */}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 px-6 pt-10 pb-6 bg-gradient-to-t from-black/85 via-black/50 to-transparent pointer-events-none">
          {speaker && (
            <p className="text-cyan-300/80 text-xs font-mono tracking-widest mb-1.5">{speaker}</p>
          )}
          <p className="text-slate-100 text-base leading-relaxed whitespace-pre-wrap">{caption}</p>
        </div>
      )}
    </div>
  );
}
