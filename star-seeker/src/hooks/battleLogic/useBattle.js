import { useEffect, useRef, useState, useCallback } from 'react';
import { TICK_RATE } from '../../data/gameData';
import useBattleState from './useBattleState';
import { processBattleTick } from './battleTick'; 

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
  const [battleEvents, setBattleEvents] = useState([]);
  const [cutInInfo, setCutInInfo] = useState(null);
  const pendingResultRef = useRef(null);

  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  // 최신 상태 유지를 위한 Refs
  const alliesRef = useRef(allies);
  const buffsRef = useRef(buffs);
  const enemyRef = useRef(enemy);

  // [Ref 동기화] 렌더링 시점마다 즉시 최신값 반영
  alliesRef.current = allies;
  buffsRef.current = buffs;
  enemyRef.current = enemy;

  const togglePause = useCallback((forceState) => {
    setIsPaused(prev => forceState !== undefined ? forceState : !prev);
  }, []);

  const handleCutInComplete = useCallback(() => {
    setCutInInfo(null);
    
    if (pendingResultRef.current) {
        const { nextAllies, nextEnemy, tickEvents } = pendingResultRef.current;
        
        // 1. 상태 업데이트
        setAllies(nextAllies);
        if (nextEnemy) setEnemy(nextEnemy); 

        // 2. 승패 판정
        if (nextEnemy && nextEnemy.hp <= 0 && !nextEnemy.isDead) {
             addLog("적을 처치했습니다! 승리!", "system");
             if(onGameEndRef.current) onGameEndRef.current('win');
             setEnemy(e => ({ ...e, isDead: true }));
        }
        
        if (nextAllies.length > 0 && nextAllies.every(a => a.hp <= 0)) {
            addLog("패배...", "system");
            if(onGameEndRef.current) onGameEndRef.current('lose');
        }

        // 3. 이펙트 출력
        if (tickEvents && tickEvents.length > 0) {
             setBattleEvents(tickEvents);
        }

        pendingResultRef.current = null;
    }
  }, [setAllies, setEnemy, addLog]);

  // --- 메인 게임 루프 ---
  useEffect(() => {
    if (!initialParty || initialParty.length === 0 || !onGameEndRef.current || !isBattleStarted || isPaused || cutInInfo) return;

    const interval = setInterval(() => {
      // [Logic] 순수 로직 함수 호출
      const result = processBattleTick({
          currentAllies: alliesRef.current,
          currentBuffs: buffsRef.current,
          currentEnemy: enemyRef.current,
          addLog,
          gainCausality
      });

      const { 
          nextAllies, nextBuffs, nextEnemy, 
          tickEvents, triggeredSkillInfo
      } = result;

      // [Case 1] 컷신 트리거 발생 -> 루프 정지 및 결과 보류
      if (triggeredSkillInfo) {
          setCutInInfo(triggeredSkillInfo);
          pendingResultRef.current = result; 
          return; 
      }

      // [Case 2] 일반 진행 -> 상태 즉시 반영
      if (tickEvents.length > 0) setBattleEvents(tickEvents);
      
      setAllies(nextAllies);
      setBuffs(nextBuffs); 
      
      // [Fix] 최적화 조건문 제거: 차징(Charging) 등 내부 상태 변화를 누락하지 않도록 무조건 업데이트
      if (nextEnemy) {
          setEnemy(nextEnemy);
          setEnemyWarning(nextEnemy.isCharging);
      }

      // 승패 판정
      if (nextEnemy && nextEnemy.hp <= 0 && !nextEnemy.isDead) {
          addLog("적을 처치했습니다! 승리!", "system");
          if(onGameEndRef.current) onGameEndRef.current('win');
          setEnemy(e => ({ ...e, isDead: true }));
      }
      
      if (nextAllies.length > 0 && nextAllies.every(a => a.hp <= 0)) {
          addLog("패배...", "system");
          if(onGameEndRef.current) onGameEndRef.current('lose');
      }

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [initialParty, userStats, hpMultiplier, setAllies, setBuffs, setEnemy, setEnemyWarning, addLog, gainCausality, isBattleStarted, isPaused, cutInInfo]);

  const useSkill = (type) => {
    if (!isBattleStarted || isPaused || cutInInfo) return;

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
    isPaused, togglePause,
    battleEvents,
    cutInInfo, 
    handleCutInComplete 
  };
}