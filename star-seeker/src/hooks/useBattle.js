import { useState, useEffect, useCallback } from 'react';
import { ENEMY_TEMPLATE, TICK_RATE, ACTION_THRESHOLD, CAUSALITY_MAX, ENEMY_CAUSALITY_TRIGGER, WARNING_DURATION_MS } from '../data/gameData';

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd) {
  const [logs, setLogs] = useState([]);
  const [allies, setAllies] = useState([]);
  const [enemy, setEnemy] = useState(null);
  const [playerCausality, setPlayerCausality] = useState(0);
  const [enemyWarning, setEnemyWarning] = useState(false);
  const [buffs, setBuffs] = useState({
    atk: { active: false, timeLeft: 0, val: 0.2 },
    shield: { active: false, timeLeft: 0, val: 0 },
    speed: { active: false, timeLeft: 0, val: 1.2 },
  });

  const addLog = useCallback((text, type = 'normal') => {
    setLogs(prev => [...prev.slice(-49), { id: Date.now() + Math.random(), text, type }]);
  }, []);

  const gainCausality = useCallback((amount) => {
    const multiplier = 1 + (userStats.int * 0.01);
    const finalAmount = amount * multiplier;
    setPlayerCausality(prev => Math.min(prev + finalAmount, CAUSALITY_MAX));
  }, [userStats.int]);

  // --- 초기화 ---
  useEffect(() => {
    if (!initialParty || initialParty.length === 0) return;

    const initializedAllies = initialParty.map(char => {
      const maxHp = Math.floor(char.baseHp * (1 + userStats.chr * 0.01));
      const currentHp = Math.floor(maxHp * hpMultiplier);
      const atk = Math.floor(char.baseAtk * (1 + userStats.str * 0.01));
      const def = Math.floor(char.baseDef * (1 + userStats.wil * 0.01));
      const spd = Math.floor(char.baseSpd * (1 + userStats.agi * 0.01));

      return {
        ...char,
        hp: currentHp,
        maxHp: maxHp,
        atk: atk,
        def: def,
        spd: spd,
        // [중요] 스킬 배율 초기화 (데이터가 없으면 기본값 적용)
        normalMult: char.normalMult || 1.0,
        skillMult: char.skillMult || 2.5,
        actionGauge: Math.random() * 500,
        ultGauge: 0,
        maxUltGauge: 100,
        shield: 0,
        efficiency: char.efficiency || 1.0,
      };
    });
    setAllies(initializedAllies);

    setEnemy({
      ...ENEMY_TEMPLATE,
      hp: ENEMY_TEMPLATE.maxHp,
      causality: 0,
      actionGauge: 0,
      isCharging: false,
      chargeTimer: 0,
    });

    addLog("=== 전투 개시 ===", "system");
    addLog(`[시스템] 유저 스탯 적용 (INT: ${userStats.int})`, "system");
    if (hpMultiplier < 1.0) addLog("[상태이상] 알 수 없는 힘에 의해 체력이 감소했습니다.", "warning");

  }, [userStats, hpMultiplier, initialParty, addLog]);

  // --- 메인 루프 ---
  useEffect(() => {
    if (!enemy || allies.length === 0) return;

    const interval = setInterval(() => {
      let shieldJustExpired = false;
      const nextBuffs = { ...buffs };
      let buffChanged = false;

      ['atk', 'shield', 'speed'].forEach(key => {
        if (nextBuffs[key].active) {
          nextBuffs[key].timeLeft -= TICK_RATE;
          if (nextBuffs[key].timeLeft <= 0) {
            nextBuffs[key].active = false;
            buffChanged = true;
            if (key === 'shield') { shieldJustExpired = true; addLog(`[알림] 방어막이 소멸합니다.`, 'system'); }
            else if (key === 'atk') addLog(`[알림] 공격 강화 종료.`, 'system');
            else if (key === 'speed') addLog(`[알림] 가속 종료.`, 'system');
          }
        }
      });
      if (buffChanged) setBuffs(nextBuffs);

      // 적 로직
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
               let remainingShield = shieldJustExpired ? 0 : a.shield;
               let incomingDmg = Math.max(0, damage - a.def);
               if (remainingShield >= incomingDmg) { remainingShield -= incomingDmg; incomingDmg = 0; }
               else { incomingDmg -= remainingShield; remainingShield = 0; }
               gainCausality(1 * a.efficiency);
               return { ...a, hp: Math.max(0, a.hp - incomingDmg), shield: remainingShield };
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
            const liveAllies = allies.filter(a => a.hp > 0);
            if (liveAllies.length > 0) {
              const target = liveAllies[Math.floor(Math.random() * liveAllies.length)];
              const damage = Math.max(0, newEnemy.baseAtk - target.def);
              addLog(`⚔️ 적의 공격 -> ${target.name} (DMG: ${damage})`, 'enemy_atk');
              setAllies(curr => curr.map(a => {
                if (a.id === target.id) {
                   let shieldCalc = shieldJustExpired ? 0 : a.shield;
                   let dmgCalc = damage;
                   if (shieldCalc >= dmgCalc) { shieldCalc -= dmgCalc; dmgCalc = 0; }
                   else { dmgCalc -= shieldCalc; shieldCalc = 0; }
                   gainCausality(1 * a.efficiency);
                   return { ...a, hp: Math.max(0, a.hp - dmgCalc), shield: shieldCalc };
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

      // 아군 로직
      setAllies(prevAllies => {
        return prevAllies.map(ally => {
          let newAlly = { ...ally };
          if (shieldJustExpired) newAlly.shield = 0;
          if (newAlly.hp <= 0) return newAlly;

          const speedMultiplier = nextBuffs.speed.active ? nextBuffs.speed.val : 1;
          newAlly.actionGauge += (newAlly.spd * speedMultiplier * (1 + Math.random() * 0.1));

          if (newAlly.actionGauge >= ACTION_THRESHOLD) {
            newAlly.actionGauge = 0;
            const atkMultiplier = nextBuffs.atk.active ? (1 + nextBuffs.atk.val) : 1;
            const finalAtk = newAlly.atk * atkMultiplier;
            const eff = newAlly.efficiency || 1.0;

            if (newAlly.ultGauge >= newAlly.maxUltGauge) {
              newAlly.ultGauge = 0;
              // [수정됨] 캐릭터별 필살기 배율(skillMult) 적용
              const dmg = Math.floor(finalAtk * newAlly.skillMult);
              setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - dmg) }));
              addLog(`✨ ${newAlly.name} 필살기! (DMG: ${dmg})`, 'ally_ult');
              gainCausality(3 * eff);
            } else {
              // [수정됨] 캐릭터별 평타 배율(normalMult) 적용
              const dmg = Math.floor(finalAtk * newAlly.normalMult);
              setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - Math.max(0, dmg - e.baseDef)) }));
              addLog(`${newAlly.name} 공격 (DMG: ${dmg})`, 'ally_atk');
              newAlly.ultGauge = Math.min(newAlly.maxUltGauge, newAlly.ultGauge + 20);
              gainCausality(1 * eff);
            }
          }
          return newAlly;
        });
      });

      if (enemy && enemy.hp <= 0) onGameEnd('win');
      else if (allies.length > 0 && allies.every(a => a.hp <= 0)) onGameEnd('lose');

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [enemy, allies, buffs, hpMultiplier, userStats, addLog, gainCausality, onGameEnd]);

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