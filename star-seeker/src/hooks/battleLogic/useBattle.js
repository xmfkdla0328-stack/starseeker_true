import { useRef, useState, useCallback } from 'react'; // useEffect 제거됨 (useBattleLoop로 이동)
import useBattleState from './useBattleState';
import useBattleLoop from './useBattleLoop'; 

export default function useBattle(initialParty, userStats, hpMultiplier, onGameEnd, enemyId) {
  // 1. 전투 상태 (State)
  const {
    logs, allies, setAllies, enemy, setEnemy, 
    playerCausality, setPlayerCausality,
    enemyWarning, setEnemyWarning, 
    buffs, setBuffs, 
    addLog, gainCausality
  } = useBattleState(initialParty, userStats, hpMultiplier, enemyId);

  // 2. UI 제어 상태 (UI State)
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [battleEvents, setBattleEvents] = useState([]);
  const [cutInInfo, setCutInInfo] = useState(null);
  
  // 3. 최신 상태 참조용 Refs (루프 내부용)
  const pendingResultRef = useRef(null);
  
  // [핵심] Ref 동기화: 렌더링될 때마다 즉시 최신값 반영 (useEffect 사용 X)
  // 이렇게 해야 컷신 종료 후 리렌더링될 때 useBattleLoop가 즉시 최신 데이터를 볼 수 있음
  const alliesRef = useRef(allies);
  alliesRef.current = allies;

  const buffsRef = useRef(buffs);
  buffsRef.current = buffs;

  const enemyRef = useRef(enemy);
  enemyRef.current = enemy;

  // 4. 게임 루프 실행 (Custom Hook)
  useBattleLoop({
    initialParty,
    onGameEnd,
    isBattleStarted,
    isPaused,
    cutInInfo,
    setCutInInfo,
    pendingResultRef,
    setBattleEvents,
    // Refs & Setters 전달
    alliesRef,
    buffsRef,
    enemyRef,
    setAllies,
    setBuffs,
    setEnemy,
    setEnemyWarning,
    addLog,
    gainCausality
  });

  // 5. 이벤트 핸들러 (UI Interaction)
  const togglePause = useCallback((forceState) => {
    setIsPaused(prev => forceState !== undefined ? forceState : !prev);
  }, []);

  const handleCutInComplete = useCallback(() => {
    setCutInInfo(null); // 이 호출로 리렌더링 발생 -> useBattleLoop 재실행
    
    if (pendingResultRef.current) {
        const { updatedAllies, damageToEnemy, tickEvents } = pendingResultRef.current;
        
        // 상태 업데이트
        setAllies(updatedAllies);
        // [중요] Ref도 강제 동기화 (다음 틱 루프를 위해)
        alliesRef.current = updatedAllies; 
        
        if (damageToEnemy > 0) {
            setEnemy(e => {
                const newHp = Math.max(0, e.hp - damageToEnemy);
                if (enemyRef.current) enemyRef.current = { ...e, hp: newHp }; // Ref 동기화

                if (newHp <= 0 && !e.isDead) {
                    addLog("적을 처치했습니다! 승리!", "system");
                    onGameEnd('win');
                    return { ...e, hp: newHp, isDead: true };
                }
                return { ...e, hp: newHp };
            });
        }
        
        // 패배 판정
        if (updatedAllies.length > 0 && updatedAllies.every(a => a.hp <= 0)) {
            addLog("패배...", "system");
            onGameEnd('lose');
        }

        if (tickEvents && tickEvents.length > 0) {
             setBattleEvents(tickEvents);
        }
        
        pendingResultRef.current = null;
    }
  }, [setAllies, setEnemy, addLog, onGameEnd]);

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