import { useState, useMemo } from 'react';

export default function useGameNavigation() {
  const [gameState, setGameState] = useState('home'); 

  const actions = useMemo(() => ({
    goHome: () => setGameState('home'),
    goSelect: () => setGameState('select'),
    goStorySelect: () => setGameState('story_select'),
    goMiningSelect: () => setGameState('mining_select'),
    
    // [New] 직접 채굴 단계 선택 화면으로 이동
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