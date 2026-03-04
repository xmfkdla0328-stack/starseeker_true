import { useState, useMemo } from 'react';

export default function useGameNavigation() {
  const [gameState, setGameState] = useState('home'); 

  const actions = useMemo(() => ({
    goHome: () => setGameState('home'),
    goSelect: () => setGameState('select'),
    goStorySelect: () => setGameState('story_select'),
    
    // [NEW] 스토리(인과의 나무) 노드 선택 화면으로 이동하는 길 추가!
    goStoryNodeSelect: () => setGameState('story_node_select'), 

    goMiningSelect: () => setGameState('mining_select'),
    goDirectMiningSelect: () => setGameState('mining_stage_select'),

    goParty: () => setGameState('party'),
    goManage: () => setGameState('manage'),
    goStorage: () => setGameState('storage'),
    goGuide: () => setGameState('guide'),
    goGacha: () => setGameState('gacha'),
    
    goEvent: () => setGameState('event'),
    goBattle: () => setGameState('active'),
    goResult: (result) => setGameState(result), 
  }), []);

  return { gameState, ...actions };
}