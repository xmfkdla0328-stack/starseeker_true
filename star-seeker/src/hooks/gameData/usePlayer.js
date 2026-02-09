import { useState, useCallback } from 'react';
import { INITIAL_USER_STATS } from '../../data/gameData'; // 경로 주의

export default function usePlayer() {
  const [userStats, setUserStats] = useState(INITIAL_USER_STATS);
  const [hpMultiplier, setHpMultiplier] = useState(1.0);
  const [collectedKeywords, setCollectedKeywords] = useState([]);

  const unlockKeyword = useCallback((keywordId) => {
    setCollectedKeywords(prev => {
      if (prev.includes(keywordId)) return prev; 
      return [...prev, keywordId];
    });
  }, []);

  const updateOption = useCallback(({ type, stat, value }) => {
    if (type === 'hp') setHpMultiplier(value);
    else if (type === 'stat') setUserStats(prev => ({ ...prev, [stat]: prev[stat] + value }));
  }, []);

  return {
    userStats,
    hpMultiplier,
    collectedKeywords,
    unlockKeyword,
    updateOption
  };
}