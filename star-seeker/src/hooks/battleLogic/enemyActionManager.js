import { ACTION_THRESHOLD, TICK_RATE, ENEMY_CAUSALITY_TRIGGER } from '../../data/gameData';

function selectRandomAlly(allies) {
  const aliveAllies = allies.filter(a => a.hp > 0);
  if (aliveAllies.length === 0) return null;
  return aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
}

export function handleEnemyActions(context) {
    const { enemy, allies, addLog } = context;

    let newActionGauge = enemy.actionGauge;
    let newCausality = enemy.causality;
    let newUltGauge = enemy.ultGauge;
    let isCharging = enemy.isCharging;
    let chargeTimer = enemy.chargeTimer;
    let chargingSkill = enemy.chargingSkill;
    let damageToAllies = [];
    // [Step 5-2a] 보스 궁극기 발동 시 컷인 트리거. 차징 종료(=데미지 직전) 타이밍에만 발화.
    let triggeredEnemyCutIn = null;

    if (enemy.hp <= 0) {
        return { updatedEnemy: { ...enemy }, damageToAllies: [], triggeredEnemyCutIn: null };
    }
    
    // 1. 충전 상태 처리
    if (isCharging) {
        chargeTimer -= TICK_RATE;
        
        if (chargeTimer <= 0) {
            let skillData = null;
            let logType = 'damage';

            if (chargingSkill === 'causality') {
                skillData = enemy.skills.causality;
                logType = 'skill';
                newCausality = 0;
            } else if (chargingSkill === 'ultimate') {
                skillData = enemy.skills.ultimate;
                logType = 'skill';
                newUltGauge = 0;
                newCausality += (skillData.causalityGain || 0);

                // [Step 5-2a] 보스만, 그리고 궁극기 발동 시점에만 컷인 트리거.
                // chargingSkill === 'causality' 분기는 5-2a에서는 컷인 없음 (사용자 검증 후 결정).
                if (enemy.isBoss) {
                    triggeredEnemyCutIn = {
                        name: enemy.name,
                        image: enemy.image,
                        skillName: skillData.name,
                        side: 'enemy',  // [Step 5-2b 예약] BattleCutIn에서 진영 구분 시 사용
                    };
                }
            }

            if (skillData) {
                // [수정] 스킬 발동 로그 (데미지는 광역일 수 있어 여기서 합치기 애매하므로 발동 로그만 강조)
                addLog(`☄️ ${enemy.name}의 [${skillData.name}] 발동!`, logType);
                
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

            isCharging = false;
            chargingSkill = null;
            newActionGauge = 0;
        }
    }
    // 2. 일반 상태
    else {
        newActionGauge += (enemy.baseSpd * (1 + Math.random() * 0.1));

        if (newActionGauge >= ACTION_THRESHOLD) {
            newActionGauge = 0;

            // [Step 3b 픽스] 스킬 존재 여부 가드.
            // 잡몹은 causality/ultimate 스킬이 없을 수 있으므로
            // 해당 스킬이 정의된 경우에만 차징 분기 진입. 아니면 일반 공격으로 폴백.
            if (newCausality >= ENEMY_CAUSALITY_TRIGGER && enemy.skills.causality) {
                const skillData = enemy.skills.causality;
                isCharging = true;
                chargingSkill = 'causality';
                chargeTimer = skillData.chargeTime || 3000;
                addLog(`⚠️ ${enemy.name}이(가) [${skillData.name}]을(를) 준비합니다...`, 'system');
            } 
            else if (newUltGauge >= enemy.maxUltGauge && enemy.skills.ultimate) {
                const skillData = enemy.skills.ultimate;
                isCharging = true;
                chargingSkill = 'ultimate';
                chargeTimer = skillData.chargeTime || 2000;
                addLog(`🔥 ${enemy.name}에게서 불길한 기운이 느껴집니다. (${skillData.name})`, 'system');
            } 
            else {
                const skillData = enemy.skills.normal;
                const target = selectRandomAlly(allies);
                
                if (target && skillData) {
                    const dmg = Math.floor(enemy.baseAtk * skillData.mult);
                    // [수정] 로그에 데미지 포함
                    addLog(`⚔️ ${enemy.name}의 [${skillData.name}] -> ${target.name} (💥 ${dmg})`, 'damage');
                    damageToAllies.push({ targetId: target.id, amount: dmg });
                    
                    newUltGauge += (skillData.gaugeGain || 0);
                    newCausality += (skillData.causalityGain || 0);
                }

                // [Step 3b 픽스] 임계점 도달했지만 해당 스킬이 없는 적은 게이지를 클램프.
                // (매 틱 임계점 재체크 → 폴백 무한 반복을 막기 위함)
                if (!enemy.skills.causality && newCausality >= ENEMY_CAUSALITY_TRIGGER) {
                    newCausality = ENEMY_CAUSALITY_TRIGGER - 1;
                }
                if (!enemy.skills.ultimate && newUltGauge >= enemy.maxUltGauge) {
                    newUltGauge = enemy.maxUltGauge - 1;
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
        damageToAllies,
        triggeredEnemyCutIn
    };
}