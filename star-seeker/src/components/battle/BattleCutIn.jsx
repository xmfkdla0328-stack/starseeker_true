import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// 1. 슬라이드 애니메이션 (오른쪽에서 왼쪽으로 슉!)
const slideIn = keyframes`
  0% { transform: translateX(100%) skewX(-10deg); opacity: 0; }
  20% { transform: translateX(0) skewX(-10deg); opacity: 1; }
  80% { transform: translateX(-5%) skewX(-10deg); opacity: 1; }
  100% { transform: translateX(-10%) skewX(-10deg); opacity: 0; }
`;

// 2. 배경 암전 애니메이션
const fadeInOut = keyframes`
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
`;

const CutInOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 50; /* 이펙트 레이어보다 아래, UI보다 위 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  animation: ${fadeInOut} 1.5s ease-in-out forwards;
`;

const CharacterSlot = styled.div`
  position: absolute;
  right: -10%;
  height: 100%;
  width: 70%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${slideIn} 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
`;

const CharacterImage = styled.img`
  height: 120%;
  object-fit: cover;
  mask-image: linear-gradient(to right, transparent, black 20%);
  -webkit-mask-image: linear-gradient(to right, transparent, black 20%);
`;

const TextArea = styled.div`
  position: absolute;
  left: 5%;
  bottom: 20%;
  z-index: 10;
  animation: ${slideIn} 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
`;

const SkillName = styled.h2`
  font-size: 3rem;
  font-weight: 900;
  font-style: italic;
  color: #fff;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.8), 4px 4px 0px #000;
  margin: 0;
  line-height: 1;
`;

const SkillQuote = styled.p`
  font-size: 1.2rem;
  color: #a5f3fc;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-left: 4px solid #22d3ee;
  margin-top: 8px;
`;

export default function BattleCutIn({ cutInInfo, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (cutInInfo) {
      setVisible(true);
      // 1.5초 후 컷신 종료 알림
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cutInInfo, onComplete]);

  if (!visible || !cutInInfo) return null;

  return (
    <CutInOverlay>
      <Backdrop />
      
      {/* 캐릭터 이미지 영역 */}
      <CharacterSlot>
        {cutInInfo.image && <CharacterImage src={cutInInfo.image} alt="Cut-in" />}
      </CharacterSlot>

      {/* 텍스트 영역 */}
      <TextArea>
        <SkillName>{cutInInfo.skillName}</SkillName>
        <SkillQuote>"{cutInInfo.quote || "Target Lock. Engaging."}"</SkillQuote>
      </TextArea>
      
      {/* 장식용 라인 */}
      <div className="absolute inset-0 border-y-[50px] border-cyan-500/10 animate-pulse pointer-events-none"></div>
    </CutInOverlay>
  );
}