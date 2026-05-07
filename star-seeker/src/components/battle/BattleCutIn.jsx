import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// [Step 5-2b-i] 진영별 액센트 색상 토큰.
// ally(현재): cyan-400 (시안), enemy(신규): rose-500 (장미빨강).
// 알파값별로 미리 정의해 styled 안에서 단순 lookup.
const SIDE_TOKENS = {
  ally: {
    edge:    'rgba(34, 211, 238, 0.55)',   // EyeWindow 테두리
    glow:    'rgba(34, 211, 238, 0.18)',   // EyeWindow 글로우
    scan:    'rgba(34, 211, 238, 0.85)',   // 스캔 라인
    accent:  'rgba(34, 211, 238, 0.7)',    // AccentBar
    name:    'rgba(34, 211, 238, 0.92)',   // CharName 색
    nameGlow:'rgba(34, 211, 238, 0.8)',    // CharName 글로우
    skillGlow:'rgba(34, 211, 238, 0.45)',  // SkillName 보조 글로우
  },
  enemy: {
    edge:    'rgba(244, 63, 94, 0.6)',
    glow:    'rgba(244, 63, 94, 0.22)',
    scan:    'rgba(244, 63, 94, 0.9)',
    accent:  'rgba(244, 63, 94, 0.75)',
    name:    'rgba(251, 113, 133, 0.95)',
    nameGlow:'rgba(244, 63, 94, 0.8)',
    skillGlow:'rgba(244, 63, 94, 0.5)',
  },
};

const tokens = (side) => SIDE_TOKENS[side === 'enemy' ? 'enemy' : 'ally'];

const backdropFade = keyframes`
  0%   { opacity: 0; }
  8%   { opacity: 1; }
  88%  { opacity: 1; }
  100% { opacity: 0; }
`;

const barSlideTop = keyframes`
  0%   { transform: translateY(-100%); }
  12%  { transform: translateY(0%); }
  88%  { transform: translateY(0%); }
  100% { transform: translateY(-100%); }
`;

const barSlideBottom = keyframes`
  0%   { transform: translateY(100%); }
  12%  { transform: translateY(0%); }
  88%  { transform: translateY(0%); }
  100% { transform: translateY(100%); }
`;

// [Step 5-2b-i] 아군: 이미지가 오른쪽에서 들어와 왼쪽으로 빠짐 (기존 유지).
const imageRevealAlly = keyframes`
  0%   { transform: translateX(80px) scale(1.22); opacity: 0; filter: brightness(2) blur(6px); }
  16%  { transform: translateX(0px)  scale(1.18); opacity: 1; filter: brightness(1) blur(0); }
  84%  { transform: translateX(-18px) scale(1.22); opacity: 1; filter: brightness(1.05) blur(0); }
  100% { transform: translateX(-60px) scale(1.25); opacity: 0; filter: brightness(1.5) blur(4px); }
`;

// [Step 5-2b-i] 적측: 위 애니메이션을 좌우 반전. X 부호 모두 뒤집음.
const imageRevealEnemy = keyframes`
  0%   { transform: translateX(-80px) scale(1.22); opacity: 0; filter: brightness(2) blur(6px); }
  16%  { transform: translateX(0px)   scale(1.18); opacity: 1; filter: brightness(1) blur(0); }
  84%  { transform: translateX(18px)  scale(1.22); opacity: 1; filter: brightness(1.05) blur(0); }
  100% { transform: translateX(60px)  scale(1.25); opacity: 0; filter: brightness(1.5) blur(4px); }
`;

const scanSweep = keyframes`
  0%   { top: -4px; opacity: 0.9; }
  100% { top: 110%; opacity: 0; }
`;

const flashBurst = keyframes`
  0%   { opacity: 0.9; }
  12%  { opacity: 0.1; }
  18%  { opacity: 0.6; }
  30%  { opacity: 0; }
  100% { opacity: 0; }
`;

// [Step 5-2b-i] 텍스트 정렬은 둘 다 좌측 유지(사용자 결정). 슬라이드 X 부호만 반전.
const nameRevealAlly = keyframes`
  0%   { transform: translateX(-40px); opacity: 0; }
  18%  { transform: translateX(0px);   opacity: 1; }
  84%  { transform: translateX(8px);   opacity: 1; }
  100% { transform: translateX(60px);  opacity: 0; }
`;

const nameRevealEnemy = keyframes`
  0%   { transform: translateX(40px);  opacity: 0; }
  18%  { transform: translateX(0px);   opacity: 1; }
  84%  { transform: translateX(-8px);  opacity: 1; }
  100% { transform: translateX(-60px); opacity: 0; }
`;

const skillRevealAlly = keyframes`
  0%   { transform: translateX(-60px) skewX(-8deg); opacity: 0; }
  22%  { transform: translateX(0px)   skewX(-8deg); opacity: 1; }
  84%  { transform: translateX(12px)  skewX(-8deg); opacity: 1; }
  100% { transform: translateX(80px)  skewX(-8deg); opacity: 0; }
`;

