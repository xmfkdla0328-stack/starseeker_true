import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useBattle from '../hooks/battleLogic/useBattle';

import BattleAllyZone from '../components/battle/BattleAllyZone';
import BattleEnemyZone from '../components/battle/BattleEnemyZone';
import BattleLogZone from '../components/battle/BattleLogZone';
import BattleControlZone from '../components/battle/BattleControlZone';
import BattleStartOverlay from '../components/battle/BattleStartOverlay'; // 시작 버튼은 전투 전용이므로 유지

// [New] 공용 컴포넌트 import (경로 주의: screens 폴더에서 나가서 components로 진입)
import GameHeader from '../components/common/GameHeader';
import PauseMenu from '../components/common/PauseMenu';

const BattleScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh; 
  background-color: #0f0f11;
  color: white;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
`;

const EnemyArea = styled.div`
  flex: 2; 
  min-height: 0;
  overflow: hidden;
  &.intro-hidden { opacity: 0; }
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

function BattleScreen({ initialParty, userStats, hpMultiplier, onGameEnd, enemyId }) {
  const { 
    logs, allies, enemy, playerCausality, enemyWarning, buffs,
    useSkill, startBattle, isBattleStarted, isPaused, togglePause 
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId);

  const [introStep, setIntroStep] = useState(0);
  
  // 환경설정 상태 (실제로는 전역 상태 관리나 Context API로 빼는 것이 좋음)
  const [bgmVolume, setBgmVolume] = useState(0.5); 
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 500);
    const t2 = setTimeout(() => setIntroStep(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleStartClick = () => {
    setIntroStep(3); 
    setTimeout(() => {
        setIntroStep(4);
        startBattle();
    }, 1000);
  };

  const handleRetreat = () => {
    if (window.confirm("전투를 포기하고 귀환하시겠습니까?")) {
        onGameEnd('lose'); 
    }
  };

  return (
    <BattleScreenContainer>
      {/* 1. 상단 공용 헤더 (일시정지 버튼) */}
      {isBattleStarted && !isPaused && (
        <GameHeader onPause={() => togglePause(true)} />
      )}

      {/* 2. 공용 일시정지 메뉴 */}
      {isPaused && (
        <PauseMenu 
          onResume={() => togglePause(false)}
          onRetreat={handleRetreat}
          bgmVolume={bgmVolume}
          setBgmVolume={setBgmVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      )}

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

      {/* 시작 오버레이는 전투 고유 기능이므로 유지 */}
      {(introStep === 2 || introStep === 3) && (
          <BattleStartOverlay 
            onStart={handleStartClick} 
            fading={introStep === 3} 
          />
      )}
    </BattleScreenContainer>
  );
}

export default BattleScreen;