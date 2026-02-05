import { ACTION_THRESHOLD, TICK_RATE, ENEMY_CAUSALITY_TRIGGER } from '../../data/gameData';

// 살아있는 아군 중 랜덤으로 타겟을 선택하는 함수
function selectRandomAlly(allies) {
  const aliveAllies = allies.filter(a => a.hp > 0);
  if (aliveAllies.length === 0) return null;
  return aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
}

/**
 * 적의 행동 로직 (AI)
 * 구조: 충전 체크 -> (행동 게이지 충전) -> 턴 획득 -> [인과력 스킬 > 필살기 > 일반 공격] 판단
 */
export function handleEnemyActions(context) {
    const { enemy, allies, addLog } = context;

    // 상태 복사
    let newActionGauge = enemy.actionGauge;
    let newCausality = enemy.causality;
    let newUltGauge = enemy.ultGauge;
    let isCharging = enemy.isCharging;
    let chargeTimer = enemy.chargeTimer;
    let chargingSkill = enemy.chargingSkill; // 현재 준비 중인 스킬 타입
    let damageToAllies = [];

    if (enemy.hp <= 0) {
        return { updatedEnemy: { ...enemy }, damageToAllies: [] };
    }
    
    // ----------------------------------------------------
    // 1. 충전(Charging) 상태 처리 (스킬 준비 중)
    // ----------------------------------------------------
    if (isCharging) {
        chargeTimer -= TICK_RATE;
        
        // 충전 완료! 스킬 발동
        if (chargeTimer <= 0) {
            let skillData = null;
            let logType = 'enemy_atk';

            // 준비했던 스킬이 무엇인지 확인
            if (chargingSkill === 'causality') {
                skillData = enemy.skills.causality;
                logType = 'enemy_ult'; // 인과력 스킬 강조
                newCausality = 0; // 인과력 소모
            } else if (chargingSkill === 'ultimate') {
                skillData = enemy.skills.ultimate;
                logType = 'enemy_atk'; // 필살기
                newUltGauge = 0; // 게이지 소모
                newCausality += (skillData.causalityGain || 0); // 필살기 사용으로 인과력 축적
            }

            if (skillData) {
                addLog(`☄️ ${enemy.name}의 [${skillData.name}] 발동!`, logType);
                
                // 데미지 판정 (광역/단일)
                if (skillData.isAoe) {
                    allies.forEach(ally => {
                        if (ally.hp > 0) {
                            damageToAllies.push({ targetId: ally.id, amount: Math.floor(enemy.baseAtk * skillData.mult) });
                        }
                    });
                } else {
                    const target = selectRandomAlly(allies);
                    if (target) {
                        damageToAllies.push({ targetId: target.id, amount: Math.floor(enemy.baseAtk * skillData.mult) });
                    }
                }
            }

            // 상태 초기화
            isCharging = false;
            chargingSkill = null;
            newActionGauge = 0;
        }
    }
    // ----------------------------------------------------
    // 2. 일반 상태 (행동 게이지 충전 및 패턴 결정)
    // ----------------------------------------------------
    else {
        newActionGauge += (enemy.baseSpd * (1 + Math.random() * 0.1));

        // 턴 획득
        if (newActionGauge >= ACTION_THRESHOLD) {
            newActionGauge = 0;

            // [패턴 1] 인과력 조건 충족 시 -> 인과력 스킬 예고 (최우선)
            if (newCausality >= ENEMY_CAUSALITY_TRIGGER) {
                const skillData = enemy.skills.causality;
                isCharging = true;
                chargingSkill = 'causality';
                chargeTimer = skillData.chargeTime || 3000;
                addLog(`⚠️ ${enemy.name}이(가) [${skillData.name}]을(를) 준비합니다...`, 'warning');
            } 
            // [패턴 2] 필살기 게이지 충족 시 -> 필살기 예고 (차선)
            else if (newUltGauge >= enemy.maxUltGauge) {
                const skillData = enemy.skills.ultimate;
                isCharging = true;
                chargingSkill = 'ultimate';
                chargeTimer = skillData.chargeTime || 2000;
                addLog(`🔥 ${enemy.name}에게서 불길한 기운이 느껴집니다. (${skillData.name})`, 'warning');
            } 
            // [패턴 3] 일반 공격 (즉시 시전)
            else {
                const skillData = enemy.skills.normal;
                const target = selectRandomAlly(allies);
                
                if (target) {
                    const dmg = Math.floor(enemy.baseAtk * skillData.mult);
                    addLog(`⚔️ ${enemy.name}의 [${skillData.name}] -> ${target.name}`, 'enemy_atk');
                    damageToAllies.push({ targetId: target.id, amount: dmg });
                    
                    // 게이지 및 인과력 축적
                    newUltGauge += (skillData.gaugeGain || 0);
                    newCausality += (skillData.causalityGain || 0);
                }
            }
        }
    }

    return { 
        updatedEnemy: { 
            ...enemy, 
            actionGauge: newActionGauge, 
            causality: newCausality, 
            ultGauge: Math.min(newUltGauge, enemy.maxUltGauge),
            isCharging, 
            chargeTimer,
            chargingSkill
        },
        damageToAllies
    };
}