import { handleAllyActions } from './actionManager';
import { manageBuffs } from './buffManager';
import { handleEnemyActions } from './enemyActionManager';
import { calculateDamage } from './damageCalculator';
import {
  CAUSALITY_SKILLS,
  CAUSALITY_SKILL_ORDER,
  applySkillSideEffects,
  autoActivateLog,
} from '../../data/causalitySkills';
import {
  ENEMY_EFFECTS,
  applyEnemyEffect,
  tickStatusEffects,
} from '../../data/enemyEffects';

// =============================================================================
// battleTick.js — 전투 1프레임(Tick) 처리.
// processBattleTick는 6개 단계(phase) 함수의 얇은 오케스트레이터이며, 각 phase는
// 입력 상태를 받아 일부분만 변환한 결과를 반환한다. 어떤 phase도 외부 상태를
// 직접 mutate하지 않고, 다음 phase 입력으로 넘기는 방식으로 데이터 흐름을 명시한다.
// (이전 모놀리식 함수에서 단계간 변수 흐름이 섞여 따라가기 어려웠던 문제를 해결.)
//
// 단계 순서:
//   1) tickBuffsAndStatuses   — 전역 버프 만료 + 상태이상 시간 차감
//   2) runEnemyPhase          — 적 행동 루프 (데미지·디버프·컷인 수집)
//   3) applyPendingEnemyEffects — 적 스킬이 만든 상태이상 부여
//   4) applyEnemyDamageToAllies — 수집된 적 데미지를 실제 아군 HP/실드에 적용
//   5) runAllyPhase           — 아군 행동 (handleAllyActions 위임)
//   6) runAutoCausalitySkill  — 자동 모드 인과력 스킬 자동 발동
// =============================================================================

// =============================================================================
// Phase 1 — 전역 버프 시간 차감 + 상태이상 슬롯 시간 차감.
//   - 데미지/행동 처리 전에 미리 1틱 차감하여, 만료된 효과가 이번 틱 행동에
//     영향을 주지 않도록 함.
// 반환: { nextBuffs, nextAllies, nextEnemies, shieldJustExpired, buffsChanged }
// =============================================================================
function tickBuffsAndStatuses({ buffs, allies, enemies, addLog }) {
  const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(buffs, addLog);
  const nextAllies = allies.map(a => tickStatusEffects(a, addLog));
  const nextEnemies = enemies.map(e => tickStatusEffects(e, addLog));
  return {
    nextBuffs: hasChanged ? updatedBuffs : buffs,
    nextAllies,
    nextEnemies,
    shieldJustExpired,
    buffsChanged: hasChanged,
  };
}

// =============================================================================
// Phase 2 — 살아있는 모든 적의 행동을 실행하고 결과를 모은다.
//   - 각 적의 게이지/충전 갱신은 enemies 배열에 즉시 반영.
//   - 데미지/디버프/컷인은 큐에 모아 다음 phase가 일괄 처리.
// 반환: { nextEnemies, allDamageToAllies, enemyDamageSourceMap, pendingEffects, cutInQueue }
// =============================================================================
function runEnemyPhase({ allies, enemies, addLog }) {
  const nextEnemies = enemies; // map은 phase1에서 이미 새 배열로 생성됨 — 여기선 in-place 인덱스 교체.
  const allDamageToAllies = [];
  // hit별 가해자 추적 (피격 시 크리 계산은 가해자 stat 기반).
  const enemyDamageSourceMap = new Map();
  const pendingEffects = [];
  const cutInQueue = [];

  for (let ei = 0; ei < nextEnemies.length; ei++) {
    const enemy = nextEnemies[ei];
    if (!enemy || enemy.hp <= 0) continue;

    const { updatedEnemy, damageToAllies, triggeredEnemyCutIn, effectsToApply } = handleEnemyActions({
      enemy,
      allies,
      addLog,
    });

    if (updatedEnemy) {
      nextEnemies[ei] = updatedEnemy;
    }

    // [Step 5-2b-ii] 모든 적 ult 컷인을 배열 인덱스 순으로 누적. 상한 없음.
    // _id: BattleCutIn 재마운트용 React key — 같은 진영 컷인이 연속될 때도
    // styled-components 애니메이션이 새로 시작되도록 강제.
    if (triggeredEnemyCutIn) {
      cutInQueue.push({ ...triggeredEnemyCutIn, _id: `cutin_${Date.now()}_${Math.random()}` });
    }

    if (damageToAllies && damageToAllies.length > 0) {
      damageToAllies.forEach(d => {
        allDamageToAllies.push(d);
        enemyDamageSourceMap.set(d, updatedEnemy || enemy);
      });
    }

    if (effectsToApply && effectsToApply.length > 0) {
      pendingEffects.push(...effectsToApply);
    }
  }

  return { nextEnemies, allDamageToAllies, enemyDamageSourceMap, pendingEffects, cutInQueue };
}

