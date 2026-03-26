import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// 1. 배경 암전 애니메이션 (강력한 암전)
const flashDark = keyframes`
  0% { opacity: 0; background: rgba(0, 0, 0, 0); }
  10% { opacity: 1; background: rgba(0, 0, 0, 0.95); } /* 거의 검게 암전 */
  90% { opacity: 1; background: rgba(0, 0, 0, 0.9); }
  100% { opacity: 0; background: rgba(0, 0, 0, 0); }
`;

// 2. 위아래로 날카롭게 닫히는 레터박스
const cinematicClose = keyframes`
  0% { transform: scaleY(0); }
  15% { transform: scaleY(1); }
  90% { transform: scaleY(1); }
  100% { transform: scaleY(0); }
`;

// 3. 캐릭터 눈가 컷인 슬라이드 (더 빠르고 임팩트 있게)
const slideAndZoom = keyframes`
  0% { transform: translateX(60%) scale(1.15); opacity: 0; filter: blur(10px); }
  15% { transform: translateX(5%) scale(1.15); opacity: 1; filter: blur(0px); }
  85% { transform: translateX(-5%) scale(1.2); opacity: 1; filter: blur(0px); }
  100% { transform: translateX(-60%) scale(1.25); opacity: 0; filter: blur(10px); }
`;

// 4. 스킬 이름 텍스트 애니메이션 (날카로운 슬라이드)
const textSlide = keyframes`
  0% { transform: translateX(-100px) skewX(-20deg); opacity: 0; }
  15% { transform: translateX(0) skewX(-20deg); opacity: 1; }
  85% { transform: translateX(30px) skewX(-20deg); opacity: 1; }
  100% { transform: translateX(150px) skewX(-20deg); opacity: 0; }
`;

const CutInOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 999; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  animation: ${flashDark} 1.6s ease-out forwards;
`;

// [Fix] 시네마틱 레터박스를 훨씬 더 좁게 만듭니다 (35vh -> 20vh)
const CinematicBars = styled.div`
  position: relative;
  width: 100%;
  height: 20vh; /* 화면의 20%만 사용하여 눈가만 날카롭게 보여줍니다 */
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transform-origin: center;
  animation: ${cinematicClose} 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  
  /* 금빛 테두리 라인을 더 선명하게 */
  border-top: 2px solid rgba(251, 191, 36, 0.7); 
  border-bottom: 2px solid rgba(251, 191, 36, 0.7);
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
`;

const CharacterImage = styled.img`
  width: 160%; /* 가로로 더 넓게 펼쳐서 속도감을 줌 */
  height: 100%;
  
  /* [Fix] object-position을 미세하게 조정하여 눈매가 중앙에 오도록 맞춥니다 */
  object-fit: cover;
  object-position: 50% 23%; 
  
  animation: ${slideAndZoom} 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  
  /* 양쪽 끝 그라데이션 페이드아웃 범위를 넓혀 부드럽게 */
  mask-image: linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%);
`;

// [Fix] 스킬 대사 영역(TextArea, SkillQuote)을 텍스트 하나만 깔끔하게 배치하는 구조로 변경
const SkillNameArea = styled.div`
  position: absolute;
  left: 8%;
  /* 레터박스 중앙에 딱 맞게 배치 */
  z-index: 10;
  animation: ${textSlide} 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const SkillName = styled.h2`
  font-size: 3.8rem; /* 글씨 크기를 더 키워 시원하게 */
  font-weight: 950; /* 가장 두껍게 */
  font-style: italic; /* 역동적인 기울임 */
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 4px; /* 자간을 넓혀 웅장하게 */
  /* 강력한 흰색 발광 효과 + 선명도를 위한 하드 쉐도우 */
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 1), 
    0 0 5px rgba(251, 191, 36, 0.8), /* 미세한 금빛 후광 */
    4px 4px 0px #000;
  margin: 0;
  line-height: 1;
`;

export default function BattleCutIn({ cutInInfo, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (cutInInfo) {
      setVisible(true);
      // 1.6초 후 컷신 완전 종료
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [cutInInfo, onComplete]);

  if (!visible || !cutInInfo) return null;

  return (
    <CutInOverlay>
      <Backdrop />
      
      {/* 2. 더 좁아진 시네마틱 레터박스 & 눈가 크롭 컷인 */}
      <CinematicBars>
        {cutInInfo.image && <CharacterImage src={cutInInfo.image} alt="Cut-in" />}
        
        {/* 3. [Fix] 유치한 대사는 빼고 오직 깔끔하고 웅장한 스킬 이름만 슬라이딩 됨 */}
        <SkillNameArea>
          <SkillName>{cutInInfo.skillName}</SkillName>
        </SkillNameArea>
      </CinematicBars>
      
    </CutInOverlay>
  );
}