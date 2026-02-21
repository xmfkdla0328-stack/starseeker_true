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

      const globalAtkMult = buffs.atk.active ? (1 + buffs.atk.val) : 1;
      const selfAtkMult = 1 + ally.selfBuffs.atkUp;
      const finalAtk = ally.atk * globalAtkMult * selfAtkMult;
      const eff = ally.efficiency || 1.0;
      const isCrit = Math.random() < 0.1;
      const finalCritMultiplier = isCrit ? (1.5 * (1 + ally.selfBuffs.critDmgUp)) : 1.0;
      
      // [NEW] 기억 세공 효과 체크
      const hasDmgUp = ally.memoryEffects && ally.memoryEffects.some(e => e.id === 'DMG_UP');
      const hasHealUp = ally.memoryEffects && ally.memoryEffects.some(e => e.id === 'HEAL_UP');

      // [NEW] executorProps에 hasHealUp 정보 추가 전달 (skillExecutor에서 읽어서 힐량 증폭에 사용)
      const executorProps = { 
          finalAtk, finalCritMultiplier, isCrit, setBuffs, addLog, currentAllies: nextAllies,
          hasHealUp 
      };

      // [필살기 사용 시점]
      if (ally.ultGauge >= ally.maxUltGauge) {
        ally.ultGauge = 0;
        
        triggeredSkillInfo = {
            name: ally.name,
            image: ally.image, 
            skillName: ally.combatSkills.ultimate.name,
            quote: ally.combatSkills.ultimate.quote || `${ally.name}의 진정한 힘을 보여주마!`
        };

        let { damageDealt, alliesToHeal, newSelfBuffs } = executeUltimateSkill(ally, ally.combatSkills.ultimate, executorProps);
        
        // [NEW] 기억 세공 효과: 공격 출력 증폭 (가하는 대미지 10% 증가)
        if (hasDmgUp && damageDealt > 0) {
            damageDealt = Math.floor(damageDealt * 1.1);
        }

        addLog(`${ally.name}: [${ally.combatSkills.ultimate.name}]! (💥 ${damageDealt})`, 'skill');

        totalEnemyDamage += damageDealt;
        
        // 힐 적용 후, 현재 ally 변수에도 최신 HP 반영
        if (alliesToHeal && typeof alliesToHeal === 'function') {
            nextAllies = alliesToHeal(nextAllies);
            if (nextAllies[i]) {
                ally.hp = nextAllies[i].hp;
            }
        }
        
        ally.selfBuffs = newSelfBuffs;
        gainCausality(3 * eff);
      } 
      // [일반 공격]
      else {
        const skillName = ally.combatSkills?.normal?.name || "기본 공격";
        let { damageDealt, alliesToModify } = executeNormalSkill(ally, ally.combatSkills.normal, executorProps);
        
        // [NEW] 기억 세공 효과: 공격 출력 증폭 (가하는 대미지 10% 증가)
        if (hasDmgUp && damageDealt > 0) {
            damageDealt = Math.floor(damageDealt * 1.1);
        }

        addLog(`${ally.name}의 [${skillName}]! (💥 ${damageDealt})`, 'damage');

        totalEnemyDamage += damageDealt;
        
        // 상태 변경(힐 등) 후, 현재 ally 변수에도 최신 HP 반영
        if (alliesToModify && typeof alliesToModify === 'function') {
             nextAllies = alliesToModify(nextAllies);
             if (nextAllies[i]) {
                 ally.hp = nextAllies[i].hp;
             }
        }
        
        ally.ultGauge = Math.min(ally.maxUltGauge, ally.ultGauge + 20);
        gainCausality(1 * eff);
      }
    }
    
    // 최종적으로 현재 ally 상태를 배열에 다시 넣음
    nextAllies[i] = ally;
  }

  return { updatedAllies: nextAllies, damageToEnemy: totalEnemyDamage, triggeredSkillInfo };
}