// =============================================================================
// Phase 3 — 적 스킬이 만든 상태이상을 실제로 부여한다.
//   - 적 데미지 적용 직전에 부여하여 "데미지와 동시 적용" 의도를 만족.
//   - applyEnemyEffect는 allies/enemies를 새 참조로 반환하므로, 이후 phase는
//     반드시 이 반환값을 사용해야 함.
// 반환: { nextAllies, nextEnemies }
// =============================================================================
function applyPendingEnemyEffects({ pendingEffects, allies, enemies, addLog }) {
  if (pendingEffects.length === 0) {
    return { nextAllies: allies, nextEnemies: enemies };
  }
  let nextAllies = allies;
  let nextEnemies = enemies;
  for (const { effectId, sourceName } of pendingEffects) {
    const effect = ENEMY_EFFECTS[effectId];
    if (!effect) continue;
    const result = applyEnemyEffect(effect, nextAllies, nextEnemies, sourceName, addLog);
    nextAllies = result.allies;
    nextEnemies = result.enemies;
  }
  return { nextAllies, nextEnemies };
}

// =============================================================================
// Phase 4 — 수집된 적 데미지를 아군 HP/실드에 실제 차감하고 tickEvents에 기록.
//   - 한 아군이 여러 적에게 동시에 맞는 경우 누적 차감.
//   - 데미지 1당 (efficiency 가중) CP 1 누적.
// 반환: { nextAllies, addedTickEvents }
// =============================================================================
function applyEnemyDamageToAllies({ allies, allDamageToAllies, enemyDamageSourceMap, buffs, gainCausality }) {
  if (allDamageToAllies.length === 0) {
    return { nextAllies: allies, addedTickEvents: [] };
  }
  const addedTickEvents = [];
  const nextAllies = allies.map(ally => {
    const hits = allDamageToAllies.filter(d => d.targetId == ally.id);
    if (hits.length === 0) return ally;

    let workingAlly = { ...ally };
    for (const hit of hits) {
      const attacker = enemyDamageSourceMap.get(hit);
      const { finalDamage, remainingShield, isCrit } = calculateDamage(
        attacker,
        workingAlly,
        hit.amount,
        buffs,
      );

      if (finalDamage > 0 || hit.amount > 0) {
        addedTickEvents.push({
          id: `evt_${Date.now()}_${Math.random()}`,
          targetId: `ally-target-${ally.id}`,
          value: finalDamage,
          type: 'damage',
          isCrit: isCrit || false,
        });
      }

      if (finalDamage > 0) {
        gainCausality(1 * (workingAlly.efficiency || 1.0));
      }

      workingAlly = {
        ...workingAlly,
        hp: Math.max(0, workingAlly.hp - finalDamage),
        shield: remainingShield,
      };
    }
    return workingAlly;
  });
  return { nextAllies, addedTickEvents };
}

