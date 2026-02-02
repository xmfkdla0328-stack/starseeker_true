import { useEffect } from 'react';
import { TICK_RATE, ACTION_THRESHOLD, ENEMY_CAUSALITY_TRIGGER, WARNING_DURATION_MS } from '../../data/gameData'; // 경로 수정
import useBattleState from './useBattleState'; // 경로 수정
import { handleAllyActions } from './actionManager'; // 경로 수정
import { manageBuffs } from './buffManager'; // 경로 수정

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
    if (!enemy || allies.length === 0 || !onGameEnd) return;

    const interval = setInterval(() => {
      // 1. 버프 관리 로직을 buffManager.js에 위임
      const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(buffs, addLog);
      if (hasChanged) {
        setBuffs(updatedBuffs);
      }

      // 2. 적(Enemy) 행동
      setEnemy(prevEnemy => {
        if (prevEnemy.hp <= 0) return prevEnemy;
        let newEnemy = { ...prevEnemy };

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
               if (updatedBuffs.damageReduction.active) finalDmg = Math.floor(finalDmg * (1 - updatedBuffs.damageReduction.val));
               let remainingShield = shieldJustExpired ? 0 : a.shield;
               if (remainingShield >= finalDmg) { remainingShield -= finalDmg; finalDmg = 0; }
               else { finalDmg -= remainingShield; remainingShield = 0; }
               gainCausality(1 * a.efficiency);
               return { ...a, hp: Math.max(0, a.hp - finalDmg), shield: remainingShield };
            }));
          }
          return newEnemy;
        }

        newEnemy.actionGauge += (newEnemy.baseSpd * (1 + Math.random() * 0.1));
        if (newEnemy.actionGauge >= ACTION_THRESHOLD) {
          newEnemy.actionGauge = 0;
          if (newEnemy.causality >= ENEMY_CAUSALITY_TRIGGER) {
            newEnemy.isCharging = true;
            newEnemy.chargeTimer = WARNING_DURATION_MS;
            setEnemyWarning(true);
            addLog(`[경고] 인과율 급증 감지! (${newEnemy.name})`, 'warning');
          } else {
            setAllies(currAllies => {
              const liveAllies = currAllies.filter(a => a.hp > 0);
              if (liveAllies.length > 0) {
                const target = liveAllies[Math.floor(Math.random() * liveAllies.length)];
                const damage = Math.max(0, newEnemy.baseAtk - target.def);
                let finalDmg = updatedBuffs.damageReduction.active ? Math.floor(damage * (1 - updatedBuffs.damageReduction.val)) : damage;
                addLog(`⚔️ 적의 공격 -> ${target.name} (DMG: ${finalDmg})`, 'enemy_atk');
                newEnemy.causality += 2;
                return currAllies.map(a => {
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
                });
              }
              return currAllies;
            });
          }
        }
        return newEnemy;
      });

      // 3. 아군(Allies) 행동 로직을 actionManager.js에 위임
      setAllies(prevAllies => {
        const { updatedAllies, damageToEnemy } = handleAllyActions({
            allies: prevAllies,
            buffs: updatedBuffs,
            shieldJustExpired,
            setBuffs,
            addLog,
            gainCausality,
        });

        if (damageToEnemy > 0) {
            setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - damageToEnemy) }));
        }

        // 4. 게임 종료 체크
        setEnemy(e => {
            if (e && e.hp <= 0 && !e.isDead) {
                addLog("승리!", "system");
                if(onGameEnd) onGameEnd('win');
                return { ...e, isDead: true };
            }
            return e;
        });
        
        if (updatedAllies.every(a => a.hp <= 0)) {
            addLog("패배...", "system");
            if(onGameEnd) onGameEnd('lose');
        }

        return updatedAllies;
      });

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [initialParty, userStats, hpMultiplier, onGameEnd, addLog, gainCausality, setAllies, setBuffs, setEnemy, setEnemyWarning, buffs]); 

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
