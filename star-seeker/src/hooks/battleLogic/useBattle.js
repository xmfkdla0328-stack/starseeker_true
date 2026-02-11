import { useEffect, useRef, useState, useCallback } from 'react';
import { TICK_RATE } from '../../data/gameData';
import useBattleState from './useBattleState';
import { handleAllyActions } from './actionManager';
import { manageBuffs } from './buffManager';
import { handleEnemyActions } from './enemyActionManager';
import { calculateDamage } from './damageCalculator'; // [New] 계산기 추가

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId) {
  const {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  } = useBattleState(initialParty, userStats, hpMultiplier, enemyId);

  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  const alliesRef = useRef(allies);
  useEffect(() => { alliesRef.current = allies; }, [allies]);

  const buffsRef = useRef(buffs);
  useEffect(() => { buffsRef.current = buffs; }, [buffs]);

  const enemyRef = useRef(enemy);
  useEffect(() => { enemyRef.current = enemy; }, [enemy]);

  const togglePause = useCallback((forceState) => {
    setIsPaused(prev => forceState !== undefined ? forceState : !prev);
  }, []);

  // --- 메인 게임 루프 ---
  useEffect(() => {
    if (!initialParty || initialParty.length === 0 || !onGameEndRef.current || !isBattleStarted || isPaused) return;

    const interval = setInterval(() => {
      let currentAllies = [...alliesRef.current];
      let currentBuffs = buffsRef.current;

      // 1. 버프 관리
      const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(currentBuffs, addLog);
      if (hasChanged) {
        setBuffs(updatedBuffs);
        currentBuffs = updatedBuffs;
      }

      // 2. 적의 행동 (Enemy Action)
      if (enemyRef.current && enemyRef.current.hp > 0) {
        const enemyContext = { 
            enemy: enemyRef.current, 
            allies: currentAllies, 
            addLog 
        };
        
        const { updatedEnemy, damageToAllies } = handleEnemyActions(enemyContext);

        if (updatedEnemy) {
            setEnemy(updatedEnemy);
            setEnemyWarning(updatedEnemy.isCharging); 
        }

        // [Refactored] 적이 아군을 공격했을 때
        if (damageToAllies && damageToAllies.length > 0) {
            currentAllies = currentAllies.map(ally => {
                const hitInfo = damageToAllies.find(d => d.targetId == ally.id);
                if (hitInfo) {
                    // (A) 데미지 계산기 호출
                    const { finalDamage, remainingShield } = calculateDamage(
                        enemyRef.current, // 공격자
                        ally,             // 방어자
                        hitInfo.amount,   // 원본 데미지
                        currentBuffs      // 현재 버프 상태
                    );

                    // (B) 피격 시 인과력 획득 (유효타일 때만)
                    if (finalDamage > 0) {
                        gainCausality(1 * (ally.efficiency || 1.0));
                    }

                    // (C) 상태 업데이트 (계산 결과 적용)
                    return { 
                        ...ally, 
                        hp: Math.max(0, ally.hp - finalDamage), 
                        shield: remainingShield 
                    };
                }
                return ally;
            });
        }
      }

      // 3. 아군의 행동 (Ally Action)
      const { updatedAllies, damageToEnemy } = handleAllyActions({
          allies: currentAllies, 
          buffs: currentBuffs,
          shieldJustExpired,
          setBuffs,
          addLog,
          gainCausality,
      });

      // 4. 결과 처리 (HP 갱신 및 승패 판정)
      if (damageToEnemy > 0) {
          setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - damageToEnemy) }));
      }
      
      setAllies(updatedAllies);

      setEnemy(e => {
          if (e && e.hp <= 0 && !e.isDead) {
              addLog("적을 처치했습니다! 승리!", "system");
              if(onGameEndRef.current) onGameEndRef.current('win');
              return { ...e, isDead: true };
          }
          return e;
      });
      
      if (updatedAllies.length > 0 && updatedAllies.every(a => a.hp <= 0)) {
          addLog("패배...", "system");
          if(onGameEndRef.current) onGameEndRef.current('lose');
      }

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [initialParty, userStats, hpMultiplier, setAllies, setBuffs, setEnemy, setEnemyWarning, addLog, gainCausality, isBattleStarted, isPaused]);

  // 스킬 사용 로직 (기존 유지)
  const useSkill = (type) => {
    if (!isBattleStarted || isPaused) return;

    const cost = { atk: 10, shield: 20, speed: 30 };
    if (playerCausality < cost[type]) { 
        addLog("CP(인과력)가 부족합니다.", "system"); 
        return; 
    }

    setPlayerCausality(prev => prev - cost[type]);

    if (type === 'atk') {
      setBuffs(prev => ({ ...prev, atk: { ...prev.atk, active: true, timeLeft: 10000 } }));
      addLog(">>> [인과율 개입] 무력 강화 활성화", "skill");
    } else if (type === 'shield') {
      setAllies(prev => prev.map(a => ({ ...a, shield: Math.floor(a.maxHp * 0.3) })));
      setBuffs(prev => ({ ...prev, shield: { ...prev.shield, active: true, timeLeft: 5000 } }));
      addLog(">>> [인과율 개입] 절대 방어 활성화", "skill");
    } else if (type === 'speed') {
      setBuffs(prev => ({ ...prev, speed: { ...prev.speed, active: true, timeLeft: 10000 } }));
      addLog(">>> [인과율 개입] 시간 가속 활성화", "skill");
    }
  };

  const startBattle = () => {
    setIsBattleStarted(true);
    setIsPaused(false); 
    addLog("--- 전투가 시작됩니다 ---", "system");
  };

  return { 
    logs, allies, enemy, playerCausality, enemyWarning, buffs, 
    useSkill, startBattle, isBattleStarted,
    isPaused, togglePause 
  };
}