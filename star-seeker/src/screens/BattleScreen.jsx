import React from 'react';
import styled from 'styled-components';
import useBattle from '../hooks/battleLogic/useBattle';

import BattleAllyZone from '../components/battle/BattleAllyZone';
import BattleEnemyZone from '../components/battle/BattleEnemyZone';
import BattleLogZone from '../components/battle/BattleLogZone';
import BattleControlZone from '../components/battle/BattleControlZone';

const BattleScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh; 
    background-color: #1a1a1a;
    color: white;
`;

// [수정] flex 값을 3에서 2로 변경하여 차지하는 비율 축소
const EnemyArea = styled.div`
  flex: 2; 
  min-height: 0;
  overflow: hidden; 
`;

const AllyArea = styled.div`
  flex: 0 0 auto; 
  overflow: hidden; 
`;

const LogArea = styled.div`
  flex: 1; 
  min-height: 0; 
  overflow-y: auto;
`;

const ControlArea = styled.div`
  flex: 0 0 auto;
`;

function BattleScreen({ initialParty, userStats, hpMultiplier, onGameEnd }) {
  const { 
    logs, 
    allies, 
    enemy, 
    playerCausality, 
    enemyWarning,
    buffs,
    useSkill
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd);

  return (
    <BattleScreenContainer>
      <EnemyArea>
        {enemy && <BattleEnemyZone enemy={enemy} warning={enemyWarning} />}
      </EnemyArea>

      <AllyArea>
        <BattleAllyZone allies={allies} />
      </AllyArea>

      <LogArea>
        <BattleLogZone logs={logs} />
      </LogArea>

      <ControlArea>
        <BattleControlZone 
            causality={playerCausality} 
            onUseSkill={useSkill} 
            buffs={buffs}
            userStats={userStats} 
        />
      </ControlArea>

    </BattleScreenContainer>
  );
}

export default BattleScreen;
