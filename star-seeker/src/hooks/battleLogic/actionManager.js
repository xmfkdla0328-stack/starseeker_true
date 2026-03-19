import { ACTION_THRESHOLD, TICK_RATE } from '../../data/gameData';
import { executeUltimateSkill, executeNormalSkill } from './skillExecutor';

export function handleAllyActions({
  allies,
  buffs,
  shieldJustExpired,
  setBuffs,
  addLog,
  gainCausality
}) {
  let nextAllies = [...allies];
  let totalEnemyDamage = 0;
  
  let triggeredSkillInfo = null;
  const allyTickEvents = []; 

  for (let i = 0; i < nextAllies.length; i++) {
    let ally = { ...nextAllies[i] };

    if (!ally.selfBuffs) ally.selfBuffs = { atkUp: 0, critDmgUp: 0, buffTime: 0 };
    if (ally.selfBuffs.buffTime > 0) {
      ally.selfBuffs.buffTime -= TICK_RATE;
      if (ally.selfBuffs.buffTime <= 0) {
        ally.selfBuffs = { ...ally.selfBuffs, atkUp: 0, critDmgUp: 0, buffTime: 0 };
        addLog(`${ally.name}의 강화 효과가 종료되었습니다.`, 'buff');
      }
    }

    if (shieldJustExpired) ally.shield = 0;
    
    if (ally.hp <= 0) {
      nextAllies[i] = ally;
      continue;
    }

    const speedMultiplier = buffs.speed.active ? buffs.speed.val : 1;
    ally.actionGauge += (ally.spd * speedMultiplier * (1 + Math.random() * 0.1));

    // [Fix] 5. 행동 실행 (게이지 100% 도달하여 "내 턴"이 되었을 때!)
    if (ally.actionGauge >= ACTION_THRESHOLD) {
      ally.actionGauge = 0;

      // [NEW] 턴 시작 직후: 나에게 지속 회복(hot) 버프가 있다면 먼저 체력을 회복합니다.
      if (ally.selfBuffs.hot && ally.selfBuffs.hot.turns > 0) {
          const hotVal = ally.selfBuffs.hot.amount;
          const oldHp = ally.hp;
          ally.hp = Math.min(ally.maxHp, ally.hp + hotVal);
          const diff = ally.hp - oldHp;

          if (diff > 0) {
              allyTickEvents.push({
                  id: `evt_hot_${ally.id}_${Date.now()}_${Math.random()}`,
                  targetId: `ally-target-${ally.id}`,
                  value: Math.floor(diff),
                  type: 'heal',
                  isCrit: false
              });
              addLog(`${ally.name}의 지속 회복! (+${Math.floor(diff)})`, 'heal');
          }
          ally.selfBuffs.hot.turns -= 1; // 턴을 1회 깎습니다.
      }

      const globalAtkMult = buffs.atk.active ? (1 + buffs.atk.val) : 1;
      const selfAtkMult = 1 + (ally.selfBuffs.atkUp || 0);
      const finalAtk = ally.atk * globalAtkMult * selfAtkMult;
      const eff = ally.efficiency || 1.0;
      const isCrit = Math.random() < 0.1;
      const finalCritMultiplier = isCrit ? (1.5 * (1 + (ally.selfBuffs.critDmgUp || 0))) : 1.0;
      
      const hasDmgUp = ally.memoryEffects && ally.memoryEffects.some(e => e.id === 'DMG_UP');
      const hasHealUp = ally.memoryEffects && ally.memoryEffects.some(e => e.id === 'HEAL_UP');

      const executorProps = { 
          finalAtk, finalCritMultiplier, isCrit, setBuffs, addLog, currentAllies: nextAllies,
          hasHealUp 
      };

      if (ally.ultGauge >= ally.maxUltGauge) {
        ally.ultGauge = 0;
        
        triggeredSkillInfo = {
            name: ally.name,
            image: ally.image, 
            skillName: ally.combatSkills.ultimate.name,
            quote: ally.combatSkills.ultimate.quote || `${ally.name}의 진정한 힘을 보여주마!`
        };

        let { damageDealt, alliesToHeal, newSelfBuffs } = executeUltimateSkill(ally, ally.combatSkills.ultimate, executorProps);
        
        if (hasDmgUp && damageDealt > 0) {
            damageDealt = Math.floor(damageDealt * 1.1);
        }

        if (damageDealt > 0) {
            addLog(`${ally.name}: [${ally.combatSkills.ultimate.name}]! (💥 ${damageDealt})`, 'skill');
            totalEnemyDamage += damageDealt;
        }
        
        if (alliesToHeal && typeof alliesToHeal === 'function') {
            const hpSnapshot = nextAllies.map(a => a.hp); 
            nextAllies = alliesToHeal(nextAllies); 
            
            nextAllies.forEach((updatedAlly, idx) => {
                const diff = updatedAlly.hp - hpSnapshot[idx];
                if (diff > 0) {
                    allyTickEvents.push({
                        id: `evt_heal_ult_${Date.now()}_${Math.random()}`,
                        targetId: `ally-target-${updatedAlly.id}`,
                        value: Math.floor(diff),
                        type: 'heal',
                        isCrit: false
                    });
                }
            });

            if (nextAllies[i]) {
                ally.hp = nextAllies[i].hp;
                ally.selfBuffs = nextAllies[i].selfBuffs; // [Fix] 힐러가 부여한 hot 버프를 내 상태에도 동기화
            }
        } else {
             ally.selfBuffs = newSelfBuffs;
        }
        
        gainCausality(3 * eff);
      } 
      else {
        const skillName = ally.combatSkills?.normal?.name || "기본 공격";
        let { damageDealt, alliesToModify } = executeNormalSkill(ally, ally.combatSkills.normal, executorProps);
        
        if (hasDmgUp && damageDealt > 0) {
            damageDealt = Math.floor(damageDealt * 1.1);
        }

        if (damageDealt > 0) {
            addLog(`${ally.name}의 [${skillName}]!`, 'damage');
            totalEnemyDamage += damageDealt;
        }
        
        if (alliesToModify && typeof alliesToModify === 'function') {
             const hpSnapshot = nextAllies.map(a => a.hp); 
             nextAllies = alliesToModify(nextAllies);
             
             nextAllies.forEach((updatedAlly, idx) => {
                const diff = updatedAlly.hp - hpSnapshot[idx];
                if (diff > 0) {
                    allyTickEvents.push({
                        id: `evt_heal_norm_${Date.now()}_${Math.random()}`,
                        targetId: `ally-target-${updatedAlly.id}`,
                        value: Math.floor(diff),
                        type: 'heal',
                        isCrit: isCrit 
                    });
                }
             });

             if (nextAllies[i]) {
                 ally.hp = nextAllies[i].hp;
             }
        }
        
        ally.ultGauge = Math.min(ally.maxUltGauge, ally.ultGauge + 20);
        gainCausality(1 * eff);
      }
    }
    
    nextAllies[i] = ally;
  }

  return { updatedAllies: nextAllies, damageToEnemy: totalEnemyDamage, triggeredSkillInfo, allyTickEvents };
}