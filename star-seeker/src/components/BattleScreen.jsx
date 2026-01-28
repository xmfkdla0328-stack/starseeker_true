import React from 'react';
import useBattle from '../hooks/useBattle'; // 분리된 로직 훅 임포트

// 하위 컴포넌트 임포트
import BattleEnemyZone from './battle/BattleEnemyZone';
import BattleAllyZone from './battle/BattleAllyZone';
import BattleLogZone from './battle/BattleLogZone';
import BattleControlZone from './battle/BattleControlZone';

export default function BattleScreen({ userStats, hpMultiplier, onGameEnd, initialParty }) {
  
  // 훅을 사용하여 전투 로직과 상태를 모두 가져옴
  const { 
    logs, 
    allies, 
    enemy, 
    playerCausality, 
    enemyWarning, 
    buffs, 
    useSkill 
  } = useBattle(initialParty, userStats, hpMultiplier, onGameEnd);

  if (!enemy || allies.length === 0) return <div className="text-white text-center mt-20">Initializing Combat System...</div>;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      
      {/* 1. 적 영역 */}
      <BattleEnemyZone 
        enemy={enemy} 
        enemyWarning={enemyWarning} 
      />
      
      {/* 2. 아군 영역 */}
      <BattleAllyZone 
        allies={allies} 
      />
      
      {/* 3. 로그 영역 */}
      <BattleLogZone 
        logs={logs} 
      />
      
      {/* 4. 컨트롤 영역 */}
      <BattleControlZone 
        playerCausality={playerCausality} 
        buffs={buffs} 
        userStats={userStats} 
        onUseSkill={useSkill} 
      />
      
    </div>
  );
}