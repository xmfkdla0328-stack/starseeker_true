import React from 'react';
import styled from 'styled-components';
import { Pause } from 'lucide-react';

const TopBar = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 50; /* z-index를 넉넉하게 줌 */
  display: flex;
  gap: 12px;
`;

const PauseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export default function GameHeader({ onPause }) {
  return (
    <TopBar>
      <PauseButton onClick={onPause}>
        <Pause size={15} />
      </PauseButton>
    </TopBar>
  );
}