// =============================================================================
// Phase 5 — 아군 행동 1턴 실행 (handleAllyActions로 위임).
//   - setBuffs 함수형 업데이터 지원: skillExecutor의 일부 ult가
//     `setBuffs(b => ({ ...b, damageReduction: {...} }))` 형태로 호출하기 때문.
//     (이전엔 함수 그대로 nextBuffs에 대입되어 이후 `{...nextBuffs}` 시 키가
//      사라지는 회귀가 있어 함수형 처리를 명시화함.)
//   - 적별 데미지(damageToEnemies)는 이 phase 내부에서 즉시 차감.
// 반환: {
//   nextAllies, nextBuffs, nextEnemies, allyCutIn, addedTickEvents,
//   firedUltAllyIds, buffsChanged
// }
// =============================================================================
function runAllyPhase({ allies, buffs, enemies, shieldJustExpired, addLog, gainCausality, battleMode, priorityTargetIdx, pendingUltAllyIds }) {
  let mutatedBuffs = buffs;
  const setBuffs = (updater) => {
    mutatedBuffs = typeof updater === 'function' ? updater(mutatedBuffs) : updater;
  };

  const allyResult = handleAllyActions({
    allies,
    buffs,
    enemies,
    shieldJustExpired,
    setBuffs,
    addLog,
    gainCausality,
    // [Step 7-c] 우선 타겟 정보 — 단일 타겟 공격에만 적용 (AOE 영향 없음).
    battleMode,
    priorityTargetIdx,
    // [Step 7-d] 수동 모드 ult 발동 요청 큐.
    pendingUltAllyIds,
  });

  // 적별 데미지 적용 — 같은 적이 한 틱에 여러 번 맞는 경우 누적 차감.
  let nextEnemies = enemies;
  if (allyResult.damageToEnemies && allyResult.damageToEnemies.length > 0) {
    nextEnemies = [...enemies];
    allyResult.damageToEnemies.forEach(d => {
      const idx = d.targetEnemyIdx;
      const target = nextEnemies[idx];
      if (target && target.hp > 0) {
        nextEnemies[idx] = {
          ...target,
          hp: Math.max(0, target.hp - d.amount),
        };
      }
    });
  }

  // 아군 ult 컷인 — 큐 마지막에 추가될 단일 항목 (있을 때만).
  const allyCutIn = allyResult.triggeredSkillInfo
    ? { ...allyResult.triggeredSkillInfo, _id: `cutin_${Date.now()}_${Math.random()}` }
    : null;

  return {
    nextAllies: allyResult.updatedAllies,
    nextBuffs: mutatedBuffs,
    nextEnemies,
    allyCutIn,
    addedTickEvents: allyResult.allyTickEvents || [],
    firedUltAllyIds: allyResult.firedUltAllyIds || [],
    buffsChanged: allyResult.buffsChanged,
  };
}

// =============================================================================
// Phase 6 — 자동 모드 인과력 스킬 자동 발동.
// [Step 7-c2] 정책 (사용자 결정):
//   매 틱마다 "가장 싼 비활성 스킬부터" 평가. CP 충족 시 1개 발동, 활성 중이면
//   건너뛰고 더 비싼 스킬 평가. 활성 중 스킬은 절대 중복 발동 안 함(CP 낭비 방지).
// 의도된 비효율 (수동 모드의 가치 보장):
//   - 보스 차징 등 "위협 인지" 없음 → SHIELD가 평타에 발동되어 큰 기술 못 막음 가능
//   - "콤보 인지" 없음 → ATTACK 없이도 HASTE가 단독 발동 (화력 곱연산 손해)
//   - "CP 캡 안전망" 없음 → 100 캡 적립 손실 가능
//   사용자는 수동 모드에서 직접 타이밍을 잡아 위 비효율을 피할 수 있음.
// 위치: 모든 행동/데미지 적용 후 → 이번 틱 결과 반영된 nextBuffs/nextAllies 위에서 결정.
//
// [Refactor] 비용/지속/라벨/사이드이펙트는 data/causalitySkills.js의 단일 소스 사용.
// CAUSALITY_SKILL_ORDER가 평가 순서(비용 오름차순), 각 스킬은 CAUSALITY_SKILLS[id].
//
// 반환: { nextBuffs, nextAllies, autoSkillCost, autoSkillTriggered }
//   - battleMode가 'auto'가 아니거나 발동 안 됐을 경우 입력 그대로 + cost=0/triggered=null.
// =============================================================================
function runAutoCausalitySkill({ battleMode, buffs, allies, currentPlayerCausality, addLog }) {
  if (battleMode !== 'auto') {
    return { nextBuffs: buffs, nextAllies: allies, autoSkillCost: 0, autoSkillTriggered: null };
  }
  for (const skillId of CAUSALITY_SKILL_ORDER) {
    const skill = CAUSALITY_SKILLS[skillId];
    if (buffs[skillId]?.active) continue; // 활성 중이면 건너뛰고 다음 비싼 스킬 평가
    if (currentPlayerCausality < skill.cost) continue; // CP 부족
    // 발동
    const nextAllies = skill.sideEffects.length > 0
      ? applySkillSideEffects(skill, allies)
      : allies;
    const nextBuffs = {
      ...buffs,
      [skillId]: { ...buffs[skillId], active: true, timeLeft: skill.durationMs },
    };
    addLog(autoActivateLog(skillId), 'skill');
    return { nextBuffs, nextAllies, autoSkillCost: skill.cost, autoSkillTriggered: skillId };
  }
  return { nextBuffs: buffs, nextAllies: allies, autoSkillCost: 0, autoSkillTriggered: null };
}

