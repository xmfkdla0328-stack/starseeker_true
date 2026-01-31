import { useEffect } from 'react';
import { TICK_RATE, ACTION_THRESHOLD, ENEMY_CAUSALITY_TRIGGER, WARNING_DURATION_MS } from '../data/gameData';
import useBattleState from './useBattleState';

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd) {
  const {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  } = useBattleState(initialParty, userStats, hpMultiplier);

  // --- 메인 게임 루프 ---
  useEffect(() => {
    if (!enemy || allies.length === 0) return;

    const interval = setInterval(() => {
      let shieldJustExpired = false;
      const nextBuffs = { ...buffs };
      let buffChanged = false;

      // 1. 전역 버프(Global Buffs) 관리
      ['atk', 'shield', 'speed', 'damageReduction', 'regen'].forEach(key => {
        if (nextBuffs[key].active) {
          nextBuffs[key].timeLeft -= TICK_RATE;
          if (nextBuffs[key].timeLeft <= 0) {
            nextBuffs[key].active = false;
            buffChanged = true;
            if (key === 'shield') { shieldJustExpired = true; addLog(`[알림] 방어막이 소멸합니다.`, 'system'); }
            else if (key === 'damageReduction') addLog(`[알림] 피해 감소 효과 종료.`, 'system');
          }
        }
      });
      if (buffChanged) setBuffs(nextBuffs);

      // 2. 적(Enemy) 행동
      setEnemy(prevEnemy => {
        if (prevEnemy.hp <= 0) return prevEnemy;
        let newEnemy = { ...prevEnemy };

        // (1) 특수 패턴 충전
        if (newEnemy.isCharging) {
          newEnemy.chargeTimer -= TICK_RATE;
          if (newEnemy.chargeTimer <= 0) {
            setEnemyWarning(false);
            newEnemy.isCharging = false;
            newEnemy.causality = 0;
            
            const damage = Math.floor(newEnemy.baseAtk * 1.8);
            addLog(`☄️ ${newEnemy.name}의 [파멸의 일격]!`, 'enemy_ult');
            
            setAllies(curr => curr.map(a => {
               if (a.hp <= 0) return a;
               let finalDmg = Math.max(0, damage - a.def);

               if (nextBuffs.damageReduction.active) {
                 finalDmg = Math.floor(finalDmg * (1 - nextBuffs.damageReduction.val));
               }

               let remainingShield = shieldJustExpired ? 0 : a.shield;
               if (remainingShield >= finalDmg) { remainingShield -= finalDmg; finalDmg = 0; }
               else { finalDmg -= remainingShield; remainingShield = 0; }
               
               gainCausality(1 * a.efficiency);
               return { ...a, hp: Math.max(0, a.hp - finalDmg), shield: remainingShield };
            }));
          }
          return newEnemy;
        }

        // (2) 일반 행동
        newEnemy.actionGauge += (newEnemy.baseSpd * (1 + Math.random() * 0.1));
        if (newEnemy.actionGauge >= ACTION_THRESHOLD) {
          newEnemy.actionGauge = 0;
          if (newEnemy.causality >= ENEMY_CAUSALITY_TRIGGER) {
            newEnemy.isCharging = true;
            newEnemy.chargeTimer = WARNING_DURATION_MS;
            setEnemyWarning(true);
            addLog(`[경고] 인과율 급증 감지! (${newEnemy.name})`, 'warning');
          } else {
            // 일반 공격
            const liveAllies = allies.filter(a => a.hp > 0);
            if (liveAllies.length > 0) {
              const target = liveAllies[Math.floor(Math.random() * liveAllies.length)];
              const damage = Math.max(0, newEnemy.baseAtk - target.def);
              
              let finalDmg = damage;
              if (nextBuffs.damageReduction.active) {
                 finalDmg = Math.floor(damage * (1 - nextBuffs.damageReduction.val));
              }

              addLog(`⚔️ 적의 공격 -> ${target.name} (DMG: ${finalDmg})`, 'enemy_atk');
              
              setAllies(curr => curr.map(a => {
                if (a.id === target.id) {
                   let shieldCalc = shieldJustExpired ? 0 : a.shield;
                   let dmgToApply = finalDmg;
                   
                   if (shieldCalc >= dmgToApply) { shieldCalc -= dmgToApply; dmgToApply = 0; }
                   else { dmgToApply -= shieldCalc; shieldCalc = 0; }
                   
                   gainCausality(1 * a.efficiency);
                   return { ...a, hp: Math.max(0, a.hp - dmgToApply), shield: shieldCalc };
                }
                if (shieldJustExpired) return { ...a, shield: 0 };
                return a;
              }));
              newEnemy.causality += 2;
            }
          }
        }
        return newEnemy;
      });

      // 3. 아군(Allies) 행동
      setAllies(prevAllies => {
        let nextAllies = [...prevAllies];
        let enemyDamageTaken = 0;

        for (let i = 0; i < nextAllies.length; i++) {
          let ally = { ...nextAllies[i] };
          
          // 개별 버프 초기화 (처음 실행 시)
          if (!ally.selfBuffs) ally.selfBuffs = { atkUp: 0, critDmgUp: 0, buffTime: 0 };

          // 개별 버프 시간 차감
          if (ally.selfBuffs.buffTime > 0) {
            ally.selfBuffs.buffTime -= TICK_RATE;
            if (ally.selfBuffs.buffTime <= 0) {
                ally.selfBuffs = { atkUp: 0, critDmgUp: 0, buffTime: 0 }; // 초기화
                addLog(`${ally.name}의 강화 효과가 종료되었습니다.`, 'system');
            }
          }

          if (shieldJustExpired) ally.shield = 0;

          // 도트 힐 (아다드) - 1초(1000ms)마다 발동
          if (nextBuffs.regen.active && nextBuffs.regen.timeLeft % 1000 < TICK_RATE && ally.hp > 0) {
             const healAmount = nextBuffs.regen.val;
             ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
          }

          if (ally.hp <= 0) {
            nextAllies[i] = ally;
            continue;
          }

          const speedMultiplier = nextBuffs.speed.active ? nextBuffs.speed.val : 1;
          ally.actionGauge += (ally.spd * speedMultiplier * (1 + Math.random() * 0.1));

          if (ally.actionGauge >= ACTION_THRESHOLD) {
            ally.actionGauge = 0;
            
            // 공격력 계산 (기본 * 전역버프 * 자가버프)
            const globalAtkMult = nextBuffs.atk.active ? (1 + nextBuffs.atk.val) : 1;
            const selfAtkMult = 1 + ally.selfBuffs.atkUp;
            const finalAtk = ally.atk * globalAtkMult * selfAtkMult;
            
            const eff = ally.efficiency || 1.0;

            // [치명타 계산]
            const baseCritRate = 0.1; // 기본 10%
            const baseCritDmg = 1.5;  // 기본 150%
            const selfCritDmgMult = 1 + ally.selfBuffs.critDmgUp; // 시에 버프
            
            const isCrit = Math.random() < baseCritRate;
            const finalCritMultiplier = isCrit ? (baseCritDmg * selfCritDmgMult) : 1.0;

            // --- 필살기 ---
            if (ally.ultGauge >= ally.maxUltGauge) {
              ally.ultGauge = 0;
              const skill = ally.combatSkills.ultimate;
              
              // [서주목] 방어력 계수 + 받피감(20%)
              if (ally.id === 1) { 
                  let dmg = Math.floor(ally.def * skill.mult * finalCritMultiplier);
                  enemyDamageTaken += dmg;
                  setBuffs(b => ({ ...b, damageReduction: { active: true, val: skill.buffVal || 0.2, timeLeft: 10000 } }));
                  addLog(`✨ [${ally.name}] ${skill.name}! ${isCrit ? '(CRIT!)' : ''}`, 'ally_ult');
              } 
              // [시에] 치명타 피해 증가 버프 후 공격
              else if (ally.id === 2) {
                  // 버프 적용 (40%)
                  ally.selfBuffs = { ...ally.selfBuffs, critDmgUp: skill.buffVal || 0.4, buffTime: 10000 };
                  // 버프가 적용된 상태로 데미지 계산을 위해 크리 배율 재계산
                  const boostedCritMult = 1 + (skill.buffVal || 0.4);
                  const currentCritMultiplier = isCrit ? (baseCritDmg * boostedCritMult) : 1.0;
                  
                  let dmg = Math.floor(finalAtk * skill.mult * currentCritMultiplier);
                  enemyDamageTaken += dmg;
                  addLog(`✨ [${ally.name}] ${skill.name}! (치명피해 증가)`, 'ally_ult');
              }
              // [천백] 공격력 증가 버프 후 공격
              else if (ally.id === 6) {
                  // 버프 적용 (20%)
                  ally.selfBuffs = { ...ally.selfBuffs, atkUp: skill.buffVal || 0.2, buffTime: 10000 };
                  // 버프가 적용된 상태로 데미지 계산
                  const boostedAtk = finalAtk * (1 + (skill.buffVal || 0.2)); 
                  let dmg = Math.floor(boostedAtk * skill.mult * finalCritMultiplier);
                  enemyDamageTaken += dmg;
                  addLog(`✨ [${ally.name}] ${skill.name}! (공격력 증가)`, 'ally_ult');
              }
              // [아다드] 전체 회복 + 도트 힐
              else if (ally.id === 4) { 
                  const healAmount = Math.floor(finalAtk * skill.mult); 
                  nextAllies = nextAllies.map(a => a.hp > 0 ? { ...a, hp: Math.min(a.maxHp, a.hp + healAmount) } : a);
                  
                  const regenVal = Math.floor(finalAtk * (skill.dotMult || 0.3));
                  setBuffs(b => ({ ...b, regen: { active: true, val: regenVal, timeLeft: 10000 } }));
                  addLog(`✨ [${ally.name}] ${skill.name}! (전체 회복)`, 'ally_ult');
              }
              // [람만] 공격 + 전체 회복
              else if (ally.id === 5) { 
                  const dmg = Math.floor(finalAtk * skill.mult * finalCritMultiplier); 
                  const healAmount = Math.floor(finalAtk * (skill.healMult || 2.0));
                  enemyDamageTaken += dmg;
                  nextAllies = nextAllies.map(a => a.hp > 0 ? { ...a, hp: Math.min(a.maxHp, a.hp + healAmount) } : a);
                  addLog(`✨ [${ally.name}] ${skill.name}! (공격+회복)`, 'ally_ult');
              }
              // [그 외 일반 딜러]
              else { 
                  let dmg = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
                  enemyDamageTaken += dmg;
                  addLog(`✨ [${ally.name}] ${skill.name}! ${isCrit ? '(CRIT!)' : ''}`, 'ally_ult');
              }
              gainCausality(3 * eff);
            } 
            
            // --- 평타 ---
            else {
              const skill = ally.combatSkills.normal;
              
              // [아다드] 평타: 생명력이 제일 낮은 아군 회복
              if (ally.id === 4) { 
                  let targetIdx = -1;
                  let minRatio = 1.01;
                  
                  // 현재 시점의 아군들 중에서 가장 위급한 대상 찾기
                  nextAllies.forEach((a, idx) => {
                      if (a.hp > 0 && (a.hp / a.maxHp) < minRatio) {
                          minRatio = a.hp / a.maxHp;
                          targetIdx = idx;
                      }
                  });
                  if (targetIdx === -1) targetIdx = i; // 다 죽었으면 자신

                  const healAmount = Math.floor(finalAtk * skill.mult);
                  
                  if (targetIdx === i) {
                     ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
                  } else {
                     nextAllies[targetIdx] = { 
                         ...nextAllies[targetIdx], 
                         hp: Math.min(nextAllies[targetIdx].maxHp, nextAllies[targetIdx].hp + healAmount) 
                     };
                  }
                  addLog(`${ally.name}의 ${skill.name} -> ${nextAllies[targetIdx].name} 치유 (${healAmount})`, 'ally_atk');
              }
              // [서주목] 평타: 방어력 계수
              else if (ally.id === 1) { 
                  let dmg = Math.floor(ally.def * skill.mult * finalCritMultiplier);
                  enemyDamageTaken += dmg;
                  addLog(`${ally.name}의 ${skill.name}. ${isCrit ? '(Crit!)' : ''} (DMG: ${dmg})`, 'ally_atk');
              }
              // [그 외] 공격력 계수
              else {
                  let dmg = Math.floor(finalAtk * skill.mult * finalCritMultiplier);
                  enemyDamageTaken += dmg;
                  addLog(`${ally.name}의 ${skill.name}. ${isCrit ? '(Crit!)' : ''} (DMG: ${dmg})`, 'ally_atk');
              }

              ally.ultGauge = Math.min(ally.maxUltGauge, ally.ultGauge + 20);
              gainCausality(1 * eff);
            }
          }
          nextAllies[i] = ally; // 변경된 본인 상태 저장
        }

        // 적 데미지 처리
        if (enemyDamageTaken > 0) {
            setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - enemyDamageTaken) }));
        }

        return nextAllies;
      });

      if (enemy && enemy.hp <= 0) onGameEnd('win');
      else if (allies.length > 0 && allies.every(a => a.hp <= 0)) onGameEnd('lose');

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [enemy, allies, buffs, hpMultiplier, userStats, addLog, gainCausality, onGameEnd]);

  // 유저 스킬
  const useSkill = (type) => {
    if (type === 'atk') {
      if (playerCausality < 10) { addLog("CP 부족", "system"); return; }
      setPlayerCausality(prev => prev - 10);
      setBuffs(prev => ({ ...prev, atk: { active: true, timeLeft: 10000, val: 0.2 } }));
      addLog(">>> [인과율] 무력 강화", "skill");
    } else if (type === 'shield') {
      if (playerCausality < 20) { addLog("CP 부족", "system"); return; }
      setPlayerCausality(prev => prev - 20);
      setAllies(prev => prev.map(a => ({ ...a, shield: Math.floor(a.maxHp * 0.5) })));
      setBuffs(prev => ({ ...prev, shield: { active: true, timeLeft: 5000, val: 1 } }));
      addLog(">>> [인과율] 절대 방어", "skill");
    } else if (type === 'speed') {
      if (playerCausality < 30) { addLog("CP 부족", "system"); return; }
      setPlayerCausality(prev => prev - 30);
      setBuffs(prev => ({ ...prev, speed: { active: true, timeLeft: 10000, val: 1.5 } }));
      addLog(">>> [인과율] 시간 가속", "skill");
    }
  };

  return { logs, allies, enemy, playerCausality, enemyWarning, buffs, useSkill };
}
