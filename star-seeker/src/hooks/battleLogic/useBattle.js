import { useEffect, useRef, useState, useCallback } from 'react';
import { TICK_RATE } from '../../data/gameData';
import useBattleState from './useBattleState';
import { handleAllyActions } from './actionManager';
import { manageBuffs } from './buffManager';
import { handleEnemyActions } from './enemyActionManager';

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId) {
  const {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  } = useBattleState(initialParty, userStats, hpMultiplier, enemyId);

  const [isBattleStarted, setIsBattleStarted] = useState(false);
  // [New] 일시정지 상태 관리
  const [isPaused, setIsPaused] = useState(false);

  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  const alliesRef = useRef(allies);
  useEffect(() => { alliesRef.current = allies; }, [allies]);

  const buffsRef = useRef(buffs);
  useEffect(() => { buffsRef.current = buffs; }, [buffs]);

  const enemyRef = useRef(enemy);
  useEffect(() => { enemyRef.current = enemy; }, [enemy]);

  // [New] 일시정지 토글 함수
  const togglePause = useCallback((forceState) => {
    setIsPaused(prev => forceState !== undefined ? forceState : !prev);
  }, []);

  // --- 메인 게임 루프 ---
  useEffect(() => {
    // [수정] !isPaused 조건 추가: 일시정지 상태가 아닐 때만 루프 실행
    if (!initialParty || initialParty.length === 0 || !onGameEndRef.current || !isBattleStarted || isPaused) return;

    const interval = setInterval(() => {
      let currentAllies = [...alliesRef.current];
      let currentBuffs = buffsRef.current;

      const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(currentBuffs, addLog);
      if (hasChanged) {
        setBuffs(updatedBuffs);
        currentBuffs = updatedBuffs;
      }

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

        if (damageToAllies && damageToAllies.length > 0) {
            currentAllies = currentAllies.map(ally => {
                const hitInfo = damageToAllies.find(d => d.targetId == ally.id);
                if (hitInfo) {
                    let rawDmg = hitInfo.amount;
                    let def = ally.def || 0;
                    let finalDmg = Math.max(1, rawDmg - def);

                    if (currentBuffs.damageReduction.active) {
                        const reductionRate = currentBuffs.damageReduction.val || 0;
                        finalDmg = Math.floor(finalDmg * (1 - reductionRate));
                    }

                    let remainingShield = ally.shield || 0;
                    if (remainingShield > 0) {
                        if (remainingShield >= finalDmg) {
                            remainingShield -= finalDmg;
                            finalDmg = 0;
                        } else {
                            finalDmg -= remainingShield;
                            remainingShield = 0;
                        }
                    }

                    if (finalDmg > 0) {
                        gainCausality(1 * (ally.efficiency || 1.0));
                    }

                    return { ...ally, hp: Math.max(0, ally.hp - finalDmg), shield: remainingShield };
                }
                return ally;
            });
        }
      }

      const { updatedAllies, damageToEnemy } = handleAllyActions({
          allies: currentAllies, 
          buffs: currentBuffs,
          shieldJustExpired,
          setBuffs,
          addLog,
          gainCausality,
      });

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
  }, [initialParty, userStats, hpMultiplier, setAllies, setBuffs, setEnemy, setEnemyWarning, addLog, gainCausality, isBattleStarted, isPaused]); // [수정] 의존성 배열에 isPaused 추가

  const useSkill = (type) => {
    // [수정] 일시정지 중에는 스킬 사용 불가
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
    // [New] 전투 시작 시 일시정지 해제 보장
    setIsPaused(false); 
    addLog("--- 전투가 시작됩니다 ---", "system");
  };

  // [수정] isPaused, togglePause 반환 추가
  return { 
    logs, allies, enemy, playerCausality, enemyWarning, buffs, 
    useSkill, startBattle, isBattleStarted,
    isPaused, togglePause 
  };
}