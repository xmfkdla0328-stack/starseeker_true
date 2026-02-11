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

    if (enemy.hp <= 0) {
        return { updatedEnemy: { ...enemy }, damageToAllies: [] };
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

            if (newCausality >= ENEMY_CAUSALITY_TRIGGER) {
                const skillData = enemy.skills.causality;
                isCharging = true;
                chargingSkill = 'causality';
                chargeTimer = skillData.chargeTime || 3000;
                addLog(`⚠️ ${enemy.name}이(가) [${skillData.name}]을(를) 준비합니다...`, 'system');
            } 
            else if (newUltGauge >= enemy.maxUltGauge) {
                const skillData = enemy.skills.ultimate;
                isCharging = true;
                chargingSkill = 'ultimate';
                chargeTimer = skillData.chargeTime || 2000;
                addLog(`🔥 ${enemy.name}에게서 불길한 기운이 느껴집니다. (${skillData.name})`, 'system');
            } 
            else {
                const skillData = enemy.skills.normal;
                const target = selectRandomAlly(allies);
                
                if (target) {
                    const dmg = Math.floor(enemy.baseAtk * skillData.mult);
                    // [수정] 로그에 데미지 포함
                    addLog(`⚔️ ${enemy.name}의 [${skillData.name}] -> ${target.name} (💥 ${dmg})`, 'damage');
                    damageToAllies.push({ targetId: target.id, amount: dmg });
                    
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