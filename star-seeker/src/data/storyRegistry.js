// 파일 경로: src/data/storyRegistry.js

import { prologue_event } from './stories/prologue/prologue1';
// [NEW] 새로 만든 prologue2.js를 불러옵니다.
import { prologue2_event } from './stories/prologue/prologue2'; 
// [NEW] 코드 네임 입력이 포함된 prologue3.js를 불러옵니다.
import { prologue3_event } from './stories/prologue/prologue3'; 

export const STORY_DATABASE = {
  'evt_prologue_start': prologue_event,
  // [NEW] 'evt_prologue_2'라는 이름표로 보관함에 등록합니다!
  'evt_prologue_2': prologue2_event, 
  // [NEW] '이름 없는 무덤' 노드가 가리키는 이벤트입니다.
  'evt_prologue_3': prologue3_event, 
};

export const getStoryEvent = (eventId) => {
  return STORY_DATABASE[eventId] || null;
};