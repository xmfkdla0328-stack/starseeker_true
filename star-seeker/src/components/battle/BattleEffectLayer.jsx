import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// [수정] 더 역동적이고 사이버틱한 애니메이션
// 쫀득하게 튀어올랐다가(scale 1.2), 위로 사라지며 블러 처리
const floatUp = keyframes`
  0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; filter: blur(2px); }
  20% { transform: translate(-50%, -10px) scale(1.2); opacity: 1; filter: blur(0px); }
  40% { transform: translate(-50%, -15px) scale(1.0); opacity: 1; }
  100% { transform: translate(-50%, -50px) scale(0.9); opacity: 0; filter: blur(4px); }
`;

const LayerContainer = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none; /* 클릭 통과 */
  z-index: 999;
  overflow: hidden;
`;

// [수정] 사이버펑크 스타일 텍스트 디자인 적용
const DamageText = styled.div`
  position: absolute;
  /* 두껍고 기울어진 시스템 폰트로 속도감 표현 */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 900; /* 가장 두껍게 */
  font-style: italic; /* 기울임 */
  letter-spacing: -0.5px; /* 자간을 좁혀 단단한 느낌 */

  /* [요청 1] 크기 축소 */
  font-size: ${props => props.$isCrit ? '1.5rem' : '1.1rem'};

  /* [요청 2] 붉은색 + 사이버펑크 네온 스타일 */
  /* 기본: 네온 레드, 크리티컬: 네온 옐로우 */
  color: ${props => props.$isCrit ? '#facc15' : '#ff0055'};

  /* 3중 텍스트 그림자로 강력한 네온 발광 효과 연출 */
  text-shadow: 
    0 0 2px white, /* 중심부 흰색 하이라이트 */
    0 0 8px ${props => props.$isCrit ? '#facc15' : '#ff0055'}, /* 메인 네온 광원 */
    2px 2px 0px rgba(0,0,0,1); /* 선명도를 위한 강한 검은색 하드 쉐도우 */

  /* 쫀득한 느낌의 베지에 곡선 적용 */
  animation: ${floatUp} 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  
  white-space: nowrap;
  pointer-events: none;
  will-change: transform, opacity, filter; /* 성능 최적화 힌트 */
`;

export default function BattleEffectLayer({ events }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const newParticles = events.map(event => {
      // 1. 목표 대상의 화면상 위치 찾기
      const targetEl = document.getElementById(event.targetId);
      if (!targetEl) return null;

      const rect = targetEl.getBoundingClientRect();
      
      // 화면 기준 중앙 상단 좌표 계산
      // 대상의 중앙(left + width/2)의 약간 위쪽(top + height*0.2)에서 시작
      return {
        id: event.id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.2, 
        value: event.value,
        type: event.type,
        isCrit: event.isCrit
      };
    }).filter(Boolean);

    setParticles(prev => [...prev, ...newParticles]);

    // Cleanup: 애니메이션 시간(0.7s)보다 조금 길게 잡아서 제거
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);

    return () => clearTimeout(timer);
  }, [events]);

  return (
    <LayerContainer>
      {particles.map(p => (
        <DamageText 
          key={p.id} 
          style={{ left: p.x, top: p.y }}
          $isCrit={p.isCrit}
        >
          {/* 치명타일 경우 숫자 뒤에 '!' 추가 */}
          {p.value}{p.isCrit ? '!' : ''}
        </DamageText>
      ))}
    </LayerContainer>
  );
}