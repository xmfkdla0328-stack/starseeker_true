import { useEffect, useRef } from 'react';
import { TICK_RATE } from '../../data/gameData';
import { handleAllyActions } from './actionManager';
import { manageBuffs } from './buffManager';
import { handleEnemyActions } from './enemyActionManager';
import { calculateDamage } from './damageCalculator';

export default function useBattleLoop({
  // 실행 조건들
  isBattleStarted,
  isPaused,
  cutInInfo,
  
  // 상태 갱신 함수들
  setAllies,
  setBuffs,
  setEnemy,
  setEnemyWarning,
  setCutInInfo,
  setBattleEvents,
  addLog,
  gainCausality,
  onGameEnd,
  
  // 데이터 참조용 Refs (항상 최신값 보장)
  alliesRef,
  buffsRef,
  enemyRef,
  pendingResultRef,
}) {
  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  useEffect(() => {
    // 1. 실행 조건 체크 (전투 시작 전, 일시정지, 컷신 중이면 루프 정지)
    if (!isBattleStarted || isPaused || cutInInfo) return;

    const interval = setInterval(() => {
      // 2. Ref에서 최신 상태 가져오기 (매 틱마다 최신값 읽음)
      let currentAllies = [...alliesRef.current];
      let currentBuffs = buffsRef.current;
      let currentEnemy = enemyRef.current;
      
      const tickEvents = [];

      // --- [로직 1] 버프 관리 ---
      const { updatedBuffs, shieldJustExpired, hasChanged } = manageBuffs(currentBuffs, addLog);
      if (hasChanged) {
        setBuffs(updatedBuffs);
        currentBuffs = updatedBuffs; // 로컬 변수 업데이트
      }

      // --- [로직 2] 적의 행동 ---
      if (currentEnemy && currentEnemy.hp > 0) {
        const enemyContext = { enemy: currentEnemy, allies: currentAllies, addLog };
        const { updatedEnemy, damageToAllies } = handleEnemyActions(enemyContext);

        if (updatedEnemy) {
            setEnemy(updatedEnemy);
            setEnemyWarning(updatedEnemy.isCharging);
            currentEnemy = updatedEnemy; // 로컬 변수 업데이트
        }

        if (damageToAllies && damageToAllies.length > 0) {
            currentAllies = currentAllies.map(ally => {
                const hitInfo = damageToAllies.find(d => d.targetId == ally.id);
                if (hitInfo) {
                    const { finalDamage, remainingShield, isCrit } = calculateDamage(
                        currentEnemy, ally, hitInfo.amount, currentBuffs
                    );

                    if (finalDamage > 0 || hitInfo.amount > 0) {
                        tickEvents.push({
                            id: `evt_${Date.now()}_${Math.random()}`,
                            targetId: `ally-target-${ally.id}`,
                            value: finalDamage,
                            type: 'damage',
                            isCrit: isCrit || false
                        });
                    }

                    if (finalDamage > 0) gainCausality(1 * (ally.efficiency || 1.0));

                    return { ...ally, hp: Math.max(0, ally.hp - finalDamage), shield: remainingShield };
                }
                return ally;
            });
        }
      }

      // --- [로직 3] 아군의 행동 ---
      const { updatedAllies, damageToEnemy, triggeredSkillInfo } = handleAllyActions({
          allies: currentAllies,
          buffs: currentBuffs,
          shieldJustExpired,
          setBuffs,
          addLog,
          gainCausality,
      });

      // [핵심] 컷신 트리거 감지 -> 루프 중단 및 보류
      if (triggeredSkillInfo) {
          setCutInInfo(triggeredSkillInfo); // State 변경 -> 리렌더링 -> useEffect 재실행 -> 조건문에 걸려 루프 정지

          if (damageToEnemy > 0) {
              tickEvents.push({
                  id: `evt_ult_${Date.now()}`,
                  targetId: `enemy-target-main`,
                  value: damageToEnemy,
                  type: 'damage',
                  isCrit: true
              });
          }

          // 결과 보류
          pendingResultRef.current = {
              updatedAllies,
              damageToEnemy,
              tickEvents: [...tickEvents]
          };
          return; // 이번 틱 종료
      }

      // --- [로직 4] 일반 턴 처리 ---
      if (damageToEnemy > 0) {
          tickEvents.push({
              id: `evt_${Date.now()}_${Math.random()}`,
              targetId: `enemy-target-main`,
              value: damageToEnemy,
              type: 'damage',
              isCrit: false
          });
          setEnemy(e => ({ ...e, hp: Math.max(0, e.hp - damageToEnemy) }));
      }
      
      if (tickEvents.length > 0) setBattleEvents(tickEvents);
      setAllies(updatedAllies);

      // 승패 판정
      if (currentEnemy && currentEnemy.hp - damageToEnemy <= 0 && !currentEnemy.isDead && damageToEnemy > 0) {
          // 위에서 setEnemy를 했지만, 확실한 판정을 위해 여기서 체크
          // (비동기 state 업데이트 문제 방지 위해 로컬 변수 계산값 사용 가능)
      }
      
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
  }, [
    // [중요] 의존성 배열 관리: 
    // isBattleStarted, isPaused, cutInInfo가 바뀌면 루프가 재시작되거나 멈춥니다.
    isBattleStarted, isPaused, cutInInfo, 
    // 아래 함수들은 useCallback으로 감싸져 있거나 Ref라 변경되지 않음
    alliesRef, buffsRef, enemyRef, pendingResultRef,
    setAllies, setBuffs, setEnemy, setEnemyWarning, setCutInInfo, setBattleEvents, addLog, gainCausality
  ]);
}