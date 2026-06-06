import React, { useState, useEffect, useMemo } from 'react';
import { Scroll, ArrowLeft } from 'lucide-react';

// Sub Components
import StoryViewer from './event/StoryViewer';
import ChoicePanel from './event/ChoicePanel';
import CodeNameInput from './event/CodeNameInput';
import KeywordToast from './event/KeywordToast'; // [New] 분리된 컴포넌트 import

// Hooks & Data
import { getStoryEvent } from '../data/storyRegistry';
import useEventBGM from '../hooks/event/useEventBGM';

// Common Components
import GameHeader from "./common/GameHeader"; 
import PauseMenu from "./common/PauseMenu";

// 씬 타입에 따른 화면 단계(phase) 결정
const phaseForScene = (scene) => {
  if (!scene) return 'story';
  if (scene.type === 'choice') return 'choice';
  if (scene.type === 'input') return 'input';
  return 'story';
};

// 텍스트 내 {name} 플레이스홀더를 코드 네임(닉네임)으로 치환
const applyNickname = (text, nickname) => {
  if (!text) return text;
  return text.replace(/\{name\}/g, nickname || '관측자');
};

export default function EventScreen({ 
  activeEventId = 'prologue', 
  onOptionSelected, 
  onEventComplete, 
  onUnlockKeyword, 
  collectedKeywords, 
  userStats,
  partyList,
  nickname,
  onSetNickname,
  navigate 
}) {
  // --- State ---
  const [eventData, setEventData] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [history, setHistory] = useState([]);
  const [newKeyword, setNewKeyword] = useState(null); 
  
  // 파티 보유 스킬 (중복 제거, { name, level } 형태)
  const partySkills = useMemo(() => {
    if (!partyList) return [];
    const count = {};
    partyList.forEach(char => {
      (char.skills || []).forEach(name => {
        count[name] = (count[name] || 0) + 1;
      });
    });
    return Object.entries(count).map(([name, level]) => ({ name, level }));
  }, [partyList]);

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
      setPhase(phaseForScene(data.scenes[0]));
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
        setHistory(prev => [...prev, {
          ...currentScene,
          text: applyNickname(currentScene.text, nickname),
          speaker: applyNickname(currentScene.speaker, nickname),
        }]);
    }

    if (currentScene.isEnd) {
      onEventComplete(currentScene.nextAction);
      return;
    }

    if (currentSceneIndex < eventData.scenes.length - 1) {
        const nextIdx = currentSceneIndex + 1;
        setCurrentSceneIndex(nextIdx);
        setPhase(phaseForScene(eventData.scenes[nextIdx]));
    } else {
        onEventComplete();
    }
  };

  // 풀 스킵: 현재 씬부터 다음 분기점(선택지/입력) 또는 이벤트 종료(전투 진입 등)까지 한 번에 건너뜀
  const handleSkip = () => {
    if (isPaused) return;
    if (!currentScene || !eventData) return;

    const scenes = eventData.scenes;
    const collected = [];

    const pushDialogue = (scene) => {
      if ((scene.type === 'script' || scene.type === 'monologue' || scene.type === 'question') && scene.text) {
        collected.push({
          ...scene,
          text: applyNickname(scene.text, nickname),
          speaker: applyNickname(scene.speaker, nickname),
        });
      }
    };

    let idx = currentSceneIndex;
    while (idx < scenes.length) {
      const scene = scenes[idx];
      pushDialogue(scene);

      // 이벤트 종료 지점(전투 진입/스토리 복귀 등) → 이벤트 완료
      if (scene.isEnd) {
        if (collected.length) setHistory(prev => [...prev, ...collected]);
        onEventComplete(scene.nextAction);
        return;
      }

      const nextIdx = idx + 1;
      // 더 이상 씬이 없으면 종료
      if (nextIdx >= scenes.length) {
        if (collected.length) setHistory(prev => [...prev, ...collected]);
        onEventComplete();
        return;
      }

      // 다음 씬이 분기점(선택지/코드네임 입력)이면 그 앞에서 멈춤
      const nextScene = scenes[nextIdx];
      if (nextScene.type === 'choice' || nextScene.type === 'input') {
        if (collected.length) setHistory(prev => [...prev, ...collected]);
        setCurrentSceneIndex(nextIdx);
        setPhase(phaseForScene(nextScene));
        return;
      }

      idx = nextIdx;
    }
  };

  // 코드 네임 입력 완료 → 전역 닉네임 연동 후 다음 씬으로 진행
  const handleCodeNameSubmit = (name) => {
    if (onSetNickname) onSetNickname(name);
    setHistory(prev => [...prev, { type: 'system', text: `[코드 네임 등록] ${name}`, speaker: 'Player' }]);

    if (currentScene?.isEnd) {
      onEventComplete(currentScene.nextAction);
      return;
    }

    if (currentSceneIndex < eventData.scenes.length - 1) {
        const nextIdx = currentSceneIndex + 1;
        setCurrentSceneIndex(nextIdx);
        setPhase(phaseForScene(eventData.scenes[nextIdx]));
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
            setPhase(phaseForScene(eventData.scenes[nextIndex]));
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
      {!isStoryMode && !isPaused && phase !== 'choice' && (
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
                    userStats={userStats}
                    partySkills={partySkills}
                    nickname={nickname}
                    onSkip={handleSkip}
                />
            )}
            {phase === 'input' && (
                <CodeNameInput 
                    key={currentScene.id}
                    script={currentScene} 
                    onSubmit={handleCodeNameSubmit} 
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