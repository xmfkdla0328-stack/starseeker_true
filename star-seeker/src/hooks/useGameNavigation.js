import { useState } from 'react';

export default function useGameNavigation() {
  // gameState: 'home' | 'party' | 'manage' | 'storage' | 'guide' | 'gacha' | 'select' | 'story_select' | 'mining_select' | 'event' | 'active' | 'win' | 'lose'
  const [gameState, setGameState] = useState('home');

  const handlers = {
    goHome: () => setGameState('home'),
    goSelect: () => setGameState('select'),
    goParty: () => setGameState('party'),
    goManage: () => setGameState('manage'),
    goStorage: () => setGameState('storage'),
    goGuide: () => setGameState('guide'),
    goGacha: () => setGameState('gacha'),
    goStorySelect: () => setGameState('story_select'),
    goMiningSelect: () => setGameState('mining_select'),
    goEvent: () => setGameState('event'),
    goBattle: () => setGameState('active'),
    goResult: (result) => setGameState(result), // 'win' or 'lose'
  };

  return { gameState, ...handlers };
}