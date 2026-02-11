import { handleAllyActions } from './actionManager';
import { manageBuffs } from './buffManager';
import { handleEnemyActions } from './enemyActionManager';
import { calculateDamage } from './damageCalculator';

/**
 * 전투의 1 프레임(Tick)을 처리하는 순수 로직 함수
 * @param {Object} params - 현재 전투 상태 및 함수들
 * @returns {Object} result - 업데이트된 상태 및 발생한 이벤트
 */
export function processBattleTick({
  currentAllies,
  currentBuffs,
  currentEnemy,
  addLog,
  gainCausality
}) {
  const tickEvents = [];
  let nextAllies = [...currentAllies];
  let nextBuffs = currentBuffs;
  let nextEnemy = currentEnemy ? { ...currentEnemy } : null;
  
  // 결과 반환용 변수
  let triggeredSkillInfo = null;
  let damageToEnemyTotal = 0;

  // 1. 버프 관리
  const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(nextBuffs, addLog);
  if (hasChanged) {
    nextBuffs = updatedBuffs;
  }

  // 2. 적의 행동 (Enemy Action)
  if (nextEnemy && nextEnemy.hp > 0) {
    const enemyContext = { 
        enemy: nextEnemy, 
        allies: nextAllies, 
        addLog 
    };
    
    const { updatedEnemy, damageToAllies } = handleEnemyActions(enemyContext);

    if (updatedEnemy) {
        nextEnemy = updatedEnemy; // 적 상태 갱신 (게이지 충전 등)
    }

    if (damageToAllies && damageToAllies.length > 0) {
        nextAllies = nextAllies.map(ally => {
            const hitInfo = damageToAllies.find(d => d.targetId == ally.id);
            if (hitInfo) {
                const { finalDamage, remainingShield, isCrit } = calculateDamage(
                    nextEnemy, 
                    ally,             
                    hitInfo.amount,   
                    nextBuffs      
                );

                if (finalDamage > 0 || hitInfo.amount > 0) {
                    tickEvents.push({
                        id: `evt_${Date.now()}_${Math.random()}`,
                        targetId: `ally-target-${ally.id}`,
                        value: finalDamage,
                        type: 'damage',
                        isCrit: isCrit || false
                    });
                }

                if (finalDamage > 0) {
                    gainCausality(1 * (ally.efficiency || 1.0));
                }

                return { 
                    ...ally, 
                    hp: Math.max(0, ally.hp - finalDamage), 
                    shield: remainingShield 
                };
            }
            return ally;
        });
    }
  }

  // 3. 아군의 행동 (Ally Action)
  const allyResult = handleAllyActions({
      allies: nextAllies, 
      buffs: nextBuffs,
      shieldJustExpired,
      setBuffs: (newBuffs) => { nextBuffs = newBuffs; }, // 콜백을 통해 로컬 변수 업데이트
      addLog,
      gainCausality,
  });

  nextAllies = allyResult.updatedAllies;
  damageToEnemyTotal = allyResult.damageToEnemy;
  triggeredSkillInfo = allyResult.triggeredSkillInfo;

  // 컷신 트리거 발생 시, 적 피격 이펙트 미리 생성
  if (triggeredSkillInfo && damageToEnemyTotal > 0) {
      tickEvents.push({
          id: `evt_ult_${Date.now()}`,
          targetId: `enemy-target-main`,
          value: damageToEnemyTotal,
          type: 'damage',
          isCrit: true 
      });
  } 
  // 일반 턴에서 적 피격 처리
  else if (damageToEnemyTotal > 0 && nextEnemy) {
      tickEvents.push({
          id: `evt_${Date.now()}_${Math.random()}`,
          targetId: `enemy-target-main`,
          value: damageToEnemyTotal,
          type: 'damage',
          isCrit: false
      });
      nextEnemy.hp = Math.max(0, nextEnemy.hp - damageToEnemyTotal);
  }

  return {
    nextAllies,
    nextBuffs,
    nextEnemy,
    tickEvents,
    triggeredSkillInfo,
    damageToEnemyTotal,
    buffsChanged: hasChanged || allyResult.buffsChanged // handleAllyActions 내부 구현에 따라 다름 (현재는 hasChanged만 체크해도 무방)
  };
}