const skillRevealEnemy = keyframes`
  0%   { transform: translateX(60px)  skewX(-8deg); opacity: 0; }
  22%  { transform: translateX(0px)   skewX(-8deg); opacity: 1; }
  84%  { transform: translateX(-12px) skewX(-8deg); opacity: 1; }
  100% { transform: translateX(-80px) skewX(-8deg); opacity: 0; }
`;

const accentLine = keyframes`
  0%   { width: 0%;   opacity: 0; }
  20%  { width: 100%; opacity: 0.7; }
  84%  { width: 100%; opacity: 0.4; }
  100% { width: 0%;   opacity: 0; }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 999;
  overflow: hidden;
  pointer-events: none;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.93);
  animation: ${backdropFade} 2s ease-in-out forwards;
`;

const FlashBurst = styled.div`
  position: absolute;
  inset: 0;
  background: #fff;
  z-index: 2;
  animation: ${flashBurst} 2s ease-out forwards;
`;

const BarTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 38%;
  background: #000;
  z-index: 3;
  animation: ${barSlideTop} 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const BarBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 38%;
  background: #000;
  z-index: 3;
  animation: ${barSlideBottom} 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const EyeWindow = styled.div`
  position: absolute;
  top: 38%;
  left: 0;
  right: 0;
  height: 24%;
  z-index: 4;
  overflow: hidden;
  border-top: 1.5px solid ${(p) => tokens(p.$side).edge};
  border-bottom: 1.5px solid ${(p) => tokens(p.$side).edge};
  box-shadow:
    0 0 24px ${(p) => tokens(p.$side).glow},
    inset 0 0 40px rgba(0, 0, 0, 0.45);
`;

const CharImage = styled.img`
  position: absolute;
  inset: 0;
  width: 140%;
  height: 100%;
  left: -20%;
  object-fit: cover;
  object-position: 50% 22%;
  animation: ${(p) => (p.$side === 'enemy' ? imageRevealEnemy : imageRevealAlly)}
    2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 14%,
    black 86%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 14%,
    black 86%,
    transparent 100%
  );
`;

const ScanLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    ${(p) => tokens(p.$side).scan},
    transparent
  );
  animation: ${scanSweep} 0.7s ease-out forwards;
  animation-delay: 0.1s;
  z-index: 5;
`;

const TextArea = styled.div`
  position: absolute;
  top: 38%;
  left: 0;
  right: 0;
  height: 24%;
  z-index: 6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 9%;
  gap: 3px;
`;

const AccentBar = styled.div`
  height: 1px;
  background: linear-gradient(
    to right,
    ${(p) => tokens(p.$side).accent},
    transparent
  );
  animation: ${accentLine} 2s ease-out forwards;
  animation-delay: 0.15s;
  margin-bottom: 4px;
`;

const CharName = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: ${(p) => tokens(p.$side).name};
  text-shadow: 0 0 14px ${(p) => tokens(p.$side).nameGlow};
  animation: ${(p) => (p.$side === 'enemy' ? nameRevealEnemy : nameRevealAlly)}
    2s ease-out forwards;
`;

const SkillName = styled.div`
  font-size: 2.2rem;
  font-weight: 900;
  font-style: italic;
  color: #ffffff;
  letter-spacing: 2px;
  line-height: 1;
  text-transform: uppercase;
  animation: ${(p) => (p.$side === 'enemy' ? skillRevealEnemy : skillRevealAlly)}
    2s ease-out forwards;
  text-shadow:
    0 0 22px rgba(255, 255, 255, 0.75),
    0 0 8px ${(p) => tokens(p.$side).skillGlow},
    3px 3px 0 rgba(0, 0, 0, 0.85);
`;

export default function BattleCutIn({ cutInInfo, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (cutInInfo) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cutInInfo, onComplete]);

  if (!visible || !cutInInfo) return null;

  // [Step 5-2b-i] side가 명시되지 않으면 'ally'로 폴백 (기존 아군 컷인 회귀 방지).
  const side = cutInInfo.side === 'enemy' ? 'enemy' : 'ally';

  return (
    <Overlay>
      <Backdrop />
      <FlashBurst />

      <BarTop />
      <BarBottom />

      <EyeWindow $side={side}>
        {cutInInfo.image && (
          <CharImage $side={side} src={cutInInfo.image} alt={cutInInfo.name} />
        )}
        <ScanLine $side={side} />
      </EyeWindow>

      <TextArea>
        <AccentBar $side={side} />
        <CharName $side={side}>{cutInInfo.name}</CharName>
        <SkillName $side={side}>{cutInInfo.skillName}</SkillName>
      </TextArea>
    </Overlay>
  );
}
