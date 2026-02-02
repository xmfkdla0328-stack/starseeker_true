import { ACTION_THRESHOLD, TICK_RATE } from '../../data/gameData';
import { executeUltimateSkill, executeNormalSkill } from './skillExecutor';

/**
 * 모든 아군의 행동을 처리하고, 그 결과를 반환합니다.
 * @param {object} props - 필요한 상태와 함수들을 담은 객체
 * @returns {{updatedAllies: Array, damageToEnemy: number}} - 변경된 아군 배열과 적에게 가한 총 데미지
 */
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

  for (let i = 0; i < nextAllies.length; i++) {
    let ally = { ...nextAllies[i] };

    // 1. 개별 버프 시간 관리
    if (!ally.selfBuffs) ally.selfBuffs = { atkUp: 0, critDmgUp: 0, buffTime: 0 };
    if (ally.selfBuffs.buffTime > 0) {
      ally.selfBuffs.buffTime -= TICK_RATE;
      if (ally.selfBuffs.buffTime <= 0) {
        ally.selfBuffs = { atkUp: 0, critDmgUp: 0, buffTime: 0 };
        addLog(`${ally.name}의 강화 효과가 종료되었습니다.`, 'system');
      }
    }

    // 2. 전역 버프/디버프 효과 적용
    if (shieldJustExpired) ally.shield = 0;
    if (buffs.regen.active && buffs.regen.timeLeft % 1000 < TICK_RATE && ally.hp > 0) {
      ally.hp = Math.min(ally.maxHp, ally.hp + buffs.regen.val);
    }

    // 3. 행동 불능 상태 체크
    if (ally.hp <= 0) {
      nextAllies[i] = ally;
      continue;
    }

    // 4. 행동 게이지 계산
    const speedMultiplier = buffs.speed.active ? buffs.speed.val : 1;
    ally.actionGauge += (ally.spd * speedMultiplier * (1 + Math.random() * 0.1));

    // 5. 행동 실행 (게이지 100% 도달 시)
    if (ally.actionGauge >= ACTION_THRESHOLD) {
      ally.actionGauge = 0;

      // 스탯 최종 계산
      const globalAtkMult = buffs.atk.active ? (1 + buffs.atk.val) : 1;
      const selfAtkMult = 1 + ally.selfBuffs.atkUp;
      const finalAtk = ally.atk * globalAtkMult * selfAtkMult;
      const eff = ally.efficiency || 1.0;
      const isCrit = Math.random() < 0.1;
      const finalCritMultiplier = isCrit ? (1.5 * (1 + ally.selfBuffs.critDmgUp)) : 1.0;
      const executorProps = { finalAtk, finalCritMultiplier, isCrit, setBuffs, addLog, currentAllies: nextAllies };

      // 필살기 or 일반공격 결정 및 실행
      if (ally.ultGauge >= ally.maxUltGauge) {
        ally.ultGauge = 0;
        const { damageDealt, alliesToHeal, newSelfBuffs } = executeUltimateSkill(ally, ally.combatSkills.ultimate, executorProps);
        totalEnemyDamage += damageDealt;
        if (alliesToHeal.length > 0) nextAllies = alliesToHeal(nextAllies);
        ally.selfBuffs = newSelfBuffs;
        gainCausality(3 * eff);
      } else {
        const { damageDealt, alliesToModify } = executeNormalSkill(ally, ally.combatSkills.normal, executorProps);
        totalEnemyDamage += damageDealt;
        if (alliesToModify) nextAllies = alliesToModify(nextAllies);
        ally.ultGauge = Math.min(ally.maxUltGauge, ally.ultGauge + 20);
        gainCausality(1 * eff);
      }
    }
    nextAllies[i] = ally;
  }

  return { updatedAllies: nextAllies, damageToEnemy: totalEnemyDamage };
}
