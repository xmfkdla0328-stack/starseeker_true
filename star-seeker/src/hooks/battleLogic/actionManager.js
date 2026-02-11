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
  
  // [New] 컷신 발동 정보를 담을 변수 (이번 턴에 필살기 쓴 사람이 있으면 여기에 저장)
  let triggeredSkillInfo = null;

  for (let i = 0; i < nextAllies.length; i++) {
    let ally = { ...nextAllies[i] };

    // 1. 개별 버프 시간 관리
    if (!ally.selfBuffs) ally.selfBuffs = { atkUp: 0, critDmgUp: 0, buffTime: 0 };
    if (ally.selfBuffs.buffTime > 0) {
      ally.selfBuffs.buffTime -= TICK_RATE;
      if (ally.selfBuffs.buffTime <= 0) {
        ally.selfBuffs = { atkUp: 0, critDmgUp: 0, buffTime: 0 };
        addLog(`${ally.name}의 강화 효과가 종료되었습니다.`, 'buff');
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

      // [필살기 사용 시점]
      if (ally.ultGauge >= ally.maxUltGauge) {
        ally.ultGauge = 0;
        
        // [New] 컷신 트리거 정보 생성!
        triggeredSkillInfo = {
            name: ally.name,
            image: ally.image, // 캐릭터 일러스트 (없으면 BattleAllyZone의 fallback 사용됨)
            skillName: ally.combatSkills.ultimate.name,
            quote: ally.combatSkills.ultimate.quote || `${ally.name}의 진정한 힘을 보여주마!`
        };

        const { damageDealt, alliesToHeal, newSelfBuffs } = executeUltimateSkill(ally, ally.combatSkills.ultimate, executorProps);
        
        addLog(`${ally.name}: [${ally.combatSkills.ultimate.name}]! (💥 ${damageDealt})`, 'skill');

        totalEnemyDamage += damageDealt;
        if (alliesToHeal.length > 0) {
            if (typeof alliesToHeal === 'function') nextAllies = alliesToHeal(nextAllies);
        }
        ally.selfBuffs = newSelfBuffs;
        gainCausality(3 * eff);
      } 
      // [일반 공격]
      else {
        const skillName = ally.combatSkills?.normal?.name || "기본 공격";
        const { damageDealt, alliesToModify } = executeNormalSkill(ally, ally.combatSkills.normal, executorProps);
        
        addLog(`${ally.name}의 [${skillName}]! (💥 ${damageDealt})`, 'damage');

        totalEnemyDamage += damageDealt;
        if (alliesToModify) {
             if (typeof alliesToModify === 'function') nextAllies = alliesToModify(nextAllies);
        }
        ally.ultGauge = Math.min(ally.maxUltGauge, ally.ultGauge + 20);
        gainCausality(1 * eff);
      }
    }
    nextAllies[i] = ally;
  }

  // [New] triggeredSkillInfo도 함께 반환
  return { updatedAllies: nextAllies, damageToEnemy: totalEnemyDamage, triggeredSkillInfo };
}