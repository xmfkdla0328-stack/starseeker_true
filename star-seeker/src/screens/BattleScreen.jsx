import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useBattle from '../hooks/battleLogic/useBattle';

import BattleAllyZone from '../components/battle/BattleAllyZone';
import BattleEnemyZone from '../components/battle/BattleEnemyZone';
import BattleLogZone from '../components/battle/BattleLogZone';
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
    cutInInfo, 
    handleCutInComplete 
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId);

  const [introStep, setIntroStep] = useState(0);
  const [bgmVolume, setBgmVolume] = useState(0.5); 
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // [수정] 인트로 시퀀스 자동화
  useEffect(() => {
    // 1. 적 등장 (0.5초 후)
    const t1 = setTimeout(() => setIntroStep(1), 500);
    
    // 2. 오버레이(Start UI) 등장 (2초 후)
    const t2 = setTimeout(() => setIntroStep(2), 2000);

    // 3. [New] 자동 시작 트리거 (오버레이가 뜨고 1.5초 뒤에 자동으로 시작)
    const t3 = setTimeout(() => {
        handleAutoStart(); 
    }, 3500); // 2000ms(오버레이 등장) + 1500ms(대기)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // [수정] 버튼 클릭 대신 호출될 자동 시작 함수
  const handleAutoStart = () => {
    setIntroStep(3); // 페이드 아웃 시작
    setTimeout(() => {
        setIntroStep(4); // UI 표시
        startBattle();   // 전투 로직 시작
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

      {/* 오버레이에 더 이상 버튼 핸들러를 넘길 필요가 없지만, 기존 props 호환성을 위해 둠 */}
      {(introStep === 2 || introStep === 3) && (
          <BattleStartOverlay 
            fading={introStep === 3} 
          />
      )}
    </BattleScreenContainer>
  );
}

export default BattleScreen;