// =============================================================================
// processBattleTick — 오케스트레이터.
// 각 phase 함수에 현재 상태를 넘기고, 반환된 새 상태를 다음 phase로 전달한다.
// 반환 값의 형태/의미는 이전 모놀리식 버전과 1:1 동일하다.
// =============================================================================
export function processBattleTick({
  currentAllies,
  currentBuffs,
  currentEnemies,
  // [Step 7-c] 수동 모드 + 우선 타겟 idx (단일 타겟 공격에서 잡몹 우선 정렬을 덮어씀).
  battleMode = 'auto',
  priorityTargetIdx = null,
  // [Step 7-c2] 자동 인과력 스킬 발동 결정에 사용 (이번 틱 시작 시점 CP).
  currentPlayerCausality = 0,
  // [Step 7-d] 수동 모드 ult 발동 요청 큐 (Set<allyId>). null/undefined면 빈 집합.
  pendingUltAllyIds = null,
  addLog,
  gainCausality,
}) {
  const startingEnemies = Array.isArray(currentEnemies)
    ? currentEnemies.map(e => ({ ...e }))
    : [];

  // Phase 1
  const p1 = tickBuffsAndStatuses({
    buffs: currentBuffs,
    allies: [...currentAllies],
    enemies: startingEnemies,
    addLog,
  });

  // Phase 2
  const p2 = runEnemyPhase({
    allies: p1.nextAllies,
    enemies: p1.nextEnemies,
    addLog,
  });

  // Phase 3 — 적이 부여한 상태이상을 데미지 적용 전에 부여 (동시 적용 의도).
  const p3 = applyPendingEnemyEffects({
    pendingEffects: p2.pendingEffects,
    allies: p1.nextAllies,
    enemies: p2.nextEnemies,
    addLog,
  });

  // Phase 4 — 적 데미지를 아군에 적용.
  const p4 = applyEnemyDamageToAllies({
    allies: p3.nextAllies,
    allDamageToAllies: p2.allDamageToAllies,
    enemyDamageSourceMap: p2.enemyDamageSourceMap,
    buffs: p1.nextBuffs,
    gainCausality,
  });

  // Phase 5 — 아군 행동.
  const p5 = runAllyPhase({
    allies: p4.nextAllies,
    buffs: p1.nextBuffs,
    enemies: p3.nextEnemies,
    shieldJustExpired: p1.shieldJustExpired,
    addLog,
    gainCausality,
    battleMode,
    priorityTargetIdx,
    pendingUltAllyIds,
  });

  // Phase 6 — 자동 인과력 스킬 (auto 모드만).
  const p6 = runAutoCausalitySkill({
    battleMode,
    buffs: p5.nextBuffs,
    allies: p5.nextAllies,
    currentPlayerCausality,
    addLog,
  });

  // 컷인 큐 합치기: 적 ult 컷인들 → 아군 ult 컷인 1개 (순서 정책 유지).
  const cutInQueue = [...p2.cutInQueue];
  if (p5.allyCutIn) cutInQueue.push(p5.allyCutIn);

  return {
    nextAllies: p6.nextAllies,
    nextBuffs: p6.nextBuffs,
    nextEnemies: p5.nextEnemies,
    tickEvents: [...p4.addedTickEvents, ...p5.addedTickEvents],
    // [Step 5-2b-ii] 컷인 큐 (0~N개). useBattle이 큐 비어있을 때만 데미지 일괄 적용.
    cutInQueue,
    buffsChanged: p1.buffsChanged || p5.buffsChanged,
    // [Step 7-c2] 자동 발동 비용 (>0이면 useBattle이 setPlayerCausality로 차감).
    autoSkillCost: p6.autoSkillCost,
    autoSkillTriggered: p6.autoSkillTriggered,
    // [Step 7-d] 이번 틱에 ult를 실제 발동한 아군 id 목록 (useBattle이 pending 집합에서 제거).
    firedUltAllyIds: p5.firedUltAllyIds,
  };
}
