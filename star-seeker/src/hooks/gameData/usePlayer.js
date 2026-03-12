import { useState, useCallback } from 'react';
import { INITIAL_USER_STATS, getRequiredExp } from '../../data/gameData'; 

export default function usePlayer() {
  const [userStats, setUserStats] = useState(INITIAL_USER_STATS);
  const [hpMultiplier, setHpMultiplier] = useState(1.0);
  const [collectedKeywords, setCollectedKeywords] = useState([]);
  
  // [Fix] 초기 상태를 완전히 비워진 배열로 수정합니다! (아무것도 클리어하지 않은 태초의 상태)
  const [clearedNodes, setClearedNodes] = useState([]);

  const [levelInfo, setLevelInfo] = useState({ level: 1, exp: 0 });

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

  const completeStoryNode = useCallback((nodeId) => {
    setClearedNodes(prev => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId];
    });
  }, []);

  const addExp = useCallback((amount) => {
    setLevelInfo(prev => {
        let newExp = prev.exp + amount;
        let newLevel = prev.level;
        let required = getRequiredExp(newLevel);

        while (newExp >= required) {
            newExp -= required;
            newLevel += 1;
            required = getRequiredExp(newLevel);
            console.log(`[LEVEL UP!] 현재 레벨: ${newLevel}`); 
        }

        return { level: newLevel, exp: newExp };
    });
  }, []);

  return {
    userStats,
    hpMultiplier,
    collectedKeywords,
    clearedNodes,       
    levelInfo,        
    unlockKeyword,
    updateOption,
    completeStoryNode,  
    addExp            
  };
}