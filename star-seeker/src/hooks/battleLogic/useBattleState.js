import { useState, useEffect, useCallback } from 'react';
import { CAUSALITY_MAX } from '../../data/gameData';
import { ENEMIES, ENEMY_TEMPLATE, MAX_ENEMIES_PER_BATTLE, ENEMY_LINEUPS } from '../../data/enemyData'; 

/**
 * enemyId 파라미터를 정규화하여 적 인스턴스 데이터 ID 목록을 반환.
 * 지원 형태:
 *   - string                          : 단일 적 (기존 호환)
 *   - string[]                        : 각 항목 하나당 1 인스턴스
 *   - Array<{id, count?}>             : 같은 적을 count만큼 복제
 *   - Array<string | {id, count?}>   : 위 두 가지 혼합
 *   - null/undefined                  : 빈 배열 (호출부가 fallback 처리)
 */
function resolveEnemyLineup(enemyId) {
  if (!enemyId) return [];
  if (typeof enemyId === 'string') {
    // [Step 3b] 라인업 프리셋 키가 들어오면 ENEMY_LINEUPS에서 펼쳐 재귀 처리.
    // (ex. 'data_aggregate_extraction' → [recorder_page x4, recorder_bookmark x1])
    if (ENEMY_LINEUPS && ENEMY_LINEUPS[enemyId]) {
      return resolveEnemyLineup(ENEMY_LINEUPS[enemyId]);
    }
    return [enemyId];
  }
  if (Array.isArray(enemyId)) {
    return enemyId.flatMap(entry => {
      if (typeof entry === 'string') return [entry];
      if (entry && typeof entry === 'object' && entry.id) {
        const n = Math.max(1, Math.floor(entry.count || 1));
        return Array(n).fill(entry.id);
      }
      return [];
    });
  }
  return [];
}

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

    // 2. 적 초기화 (배열로 통일. 단일/다중 모두 지원)
    //    instanceId: 같은 종류 적이 여러 마리 있을 때 React key/DOM id로 사용 (예: 'recorder_page#0')
    const lineupIds = resolveEnemyLineup(enemyId).slice(0, MAX_ENEMIES_PER_BATTLE);
    // 같은 id가 여러 마리인 경우만 actionGauge를 살짝 분산 (동시 행동 방지)
    // 이렇게 하면 단일 적/혼합 편성의 단독 인스턴스는 기존처럼 actionGauge=0으로 시작 → 백워드 호환 유지
    const idCounts = lineupIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    let enemyInstances = lineupIds
      .map((id, idx) => {
        const data = ENEMIES[id];
        if (!data) return null;
        const isDuplicate = idCounts[id] > 1;
        return {
          ...data,
          instanceId: `${data.id}#${idx}`,
          hp: data.initialHp || data.maxHp,
          actionGauge: isDuplicate ? Math.random() * 200 : 0,
          ultGauge: 0,
          causality: 0,
          isCharging: false,
          chargeTimer: 0,
          chargingSkill: null
        };
      })
      .filter(Boolean);

    // Fallback: 라인업이 비었으면 기본 템플릿 1마리
    if (enemyInstances.length === 0 && ENEMY_TEMPLATE) {
      enemyInstances = [{
        ...ENEMY_TEMPLATE,
        instanceId: `${ENEMY_TEMPLATE.id}#0`,
        hp: ENEMY_TEMPLATE.initialHp || ENEMY_TEMPLATE.maxHp,
        actionGauge: 0,
        ultGauge: 0,
        causality: 0,
        isCharging: false,
        chargeTimer: 0,
        chargingSkill: null
      }];
    }

    setEnemies(enemyInstances);

    // [Log] 같은 종류는 묶어서 출현 알림 (보스는 ⚠️ 강조)
    const groups = new Map(); // id → { name, isBoss, count }
    enemyInstances.forEach(e => {
      const g = groups.get(e.id) || { name: e.name, isBoss: !!e.isBoss, count: 0 };
      g.count++;
      groups.set(e.id, g);
    });
    groups.forEach(g => {
      const suffix = g.count > 1 ? ` x${g.count}` : '';
      if (g.isBoss) {
        addLog(`⚠️ 강적 [${g.name}]${suffix} 출현!`, 'system');
      } else {
        addLog(`적 [${g.name}]${suffix} 출현.`, 'system');
      }
    });

  }, [initialParty, userStats, hpMultiplier, addLog, enemyId]);

  return {
    logs, allies, setAllies, enemies, setEnemies, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  };
}