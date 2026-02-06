import React, { useState, useEffect, useRef } from 'react';
import { Scroll, ArrowLeft, AlertCircle, Key } from 'lucide-react';
import StoryViewer from './event/StoryViewer';
import ChoicePanel from './event/ChoicePanel';
import RewardPopup from './event/RewardPopup';
import { getStoryEvent } from '../data/storyRegistry';
import { ALL_KEYWORDS } from '../data/keywordData';
import useEventBGM from '../hooks/event/useEventBGM';

// [수정됨] 키워드 획득 알림 컴포넌트 (설명 기능 제거)
const KeywordToast = ({ keywordId, onClose }) => {
    const keyword = ALL_KEYWORDS.find(k => k.id === keywordId);

    if (!keyword) return null;

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-[90%] max-w-sm">
            <div 
                className="bg-slate-900/95 border border-emerald-500/50 rounded-lg p-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md cursor-pointer transition-all hover:bg-slate-800"
                onClick={onClose} // [수정] 클릭 시 설명 대신 팝업 닫기
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 flex-shrink-0">
                        <Key size={16} />
                    </div>
                    <div className="flex-1 min-w-0"> 
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">New Keyword Unlocked</p>
                        <p className="text-sm text-white font-bold truncate">{keyword.title}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function EventScreen({ 
    activeEventId = 'prologue', 
    onOptionSelected, 
    onEventComplete, 
    onUnlockKeyword, 
    collectedKeywords, 
    navigate 
}) {
  const [eventData, setEventData] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [history, setHistory] = useState([]);
  const [newKeyword, setNewKeyword] = useState(null); 

  // 데이터 로드
  useEffect(() => {
    const data = getStoryEvent(activeEventId);
    if (data) {
      setEventData(data);
      setCurrentSceneIndex(0);
      setPhase(data.scenes[0].type === 'choice' ? 'choice' : 'story');
    } else {
      setPhase('error');
    }
  }, [activeEventId]);

  const currentScene = eventData?.scenes[currentSceneIndex];

  // BGM 로직
  useEventBGM(currentScene);

  // 키워드 획득 체크
  useEffect(() => {
    if (currentScene && currentScene.keywordUnlock) {
        if (onUnlockKeyword) onUnlockKeyword(currentScene.keywordUnlock);
        setNewKeyword(currentScene.keywordUnlock);
        
        // 3초 뒤 자동 닫힘
        const timer = setTimeout(() => setNewKeyword(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [currentScene, onUnlockKeyword]);

  // --- 진행 로직 ---

  const handleNext = () => {
    if (!currentScene) return;
    
    // 로그 저장
    if ((currentScene.type === 'script' || currentScene.type === 'monologue' || currentScene.type === 'question') && currentScene.text) {
        setHistory(prev => [...prev, currentScene]);
    }

    if (currentScene.isEnd) {
      onEventComplete();
      return;
    }

    if (currentSceneIndex < eventData.scenes.length - 1) {
        const nextIdx = currentSceneIndex + 1;
        setCurrentSceneIndex(nextIdx);
        const nextScene = eventData.scenes[nextIdx];
        
        if (nextScene.type === 'choice') setPhase('choice');
        else setPhase('story');
    } else {
        onEventComplete();
    }
  };

  const handleChoice = (choice) => {
    if (choice.effect) onOptionSelected(choice.effect);
    
    setHistory(prev => [...prev, { type: 'system', text: `[선택] ${choice.text}`, speaker: 'Player' }]);

    if (choice.nextSceneId) {
        const nextIndex = eventData.scenes.findIndex(s => s.id === choice.nextSceneId);
        if (nextIndex !== -1) {
            setCurrentSceneIndex(nextIndex);
            setPhase(eventData.scenes[nextIndex].type === 'choice' ? 'choice' : 'story');
        } else {
            onEventComplete();
        }
    } else {
        handleNext();
    }
  };

  if (phase === 'loading') return <div className="text-white p-6">Loading...</div>;
  if (phase === 'error') return <div className="text-rose-400 p-6">Error loading event.</div>;

  const isStoryMode = phase === 'story' || (currentScene && currentScene.type === 'question');

  return (
    <div className={`flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] ${isStoryMode ? 'p-0' : 'p-6'}`}>
      
      {/* 키워드 획득 팝업 */}
      {newKeyword && <KeywordToast keywordId={newKeyword} onClose={() => setNewKeyword(null)} />}

      {!isStoryMode && (
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <button onClick={() => navigate && navigate('Home')} className="p-2 text-slate-400 hover:text-white"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-2 text-amber-200">
                <Scroll size={20} />
                <span className="font-bold tracking-widest text-sm truncate max-w-[200px]">{eventData.title}</span>
            </div>
            <div className="w-8"></div>
        </div>
      )}

      <div className={`flex-1 flex flex-col justify-center w-full mx-auto transition-all duration-500 ${isStoryMode ? 'max-w-full h-full' : 'max-w-lg'}`}>
        <div className={`w-full flex flex-col transition-all duration-500 ${isStoryMode ? 'h-full bg-black' : 'bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-2xl min-h-[300px]'}`}>
            {(phase === 'story' || (currentScene && currentScene.type === 'question')) && (
                <StoryViewer 
                    script={currentScene} 
                    history={history} 
                    onNext={handleNext} 
                />
            )}
            {phase === 'choice' && (
                <ChoicePanel 
                    choices={currentScene.choices} 
                    onSelect={handleChoice} 
                    collectedKeywords={collectedKeywords} 
                />
            )}
        </div>
      </div>
    </div>
  );
}