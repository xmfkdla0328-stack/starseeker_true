// 파일 경로: src/data/stories/prologue/prologue3.js

export const prologue3_event = {
  id: 'evt_prologue_3',
  title: '서장: 이름 없는 무덤',
  type: 'story',
  scenes: [
    {
      id: 1, type: 'monologue',
      text: "...스템 동기화....",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 2, type: 'monologue',
      text: "...888회차 각성을 시도합니다.",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 3, type: 'script',
      text: "대상자의 자아 인지를 확인합니다.",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 4, type: 'question',
      text: "당신의 코드 네임은 무엇입니까?",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
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
      speaker: "???", bg: "/images/background/배경_01_요람.png",
    },
        {
      id: 7, type: 'script',
      text: "대상자의 자아인지 상의 외형을 확인합니다.",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 8, type: 'image_reveal',
      text: "외형 출력 완료, 해당 외형이 맞습니까?",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
      image: "/images/excutseen/excutseen_01_외형확인.png",
    },
    {
      id: 9, type: 'script',
      text: "대상자의 자아 인지 상의 외형이 확인되었습니다.",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
    },
     {
      id: 10, type: 'script',
      text: "자아인지 정상 작동 여부 검사 결과, 정확도 수치 83% 출력. 작동 가능 수준으로 확인, 해치를 개방합니다.",
      speaker: "???", bg: "/images/background/배경_01_요람.png",
    },
     {
      id: 11, type: 'script',
      hideUI: true, 
      effect: "warp_white",
      bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 12, type: 'script',
      text: "…여긴….",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 13, type: 'monologue',
      text: "조명이 없어 캄캄하여 당장 코 앞도 보기가 힘들지만, 곧 깨닫는다.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 14, type: 'monologue',
      text: "이 곳은 내게 익숙한 곳이다.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 15, type: 'script',
      text: "…그런데 왜─.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
  ],
};
