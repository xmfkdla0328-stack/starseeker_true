import React, { useState, useEffect } from 'react';
import { Scroll, ArrowLeft } from 'lucide-react';

// Sub Components
import StoryViewer from './event/StoryViewer';
import ChoicePanel from './event/ChoicePanel';
import KeywordToast from './event/KeywordToast'; // [New] 분리된 컴포넌트 import

// Hooks & Data
import { getStoryEvent } from '../data/storyRegistry';
import useEventBGM from '../hooks/event/useEventBGM';

// Common Components
import GameHeader from "./common/GameHeader"; 
import PauseMenu from "./common/PauseMenu";

export default function EventScreen({ 
  activeEventId = 'prologue', 
  onOptionSelected, 
  onEventComplete, 
  onUnlockKeyword, 
  collectedKeywords, 
  navigate 
}) {
  // --- State ---
  const [eventData, setEventData] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [history, setHistory] = useState([]);
  const [newKeyword, setNewKeyword] = useState(null); 
  
  // 일시정지 및 설정 상태
  const [isPaused, setIsPaused] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // --- Effects ---
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

  // BGM 재생
  useEventBGM(currentScene, bgmVolume, isMuted);

  // 키워드 해금 체크
  useEffect(() => {
    if (currentScene && currentScene.keywordUnlock) {
        if (onUnlockKeyword) onUnlockKeyword(currentScene.keywordUnlock);
        setNewKeyword(currentScene.keywordUnlock);
        const timer = setTimeout(() => setNewKeyword(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [currentScene, onUnlockKeyword]);

  // --- Handlers ---
  const handleNext = () => {
    if (!currentScene) return;
    if (isPaused) return;

    if ((currentScene.type === 'script' || currentScene.type === 'monologue' || currentScene.type === 'question') && currentScene.text) {
        setHistory(prev => [...prev, currentScene]);
    }

    if (currentScene.isEnd) {
      onEventComplete(currentScene.nextAction);
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
    if (isPaused) return; 

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

  const handleRetreat = () => {
    if (window.confirm("이벤트를 중단하고 나가시겠습니까?")) {
        navigate('Home'); 
    }
  };

  // --- Render ---
  if (phase === 'loading') return <div className="text-white p-6">Loading...</div>;
  if (phase === 'error') return <div className="text-rose-400 p-6">Error loading event.</div>;

  const isStoryMode = phase === 'story' || (currentScene && currentScene.type === 'question');

  return (
    <div className={`flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] ${isStoryMode ? 'p-0' : 'p-6'}`}>
      
      {/* 1. Header & Pause Menu */}
      {!isPaused && (
        <GameHeader onPause={() => setIsPaused(true)} />
      )}

      {isPaused && (
        <PauseMenu 
            onResume={() => setIsPaused(false)}
            onRetreat={handleRetreat}
            bgmVolume={bgmVolume}
            setBgmVolume={setBgmVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
        />
      )}

      {/* 2. Notification */}
      {newKeyword && <KeywordToast keywordId={newKeyword} onClose={() => setNewKeyword(null)} />}

      {/* 3. Navigation Bar (Non-Story Mode) */}
      {!isStoryMode && !isPaused && (
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <button onClick={() => navigate && navigate('Home')} className="p-2 text-slate-400 hover:text-white"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-2 text-amber-200">
                <Scroll size={20} />
                <span className="font-bold tracking-widest text-sm truncate max-w-[200px]">{eventData.title}</span>
            </div>
            <div className="w-8"></div>
        </div>
      )}

      {/* 4. Main Event Area */}
      <div className={`flex-1 flex flex-col justify-center w-full mx-auto transition-all duration-500 ${isStoryMode ? 'max-w-full h-full' : 'max-w-lg'}`}>
        <div className={`w-full flex flex-col transition-all duration-500 ${isStoryMode ? 'h-full bg-black' : 'bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-2xl min-h-[300px]'}`}>
            {(phase === 'story' || (currentScene && currentScene.type === 'question')) && (
                <StoryViewer 
                    script={currentScene} 
                    history={history} 
                    onNext={handleNext} 
                    paused={isPaused} 
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