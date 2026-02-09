import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useBattle from '../hooks/battleLogic/useBattle';

import BattleAllyZone from '../components/battle/BattleAllyZone';
import BattleEnemyZone from '../components/battle/BattleEnemyZone';
import BattleLogZone from '../components/battle/BattleLogZone';
import BattleControlZone from '../components/battle/BattleControlZone';
import { Play } from 'lucide-react'; 

const BattleScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh; 
    background-color: #1a1a1a;
    color: white;
    position: relative;
`;

const EnemyArea = styled.div`
  flex: 2; 
  min-height: 0;
  overflow: hidden;
  &.intro-hidden { opacity: 0; }
  /* App.css의 .intro-slide-up 클래스 사용 */
`;

const AllyArea = styled.div`
  flex: 0 0 auto; 
  overflow: hidden; 
  transition: opacity 1s ease-in-out;
  opacity: ${props => props.$visible ? 1 : 0};
`;

const LogArea = styled.div`
  flex: 1; 
  min-height: 0; 
  overflow-y: auto;
  transition: opacity 1s ease-in-out;
  opacity: ${props => props.$visible ? 1 : 0};
`;

const ControlArea = styled.div`
  flex: 0 0 auto;
  transition: opacity 1s ease-in-out;
  opacity: ${props => props.$visible ? 1 : 0};
`;

const BattleStartOverlay = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
    background: rgba(0, 0, 0, 0.4); 
    backdrop-filter: blur(2px);
    transition: opacity 0.5s;
    opacity: ${props => props.$fading ? 0 : 1};
    pointer-events: ${props => props.$fading ? 'none' : 'auto'};
`;

// [수정] enemyId prop 추가
function BattleScreen({ initialParty, userStats, hpMultiplier, onGameEnd, enemyId }) {
  const { 
    logs, 
    allies, 
    enemy, 
    playerCausality, 
    enemyWarning,
    buffs,
    useSkill,
    startBattle, 
    isBattleStarted 
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId); // [수정] ID 전달

  const [introStep, setIntroStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 500);
    const t2 = setTimeout(() => setIntroStep(2), 2000);

    return () => {
        clearTimeout(t1); clearTimeout(t2);
    };
  }, []);

  const handleStartClick = () => {
    setIntroStep(3); 
    setTimeout(() => {
        setIntroStep(4);
        startBattle();
    }, 1000);
  };

  return (
    <BattleScreenContainer>
      <EnemyArea className={introStep === 0 ? 'intro-hidden' : 'intro-slide-up'}>
        {enemy && (
            <BattleEnemyZone 
                enemy={enemy} 
                enemyWarning={enemyWarning} 
                showStatus={introStep >= 3} 
            />
        )}
      </EnemyArea>

      <AllyArea $visible={introStep >= 3}>
        <BattleAllyZone allies={allies} />
      </AllyArea>

      <LogArea $visible={introStep >= 3}>
        <BattleLogZone logs={logs} />
      </LogArea>

      <ControlArea $visible={introStep >= 3}>
        <BattleControlZone 
          playerCausality={playerCausality} 
          buffs={buffs} 
          userStats={userStats} 
          onUseSkill={useSkill}
        />
      </ControlArea>

      {(introStep === 2 || introStep === 3) && (
          <BattleStartOverlay $fading={introStep === 3}>
              <div className={introStep === 3 ? 'cyber-button-exit' : 'cyber-button-enter'}>
                <button onClick={handleStartClick} className="cyber-btn">
                    <div className="flex items-center gap-2">
                        <Play size={20} className="fill-cyan-400" />
                        <span>SYSTEM START</span>
                    </div>
                </button>
                <p className="text-[10px] text-cyan-500/70 text-center mt-3 font-mono tracking-widest animate-pulse">
                    CAUSALITY LINK READY
                </p>
              </div>
          </BattleStartOverlay>
      )}
    </BattleScreenContainer>
  );
}

export default BattleScreen;