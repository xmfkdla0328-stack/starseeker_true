import { prologue_event } from './stories/prologue';

// 여기에 import로 챕터들을 계속 추가하면 됩니다.
// import { chapter1_event } from './stories/chapter1';

export const STORY_DATABASE = {
  // ID를 키(Key)로 사용하여 데이터를 매핑합니다.
  'prologue': prologue_event,
  // 'chapter1': chapter1_event,
};

/**
 * 이벤트 ID를 받아 해당 스토리 데이터를 반환하는 함수
 */
export const getStoryEvent = (eventId) => {
  return STORY_DATABASE[eventId] || null;
};