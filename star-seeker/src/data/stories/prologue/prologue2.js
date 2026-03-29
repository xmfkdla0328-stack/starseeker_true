// 파일 경로: src/data/stories/prologue/prologue2.js

export const prologue2_event = {
  id: 'evt_prologue_2', 
  title: '서장: 잔해 속에서',
  type: 'story', 
  scenes: [
    { 
      id: 1, type: 'monologue', 
      text: "거친 숨을 몰아쉬며, 당신은 무너져 내리는 적의 잔해를 바라본다.", 
      speaker: "???", bg: "ruin_entrance", effect: "shake", 
    },
    { 
      id: 2, type: 'script', text: "드디어…! 드디어 놈이 쓰러졌어, 관측자!", speaker: "에키드나", characterImage: "/images/characters/mainImage/list/ekidnaList.png", bg: "ruin_entrance",
    },
    { 
      id: 3, type: 'script', text: "…그럴리가….", speaker: "관측자", characterImage: "/images/characters/mainImage/list/noeloriginList.png", bg: "ruin_entrance",
    },
    { 
      id: 4, type: 'monologue', text: "이렇게 쉽게 쓰러질 상대가 아니다.", speaker: "???", bg: "ruin_entrance",
    },
    { 
      id: 5, type: 'monologue', text: "당신은 모공이 송연해지는 것을 느낀다.", speaker: "???", bg: "ruin_entrance",
    },
    { 
      id: 6, type: 'script', text: "조심해, 에키드나! 이렇게 끝이 날 놈이 아니─.", speaker: "관측자", characterImage: "/images/characters/mainImage/list/noeloriginList.png", bg: "ruin_entrance",
    },
    {
      id: 7, type: 'monologue', text: "쿠구구구궁...!", speaker: "???", bg: "ruin_entrance", effect: "shake",
    },
    { 
      // [NEW] 1. 발끝부터 머리까지 천천히 위로 훑어보는 씬
      id: 8, type: 'monologue', 
      text: "짙은 흙먼지를 뚫고, 거대한 붉은 안광이 서서히 모습을 드러낸다.", 
      speaker: "???", bg: "ruin_entrance",
      centerImage: "/images/enemy/disaster.png",
      centerImageEffect: "pan-up" // 우리가 만든 훑어보기 애니메이션 트리거!
    },
    { 
      // [NEW] 2. 훑어보기가 끝나고 전체 모습을 온전히 마주하는 씬
      id: 9, type: 'monologue', 
      text: `당신은 보지 않고도 깨닫는다.
      그것은 죽지 않았다. 아니, 죽은 적이 없고, 없을 것이다.`, 
      speaker: "???", bg: "ruin_entrance",
      centerImage: "/images/enemy/disaster.png" 
    },
    {
      // [NEW] 3. 에키드나의 비명 (화면이 흔들리며 붉게 점멸)
      id: 10, type: 'script', 
      text: "관측자!!!", 
      speaker: "에키드나", characterImage: "/images/characters/mainImage/list/ekidnaList.png", 
      bg: "red_alert", effect: "shake",
      centerImage: "/images/enemy/disaster.png"
    },
    { 
      // [NEW] 4. 순식간에 암전 (UI 숨김 + 화면 즉시 까맣게 덮음 + 1.5초 대기)
      id: 11, type: 'monologue', text: "", speaker: "???", bg: "black", 
      hideUI: true, 
      effect: "blackout", 
      duration: 1500 
    },
    { 
      // 5. 암전 여운을 남긴 후 깔끔하게 종료
      id: 12, type: 'monologue', text: "", speaker: "???", bg: "black", hideUI: true,
      isEnd: true, nextAction: 'story_node_select' 
    }
  ]
};