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
import StatusInspector from '../components/battle/StatusInspector';
import BattleTopControls from '../components/battle/BattleTopControls';

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
  /* [Step 5-1 v4] BossEnemyDisplay 내부의 flex-1 / min-h-0 가 동작하도록 자체를 flex 컨테이너로 만든다.
     이게 없으면 보스 카드가 자연 높이로 부풀어 짧은 화면에서 게이지가 영역 밖으로 흘러나간다. */
  display: flex;
  flex-direction: column;
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

function BattleScreen({ initialParty, userStats, hpMultiplier, onGameEnd, onRetreat, enemyId }) {
  const { 
    logs, allies, enemies, playerCausality, enemyWarning, buffs,
    useSkill, startBattle, isBattleStarted, isPaused, togglePause,
    battleEvents, 
    cutInInfo, 
    handleCutInComplete,
    battleMode, toggleBattleMode,
    battleSpeed, toggleBattleSpeed,
    priorityTargetIdx, setPriorityTarget,
    pendingUltAllyIds, requestUltimate
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId);

  const [introStep, setIntroStep] = useState(0);
  const [bgmVolume, setBgmVolume] = useState(0.5); 
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // [Inspector] 길게 누른 카드의 식별자. { kind: 'ally'|'enemy', id }.
  const [inspectorTarget, setInspectorTarget] = useState(null);
  // 일시정지 출처: 'user'(헤더 버튼) | 'inspector' | null.
  // PauseMenu는 'user'일 때만, StatusInspector는 inspectorTarget이 셋일 때만 렌더한다.
  // 출처 분리 덕에 인스펙터 닫힘 시 한 프레임 PauseMenu가 깜빡이는 일이 없다.
  const [pauseSource, setPauseSource] = useState(null);

  // pauseSource → 실제 전투 루프 일시정지를 동기화.
  useEffect(() => {
    if (!isBattleStarted) return;
    togglePause(pauseSource !== null);
  }, [pauseSource, isBattleStarted, togglePause]);

  const handleInspectAlly = (allyId) => {
    setInspectorTarget({ kind: 'ally', id: allyId });
    setPauseSource('inspector');
  };
  // [Step 8 Phase 2] 적 인스펙터.
  // 적은 같은 종류가 다수 등장할 수 있어 enemy.id로는 식별이 모호함(같은 id 공유).
  // useBattleState에서 부여하는 instanceId(예: 'recorder_page#0')를 기준으로 lookup.
  const handleInspectEnemy = (enemyInstanceId) => {
    setInspectorTarget({ kind: 'enemy', id: enemyInstanceId });
    setPauseSource('inspector');
  };
  const closeInspector = () => {
    setInspectorTarget(null);
    setPauseSource(null);
  };
  const handleUserPause = () => setPauseSource('user');
  const handleUserResume = () => setPauseSource(null);

  const inspectedUnit = inspectorTarget
    ? (inspectorTarget.kind === 'ally'
        ? allies.find(a => a.id === inspectorTarget.id)
        : enemies.find(e => (e.instanceId || e.id) === inspectorTarget.id))
    : null;

  // 가드: 대상 유닛이 사라지면(예: 적이 처치되어 배열에서 제거) 인스펙터를 자동 닫아
  // pause가 영구히 걸려있는 상태가 되지 않도록 한다.
  useEffect(() => {
    if (inspectorTarget && !inspectedUnit) closeInspector();
  }, [inspectorTarget, inspectedUnit]);

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
      const hasImpact = battleEvents.some(e => e.isCrit === true || e.isUltimate === true);
      if (hasImpact) {
        setIsShaking(true);
        const timer = setTimeout(() => setIsShaking(false), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [battleEvents]);

  const handleRetreat = () => {
    if (window.confirm("전투를 포기하고 귀환하시겠습니까?")) {
        setPauseSource(null);
        if (onRetreat) onRetreat();
        else onGameEnd('lose');
    }
  };

  return (
    <BattleScreenContainer className={isShaking ? 'shake-effect' : ''}>
      <BattleEffectLayer events={battleEvents} />
      {/* [Step 5-2b-ii] key={cutInInfo?._id}: 큐에 다음 컷인이 들어와 cutInInfo가 갱신될 때
          BattleCutIn을 강제 재마운트하여 styled-components 애니메이션이 새로 시작되도록 함.
          (같은 진영 컷인이 연속될 때 키 없이는 keyframe이 처음부터 재생되지 않음) */}
      <BattleCutIn key={cutInInfo?._id ?? 'idle'} cutInInfo={cutInInfo} onComplete={handleCutInComplete} />

      {isBattleStarted && !isPaused && (
        <GameHeader onPause={handleUserPause} />
      )}

      {/* [속도 조절] 우상단 floating: MANUAL/AUTO + 1x/2x.
          전투 진입 후·일시정지 아닐 때만 표시 (헤더와 동일 조건). */}
      {isBattleStarted && !isPaused && !cutInInfo && (
        <BattleTopControls
          battleMode={battleMode}
          onToggleBattleMode={toggleBattleMode}
          battleSpeed={battleSpeed}
          onToggleBattleSpeed={toggleBattleSpeed}
        />
      )}

      {/* PauseMenu는 사용자 출처 일시정지에서만 표시.
          인스펙터로 인한 일시정지일 때는 StatusInspector가 UI 책임을 가진다. */}
      {pauseSource === 'user' && !cutInInfo && (
        <PauseMenu 
          onResume={handleUserResume}
          onRetreat={handleRetreat}
          bgmVolume={bgmVolume}
          setBgmVolume={setBgmVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      )}

      <EnemyArea className={introStep === 0 ? 'intro-hidden' : 'intro-slide-up'}>
        {enemies && enemies.length > 0 && (
            <BattleEnemyZone 
                enemies={enemies} 
                enemyWarning={enemyWarning} 
                showStatus={introStep >= 3} 
                battleMode={battleMode}
                priorityTargetIdx={priorityTargetIdx}
                onSelectPriority={setPriorityTarget}
                onInspectEnemy={handleInspectEnemy}
            />
        )}
      </EnemyArea>

      <AllyArea $visible={introStep >= 3}>
        <BattleAllyZone
          allies={allies}
          events={battleEvents}
          battleMode={battleMode}
          pendingUltAllyIds={pendingUltAllyIds}
          onRequestUltimate={requestUltimate}
          onInspectAlly={handleInspectAlly}
        />
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

      {/* [Inspector] 길게 누름으로 열린 버프/디버프 패널.
          unit이 다음 틱에 사망/제거되면 자동 닫힘 (effect로 처리). */}
      {inspectorTarget && inspectedUnit && (
        <StatusInspector
          unit={inspectedUnit}
          side={inspectorTarget.kind}
          globalBuffs={buffs}
          onClose={closeInspector}
        />
      )}
    </BattleScreenContainer>
  );
}

export default BattleScreen;