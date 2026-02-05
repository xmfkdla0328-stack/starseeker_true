import React, { useState, useEffect } from 'react';
import { Scroll, ArrowLeft, AlertCircle } from 'lucide-react';
import StoryViewer from './event/StoryViewer';
import ChoicePanel from './event/ChoicePanel';
import RewardPopup from './event/RewardPopup'; // 기존 경로 유지
import { getStoryEvent } from '../data/storyRegistry';
import useEventBGM from '../hooks/event/useEventBGM'; // [New] BGM 훅

export default function EventScreen({ activeEventId = 'prologue', onOptionSelected, onEventComplete, navigate }) {
  const [eventData, setEventData] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [history, setHistory] = useState([]);

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

  // [New] BGM 로직은 훅으로 위임 (한 줄로 끝!)
  useEventBGM(currentScene);

  // --- 진행 핸들러 ---
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
        setPhase(nextScene.type === 'choice' ? 'choice' : 'story');
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
                <StoryViewer script={currentScene} history={history} onNext={handleNext} />
            )}
            {phase === 'choice' && <ChoicePanel choices={currentScene.choices} onSelect={handleChoice} />}
        </div>
      </div>
    </div>
  );
}