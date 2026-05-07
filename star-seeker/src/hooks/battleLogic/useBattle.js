import { useEffect, useRef, useState, useCallback } from 'react';
import { TICK_RATE } from '../../data/gameData';
import useBattleState from './useBattleState';
import { processBattleTick } from './battleTick';

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId) {
  // 1. 기본 상태 관리 Hook 사용
  const {
    logs, allies, setAllies, enemies, setEnemies, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality,
    battleMode, setBattleMode
  } = useBattleState(initialParty, userStats, hpMultiplier, enemyId);

  // [Step 7-b] 모드 토글 — useSkill과 동일한 정책: 컷인 진행 중에는 무시 (사용자 입력 일관성).
  // cutInInfo는 아래에서 선언되므로 함수 내부에서 closure로 참조하지 않고, 호출 시점의 ref로 체크.
  const cutInInfoRef = useRef(null);
  const toggleBattleMode = useCallback(() => {
    if (cutInInfoRef.current) return;
    setBattleMode(prev => prev === 'auto' ? 'manual' : 'auto');
  }, [setBattleMode]);

  // [Backward-compat] 외부(BattleScreen)와 일부 화면 코드에는 단일 enemy를 노출.
  //                   다중 적 UI는 step 3에서 도입 예정.
  const enemy = enemies && enemies.length > 0 ? enemies[0] : null;

  // 2. 전투 제어 상태
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [battleEvents, setBattleEvents] = useState([]);
  const [cutInInfo, setCutInInfo] = useState(null);
  
  // 3. Refs (최신 상태 동기화용)
  const pendingResultRef = useRef(null); // 컷신 대기 중인 결과 저장
  // [Step 5-2b-ii] 같은 틱에 여러 컷인이 쌓인 경우 순차 재생용 큐 (현재 표시 이후 분).
  // 큐가 모두 빌 때까지 pendingResultRef는 보류; 큐가 끝나야 데미지/효과 일괄 적용.
  const cutInQueueRef = useRef([]);
  const onGameEndRef = useRef(onGameEnd);
  const alliesRef = useRef(allies);
  const buffsRef = useRef(buffs);
  const enemiesRef = useRef(enemies);
  // [Step 7-b] battleMode도 setInterval tick에서 분기 시 stale closure를 피하려면 ref 동기화 필수.
  // 7-c (우선 타겟 마킹) / 7-d (ult 자동 발동 차단)에서 이 ref를 읽어 분기.
  const battleModeRef = useRef(battleMode);
  // 전투 종료(승/패) 한 번만 트리거되도록 보장
  const battleEndedRef = useRef(false);

  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);
  
  // [Ref 동기화] 렌더링 시점마다 즉시 최신값 반영 (useEffect 의존성 제거 트릭)
  alliesRef.current = allies;
  buffsRef.current = buffs;
  enemiesRef.current = enemies;
  battleModeRef.current = battleMode;
  cutInInfoRef.current = cutInInfo;

  // ----------------------------------------------------------
  // [Helper] 전투 결과(Next State)를 실제 State에 반영하고 승패를 판정하는 함수
  // 중복 코드를 제거하기 위해 별도 함수로 분리함
  // ----------------------------------------------------------
  const applyBattleResult = useCallback((result) => {
    const { nextAllies, nextEnemies, tickEvents, nextBuffs } = result;

    // 1. 이펙트 출력
    if (tickEvents && tickEvents.length > 0) {
        setBattleEvents(tickEvents);
    }

    // 2. 상태 업데이트
    setAllies(nextAllies);
    if (nextBuffs) setBuffs(nextBuffs);
    
    if (nextEnemies && nextEnemies.length > 0) {
        setEnemies(nextEnemies);
        // [Step 5-1] 보스가 충전 중일 때만 경고 표시 (잡몹 차징은 UI 알림 없음)
        setEnemyWarning(nextEnemies.some(e => e.isBoss && e.isCharging));
    }

    // 3. 승패 판정 (한 틱에 양쪽 KO 발생 시 승리 우선; 종료 콜백은 1회만)
    if (!battleEndedRef.current) {
      const allEnemiesDead = nextEnemies && nextEnemies.length > 0 
          && nextEnemies.every(e => e.hp <= 0);
      const allAlliesDead = nextAllies.length > 0 
          && nextAllies.every(a => a.hp <= 0);
      
      if (allEnemiesDead) {
          battleEndedRef.current = true;
          addLog("적을 처치했습니다! 승리!", "system");
          if (onGameEndRef.current) onGameEndRef.current('win');
          setEnemies(prev => prev.map(e => ({ ...e, isDead: true })));
          setIsBattleStarted(false);
      } else if (allAlliesDead) {
          battleEndedRef.current = true;
          addLog("패배...", "system");
          if (onGameEndRef.current) onGameEndRef.current('lose');
          setIsBattleStarted(false);
      }
    }
  }, [setAllies, setBuffs, setEnemies, setEnemyWarning, addLog]);


  // ----------------------------------------------------------
  // [Handler] 컷신 종료 후 처리
  // [Step 5-2b-ii] 큐에 다음 컷인이 있으면 그것을 표시 (pendingResult는 계속 보류).
  //                큐가 비었을 때만 보류된 결과를 한 번에 일괄 적용.
  // ----------------------------------------------------------
  const handleCutInComplete = useCallback(() => {
    if (cutInQueueRef.current.length > 0) {
        // 다음 컷인 표시 — setCutInInfo가 새 객체로 갱신되어 BattleCutIn의
        // useEffect가 cutInInfo 의존성으로 재실행되며 새 컷인이 시작됨.
        const next = cutInQueueRef.current.shift();
        setCutInInfo(next);
        return;
    }

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
      // [Step 5-2b-ii 픽스] React state 업데이트 race guard.
      // setCutInInfo는 비동기. setInterval 콜백이 여러 번 fire되면 React 커밋/useEffect
      // cleanup 전에 다음 틱이 돌아 pendingResultRef와 cutInInfo를 덮어씀.
      // 결과: 이전 컷인이 잠깐 떴다 새 컷인으로 갈아치워지고 이전 result 손실.
      // pendingResultRef가 살아있으면 = 큐 재생 중 = 새 틱 스킵 (동기 가드).
      if (pendingResultRef.current) return;

      // 1. 순수 로직 계산 (battleTick.js)
      const result = processBattleTick({
          currentAllies: alliesRef.current,
          currentBuffs: buffsRef.current,
          currentEnemies: enemiesRef.current,
          addLog,
          gainCausality
      });

      // 2. 컷신 트리거 체크
      // [Step 5-2b-ii] cutInQueue: 0~N개. 첫 항목 즉시 표시, 나머지는 cutInQueueRef에 보관해
      //                handleCutInComplete가 순차 소비. 큐가 빈 뒤에야 데미지 일괄 적용.
      if (result.cutInQueue && result.cutInQueue.length > 0) {
          const [first, ...rest] = result.cutInQueue;
          cutInQueueRef.current = rest;
          setCutInInfo(first);
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
    battleEndedRef.current = false; // 새 전투 시작 시 종료 트리거 리셋
    addLog("--- 전투가 시작됩니다 ---", "system");
  };

  return { 
    logs, allies, enemy, enemies, playerCausality, enemyWarning, buffs, 
    useSkill, startBattle, isBattleStarted,
    isPaused, togglePause,
    battleEvents,
    cutInInfo, 
    handleCutInComplete,
    battleMode, toggleBattleMode
  };
}