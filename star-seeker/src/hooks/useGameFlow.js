import { useState, useCallback } from 'react';
import { EQUIP_SLOTS, generateEquipment } from '../data/equipmentData';

/**
 * 게임 화면 전환 흐름(전투 진입/종료/재시도/후퇴/리브, 스토리 이벤트, 채굴 등)
 * 관련 state와 핸들러를 모아둔 커스텀 훅.
 *
 * 원래 App.jsx 안에 있던 flow 관련 코드를 그대로 옮긴 것입니다.
 * 동작은 변경되지 않으며, 단지 App.jsx의 가독성을 위해 분리했습니다.
 *
 * @param {object} nav  useGameNavigation()의 반환값
 * @param {object} data useGameData()의 반환값
 */
export default function useGameFlow(nav, data) {
  // ---- State ----
  const [currentEnemyId, setCurrentEnemyId] = useState(null);
  const [battleType, setBattleType] = useState('story');
  const [battleRewards, setBattleRewards] = useState([]);
  const [nextEventId, setNextEventId] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);

  // [Fix] BattleScreen이 'active' ↔ 'win'/'lose' 전환 시 언마운트되지 않아
  //       인트로 effect가 재실행되지 않고 startBattle()이 호출되지 않는 문제 해결.
  //       전투를 새로 시작할 때마다 이 값을 증가시켜 React key로 강제 리마운트한다.
  const [battleSessionId, setBattleSessionId] = useState(0);
  const startNewBattleSession = useCallback(() => {
    setBattleSessionId(prev => prev + 1);
  }, []);

  // ---- Handlers ----
  const handleContentSelect = (contentType) => {
    if (contentType === 'story') nav.goStorySelect();
    else if (contentType === 'mining') nav.goMiningSelect();
  };

  const handleDirectMining = () => {
    nav.goDirectMiningSelect();
  };

  const handleStartMiningBattle = (type) => {
    let enemyId = 'guardian';

    let newBattleType = 'mining_chip';
    if (type === 'stone') newBattleType = 'mining_stone';
    else if (type === 'gear' || type === 'core') newBattleType = 'mining_gear';

    setCurrentEnemyId(enemyId);
    setBattleType(newBattleType);
    setNextEventId(null);
    startNewBattleSession();
    nav.goBattle();
  };

  const handleAutoMiningEntry = () => {
    nav.goResult('auto_mining');
  };

  // [Fix] 노드 ID도 같이 받아서 기억해둡니다.
  const handleStartStoryEvent = (eventId, nodeId) => {
    setNextEventId(eventId);
    if (nodeId) setCurrentNodeId(nodeId);
    nav.goEvent();
  };

  const onGameEnd = useCallback((result) => {
    if (result === 'win') {
      if (data.addExp) data.addExp(50);

      if (battleType === 'mining_chip') {
        const rewardAmount = Math.floor(Math.random() * 2) + 4;
        data.addResource('chip_basic', rewardAmount);
        setBattleRewards([{ id: 'chip_basic', name: '데이터 보강칩', count: rewardAmount }]);
      }
      else if (battleType === 'mining_stone') {
        const rewardAmount = Math.floor(Math.random() * 2) + 1;
        data.addResource('causality_stone', rewardAmount);
        setBattleRewards([{ id: 'causality_stone', name: '인과석', count: rewardAmount }]);
      }
      else if (battleType === 'mining_gear') {
        const dropCount = Math.floor(Math.random() * 2) + 3;
        const newItems = [];
        const miningSlotKeys = ['SLOT_1', 'SLOT_2'];

        for (let i = 0; i < dropCount; i++) {
          const randomSlotKey = miningSlotKeys[Math.floor(Math.random() * miningSlotKeys.length)];
          const slotType = EQUIP_SLOTS[randomSlotKey];

          const generatedItem = generateEquipment(slotType);
          data.addEquipment(generatedItem);

          newItems.push({
            id: generatedItem.id,
            name: generatedItem.name,
            count: 1,
            rarity: generatedItem.rarity
          });
        }
        setBattleRewards(newItems);
      }
      else {
        setBattleRewards([]);
      }
    } else {
      setBattleRewards([]);
    }

    // [Fix] 전투 직후에 엉뚱한 ID를 클리어 기록에 넣던 버그 로직을 삭제했습니다!

    nav.goResult(result);
  }, [nav, battleType, data, nextEventId]);

  const handleEventComplete = (nextAction) => {
    if (data.addExp) data.addExp(20);

    if (typeof nextAction === 'string') {
      if (nextAction.startsWith('battle:')) {
        const parts = nextAction.split(':');
        const enemyId = parts[1];
        const nextEvtId = parts[2] || null;

        setCurrentEnemyId(enemyId);
        setBattleType('story');
        setNextEventId(nextEvtId);
        startNewBattleSession();
        nav.goBattle();
      }
      else if (nextAction === 'story_node_select') {
        // [Fix] 스토리가 완전히 끝났을 때! 우리가 진입했던 진짜 노드 ID에 도장을 찍습니다.
        if (currentNodeId && data.completeStoryNode) {
          data.completeStoryNode(currentNodeId);
        }
        nav.goStoryNodeSelect();
      }
      else {
        nav.goHome();
      }
    } else {
      if (currentNodeId && data.completeStoryNode) {
        data.completeStoryNode(currentNodeId);
      }
      nav.goHome();
    }
  };

  const handleRetryBattle = () => {
    startNewBattleSession();
    nav.goBattle();
  };

  const handleBattleRetreat = () => {
    if (battleType === 'story') {
      setNextEventId(null);
      nav.goStoryNodeSelect();
    } else if (battleType.startsWith('mining')) {
      nav.goDirectMiningSelect();
    } else {
      nav.goSelect();
    }
  };

  const handleLeaveBattle = () => {
    if (battleType === 'story' && nextEventId) {
      nav.goEvent();
    }
    else if (battleType.startsWith('mining')) {
      nav.goDirectMiningSelect();
    }
    else {
      nav.goHome();
    }
  };

  // ---- 외부에 노출 ----
  const battleState = {
    currentEnemyId,
    battleType,
    battleRewards,
    isStoryChain: !!nextEventId,
    battleSessionId
  };

  const handlers = {
    handleContentSelect,
    handleDirectMining,
    handleStartMiningBattle,
    handleAutoMiningEntry,
    handleStartStoryEvent,
    onGameEnd,
    handleEventComplete,
    handleRetryBattle,
    handleLeaveBattle,
    handleBattleRetreat
  };

  return {
    battleState,
    handlers,
    nextEventId
  };
}
