import { ACTION_THRESHOLD, TICK_RATE } from '../../data/gameData';
import { executeUltimateSkill, executeNormalSkill } from './skillExecutor';

export function handleAllyActions({
  allies,
  buffs,
  enemies,
  shieldJustExpired,
  setBuffs,
  addLog,
  gainCausality
}) {
  let nextAllies = [...allies];
  // [Refactor step 2] 단일 totalEnemyDamage 대신 적별 데미지 배열로 처리.
  // 각 항목: { targetEnemyIdx, amount, isCrit, isUltimate }
  const damageToEnemies = [];
  // 살아있는 적의 인덱스 목록 (AOE/단일타겟 결정용)
  const aliveEnemyIndices = (enemies || [])
    .map((e, idx) => (e && e.hp > 0) ? idx : -1)
    .filter(idx => idx >= 0);
  
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

      // [Fix] 하드코딩된 10%/1.5배 → ally의 실제 critRate/critDmg(% 단위) 사용
      const critRatePct = ally.critRate || 0; 
      const critDmgPct = ally.critDmg || 0;   
      const isCrit = Math.random() * 100 < critRatePct;
      const finalCritMultiplier = isCrit 
          ? (1 + critDmgPct / 100) * (1 + (ally.selfBuffs.critDmgUp || 0)) 
          : 1.0;
      
      const hasDmgUp = ally.memoryEffects && ally.memoryEffects.some(e => e.id === 'DMG_UP');
      const hasHealUp = ally.memoryEffects && ally.memoryEffects.some(e => e.id === 'HEAL_UP');

      const executorProps = { 
          finalAtk, finalCritMultiplier, isCrit, setBuffs, addLog, currentAllies: nextAllies,
          hasHealUp 
      };

      if (ally.ultGauge >= ally.maxUltGauge) {
        ally.ultGauge = 0;

        // [NEW] 행동 표시용 이벤트 (UI에서 칸 글로우/스케일업)
        allyTickEvents.push({
            id: `evt_actor_${ally.id}_${Date.now()}_${Math.random()}`,
            type: 'actor',
            actorId: ally.id,
            actionKind: 'ult'
        });

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

        if (damageDealt > 0 && aliveEnemyIndices.length > 0) {
            const ultSkill = ally.combatSkills.ultimate;
            // AOE이면 모든 살아있는 적, 아니면 첫 번째 살아있는 적만 타격
            const targetIndices = ultSkill.isAoe 
                ? aliveEnemyIndices 
                : [aliveEnemyIndices[0]];
            const multiSuffix = targetIndices.length > 1 ? ` x ${targetIndices.length}` : '';
            
            addLog(`${ally.name}: [${ultSkill.name}]! (💥 ${damageDealt}${multiSuffix})`, 'skill');

            targetIndices.forEach(enemyIdx => {
                damageToEnemies.push({
                    targetEnemyIdx: enemyIdx,
                    amount: damageDealt,
                    isCrit: isCrit,
                    isUltimate: true
                });
                // 적 피격 팝업 (현재 DOM은 'enemy-target-main' 단일. step 3에서 적별 DOM으로 변경 예정)
                allyTickEvents.push({
                    id: `evt_dmg_ult_${ally.id}_${enemyIdx}_${Date.now()}_${Math.random()}`,
                    targetId: 'enemy-target-main',
                    value: damageDealt,
                    type: 'damage',
                    isCrit: isCrit,
                    isUltimate: true,
                });
            });
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

        // [NEW] 행동 표시용 이벤트 (딜이면 normal, 회복이면 heal)
        allyTickEvents.push({
            id: `evt_actor_${ally.id}_${Date.now()}_${Math.random()}`,
            type: 'actor',
            actorId: ally.id,
            actionKind: damageDealt > 0 ? 'normal' : 'heal'
        });
        
        if (hasDmgUp && damageDealt > 0) {
            damageDealt = Math.floor(damageDealt * 1.1);
        }

        if (damageDealt > 0 && aliveEnemyIndices.length > 0) {
            const normalSkill = ally.combatSkills.normal;
            // 일반공격도 isAoe를 지원하지만 현재 모든 일반공격은 단일타겟
            const targetIndices = normalSkill.isAoe 
                ? aliveEnemyIndices 
                : [aliveEnemyIndices[0]];
            const multiSuffix = targetIndices.length > 1 ? ` x ${targetIndices.length}` : '';
            
            addLog(`${ally.name}의 [${skillName}]!${multiSuffix ? ' (광역)' : ''}`, 'damage');

            targetIndices.forEach(enemyIdx => {
                damageToEnemies.push({
                    targetEnemyIdx: enemyIdx,
                    amount: damageDealt,
                    isCrit: isCrit,
                    isUltimate: false
                });
                allyTickEvents.push({
                    id: `evt_dmg_${ally.id}_${enemyIdx}_${Date.now()}_${Math.random()}`,
                    targetId: 'enemy-target-main',
                    value: damageDealt,
                    type: 'damage',
                    isCrit: isCrit,
                });
            });
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

  return { updatedAllies: nextAllies, damageToEnemies, triggeredSkillInfo, allyTickEvents };
}