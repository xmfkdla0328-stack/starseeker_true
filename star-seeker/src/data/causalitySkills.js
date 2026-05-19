/**
 * 인과력 스킬 (Causality Skills) 단일 데이터 소스.
 *
 * 이전엔 useBattle.useSkill, battleTick.processBattleTick, BattleControlZone, useBattleState
 * 네 곳에 각각 비용/지속시간/라벨/SHIELD 보호막 비율(0.3) 등이 하드코딩되어 있어
 * 밸런싱 시 동기화 누락 위험이 있었음. 이 모듈이 유일한 진실 원천(SSOT).
 *
 * 스키마:
 *   id            : 'atk' | 'shield' | 'speed'         (buffs[id] 키와 동일)
 *   name          : 사용자 노출명 ('무력 강화' 등)
 *   cost          : CP 비용
 *   durationMs    : 활성 지속 시간 (ms)
 *   buffInitialVal: useBattleState 초기 buffs[id].val
 *                   - atk=0.2 → 활성 시 전 파티원 ATK +20% (actionManager의 1+buffs.atk.val)
 *                   - speed=1.2 → 활성 시 행동 속도 1.2배 (actionManager의 buffs.speed.val)
 *                   - shield=0 → val은 미사용 (효과는 sideEffects의 grantShield)
 *   sideEffects   : 활성화 시 buff active 외에 즉시 발생하는 효과.
 *                   현재는 'grantShield' 한 종류:
 *                     { kind: 'grantShield', portionOfMaxHp: 0.3 }
 *                     → 살아있는 아군 전원에 maxHp * portionOfMaxHp 보호막 부여
 *   activateLog   : 수동 발동 시 로그 문구
 */
export const CAUSALITY_SKILLS = {
  atk: {
    id: 'atk',
    name: '무력 강화',
    cost: 10,
    durationMs: 10000,
    buffInitialVal: 0.2,
    sideEffects: [],
    activateLog: '>>> [인과율 개입] 무력 강화 활성화',
  },
  shield: {
    id: 'shield',
    name: '절대 방어',
    cost: 20,
    durationMs: 5000,
    buffInitialVal: 0,
    sideEffects: [{ kind: 'grantShield', portionOfMaxHp: 0.3 }],
    activateLog: '>>> [인과율 개입] 절대 방어 활성화',
  },
  speed: {
    id: 'speed',
    name: '시간 가속',
    cost: 30,
    durationMs: 10000,
    buffInitialVal: 1.2,
    sideEffects: [],
    activateLog: '>>> [인과율 개입] 시간 가속 활성화',
  },
};

// 자동 인과력 스킬 발동 평가 순서: 비용 오름차순(싼 것부터 평가, 활성 중이면 건너뜀).
// battleTick의 자동 발동 휴리스틱이 이 순서를 그대로 사용.
export const CAUSALITY_SKILL_ORDER = ['atk', 'shield', 'speed'];

/**
 * 스킬 활성화 시 사이드이펙트(보호막 부여 등)를 적용한 새 allies 배열 반환.
 * 수동 발동(useBattle.useSkill)과 자동 발동(battleTick)에서 모두 사용 → 메커닉 일치 보장.
 * 죽은 아군(hp<=0)에는 적용하지 않음.
 */
export function applySkillSideEffects(skill, allies) {
  let result = allies;
  for (const effect of skill.sideEffects) {
    if (effect.kind === 'grantShield') {
      result = result.map(a =>
        a.hp > 0 ? { ...a, shield: Math.floor(a.maxHp * effect.portionOfMaxHp) } : a
      );
    }
  }
  return result;
}

// 자동 발동 시 로그 문구(수동과 prefix가 달라 구분 가능).
export function autoActivateLog(skillId) {
  return `>>> [자동 인과율 개입] ${CAUSALITY_SKILLS[skillId].name} 활성화`;
}
