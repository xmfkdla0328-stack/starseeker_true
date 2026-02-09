import { useEffect, useRef } from 'react';

// [수정] volume, isMuted 파라미터 추가 (기본값 설정)
export default function useEventBGM(currentScene, volume = 0.5, isMuted = false) {
  const audioRef = useRef(new Audio());
  const currentBgmSrc = useRef(null);

  // 초기 설정 및 정리
  useEffect(() => {
    audioRef.current.loop = true;
    // 초기 볼륨 설정
    audioRef.current.volume = isMuted ? 0 : volume;

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  // [New] 볼륨 및 음소거 상태 실시간 반영
  useEffect(() => {
    if (audioRef.current) {
        // 음소거면 0, 아니면 설정된 볼륨값 적용
        audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 씬 변경 감지 및 재생 (기존 로직 유지)
  useEffect(() => {
    if (!currentScene) return;

    const nextBgm = currentScene.bgm;

    // (A) 새로운 BGM -> 교체 재생
    if (nextBgm && nextBgm !== currentBgmSrc.current) {
        audioRef.current.src = nextBgm;
        // 볼륨 설정 후 재생
        audioRef.current.volume = isMuted ? 0 : volume; 
        audioRef.current.play().catch(e => console.log("Auto-play prevented:", e));
        currentBgmSrc.current = nextBgm;
    }
    // (B) BGM 끄기 -> 정지
    else if (nextBgm === null || nextBgm === "") {
        audioRef.current.pause();
        currentBgmSrc.current = null;
    }
    // (C) 언급 없음 -> 유지
  }, [currentScene]); // 의존성 배열에 volume을 넣지 않음 (재생 중 볼륨만 조절하기 위함)
}