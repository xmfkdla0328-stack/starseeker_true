// 파일 경로: src/data/stories/prologue/prologue3.js

export const prologue3_event = {
  id: 'evt_prologue_3',
  title: '서장: 이름 없는 무덤',
  type: 'story',
  scenes: [
    {
      id: 1, type: 'monologue',
      text: "...스템 동기화....",
      speaker: "???", bg: "black",
    },
    {
      id: 2, type: 'monologue',
      text: "...888회차 각성을 시도합니다.",
      speaker: "???", bg: "black",
    },
    {
      id: 3, type: 'script',
      text: "대상자의 자아 인지를 확인합니다.",
      speaker: "???", bg: "black",
    },
    {
      id: 4, type: 'question',
      text: "당신의 코드 네임은 무엇입니까?",
      speaker: "???", bg: "black",
    },
    {
      id: 5, type: 'input',
      prompt: "나를 부르는 말은 무엇인가?",
      placeholder: "코드 네임 입력...",
      confirmText: "이 코드 네임이 맞습니까?",
    },
    {
      id: 6, type: 'script',
      text: "「{name}」. 대상자가 입력한 코드 네임 확인. 저장되었습니다.",
      speaker: "???", bg: "black",
    },
    {
      id: 7, type: 'script',
      text: "대상자의 자아인지 상의 외형을 확인합니다.",
      speaker: "???", bg: "black",
      isEnd: true, nextAction: 'story_node_select',
    },
  ],
};
