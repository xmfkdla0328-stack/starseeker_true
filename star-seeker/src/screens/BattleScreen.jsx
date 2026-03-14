import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useBattle from '../hooks/battleLogic/useBattle';

import BattleAllyZone from '../components/battle/BattleAllyZone';
import BattleEnemyZone from '../components/battle/BattleEnemyZone';
// [수정] BattleLogZone 임포트 삭제됨
import BattleControlZone from '../components/battle/BattleControlZone';
import BattleStartOverlay from '../components/battle/BattleStartOverlay';
import BattleEffectLayer from '../components/battle/BattleEffectLayer';
import BattleCutIn from '../components/battle/BattleCutIn';

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
  overflow: hidden; 
`;

const EnemyArea = styled.div`
  flex: 1; /* [수정] 로그 영역이 사라진 만큼 빈 공간을 모두 차지하도록 flex: 1로 변경 */
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

// [수정] LogArea 스타일 컴포넌트 완전 삭제됨

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
    cutInInfo, 
    handleCutInComplete 
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId);

  const [introStep, setIntroStep] = useState(0);
  const [bgmVolume, setBgmVolume] = useState(0.5); 
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 500);
    const t2 = setTimeout(() => setIntroStep(2), 2000);
    const t3 = setTimeout(() => {
        handleAutoStart(); 
    }, 3500); 

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleAutoStart = () => {
    setIntroStep(3); 
    setTimeout(() => {
        setIntroStep(4); 
        startBattle();   
    }, 1000);
  };

  useEffect(() => {
    if (battleEvents.length > 0) {
      const hasImpact = battleEvents.some(e => e.isCrit === true);
      if (hasImpact) {
        setIsShaking(true);
        const timer = setTimeout(() => setIsShaking(false), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [battleEvents]);

  const handleRetreat = () => {
    if (window.confirm("전투를 포기하고 귀환하시겠습니까?")) {
        onGameEnd('lose'); 
    }
  };

  return (
    <BattleScreenContainer className={isShaking ? 'shake-effect' : ''}>
      <BattleEffectLayer events={battleEvents} />
      <BattleCutIn cutInInfo={cutInInfo} onComplete={handleCutInComplete} />

      {isBattleStarted && !isPaused && (
        <GameHeader onPause={() => togglePause(true)} />
      )}

      {isPaused && !cutInInfo && (
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

      {/* [수정] 배틀 로그 영역(<LogArea>) 완전 삭제됨 */}

      <ControlArea $visible={introStep >= 3}>
        <BattleControlZone 
          playerCausality={playerCausality} 
          buffs={buffs} 
          userStats={userStats} 
          onUseSkill={useSkill}
        />
      </ControlArea>

      {(introStep === 2 || introStep === 3) && (
          <BattleStartOverlay fading={introStep === 3} />
      )}
    </BattleScreenContainer>
  );
}

export default BattleScreen;