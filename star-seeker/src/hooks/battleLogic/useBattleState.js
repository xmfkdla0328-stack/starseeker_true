import { useState, useEffect, useCallback } from 'react';
import { CAUSALITY_MAX } from '../../data/gameData';
import { ENEMY_TEMPLATE } from '../../data/enemyData'; // [수정] 경로 변경

export default function useBattleState(initialParty, userStats, hpMultiplier) {
  // --- 상태 선언 ---
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

  // --- 유틸리티 함수 ---
  const addLog = useCallback((text, type = 'normal') => {
    setLogs(prev => [...prev.slice(-49), { id: Date.now() + Math.random(), text, type }]);
  }, []);

  const gainCausality = useCallback((amount) => {
    const multiplier = 1 + (userStats.int * 0.01);
    const finalAmount = amount * multiplier;
    setPlayerCausality(prev => Math.min(prev + finalAmount, CAUSALITY_MAX));
  }, [userStats.int]);

  // --- 전투 초기화 ---
  useEffect(() => {
    if (!initialParty || initialParty.length === 0) return;

    // 아군 초기화
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

    // [수정] 적 초기화: 분리된 enemyData.js의 템플릿 사용
    if (ENEMY_TEMPLATE) {
        setEnemy({
            ...ENEMY_TEMPLATE,
            hp: ENEMY_TEMPLATE.maxHp,
            actionGauge: 0,
            ultGauge: 0,
            causality: 0,
            isCharging: false,
            chargeTimer: 0,
            chargingSkill: null
        });
    }
    
    addLog("전투 시뮬레이션 개시...", "system");

  }, [initialParty, userStats, hpMultiplier, addLog]);

  return {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  };
}