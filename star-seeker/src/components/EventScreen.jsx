import React, { useState, useEffect, useRef } from 'react';
import { Scroll, ArrowLeft, AlertCircle } from 'lucide-react';
import StoryViewer from './event/StoryViewer';
import ChoicePanel from './event/ChoicePanel';
import RewardPopup from './event/RewardPopup';
import { getStoryEvent } from '../data/storyRegistry';

export default function EventScreen({ activeEventId = 'prologue', onOptionSelected, onEventComplete, navigate }) {
  const [eventData, setEventData] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [phase, setPhase] = useState('loading');
  
  // 지난 대사(Log) 저장용 배열
  const [history, setHistory] = useState([]);

  // --------------------------------------------------------
  // [BGM 시스템] 오디오 객체 관리
  // --------------------------------------------------------
  const audioRef = useRef(new Audio()); 
  const currentBgmSrc = useRef(null);   

  useEffect(() => {
    audioRef.current.volume = 0.5; 
    audioRef.current.loop = true;  

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const data = getStoryEvent(activeEventId);
    if (data) {
      setEventData(data);
      setCurrentSceneIndex(0);
      const firstScene = data.scenes[0];
      setPhase(firstScene.type === 'choice' ? 'choice' : 'story');
    } else {
      console.error(`Event ID [${activeEventId}] not found.`);
      setPhase('error');
    }
  }, [activeEventId]);

  const currentScene = eventData?.scenes[currentSceneIndex];

  // [BGM 시스템] 씬 변경 시 BGM 체크 및 재생 로직
  useEffect(() => {
    if (!currentScene) return;

    const nextBgm = currentScene.bgm;

    if (nextBgm && nextBgm !== currentBgmSrc.current) {
        audioRef.current.src = nextBgm;
        audioRef.current.play().catch(e => console.log("Audio play prevented (Interact needed):", e));
        currentBgmSrc.current = nextBgm;
    }
    else if (nextBgm === null || nextBgm === "") {
        audioRef.current.pause();
        currentBgmSrc.current = null;
    }
  }, [currentScene]);

  // --- 진행 로직 ---

  const handleNext = () => {
    if (!currentScene) return;
    
    // 로그 저장 (단, UI 숨김 모드이거나 내용이 없는 씬은 저장하지 않음)
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
    
    setHistory(prev => [...prev, { 
        type: 'system', 
        text: `[선택] ${choice.text}`, 
        speaker: 'Player' 
    }]);

    if (choice.nextSceneId) {
        const nextIndex = eventData.scenes.findIndex(s => s.id === choice.nextSceneId);
        if (nextIndex !== -1) {
            setCurrentSceneIndex(nextIndex);
            const nextScene = eventData.scenes[nextIndex];
            setPhase(nextScene.type === 'choice' ? 'choice' : 'story');
        } else {
            console.error("Next scene not found:", choice.nextSceneId);
            onEventComplete();
        }
    } else {
        handleNext();
    }
  };

  if (phase === 'loading') return <div className="text-white p-6">데이터 로딩 중...</div>;
  if (phase === 'error') return (
    <div className="text-rose-400 p-6 flex flex-col items-center justify-center h-full">
        <AlertCircle size={48} className="mb-4"/>
        <p>이벤트 데이터를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('Home')} className="mt-4 px-4 py-2 bg-slate-700 rounded">돌아가기</button>
    </div>
  );

  const isStoryMode = phase === 'story' || (currentScene && currentScene.type === 'question');

  return (
    <div className={`flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a]
        ${isStoryMode ? 'p-0' : 'p-6'}`}>
      
      {!isStoryMode && (
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <button onClick={() => navigate && navigate('Home')} className="p-2 text-slate-400 hover:text-white">
                <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-amber-200">
            <Scroll size={20} />
            <span className="font-bold tracking-widest text-sm truncate max-w-[200px]">
                {eventData.title}
            </span>
            </div>
            <div className="w-8"></div>
        </div>
      )}

      <div className={`flex-1 flex flex-col justify-center w-full mx-auto transition-all duration-500
          ${isStoryMode ? 'max-w-full h-full' : 'max-w-lg'}`}>
        
        <div className={`w-full flex flex-col transition-all duration-500
            ${isStoryMode 
                ? 'h-full bg-black'
                : 'bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-2xl min-h-[300px]'}`}>
            
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
                />
            )}

        </div>
      </div>
    </div>
  );
}