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
  currentEnemies,
  addLog,
  gainCausality
}) {
  const tickEvents = [];
  let nextAllies = [...currentAllies];
  let nextBuffs = currentBuffs;
  // [Refactor] 다중 적 지원: 단일 enemy 대신 enemies 배열로 처리
  let nextEnemies = Array.isArray(currentEnemies)
    ? currentEnemies.map(e => ({ ...e }))
    : [];
  
  // 결과 반환용 변수
  let triggeredSkillInfo = null;
  let damageToEnemyTotal = 0;

  // 1. 버프 관리
  const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(nextBuffs, addLog);
  if (hasChanged) {
    nextBuffs = updatedBuffs;
  }

  // 2. 적의 행동 (Enemy Action) — 살아있는 모든 적이 각자 행동
  // 각 적의 결과를 enemies 배열에 반영하고, 각 적이 발생시킨 피격 데미지는 합쳐서 처리
  const allDamageToAllies = [];
  const enemyDamageSourceMap = new Map(); // hit별 가해자 추적 (크리 계산용)

  for (let ei = 0; ei < nextEnemies.length; ei++) {
    const enemy = nextEnemies[ei];
    if (!enemy || enemy.hp <= 0) continue;

    const { updatedEnemy, damageToAllies } = handleEnemyActions({ 
        enemy, 
        allies: nextAllies, 
        addLog 
    });

    if (updatedEnemy) {
        nextEnemies[ei] = updatedEnemy; // 게이지/충전 상태 갱신
    }

    if (damageToAllies && damageToAllies.length > 0) {
        damageToAllies.forEach(d => {
            allDamageToAllies.push(d);
            // 크리 계산은 가해자 stat 기반이므로 누가 때렸는지 기억해둠
            enemyDamageSourceMap.set(d, updatedEnemy || enemy);
        });
    }
  }

  // 누적된 피격을 아군별로 적용 (한 아군이 여러 적에게 동시에 맞을 수도 있음)
  if (allDamageToAllies.length > 0) {
    nextAllies = nextAllies.map(ally => {
        const hits = allDamageToAllies.filter(d => d.targetId == ally.id);
        if (hits.length === 0) return ally;

        let workingAlly = { ...ally };
        for (const hit of hits) {
            const attacker = enemyDamageSourceMap.get(hit);
            const { finalDamage, remainingShield, isCrit } = calculateDamage(
                attacker, 
                workingAlly,             
                hit.amount,   
                nextBuffs      
            );

            if (finalDamage > 0 || hit.amount > 0) {
                tickEvents.push({
                    id: `evt_${Date.now()}_${Math.random()}`,
                    targetId: `ally-target-${ally.id}`,
                    value: finalDamage,
                    type: 'damage',
                    isCrit: isCrit || false
                });
            }

            if (finalDamage > 0) {
                gainCausality(1 * (workingAlly.efficiency || 1.0));
            }

            workingAlly = { 
                ...workingAlly, 
                hp: Math.max(0, workingAlly.hp - finalDamage), 
                shield: remainingShield 
            };
        }
        return workingAlly;
    });
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

  if (allyResult.allyTickEvents && allyResult.allyTickEvents.length > 0) {
    tickEvents.push(...allyResult.allyTickEvents);
}

  // [Refactor] 적 피격 팝업 이벤트는 actionManager가 아군별로 개별 발행함
  //           (각 이벤트가 자기 isCrit/isUltimate 플래그를 가짐 → 진짜 크리만 금색)
  //           여기서는 합산 데미지를 첫 번째 살아있는 적의 HP에서 차감.
  //           [TODO step 4] 다중 적 + 자동 타겟팅 시 데미지 분배 로직 필요.
  if (damageToEnemyTotal > 0 && nextEnemies.length > 0) {
      const targetIdx = nextEnemies.findIndex(e => e && e.hp > 0);
      if (targetIdx >= 0) {
          nextEnemies[targetIdx] = {
              ...nextEnemies[targetIdx],
              hp: Math.max(0, nextEnemies[targetIdx].hp - damageToEnemyTotal)
          };
      }
  }

  return {
    nextAllies,
    nextBuffs,
    nextEnemies,
    tickEvents,
    triggeredSkillInfo,
    damageToEnemyTotal,
    buffsChanged: hasChanged || allyResult.buffsChanged
  };
}