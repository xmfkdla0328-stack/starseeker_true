import { ACTION_THRESHOLD, TICK_RATE } from '../../data/gameData';
import { executeUltimateSkill, executeNormalSkill } from './skillExecutor';

/**
 * [Step 4] 살아있는 적 인덱스를 잡몹 우선 → 보스 순으로 반환.
 * 그룹 내에서는 enemies 배열의 원래 순서 유지 (안정 정렬).
 *
 * 단일 타겟 공격은 결과의 [0]번을 자동 선택 → 잡몹이 있으면 잡몹부터 처리.
 * 이 함수는 매 아군 행동 직전에 호출되므로 같은 틱 안에서 이미 죽은 적은 자동 제외됨.
 */
function getAliveTargetIndices(workingEnemies) {
  const alive = [];
  workingEnemies.forEach((e, idx) => {
    if (e && e.hp > 0) alive.push({ idx, isBoss: !!e.isBoss });
  });
  // 잡몹(false=0) → 보스(true=1) 순. Array.sort는 안정 정렬이므로 그룹 내 원순서 유지.
  alive.sort((a, b) => Number(a.isBoss) - Number(b.isBoss));
  return alive.map(e => e.idx);
}

/**
 * [Step 7-c] 단일 타겟 공격에서 잡몹 우선 정렬을 우선 타겟 마킹으로 덮어씀.
 * - 자동 모드 / 우선 타겟 없음 / 우선 타겟이 죽음·없음 → 기존 정렬(잡몹 우선) 그대로 [0] 사용.
 * - 수동 + 우선 타겟이 살아있으면 그 idx를 alive 목록 맨 앞으로 끌어올림 (안정성: 여러 곳에서 [0]만 보면 됨).
 */
function applyPriorityTarget(liveIndices, battleMode, priorityTargetIdx, workingEnemies) {
  if (battleMode !== 'manual') return liveIndices;
  if (priorityTargetIdx == null) return liveIndices;
  const t = workingEnemies[priorityTargetIdx];
  if (!t || t.hp <= 0) return liveIndices;
  if (!liveIndices.includes(priorityTargetIdx)) return liveIndices;
  return [priorityTargetIdx, ...liveIndices.filter(i => i !== priorityTargetIdx)];
}

export function handleAllyActions({
  allies,
  buffs,
  enemies,
  shieldJustExpired,
  setBuffs,
  addLog,
  gainCausality,
  battleMode = 'auto',
  priorityTargetIdx = null,
}) {
  let nextAllies = [...allies];
  // [Refactor step 2] 단일 totalEnemyDamage 대신 적별 데미지 배열로 처리.
  // 각 항목: { targetEnemyIdx, amount, isCrit, isUltimate }
  const damageToEnemies = [];

  // [Step 4] 워킹 카피: 같은 틱 내 아군 행동들 사이에 데미지를 누적 반영해
  //         "방금 잡몹이 죽었으면 다음 아군은 시체를 안 때리도록" 한다.
  //         이 카피는 외부로 노출하지 않으며, 진짜 데미지는 기존대로 damageToEnemies로
  //         battleTick.js에 전달되어 nextEnemies에 적용됨 (이중 차감 없음).
  let workingEnemies = (enemies || []).map(e => e ? { ...e } : null);

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
      // [Step 4] 같은 틱 내 앞선 아군이 마지막 적까지 처치한 경우, 나머지 아군은
      //         이 틱에 행동하지 않는다 — 시체에 컷인을 띄우거나 궁 게이지를 낭비하지 않도록.
      //         아군의 행동/궁 게이지는 보존하고, 다음 틱에서 승리 판정이 발생함.
      if (getAliveTargetIndices(workingEnemies).length === 0) {
        nextAllies[i] = ally;
        continue;
      }
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

        // [Step 4] 매 행동 직전에 fresh alive 인덱스 (잡몹 우선 정렬) — 시체 자동 제외
        const ultLiveIndicesRaw = getAliveTargetIndices(workingEnemies);
        // [Step 7-c] 단일 타겟 ult도 우선 타겟 마킹을 따른다 (AOE는 영향 없음).
        const ultLiveIndices = applyPriorityTarget(ultLiveIndicesRaw, battleMode, priorityTargetIdx, workingEnemies);
        if (damageDealt > 0 && ultLiveIndices.length > 0) {
            const ultSkill = ally.combatSkills.ultimate;
            // AOE이면 모든 살아있는 적, 아니면 우선순위 첫 번째 (잡몹 우선 / 수동 우선 타겟)
            const targetIndices = ultSkill.isAoe 
                ? ultLiveIndices 
                : [ultLiveIndices[0]];
            const multiSuffix = targetIndices.length > 1 ? ` x ${targetIndices.length}` : '';
            
            addLog(`${ally.name}: [${ultSkill.name}]! (💥 ${damageDealt}${multiSuffix})`, 'skill');

            targetIndices.forEach(enemyIdx => {
                damageToEnemies.push({
                    targetEnemyIdx: enemyIdx,
                    amount: damageDealt,
                    isCrit: isCrit,
                    isUltimate: true
                });
                // 적 피격 팝업: 슬롯 기반 DOM id로 per-enemy 타겟팅 (step 3b)
                allyTickEvents.push({
                    id: `evt_dmg_ult_${ally.id}_${enemyIdx}_${Date.now()}_${Math.random()}`,
                    targetId: `enemy-slot-${enemyIdx}`,
                    value: damageDealt,
                    type: 'damage',
                    isCrit: isCrit,
                    isUltimate: true,
                });
                // [Step 4] 워킹 카피에 누적 반영 → 다음 아군 행동이 fresh 상태 보도록
                if (workingEnemies[enemyIdx]) {
                    workingEnemies[enemyIdx] = {
                        ...workingEnemies[enemyIdx],
                        hp: Math.max(0, workingEnemies[enemyIdx].hp - damageDealt)
                    };
                }
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

        // [Step 4] 매 행동 직전에 fresh alive 인덱스 (잡몹 우선 정렬)
        const normalLiveIndicesRaw = getAliveTargetIndices(workingEnemies);
        // [Step 7-c] 일반 공격도 우선 타겟 마킹을 따른다.
        const normalLiveIndices = applyPriorityTarget(normalLiveIndicesRaw, battleMode, priorityTargetIdx, workingEnemies);
        if (damageDealt > 0 && normalLiveIndices.length > 0) {
            const normalSkill = ally.combatSkills.normal;
            // 일반공격도 isAoe를 지원하지만 현재 모든 일반공격은 단일타겟
            const targetIndices = normalSkill.isAoe 
                ? normalLiveIndices 
                : [normalLiveIndices[0]];
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
                    targetId: `enemy-slot-${enemyIdx}`,
                    value: damageDealt,
                    type: 'damage',
                    isCrit: isCrit,
                });
                // [Step 4] 워킹 카피에 누적 반영
                if (workingEnemies[enemyIdx]) {
                    workingEnemies[enemyIdx] = {
                        ...workingEnemies[enemyIdx],
                        hp: Math.max(0, workingEnemies[enemyIdx].hp - damageDealt)
                    };
                }
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