// 파일 경로: src/data/stories/prologue/prologue3.js

export const prologue3_event = {
  id: 'evt_prologue_3',
  title: '서장: 이름 없는 무덤',
  type: 'story',
  scenes: [
    {
      id: 1, type: 'monologue',
      text: "눈을 떴다. 끝을 알 수 없는 어둠 속, 차가운 비석들만이 줄지어 서 있다.",
      speaker: "???", bg: "black",
    },
    {
      id: 2, type: 'monologue',
      text: "이름 없는 무덤. 누구의 것도 아닌, 그러나 모두의 것인 장소.",
      speaker: "???", bg: "black",
    },
    {
      id: 3, type: 'script',
      text: "…드디어 깨어났군. 오랫동안 너를 기다렸다.",
      speaker: "???", bg: "black",
    },
    {
      id: 4, type: 'question',
      text: "너를 무엇이라 부르면 되겠나? 너의 코드 네임을 말해라.",
      speaker: "???", bg: "black",
    },
    {
      id: 5, type: 'input',
      prompt: "어둠 속의 목소리가 너의 이름을 묻는다.",
      placeholder: "코드 네임 입력...",
      confirmText: "이 코드 네임이 맞습니까?",
    },
    {
      id: 6, type: 'script',
      text: "「{name}」. 그래, 그것이 너의 이름이다. 이제부터 그 이름으로 새겨지리라.",
      speaker: "???", bg: "black",
    },
    {
      id: 7, type: 'script',
      text: "가거라, {name}. 너의 인과(因果)가 이곳에서 다시 시작된다.",
      speaker: "???", bg: "black",
      isEnd: true, nextAction: 'story_node_select',
    },
  ],
};
