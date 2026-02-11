import { useState, useEffect, useCallback } from 'react';
import { CAUSALITY_MAX } from '../../data/gameData';
import { ENEMIES, ENEMY_TEMPLATE } from '../../data/enemyData'; 

export default function useBattleState(initialParty, userStats, hpMultiplier, enemyId) { 
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

  // [수정] type 파라미터 추가 및 기본값 설정
  const addLog = useCallback((text, type = 'damage') => {
    setLogs(prev => [...prev.slice(-49), { 
        id: Date.now() + Math.random(), 
        text, 
        type, // 타입 저장
        timestamp: Date.now() 
    }]);
  }, []);

  const gainCausality = useCallback((amount) => {
    const multiplier = 1 + (userStats.int * 0.01);
    const finalAmount = amount * multiplier;
    setPlayerCausality(prev => Math.min(prev + finalAmount, CAUSALITY_MAX));
  }, [userStats.int]);

  useEffect(() => {
    if (!initialParty || initialParty.length === 0) return;

    // 1. 아군 초기화
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

    // 2. 적 초기화
    const targetEnemyData = (enemyId && ENEMIES[enemyId]) ? ENEMIES[enemyId] : ENEMY_TEMPLATE;
    
    if (targetEnemyData) {
        setEnemy({
            ...targetEnemyData,
            hp: targetEnemyData.initialHp || targetEnemyData.maxHp, 
            actionGauge: 0,
            ultGauge: 0,
            causality: 0,
            isCharging: false,
            chargeTimer: 0,
            chargingSkill: null
        });
    }
    
    // [Log] 적 출현 (시스템)
    addLog(`⚠️ 강적 [${targetEnemyData.name}] 출현!`, "system");

  }, [initialParty, userStats, hpMultiplier, addLog, enemyId]);

  return {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  };
}