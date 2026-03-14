import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// [Fix] 애니메이션 속도를 늦추고, 공중에 체공하며 선명하게 보이는 구간을 추가했습니다.
const floatUp = keyframes`
  0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; filter: blur(2px); }
  15% { transform: translate(-50%, -10px) scale(1.3); opacity: 1; filter: blur(0px); }
  30% { transform: translate(-50%, -15px) scale(1.0); opacity: 1; }
  80% { transform: translate(-50%, -25px) scale(1.0); opacity: 1; filter: blur(0px); } /* 80%까지 선명하게 유지! */
  100% { transform: translate(-50%, -50px) scale(0.9); opacity: 0; filter: blur(4px); }
`;

const LayerContainer = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none; 
  z-index: 9999; 
`;

const getColor = (type, isCrit) => {
    if (type === 'heal') return '#34d399'; // 초록색 (heal)
    if (type === 'shield') return '#38bdf8'; // 파란색 (shield)
    if (isCrit) return '#facc15'; // 노란색 (치명타)
    return '#ff0055'; // 붉은색 (일반 데미지)
};

const DamageText = styled.div`
  position: absolute;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 900; 
  font-style: italic; 
  letter-spacing: -0.5px; 
  font-size: ${props => props.$isCrit ? '1.8rem' : '1.3rem'};
  color: ${props => getColor(props.$type, props.$isCrit)};
  text-shadow: 0 0 2px white, 0 0 8px ${props => getColor(props.$type, props.$isCrit)}, 2px 2px 0px rgba(0,0,0,1); 
  
  /* [Fix] 애니메이션 지속 시간을 0.8초에서 1.5초로 넉넉하게 늘렸습니다 */
  animation: ${floatUp} 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  
  white-space: nowrap;
  pointer-events: none;
  will-change: transform, opacity, filter; 
`;

export default function BattleEffectLayer({ events }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const layerEl = document.getElementById('battle-effect-layer');
    const layerRect = layerEl ? layerEl.getBoundingClientRect() : { left: 0, top: 0 };

    const newParticles = events.map(event => {
      let targetEl = document.getElementById(event.targetId);
      if (!targetEl) targetEl = document.getElementById(`ally-target-${event.targetId}`);
      if (!targetEl && String(event.targetId).includes('enemy')) targetEl = document.getElementById('enemy-target-main');

      if (!targetEl) return null;

      const rect = targetEl.getBoundingClientRect();
      
      return {
        id: event.id || Math.random().toString(36).substr(2, 9),
        x: (rect.left - layerRect.left) + rect.width / 2,
        y: (rect.top - layerRect.top) + rect.height * 0.2, 
        value: event.value,
        type: event.type || 'damage', 
        isCrit: event.isCrit
      };
    }).filter(Boolean);

    if (newParticles.length > 0) {
        setParticles(prev => [...prev, ...newParticles]);

        // [Fix] 정리(Cleanup) 타이머도 애니메이션 시간에 맞춰 1.6초로 넉넉하게 연장
        const timer = setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1600);

        return () => clearTimeout(timer);
    }
  }, [events]);

  return (
    <LayerContainer id="battle-effect-layer">
      {particles.map(p => {
         const prefix = (p.type === 'heal' || p.type === 'shield') ? '+' : '';
         return (
            <DamageText 
              key={p.id} 
              style={{ left: p.x, top: p.y }}
              $isCrit={p.isCrit}
              $type={p.type}
            >
              {prefix}{p.value}{p.isCrit ? '!' : ''}
            </DamageText>
         );
      })}
    </LayerContainer>
  );
}