// --- 적군 효과 데이터베이스 (Enemy Effects) ---
// 보스/잡몹이 스킬 사용 시 부여하는 디버프(아군 대상) / 자버프(자기 진영 대상)의 단일 데이터 소스.
//
// 스킬 데이터(enemyData.js의 skills.*)는 `effect: '<effectId>'` 필드로 이 모듈의 효과를 참조하며,
// enemyActionManager가 스킬 데미지 적용 시점에 함께 effectsToApply에 실어 보내고,
// battleTick이 applyEnemyEffect로 대상의 statusEffects 슬롯을 갱신한다.
//
// 중첩 정책: 같은 effectId가 이미 있으면 timeLeft만 새 durationMs로 갱신 (refresh, no stack).
//
// 효과 스키마:
//   { id, name, kind:'buff'|'debuff', target:'allies'|'enemies', stat:'spd',
//     mult: 곱연산 보정치 (양수=증가, 음수=감소), durationMs, applyLog, expireLog }
//
// 현재는 stat:'spd'만 지원 (행동 속도). 추가 스탯이 필요해지면 actionManager/enemyActionManager의
// getStatusModifier 사용 지점에 분기를 추가.

import { TICK_RATE } from './gameData';

export const ENEMY_EFFECTS = {
  closure_denial: {
    id: 'closure_denial',
    name: '완결 거부',
    kind: 'debuff',
    target: 'allies',
    stat: 'spd',
    mult: -0.2,
    durationMs: 5000,
    applyLog: (sourceName) => `🕸️ ${sourceName}의 [완결 거부]! 아군의 행동 속도가 감소합니다.`,
    expireLog: (targetName) => `${targetName}의 [완결 거부]가 해제되었습니다.`,
  },
  ending_confirmed: {
    id: 'ending_confirmed',
    name: '결말 확인',
    kind: 'buff',
    target: 'enemies',
    stat: 'spd',
    mult: 0.2,
    durationMs: 5000,
    applyLog: (sourceName) => `📖 ${sourceName}의 [결말 확인]! 적 진영의 행동 속도가 증가합니다.`,
    expireLog: (targetName) => `${targetName}의 [결말 확인]이 해제되었습니다.`,
  },
};

// 효과 적용 — 대상 진영 각 엔티티의 statusEffects를 refresh.
// target='allies'면 allies 배열을, target='enemies'면 enemies 배열을 갱신해 반환.
// 죽은(hp<=0) 엔티티는 제외. 호출부는 반환된 새 배열로 갈아끼우면 됨.
export function applyEnemyEffect(effect, allies, enemies, sourceName, addLog) {
  if (!effect) return { allies, enemies };

  const refresh = (entity) => {
    if (!entity || entity.hp <= 0) return entity;
    const existing = entity.statusEffects || [];
    const others = existing.filter(e => e.effectId !== effect.id);
    return {
      ...entity,
      statusEffects: [
        ...others,
        { effectId: effect.id, timeLeft: effect.durationMs },
      ],
    };
  };

  let nextAllies = allies;
  let nextEnemies = enemies;
  if (effect.target === 'allies') {
    nextAllies = allies.map(refresh);
  } else if (effect.target === 'enemies') {
    nextEnemies = enemies.map(refresh);
  }

  if (addLog && effect.applyLog) {
    addLog(effect.applyLog(sourceName || '적'), 'skill');
  }
  return { allies: nextAllies, enemies: nextEnemies };
}

// 매 틱 호출. 엔티티 한 명의 statusEffects를 TICK_RATE만큼 감소시키고 만료 항목 제거.
// 만료 시 addLog로 알림. 반환: 갱신된 엔티티 (참조가 바뀌었을 수 있음).
export function tickStatusEffects(entity, addLog) {
  if (!entity || !entity.statusEffects || entity.statusEffects.length === 0) return entity;
  const next = [];
  let changed = false;
  for (const eff of entity.statusEffects) {
    const remaining = eff.timeLeft - TICK_RATE;
    if (remaining > 0) {
      if (remaining !== eff.timeLeft) changed = true;
      next.push({ ...eff, timeLeft: remaining });
    } else {
      changed = true;
      const meta = ENEMY_EFFECTS[eff.effectId];
      if (addLog && meta && meta.expireLog) {
        addLog(meta.expireLog(entity.name || '대상'), 'buff');
      }
    }
  }
  if (!changed) return entity;
  return { ...entity, statusEffects: next };
}

// 엔티티의 활성 효과로부터 특정 stat의 곱연산 보정치(최종 배수)를 계산.
// 예) spd에 -0.2와 +0.1이 동시에 걸려있으면 (1 + (-0.2) + 0.1) = 0.9
// 효과는 모두 합산 후 1에 더하는 방식 (가산 합산). 클램프 최소 0.1로 완전 정지 방지.
export function getStatusModifier(entity, stat) {
  if (!entity || !entity.statusEffects || entity.statusEffects.length === 0) return 1;
  let sum = 0;
  for (const eff of entity.statusEffects) {
    const meta = ENEMY_EFFECTS[eff.effectId];
    if (meta && meta.stat === stat) sum += meta.mult;
  }
  return Math.max(0.1, 1 + sum);
}
