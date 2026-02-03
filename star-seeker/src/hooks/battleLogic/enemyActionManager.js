import { ACTION_THRESHOLD, TICK_RATE } from '../../data/gameData';

// 살아있는 아군 중 랜덤으로 타겟을 선택하는 함수
function selectRandomAlly(allies) {
  const aliveAllies = allies.filter(a => a.hp > 0);
  if (aliveAllies.length === 0) return null;
  return aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
}

/**
 * 적의 행동 로직을 처리합니다.
 * @param {object} context - 전투의 모든 상태와 함수를 담고 있는 객체
 * @returns {object} - 적의 상태 변화와 아군에게 가해질 데미지 정보
 */
export function handleEnemyActions(context) {
    const { enemy, allies, addLog } = context;

    let newActionGauge = enemy.actionGauge;
    let newCausality = enemy.causality;
    let isCharging = enemy.isCharging;
    let chargeTimer = enemy.chargeTimer;
    let damageToAllies = [];

    if (enemy.hp <= 0) {
        return { newActionGauge, newCausality, isCharging, chargeTimer, damageToAllies };
    }
    
    // 1. 충전(charging) 상태 관리
    if (isCharging) {
        chargeTimer -= TICK_RATE;
        if (chargeTimer <= 0) {
            addLog(`적의 강력한 광역 공격!`, 'enemy-attack');
            // 살아있는 모든 아군에게 데미지
            allies.forEach(ally => {
                if (ally.hp > 0) {
                    damageToAllies.push({ targetId: ally.id, amount: Math.floor(enemy.atk * 2.0) });
                }
            });
            isCharging = false;
            newActionGauge = 0;
        }
    }
    // 2. 일반 행동
    else {
        newActionGauge += (enemy.spd * (1 + Math.random() * 0.1));

        if (newActionGauge >= ACTION_THRESHOLD) {
            newActionGauge = 0;

            // 행동 결정: CP(causality)가 5 이상이면 50% 확률로 충전, 아니면 일반 공격
            if (newCausality >= 5 && Math.random() < 0.5) {
                isCharging = true;
                chargeTimer = 3000; // 3초 충전
                newCausality -= 5;
                addLog('적이 힘을 모으기 시작합니다!', 'enemy-warning');
            } else {
                const target = selectRandomAlly(allies);
                if (target) {
                    const damage = Math.floor(enemy.atk * (0.8 + Math.random() * 0.4)); // 데미지 변동폭 추가
                    addLog(`⚔️ 적의 공격 -> ${target.name} (DMG: ${damage})`, 'enemy-attack');
                    damageToAllies.push({ targetId: target.id, amount: damage });
                    newCausality += 1;
                }
            }
        }
    }

    return {
        newActionGauge,
        newCausality,
        isCharging,
        chargeTimer,
        damageToAllies,
    };
}
