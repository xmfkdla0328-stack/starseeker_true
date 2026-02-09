import React from 'react';
import styled from 'styled-components';
import { Play } from 'lucide-react';

const Overlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background: rgba(0, 0, 0, 0.3); 
  backdrop-filter: blur(4px);
  transition: opacity 0.5s;
  opacity: ${props => props.$fading ? 0 : 1};
  pointer-events: ${props => props.$fading ? 'none' : 'auto'};
`;

const StartButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  border: none;
  padding: 16px 48px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
  }
`;

export default function BattleStartOverlay({ onStart, fading }) {
  return (
    <Overlay $fading={fading}>
      <StartButton onClick={onStart}>
        <Play size={20} fill="black" />
        <span>START MISSION</span>
      </StartButton>
    </Overlay>
  );
}