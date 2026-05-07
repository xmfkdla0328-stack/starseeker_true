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
  
  // [Step 5-2b-ii] 컷인 큐. 한 틱에 여러 컷인이 동시 발생하면 순서대로 쌓아 반환.
  // 순서 정책: 모든 적 ult 컷인 (배열 인덱스 순) → 아군 ult 컷인 1개.
  // useBattle이 큐를 순차 재생하고, 큐가 모두 끝난 뒤에 한 번 데미지/효과를 일괄 적용.
  const cutInQueue = [];

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

    const { updatedEnemy, damageToAllies, triggeredEnemyCutIn } = handleEnemyActions({ 
        enemy, 
        allies: nextAllies, 
        addLog 
    });

    if (updatedEnemy) {
        nextEnemies[ei] = updatedEnemy; // 게이지/충전 상태 갱신
    }

    // [Step 5-2b-ii] 모든 적 ult 컷인을 큐에 누적 (배열 인덱스 순). 상한 없음.
    // _id: BattleCutIn 재마운트용 React key (큐 항목별 고유).
    // 같은 진영 컷인이 연속될 때도 styled-components 애니메이션이 새로 시작되도록 강제.
    if (triggeredEnemyCutIn) {
        cutInQueue.push({ ...triggeredEnemyCutIn, _id: `cutin_${Date.now()}_${Math.random()}` });
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

  // 3. 아군의 행동 (Ally Action) — enemies를 넘겨서 AOE 스킬이 적별로 데미지 배포
  const allyResult = handleAllyActions({
      allies: nextAllies, 
      buffs: nextBuffs,
      enemies: nextEnemies,
      shieldJustExpired,
      setBuffs: (newBuffs) => { nextBuffs = newBuffs; }, // 콜백을 통해 로컬 변수 업데이트
      addLog,
      gainCausality,
  });

  nextAllies = allyResult.updatedAllies;
  // [Step 5-2b-ii] 아군 ult 컷인이 발생했다면 큐의 마지막에 추가 (적 → 아군 순).
  // 양쪽 데미지/효과는 result에 모두 들어가 큐가 모두 끝난 뒤 한 번에 일괄 적용됨.
  if (allyResult.triggeredSkillInfo) {
    cutInQueue.push({ ...allyResult.triggeredSkillInfo, _id: `cutin_${Date.now()}_${Math.random()}` });
  }

  if (allyResult.allyTickEvents && allyResult.allyTickEvents.length > 0) {
    tickEvents.push(...allyResult.allyTickEvents);
  }

  // [Refactor step 2] 적별 데미지 적용
  // damageToEnemies = [{ targetEnemyIdx, amount, isCrit, isUltimate }, ...]
  // 같은 적이 한 틱에 여러 번 맞을 수 있으므로 누적 차감
  if (allyResult.damageToEnemies && allyResult.damageToEnemies.length > 0) {
      allyResult.damageToEnemies.forEach(d => {
          const idx = d.targetEnemyIdx;
          const target = nextEnemies[idx];
          if (target && target.hp > 0) {
              nextEnemies[idx] = {
                  ...target,
                  hp: Math.max(0, target.hp - d.amount)
              };
          }
      });
  }

  return {
    nextAllies,
    nextBuffs,
    nextEnemies,
    tickEvents,
    // [Step 5-2b-ii] 컷인 큐 (0~N개). useBattle이 큐 비어있을 때만 데미지 일괄 적용.
    cutInQueue,
    buffsChanged: hasChanged || allyResult.buffsChanged
  };
}