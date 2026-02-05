import { useEffect, useRef } from 'react';

export default function useEventBGM(currentScene) {
  const audioRef = useRef(new Audio());
  const currentBgmSrc = useRef(null);

  // 초기 설정 및 정리
  useEffect(() => {
    audioRef.current.volume = 0.5;
    audioRef.current.loop = true;

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  // 씬 변경 감지 및 재생
  useEffect(() => {
    if (!currentScene) return;

    const nextBgm = currentScene.bgm;

    // (A) 새로운 BGM -> 교체 재생
    if (nextBgm && nextBgm !== currentBgmSrc.current) {
        audioRef.current.src = nextBgm;
        audioRef.current.play().catch(e => console.log("Auto-play prevented:", e));
        currentBgmSrc.current = nextBgm;
    }
    // (B) BGM 끄기 -> 정지
    else if (nextBgm === null || nextBgm === "") {
        audioRef.current.pause();
        currentBgmSrc.current = null;
    }
    // (C) 언급 없음 -> 유지
  }, [currentScene]);
}