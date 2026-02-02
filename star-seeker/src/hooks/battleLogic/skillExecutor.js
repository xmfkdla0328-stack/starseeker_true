/**
 * 캐릭터별 고유 스킬의 실제 효과를 처리하는 함수들을 모아놓은 파일입니다.
 * useBattle.js의 복잡도를 낮추는 것이 주 목적입니다.
 */

// --- 필살기 실행기 ---
function executeUltimateSkill(ally, skill, { finalAtk, finalCritMultiplier, isCrit, setBuffs, addLog }) {
  let damageDealt = 0;
  let newSelfBuffs = ally.selfBuffs;
  let alliesToHeal = []; // 전체 힐링이 필요한 경우 사용
  let logSuffix = isCrit ? ' (CRIT!)' : '';

  // [서주목] 방어력 계수 + 받피감(20%)
  if (ally.id === 1) {
    damageDealt = Math.floor(ally.def * skill.mult * finalCritMultiplier);
    setBuffs(b => ({ ...b, damageReduction: { active: true, val: skill.buffVal || 0.2, timeLeft: 10000 } }));
    addLog(`✨ [${ally.name}] ${skill.name}!${logSuffix}`, 'ally_ult');
  }
  // [시에] 치명타 피해 증가 버프 후 공격
  else if (ally.id === 2) {
    newSelfBuffs = { ...ally.selfBuffs, critDmgUp: skill.buffVal || 0.4, buffTime: 10000 };
    const boostedCritMult = 1 + (skill.buffVal || 0.4);
    const currentCritMultiplier = isCrit ? (1.5 * boostedCritMult) : 1.0;
    damageDealt = Math.floor(finalAtk * skill.mult * currentCritMultiplier);
    addLog(`✨ [${ally.name}] ${skill.name}! (치명피해 증가)`, 'ally_ult');
  }
  // [천백] 공격력 증가 버프 후 공격
  else if (ally.id === 6) {
    newSelfBuffs = { ...ally.selfBuffs, atkUp: skill.buffVal || 0.2, buffTime: 10000 };
    const boostedAtk = finalAtk * (1 + (skill.buffVal || 0.2));
    damageDealt = Math.floor(boostedAtk * skill.mult * finalCritMultiplier);
    addLog(`✨ [${ally.name}] ${skill.name}! (공격력 증가)`, 'ally_ult');
  }
  // [아다드] 전체 회복 + 도트 힐
  else if (ally.id === 4) {
    const healAmount = Math.floor(finalAtk * skill.mult);
    alliesToHeal = (allies) => allies.map(a => a.hp > 0 ? { ...a, hp: Math.min(a.maxHp, a.hp + healAmount) } : a);
    const regenVal = Math.floor(finalAtk * (skill.dotMult || 0.3));
    setBuffs(b => ({ ...b, regen: { active: true, val: regenVal, timeLeft: 10000 } }));
    addLog(`✨ [${ally.name}] ${skill.name}! (전체 회복)`, 'ally_ult');
  }
  // [람만] 공격 + 전체 회복
  else if (ally.id === 5) {
    damageDealt = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
    const healAmount = Math.floor(finalAtk * (skill.healMult || 2.0));
    alliesToHeal = (allies) => allies.map(a => a.hp > 0 ? { ...a, hp: Math.min(a.maxHp, a.hp + healAmount) } : a);
    addLog(`✨ [${ally.name}] ${skill.name}! (공격+회복)`, 'ally_ult');
  }
  // [그 외 일반 딜러]
  else {
    damageDealt = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
    addLog(`✨ [${ally.name}] ${skill.name}!${logSuffix}`, 'ally_ult');
  }
  
  return { damageDealt, alliesToHeal, newSelfBuffs };
}

// --- 일반 공격 실행기 ---
function executeNormalSkill(ally, skill, { finalAtk, finalCritMultiplier, isCrit, addLog, currentAllies }) {
  let damageDealt = 0;
  let alliesToModify = null; // 힐링 등으로 타 아군을 수정해야 할 경우 사용
  let logSuffix = isCrit ? ' (CRIT!)' : '';

  // [아다드] 평타: 생명력이 제일 낮은 아군 회복
  if (ally.id === 4) {
    let targetIdx = -1;
    let minRatio = 1.01;

    currentAllies.forEach((a, idx) => {
      if (a.hp > 0 && (a.hp / a.maxHp) < minRatio) {
        minRatio = a.hp / a.maxHp;
        targetIdx = idx;
      }
    });
    if (targetIdx === -1) targetIdx = currentAllies.findIndex(a => a.id === ally.id); // 다 죽었으면 자신

    const healAmount = Math.floor(finalAtk * skill.mult);
    
    alliesToModify = (allies) => allies.map((a, idx) => {
        if(idx === targetIdx) {
            return { ...a, hp: Math.min(a.maxHp, a.hp + healAmount) };
        }
        return a;
    });
    addLog(`${ally.name}의 ${skill.name} -> ${currentAllies[targetIdx].name} 치유 (${healAmount})`, 'ally_atk');
  }
  // [서주목] 평타: 방어력 계수
  else if (ally.id === 1) {
    damageDealt = Math.floor(ally.def * skill.mult * finalCritMultiplier);
    addLog(`${ally.name}의 ${skill.name}.${logSuffix} (DMG: ${damageDealt})`, 'ally_atk');
  }
  // [그 외] 공격력 계수
  else {
    damageDealt = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
    addLog(`${ally.name}의 ${skill.name}.${logSuffix} (DMG: ${damageDealt})`, 'ally_atk');
  }

  return { damageDealt, alliesToModify };
}

export { executeUltimateSkill, executeNormalSkill };
