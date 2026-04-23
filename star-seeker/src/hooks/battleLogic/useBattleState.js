import { useState, useEffect, useCallback } from 'react';
import { CAUSALITY_MAX } from '../../data/gameData';
import { ENEMIES, ENEMY_TEMPLATE } from '../../data/enemyData'; 

export default function useBattleState(initialParty, userStats, hpMultiplier, enemyId) { 
  const [logs, setLogs] = useState([]);
  const [allies, setAllies] = useState([]);
  // [Refactor] 다중 적 지원: enemy(단수) → enemies(배열). 현재는 항상 1마리.
  const [enemies, setEnemies] = useState([]);
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
      // [Fix] getFinalStats 결과면 char.hp/atk/def/speed에 장비 보너스 포함된 최종값이 들어있고,
      //       원본 캐릭터(raw)면 baseHp/baseAtk/baseDef/baseSpd만 있음 → 둘 다 안전하게 fallback
      const sourceHp  = char.hp     ?? char.baseHp  ?? 0;
      const sourceAtk = char.atk    ?? char.baseAtk ?? 0;
      const sourceDef = char.def    ?? char.baseDef ?? 0;
      const sourceSpd = char.speed  ?? char.baseSpd ?? 0;

      // [NEW] isFixed === true 면 유저 스탯 보너스를 우회하고 값 그대로 사용 (최종전 프리셋용)
      const isFixed = char.isFixed === true;

      const maxHp = isFixed ? sourceHp  : Math.floor(sourceHp  * (1 + userStats.chr * 0.01));
      const atk   = isFixed ? sourceAtk : Math.floor(sourceAtk * (1 + userStats.str * 0.01));
      const def   = isFixed ? sourceDef : Math.floor(sourceDef * (1 + userStats.wil * 0.01));
      const spd   = isFixed ? sourceSpd : Math.floor(sourceSpd * (1 + userStats.agi * 0.01));
      const currentHp = Math.floor(maxHp * hpMultiplier);

      return {
        ...char,
        hp: currentHp,
        maxHp: maxHp,
        atk: atk,
        def: def,
        spd: spd,
        // [NEW] 치명타 수치를 ally 객체에 실어서 전투 코드(actionManager)가 사용 가능하게 함
        critRate: char.critRate || 0,
        critDmg: char.critDmg || 0,
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

    // 2. 적 초기화 (배열로 통일. 현재는 1마리만 들어감)
    const targetEnemyData = (enemyId && ENEMIES[enemyId]) ? ENEMIES[enemyId] : ENEMY_TEMPLATE;
    
    if (targetEnemyData) {
        setEnemies([{
            ...targetEnemyData,
            hp: targetEnemyData.initialHp || targetEnemyData.maxHp, 
            actionGauge: 0,
            ultGauge: 0,
            causality: 0,
            isCharging: false,
            chargeTimer: 0,
            chargingSkill: null
        }]);
    }
    
    // [Log] 적 출현 (시스템)
    addLog(`⚠️ 강적 [${targetEnemyData.name}] 출현!`, "system");

  }, [initialParty, userStats, hpMultiplier, addLog, enemyId]);

  return {
    logs, allies, setAllies, enemies, setEnemies, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  };
}