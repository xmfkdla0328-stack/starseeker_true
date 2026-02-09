import React from 'react';
import styled from 'styled-components';
import { Play, Settings, Volume2, VolumeX, LogOut } from 'lucide-react';

const PauseOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const MenuBox = styled.div`
  background: rgba(30, 30, 35, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 40px;
  border-radius: 24px;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MenuTitle = styled.h2`
  text-align: center;
  font-weight: 200;
  color: #fff;
  font-size: 1.2rem;
  letter-spacing: 4px;
  margin-bottom: 24px;
  opacity: 0.9;
  text-transform: uppercase;
`;

const MenuButton = styled.button`
  background: ${props => props.$danger ? 'rgba(255, 80, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$danger ? 'rgba(255, 80, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$danger ? '#ff8a8a' : '#f0f0f0'};
  padding: 14px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$danger ? 'rgba(255, 80, 80, 0.25)' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

export default function PauseMenu({ 
  onResume, 
  onRetreat, 
  bgmVolume, 
  setBgmVolume, 
  isMuted, 
  setIsMuted 
}) {
  return (
    <PauseOverlay>
      <MenuBox>
        <MenuTitle>Pause</MenuTitle>
        
        <SettingRow>
          <span>Sound Volume</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setIsMuted(!isMuted)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex' }}>
                {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
            </button>
            <input 
              type="range" 
              min="0" max="1" step="0.1" 
              value={bgmVolume} 
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              disabled={isMuted}
              style={{ accentColor: '#fff', height: '4px' }}
            />
          </div>
        </SettingRow>

        <MenuButton onClick={onResume}>
          <Play size={18} /> Resume
        </MenuButton>
        
        <MenuButton>
            <Settings size={18} /> Settings
        </MenuButton>

        <MenuButton $danger onClick={onRetreat}>
          <LogOut size={18} /> Exit Event
        </MenuButton>
      </MenuBox>
    </PauseOverlay>
  );
}