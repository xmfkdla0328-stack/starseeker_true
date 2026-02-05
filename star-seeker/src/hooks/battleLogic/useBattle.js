import { useEffect, useRef } from 'react';
import { TICK_RATE } from '../../data/gameData';
import useBattleState from './useBattleState';
import { handleAllyActions } from './actionManager';
import { manageBuffs } from './buffManager';
import { handleEnemyActions } from './enemyActionManager';

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd) {
  const {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  } = useBattleState(initialParty, userStats, hpMultiplier);

  // --- Refs ---
  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  const alliesRef = useRef(allies);
  useEffect(() => { alliesRef.current = allies; }, [allies]);

  const buffsRef = useRef(buffs);
  useEffect(() => { buffsRef.current = buffs; }, [buffs]);

  const enemyRef = useRef(enemy);
  useEffect(() => { enemyRef.current = enemy; }, [enemy]);

  // --- 메인 게임 루프 ---
  useEffect(() => {
    if (!initialParty || initialParty.length === 0 || !onGameEndRef.current) return;

    const interval = setInterval(() => {
      // [수정 1] 이번 틱(Tick)에서 사용할 로컬 상태 변수 생성 (덮어쓰기 방지)
      let currentAllies = [...alliesRef.current];
      let currentBuffs = buffsRef.current;

      // 1. 버프 관리
      const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(currentBuffs, addLog);
      if (hasChanged) {
        setBuffs(updatedBuffs);
        currentBuffs = updatedBuffs; // 최신 버프 상태 반영
      }

      // 2. 적(Enemy) 행동 처리
      if (enemyRef.current && enemyRef.current.hp > 0) {
        const enemyContext = { 
            enemy: enemyRef.current, 
            allies: currentAllies, // 최신 아군 상태 전달
            addLog 
        };
        
        const { updatedEnemy, damageToAllies } = handleEnemyActions(enemyContext);

        if (updatedEnemy) {
            setEnemy(updatedEnemy);
            setEnemyWarning(updatedEnemy.isCharging); 
        }

        // [수정 2] 적 공격 데미지를 'currentAllies' 변수에 즉시 반영
        if (damageToAllies && damageToAllies.length > 0) {
            currentAllies = currentAllies.map(ally => {
                const hitInfo = damageToAllies.find(d => d.targetId == ally.id);
                
                if (hitInfo) {
                    let rawDmg = hitInfo.amount;
                    let def = ally.def || 0;
                    let finalDmg = Math.max(1, rawDmg - def);

                    // 피해 감소 버프
                    if (currentBuffs.damageReduction.active) {
                        const reductionRate = currentBuffs.damageReduction.val || 0;
                        finalDmg = Math.floor(finalDmg * (1 - reductionRate));
                    }

                    // 쉴드 계산
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

                    // 피격 시 인과력 획득
                    if (finalDmg > 0) {
                        gainCausality(1 * (ally.efficiency || 1.0));
                    }

                    // HP 변경 반영
                    return { ...ally, hp: Math.max(0, ally.hp - finalDmg), shield: remainingShield };
                }
                return ally;
            });
        }
      }

      // 3. 아군(Ally) 행동 처리
      // [수정 3] 적에게 맞아 HP가 깎인 상태인 'currentAllies'를 넘겨줍니다.
      const { updatedAllies, damageToEnemy } = handleAllyActions({
          allies: currentAllies, 
          buffs: currentBuffs,
          shieldJustExpired,
          setBuffs,
          addLog,
          gainCausality,
      });

      // 아군이 적에게 준 데미지 반영
      if (damageToEnemy > 0) {
          setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - damageToEnemy) }));
      }
      
      // [수정 4] 최종적으로 계산된 상태(적 데미지 + 아군 게이지 변화)를 한 번만 적용
      setAllies(updatedAllies);

      // 4. 승패 체크
      setEnemy(e => {
          if (e && e.hp <= 0 && !e.isDead) {
              addLog("적을 처치했습니다! 승리!", "system");
              if(onGameEndRef.current) onGameEndRef.current('win');
              return { ...e, isDead: true };
          }
          return e;
      });
      
      // updatedAllies(최신 상태)를 기준으로 패배 체크
      if (updatedAllies.length > 0 && updatedAllies.every(a => a.hp <= 0)) {
          addLog("모든 아군이 쓰러졌습니다... 패배", "system");
          if(onGameEndRef.current) onGameEndRef.current('lose');
      }

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [initialParty, userStats, hpMultiplier, setAllies, setBuffs, setEnemy, setEnemyWarning, addLog, gainCausality]); 

  // 유저 스킬 (인과력 소모)
  const useSkill = (type) => {
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

  return { logs, allies, enemy, playerCausality, enemyWarning, buffs, useSkill };
}