import { useState, useEffect, useCallback } from 'react';
import { ENEMY_TEMPLATE, CAUSALITY_MAX } from '../../data/gameData'; // 경로 수정

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

  // --- 초기화 로직 (전투 시작 시 1회 실행) ---
  useEffect(() => {
    if (!initialParty || initialParty.length === 0) return;

    const initializedAllies = initialParty.map(char => {
      // 스탯 계산
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
        // 스킬 정보 안전하게 매핑
        combatSkills: char.combatSkills || { 
            normal: { name: "기본 공격", mult: 1.0 }, 
            ultimate: { name: "필살기", mult: 2.5 } 
        },
        actionGauge: Math.random() * 500, // 턴 겹침 방지 랜덤 시작
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
    if (hpMultiplier < 1.0) {
        addLog("[상태이상] 알 수 없는 힘에 의해 체력이 감소했습니다.", "warning");
    }

  }, [userStats, hpMultiplier, initialParty, addLog]);

  return {
    logs, setLogs,
    allies, setAllies,
    enemy, setEnemy,
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning,
    buffs, setBuffs,
    addLog, gainCausality
  };
}