import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useBattle from '../hooks/battleLogic/useBattle';

import BattleAllyZone from '../components/battle/BattleAllyZone';
import BattleEnemyZone from '../components/battle/BattleEnemyZone';
import BattleLogZone from '../components/battle/BattleLogZone';
import BattleControlZone from '../components/battle/BattleControlZone';
import BattleStartOverlay from '../components/battle/BattleStartOverlay';
import BattleEffectLayer from '../components/battle/BattleEffectLayer';
import BattleCutIn from '../components/battle/BattleCutIn'; // [New]

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
    useSkill, startBattle, isBattleStarted, isPaused, togglePause,
    battleEvents, 
    cutInInfo, // [New] 컷신 정보
    handleCutInComplete // [New] 컷신 종료 핸들러
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId);

  const [introStep, setIntroStep] = useState(0);
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
      {/* 1. 이펙트 레이어 (최상단) */}
      <BattleEffectLayer events={battleEvents} />
      
      {/* [New] 2. 컷신 레이어 (이펙트 바로 아래) */}
      <BattleCutIn 
        cutInInfo={cutInInfo} 
        onComplete={handleCutInComplete} 
      />

      {/* 3. 상단 헤더 */}
      {isBattleStarted && !isPaused && (
        <GameHeader onPause={() => togglePause(true)} />
      )}

      {/* 4. 일시정지 메뉴 */}
      {isPaused && !cutInInfo && ( // 컷신 중에는 일시정지 메뉴 안 뜨게
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