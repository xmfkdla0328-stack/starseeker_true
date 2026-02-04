import { useEffect, useRef } from 'react';
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

  // 항상 최신 상태를 참조하기 위한 useRef
  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  const alliesRef = useRef(allies);
  useEffect(() => { alliesRef.current = allies; }, [allies]);

  const buffsRef = useRef(buffs);
  useEffect(() => { buffsRef.current = buffs; }, [buffs]);

  // --- 메인 게임 루프 ---
  useEffect(() => {
    if (!initialParty || initialParty.length === 0 || !onGameEndRef.current) return;

    const interval = setInterval(() => {
      // 1. 버프 관리 로직을 buffManager.js에 위임 (항상 최신 buffs 참조)
      const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(buffsRef.current, addLog);
      if (hasChanged) {
        setBuffs(updatedBuffs);
      }

      // 2. 적(Enemy) 행동
      setEnemy(prevEnemy => {
        if (!prevEnemy || prevEnemy.hp <= 0) return prevEnemy;
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
               // 버프 최신 상태 반영
               if (buffsRef.current.damageReduction.active) finalDmg = Math.floor(finalDmg * (1 - buffsRef.current.damageReduction.val));
               let remainingShield = a.shield;
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
            const liveAllies = alliesRef.current.filter(a => a.hp > 0);
            if (liveAllies.length > 0) {
              const target = liveAllies[Math.floor(Math.random() * liveAllies.length)];
              const damage = Math.max(0, newEnemy.baseAtk - target.def);
              // 버프 최신 상태 반영
              let finalDmg = buffsRef.current.damageReduction.active ? Math.floor(damage * (1 - buffsRef.current.damageReduction.val)) : damage;
              addLog(`⚔️ 적의 공격 -> ${target.name} (DMG: ${finalDmg})`, 'enemy_atk');
              newEnemy.causality += 2;
              
              setAllies(currAllies => currAllies.map(a => {
                if (a.id === target.id) {
                   let shieldCalc = a.shield;
                   let dmgToApply = finalDmg;
                   if (shieldCalc >= dmgToApply) { shieldCalc -= dmgToApply; dmgToApply = 0; }
                   else { dmgToApply -= shieldCalc; shieldCalc = 0; }
                   gainCausality(1 * a.efficiency);
                   return { ...a, hp: Math.max(0, a.hp - dmgToApply), shield: shieldCalc };
                }
                return a;
              }));
            }
          }
        }
        return newEnemy;
      });

      // 3. 아군(Allies) 행동 로직 (최신 상태 사용)
      const { updatedAllies, damageToEnemy } = handleAllyActions({
          allies: alliesRef.current,
          buffs: buffsRef.current,
          shieldJustExpired,
          setBuffs,
          addLog,
          gainCausality,
      });

      if (damageToEnemy > 0) {
          setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - damageToEnemy) }));
      }
      // handleAllyActions에서 반환된 결과로 allies 상태 업데이트
      setAllies(updatedAllies);

      // 4. 게임 종료 체크
      setEnemy(e => {
          if (e && e.hp <= 0 && !e.isDead) {
              addLog("승리!", "system");
              if(onGameEndRef.current) onGameEndRef.current('win');
              return { ...e, isDead: true };
          }
          return e;
      });
      
      if (alliesRef.current.every(a => a.hp <= 0)) {
          addLog("패배...", "system");
          if(onGameEndRef.current) onGameEndRef.current('lose');
      }

    }, TICK_RATE);

    return () => clearInterval(interval);
    // 의존성 배열을 비워서 최초 1회만 실행되도록 보장
  }, [initialParty, userStats, hpMultiplier, setAllies, setBuffs, setEnemy, setEnemyWarning, addLog, gainCausality]); 

  // 유저 스킬
  const useSkill = (type) => {
    const cost = { atk: 10, shield: 20, speed: 30 };
    if (playerCausality < cost[type]) { 
        addLog("CP 부족", "system"); 
        return; 
    }

    setPlayerCausality(prev => prev - cost[type]);

    if (type === 'atk') {
      setBuffs(prev => ({ ...prev, atk: { ...prev.atk, active: true, timeLeft: 10000 } }));
      addLog(">>> [인과율] 무력 강화", "skill");
    } else if (type === 'shield') {
      setAllies(prev => prev.map(a => ({ ...a, shield: Math.floor(a.maxHp * 0.5) })));
      setBuffs(prev => ({ ...prev, shield: { ...prev.shield, active: true, timeLeft: 5000 } }));
      addLog(">>> [인과율] 절대 방어", "skill");
    } else if (type === 'speed') {
      setBuffs(prev => ({ ...prev, speed: { ...prev.speed, active: true, timeLeft: 10000 } }));
      addLog(">>> [인과율] 시간 가속", "skill");
    }
  };

  return { logs, allies, enemy, playerCausality, enemyWarning, buffs, useSkill };
}
