import { useState, useEffect, useCallback } from 'react';
import { CAUSALITY_MAX } from '../../data/gameData';
import { ENEMIES, ENEMY_TEMPLATE } from '../../data/enemyData'; // [수정] ENEMIES 임포트

export default function useBattleState(initialParty, userStats, hpMultiplier, enemyId) { // [수정] enemyId 추가
  const [logs, setLogs] = useState([]);
  const [allies, setAllies] = useState([]);
  const [enemy, setEnemy] = useState(null);
  const [playerCausality, setPlayerCausality] = useState(0);
  const [enemyWarning, setEnemyWarning] = useState(false);
  
  const [buffs, setBuffs] = useState({
    atk: { active: false, timeLeft: 0, val: 0.2 },
    shield: { active: false, timeLeft: 0, val: 0 },
    speed: { active: false, timeLeft: 0, val: 1.2 },
    damageReduction: { active: false, timeLeft: 0, val: 0.0 },
    regen: { active: false, timeLeft: 0, val: 0 },
  });

  const addLog = useCallback((text, type = 'normal') => {
    setLogs(prev => [...prev.slice(-49), { id: Date.now() + Math.random(), text, type }]);
  }, []);

  const gainCausality = useCallback((amount) => {
    const multiplier = 1 + (userStats.int * 0.01);
    const finalAmount = amount * multiplier;
    setPlayerCausality(prev => Math.min(prev + finalAmount, CAUSALITY_MAX));
  }, [userStats.int]);

  useEffect(() => {
    if (!initialParty || initialParty.length === 0) return;

    // 1. 아군 초기화 (기존 동일)
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
        combatSkills: char.combatSkills || { 
            normal: { name: "기본 공격", mult: 1.0 }, 
            ultimate: { name: "필살기", mult: 2.5 } 
        },
        actionGauge: Math.random() * 500,
        ultGauge: 0,
        maxUltGauge: 100,
        shield: 0,
        efficiency: char.efficiency || 1.0,
        selfBuffs: { atkUp: 0, critDmgUp: 0, buffTime: 0 }
      };
    });
    setAllies(initializedAllies);

    // 2. [핵심] 적 초기화: ID로 데이터 조회 및 Initial HP 적용
    const targetEnemyData = (enemyId && ENEMIES[enemyId]) ? ENEMIES[enemyId] : ENEMY_TEMPLATE;
    
    if (targetEnemyData) {
        setEnemy({
            ...targetEnemyData,
            // [핵심] initialHp가 있으면 그것을 현재 hp로, 없으면 maxHp 사용
            hp: targetEnemyData.initialHp || targetEnemyData.maxHp, 
            actionGauge: 0,
            ultGauge: 0,
            causality: 0,
            isCharging: false,
            chargeTimer: 0,
            chargingSkill: null
        });
    }
    
    addLog(`⚠️ 강적 [${targetEnemyData.name}] 출현!`, "warning");

  }, [initialParty, userStats, hpMultiplier, addLog, enemyId]); // enemyId 의존성 추가

  return {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  };
}