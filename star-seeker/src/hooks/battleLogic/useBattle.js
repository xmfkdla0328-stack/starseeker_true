import { useEffect, useRef, useState, useCallback } from 'react';
import { TICK_RATE } from '../../data/gameData';
import useBattleState from './useBattleState';
import { processBattleTick } from './battleTick';

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId) {
  // 1. 기본 상태 관리 Hook 사용
  const {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  } = useBattleState(initialParty, userStats, hpMultiplier, enemyId);

  // 2. 전투 제어 상태
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [battleEvents, setBattleEvents] = useState([]);
  const [cutInInfo, setCutInInfo] = useState(null);
  
  // 3. Refs (최신 상태 동기화용)
  const pendingResultRef = useRef(null); // 컷신 대기 중인 결과 저장
  const onGameEndRef = useRef(onGameEnd);
  const alliesRef = useRef(allies);
  const buffsRef = useRef(buffs);
  const enemyRef = useRef(enemy);

  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);
  
  // [Ref 동기화] 렌더링 시점마다 즉시 최신값 반영 (useEffect 의존성 제거 트릭)
  alliesRef.current = allies;
  buffsRef.current = buffs;
  enemyRef.current = enemy;

  // ----------------------------------------------------------
  // [Helper] 전투 결과(Next State)를 실제 State에 반영하고 승패를 판정하는 함수
  // 중복 코드를 제거하기 위해 별도 함수로 분리함
  // ----------------------------------------------------------
  const applyBattleResult = useCallback((result) => {
    const { nextAllies, nextEnemy, tickEvents, nextBuffs } = result;

    // 1. 이펙트 출력
    if (tickEvents && tickEvents.length > 0) {
        setBattleEvents(tickEvents);
    }

    // 2. 상태 업데이트
    setAllies(nextAllies);
    if (nextBuffs) setBuffs(nextBuffs);
    
    if (nextEnemy) {
        setEnemy(nextEnemy);
        setEnemyWarning(nextEnemy.isCharging);
    }

    // 3. 승패 판정
    // (1) 승리
    if (nextEnemy && nextEnemy.hp <= 0 && !nextEnemy.isDead) {
        addLog("적을 처치했습니다! 승리!", "system");
        if (onGameEndRef.current) onGameEndRef.current('win');
        setEnemy(e => ({ ...e, isDead: true }));
        setIsBattleStarted(false); // 전투 종료 처리
    }
    
    // (2) 패배
    if (nextAllies.length > 0 && nextAllies.every(a => a.hp <= 0)) {
        addLog("패배...", "system");
        if (onGameEndRef.current) onGameEndRef.current('lose');
        setIsBattleStarted(false); // 전투 종료 처리
    }
  }, [setAllies, setBuffs, setEnemy, setEnemyWarning, addLog]);


  // ----------------------------------------------------------
  // [Handler] 컷신 종료 후 보류되었던 결과 처리
  // ----------------------------------------------------------
  const handleCutInComplete = useCallback(() => {
    setCutInInfo(null);
    
    if (pendingResultRef.current) {
        // 보류해뒀던 결과를 그대로 적용 (중복 로직 제거됨)
        applyBattleResult(pendingResultRef.current);
        pendingResultRef.current = null;
    }
  }, [applyBattleResult]);


  // ----------------------------------------------------------
  // [Core] 메인 게임 루프 (setInterval)
  // ----------------------------------------------------------
  useEffect(() => {
    // 실행 조건 체크: 시작 안 함 / 일시 정지 / 컷신 진행 중 / 파티 없음 -> 루프 스킵
    if (!isBattleStarted || isPaused || cutInInfo || !initialParty || initialParty.length === 0) return;

    const interval = setInterval(() => {
      // 1. 순수 로직 계산 (battleTick.js)
      const result = processBattleTick({
          currentAllies: alliesRef.current,
          currentBuffs: buffsRef.current,
          currentEnemy: enemyRef.current,
          addLog,
          gainCausality
      });

      // 2. 컷신 트리거 체크
      if (result.triggeredSkillInfo) {
          setCutInInfo(result.triggeredSkillInfo);
          pendingResultRef.current = result; // 계산 결과를 Ref에 임시 저장 (화면 멈춤)
          return; // 루프의 이번 턴 반영 중단
      }

      // 3. 일반 진행: 계산 결과 즉시 반영
      applyBattleResult(result);

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [
    isBattleStarted, isPaused, cutInInfo, initialParty, 
    addLog, gainCausality, applyBattleResult
  ]);


  // ----------------------------------------------------------
  // [Interaction] 사용자 액션 (스킬 사용, 일시정지 등)
  // ----------------------------------------------------------
  const togglePause = useCallback((forceState) => {
    setIsPaused(prev => forceState !== undefined ? forceState : !prev);
  }, []);

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