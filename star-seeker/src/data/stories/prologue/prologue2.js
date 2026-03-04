// 파일 경로: src/data/stories/prologue/prologue2.js

export const prologue2_event = {
  // [핵심 1] 앞서 꼬리표로 달아둔 다음 스토리 ID와 정확히 일치해야 합니다!
  id: 'evt_prologue_2', 
  title: '서장: 잔해 속에서',
  type: 'story', 
  scenes: [
    { 
      // [1] 전투 직후의 여운을 살리는 첫 화면
      id: 1, 
      type: 'monologue', 
      text: "거친 숨을 몰아쉬며, 당신은 무너져 내리는 적의 잔해를 바라본다.", 
      speaker: "???", 
      bg: "ruin_entrance",
      effect: "shake", // 전투의 여파
    },
    { 
      id: 2, 
      type: 'script', 
      text: "드디어…! 드디어 놈이 쓰러졌어, 관측자!", 
      speaker: "에키드나",
      characterImage: "/images/characters/ekidna_normal.png",
      bg: "ruin_entrance",
    },
    { 
      id: 3, 
      type: 'script', 
      text: "…그럴리가….", 
      speaker: "관측자",
      characterImage: "/images/characters/OrigineNoel.png",
      bg: "ruin_entrance",
    },
    { 
      id: 4, 
      type: 'monologue', 
      text: "이렇게 쉽게 쓰러질 상대가 아니다.", 
      speaker: "???",
      bg: "ruin_entrance",
    },
    { 
      id: 5, 
      type: 'monologue', 
      text: "당신은 모공이 송연해지는 것을 느낀다.", 
      speaker: "???",
      bg: "ruin_entrance",
    },
    { 
      id: 6, 
      type: 'script', 
      text: "조심해, 에키드나! 이렇게 끝이 날 놈이 아니─.", 
      speaker: "관측자",
      characterImage: "/images/characters/OrigineNoel.png",
      bg: "ruin_entrance",
    },
    {
    id: 7, 
    type: 'monologue', 
    text: "", 
    speaker: "???", 
    bg: "ruin_entrance",
    effect: "shake", // 전투의 여파
    },
    { 
      id: 8, 
      type: 'script', 
      text: "…!!", 
      speaker: "관측자",
      characterImage: "/images/characters/OrigineNoel.png",
      bg: "ruin_entrance",
    },
    { 
      id: 9, 
      type: 'script', 
      text: "관측자!", 
      speaker: "에키드나",
      characterImage: "/images/characters/ekidna_normal.png",
      bg: "ruin_entrance",
    },
    {
      id: 10, 
      type: 'monologue', 
      text: "", 
      speaker: "???", 
      bg: "ruin_entrance",
      effect: "shake", // 전투의 여파
    },
    { 
      // [마지막 씬] 스토리가 완전히 끝났을 때의 처리
      id: 4, 
      type: 'monologue',
      text: "이렇게 쉽게 쓰러질 상대가 아니다.", 
      speaker: "???", 
      bg: "black",
      isEnd: true, 
      // [핵심 2] 스토리가 끝나면 어디로 갈지 정해줍니다. 
      // 여기서는 다시 스토리 선택창(사건의 지평선)으로 돌아가게 세팅해 두었습니다.
      nextAction: 'story_node_select' 
    }
  ]
};