import { useCallback, useRef } from 'react';

/**
 * 길게 누름(long press) 감지 훅 — 터치/마우스/펜 모두 PointerEvent로 통합 처리.
 *
 * 사용:
 *   const handlers = useLongPress(() => openInspector(id), {
 *     delay: 500,
 *     onShortTap: () => fireUlt(id),  // (옵션) 임계 시간 전에 손을 떼면 호출
 *     moveThreshold: 10,              // (옵션) 이 px 이상 이동하면 취소
 *   });
 *   <div {...handlers}>...</div>
 *
 * 동작:
 *  - pointerdown: 타이머 시작
 *  - delay ms 경과 → onLongPress 호출 + 'fired' 플래그 셋 (이후 pointerup에서 onShortTap 무시)
 *  - 임계 시간 전에 pointerup → onShortTap 호출
 *  - pointermove가 moveThreshold를 넘거나 pointercancel/leave → 즉시 취소
 */
export default function useLongPress(onLongPress, options = {}) {
  const { delay = 500, onShortTap, moveThreshold = 10 } = options;

  const timerRef = useRef(null);
  const firedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback((e) => {
    firedRef.current = false;
    startRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 };
    clear();
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      timerRef.current = null;
      if (onLongPress) onLongPress(e);
    }, delay);
  }, [onLongPress, delay, clear]);

  const onPointerMove = useCallback((e) => {
    if (!timerRef.current) return;
    const dx = (e.clientX ?? 0) - startRef.current.x;
    const dy = (e.clientY ?? 0) - startRef.current.y;
    if (dx * dx + dy * dy > moveThreshold * moveThreshold) {
      clear();
    }
  }, [clear, moveThreshold]);

  const onPointerUp = useCallback((e) => {
    const wasPending = !!timerRef.current;
    clear();
    // 길게 누름이 이미 발화됐다면 짧은 탭 무시 (인스펙터 열린 뒤 손 뗌)
    if (firedRef.current) {
      firedRef.current = false;
      // 길게 누름으로 인스펙터가 열린 직후 부모 onClick이 또 트리거되는 것을 막음
      if (e && e.preventDefault) e.preventDefault();
      return;
    }
    if (wasPending && onShortTap) onShortTap(e);
  }, [clear, onShortTap]);

  const onPointerLeave = useCallback(() => { clear(); }, [clear]);
  const onPointerCancel = useCallback(() => { clear(); firedRef.current = false; }, [clear]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onPointerCancel };
}
