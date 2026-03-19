/**
 * 캐릭터별 고유 스킬의 실제 효과를 처리하는 함수들을 모아놓은 파일입니다.
 * useBattle.js의 복잡도를 낮추는 것이 주 목적입니다.
 */

// --- 필살기 실행기 ---
export function executeUltimateSkill(ally, skill, { finalAtk, finalCritMultiplier, isCrit, setBuffs, addLog, currentAllies, hasHealUp }) {
  let damageDealt = 0;
  let newSelfBuffs = { ...ally.selfBuffs };
  let alliesToHeal = []; 
  let logSuffix = isCrit ? ' (CRIT!)' : '';

  const healMultiplier = hasHealUp ? 1.1 : 1.0;

  // [서주목]
  if (ally.id === 1) {
    damageDealt = Math.floor(ally.def * skill.mult * finalCritMultiplier);
    setBuffs(b => ({ ...b, damageReduction: { active: true, val: skill.buffVal || 0.2, timeLeft: 10000 } }));
    addLog(`✨ [${ally.name}] ${skill.name}!${logSuffix} (DMG: ${damageDealt})`, 'ally_ult');
  }
  // [시에]
  else if (ally.id === 2) {
    newSelfBuffs = { ...ally.selfBuffs, critDmgUp: skill.buffVal || 0.4, buffTime: 10000 };
    const boostedCritMult = 1 + (skill.buffVal || 0.4);
    const currentCritMultiplier = isCrit ? (1.5 * boostedCritMult) : 1.0;
    
    damageDealt = Math.floor(finalAtk * skill.mult * currentCritMultiplier);
    addLog(`✨ [${ally.name}] ${skill.name}! (치명피해 증가) (DMG: ${damageDealt})`, 'ally_ult');
  }
  // [아다드] 전체 회복 + 개인 턴 기반 도트힐
  else if (ally.id === 4) {
    const healAmount = Math.floor(finalAtk * skill.mult * finalCritMultiplier * healMultiplier);
    
    // [Fix] 0.5라는 수치가 아니라, 아다드의 공격력 기반으로 실제 도트힐 량을 계산합니다!
    const dotAmount = Math.floor(finalAtk * (skill.dotMult || 0.5) * healMultiplier);

    // [Fix] 전역 버프 대신, 각 아군의 개인 버프(selfBuffs)에 2턴짜리 'hot(지속회복)'를 심어줍니다.
    alliesToHeal = (list) => list.map(a => ({ 
        ...a, 
        hp: Math.min(a.maxHp, a.hp + healAmount),
        selfBuffs: {
            ...(a.selfBuffs || {}),
            hot: { amount: dotAmount, turns: 2 } // 2턴 동안 유지
        }
    }));
    
    addLog(`✨ [${ally.name}] ${skill.name}! (전체 치유: ${healAmount}, 지속 치유: 매턴 ${dotAmount})`, 'ally_ult');
  }
  // [람만]
  else if (ally.id === 5) {
    damageDealt = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
    const healAmount = Math.floor(finalAtk * (skill.healMult || 2.0) * healMultiplier);
    alliesToHeal = (list) => list.map(a => ({ ...a, hp: Math.min(a.maxHp, a.hp + healAmount) }));
    addLog(`✨ [${ally.name}] ${skill.name}! (공격 ${damageDealt} + 치유 ${healAmount})`, 'ally_ult');
  }
  // [천백]
  else if (ally.id === 6) {
    const buffVal = skill.buffVal || 0.2;
    newSelfBuffs = { ...ally.selfBuffs, atkUp: buffVal, buffTime: 10000 }; 
    const enhancedAtk = finalAtk * (1 + buffVal);
    damageDealt = Math.floor(enhancedAtk * skill.mult * finalCritMultiplier);
    addLog(`✨ [${ally.name}] ${skill.name}! (공격력 증가) (DMG: ${damageDealt})`, 'ally_ult');
  }
  // [기본 로직]
  else {
    damageDealt = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
    addLog(`✨ [${ally.name}] ${skill.name}!${logSuffix} (DMG: ${damageDealt})`, 'ally_ult');
  }

  return { damageDealt, alliesToHeal, newSelfBuffs };
}

// --- 일반 스킬 실행기 ---
export function executeNormalSkill(ally, skill, { finalAtk, finalCritMultiplier, isCrit, addLog, currentAllies, hasHealUp }) {
  let damageDealt = 0;
  let alliesToModify = null; 
  let logSuffix = isCrit ? ' (CRIT!)' : '';

  const healMultiplier = hasHealUp ? 1.1 : 1.0;

  // [아다드]
  if (ally.id === 4) {
    let targetIdx = -1;
    let minRatio = 1.01;

    currentAllies.forEach((a, idx) => {
      if (a.hp > 0 && (a.hp / a.maxHp) < minRatio) {
        minRatio = a.hp / a.maxHp;
        targetIdx = idx;
      }
    });
    if (targetIdx === -1) targetIdx = currentAllies.findIndex(a => a.id === ally.id); 

    const healAmount = Math.floor(finalAtk * skill.mult * (isCrit ? 1.5 : 1.0) * healMultiplier);
    
    alliesToModify = (allies) => allies.map((a, idx) => {
        if(idx === targetIdx) {
            return { ...a, hp: Math.min(a.maxHp, a.hp + healAmount) };
        }
        return a;
    });
    addLog(`${ally.name}의 ${skill.name} -> ${currentAllies[targetIdx].name} 치유 (${healAmount})`, 'ally_atk');
  }
  // [서주목]
  else if (ally.id === 1) {
    damageDealt = Math.floor(ally.def * skill.mult * finalCritMultiplier);
    addLog(`${ally.name}의 ${skill.name}! (방어비례) (DMG: ${damageDealt})${logSuffix}`, 'ally_atk');
  }
  // [기본 로직]
  else {
    damageDealt = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
    addLog(`${ally.name}의 ${skill.name}. (DMG: ${damageDealt})${logSuffix}`, 'ally_atk');
  }

  return { damageDealt, alliesToModify };
}