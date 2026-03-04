import { useState, useCallback } from 'react';
import { INITIAL_USER_STATS } from '../../data/gameData'; 

export default function usePlayer() {
  const [userStats, setUserStats] = useState(INITIAL_USER_STATS);
  const [hpMultiplier, setHpMultiplier] = useState(1.0);
  const [collectedKeywords, setCollectedKeywords] = useState([]);
  
  // [NEW] 유저가 클리어한 스토리 노드 ID를 추적합니다. (기본으로 시작점 제공)
  const [clearedNodes, setClearedNodes] = useState(['node_start']);

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

  // [NEW] 전투나 스토리가 끝났을 때 해당 노드를 '클리어 처리'하는 함수
  const completeStoryNode = useCallback((nodeId) => {
    setClearedNodes(prev => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId];
    });
  }, []);

  return {
    userStats,
    hpMultiplier,
    collectedKeywords,
    clearedNodes,       // [NEW] 내보내기
    unlockKeyword,
    updateOption,
    completeStoryNode   // [NEW] 내보내기
  };
}