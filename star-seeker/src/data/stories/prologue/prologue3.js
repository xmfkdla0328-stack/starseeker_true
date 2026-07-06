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
      speaker: "System", bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 4, type: 'question',
      text: "당신의 코드 네임은 무엇입니까?",
      speaker: "System", bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 5, type: 'input',
      prompt: "나를 부르는 말은?",
      placeholder: "N03L",
      confirmText: "이 코드 네임이 맞습니까?",
    },
    {
      id: 6, type: 'script',
      text: "「{name}」. 대상자가 입력한 코드 네임 확인. 저장되었습니다.",
      speaker: "System", bg: "/images/background/배경_01_요람.png",
    },
        {
      id: 7, type: 'script',
      text: "대상자의 자아인지 상의 외형을 확인합니다.",
      speaker: "System", bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 8, type: 'image_reveal',
      text: "외형 출력 완료, 해당 외형이 맞습니까?",
      speaker: "System", bg: "/images/background/배경_01_요람.png",
      image: "/images/excutseen/excutseen_01_외형확인.png",
    },

       {
      id: 9,
      type: 'choice',
      choices: [
        {
          id: 'use_power',
          text: `외형 확인 완료.`,
          type: 'risk',
          riskText: '아마도 이 모습이 맞는 것 같다',
          nextSceneId: 10,
          condition: { type: 'keyword', id: 'kw_causality', name: '인과력' }
        }
      ]
    },

    {
      id: 10, type: 'script',
      text: "대상자의 외형 인지가 확인되었습니다.",
      speaker: "System", bg: "/images/background/배경_01_요람.png",
    },
     {
      id: 11, type: 'script',
      text: "자아인지 정상 작동 여부 검사 결과, 정확도 수치 83% 출력. 작동 가능 수준으로 확인, 해치를 개방합니다.",
      speaker: "System", bg: "/images/background/배경_01_요람.png",
    },
     {
      id: 12, type: 'script',
      hideUI: true, 
      effect: "warp_white",
      bg: "/images/background/배경_01_요람.png",
    },
    {
      id: 13, type: 'script',
      text: "…여긴….",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 14, type: 'monologue',
      text: "당신은 가물가물한 눈을 들어 주변을 돌아보지만, 무언가 거대한 유리 수조같은 것의 실루엣만을 간신히 확인할 뿐.\n그 이상의 것들은 조명 하나 없는 어둠때문에 보지 못합니다.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 15, type: 'monologue',
      text: "그러나 그럼에도, 당신은 막연하게 확신합니다.\n이 곳은 당신에게 있어 너무나도 익숙한 곳입니다.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 16, type: 'script',
      text: "…그런데 왜 이렇게 어둡지?",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 17, type: 'monologue',
      text: "당신의 기억이 맞다면, 이 곳은 본래 이렇게 어두울 리가 없는 곳입니다.\n오히려 각각의 기계와 조명이 발하는 빛으로 시설 내의 인공 낮과 밤에 상관 없이 늘 밝아야 하는 곳입니다.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 18, type: 'monologue',
      text: "혹시 시설에 무언가 문제라도 생긴 것일까요? 그렇다고 한다면 왜, 어떻게, 누가?\n그러나 당신에게 원인에 대해 생각해볼 여유는 주어지지 않았습니다.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png",
    },
    {
      id: 19, type: 'monologue',
      text: "무언가 두껍고 단단한 것이 부서진 듯한 굉음과 함께, 당신은 큰 충격을 느끼며 등 뒤의 벽에 처박힙니다.",
      speaker: "{name}", bg: "/images/background/배경_02_요람밖.png", effect: "shake",
    },
    {
      id: 20, type: 'monologue',
      text: "강렬한 충격에 폐에서 빠져나온 공기가 입 밖으로 튀어나오고, 눈알이 빠져나올 것만 같습니다.\n그리고 무엇보다도, 돌 혹은 '그것'이 지닌 길쭉한 관에 스친 눈에서 화끈거리는 고통이 올라옵니다.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 21, type: 'script',
      text: "컥, 이, 거 놔…!!",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 22, type: 'monologue',
      text: "있는 힘껏 팔과 다리를 흔들며 저항해보지만, 당신을 포박한 그것에 비해 당신의 힘은 너무나도 미약합니다.\n당신의 미약한 저항을 비웃듯, 그것은 또 다른 길쭉한 관을 뻗어 당신의 배를 찌릅니다.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 23, type: 'monologue',
      text: "당신의 뱃 속 내부 장기를 다치게 하여, 당신을 사망에 이르게 하려 한 것일까요?\n유감스럽게도, 아닙니다.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 22, type: 'monologue',
      text: "그것은 당신에게서 무언가를 '흡수'하고 있습니다.\n그리고 그것이 경험이나 데이터, 정보, 혹은 기억이라고 부르는 것이라는 것을, 당신은 이 시설을 부르는 말을 떠올리지 못하게 된 시점에서 깨닫습니다.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 23, type: 'script',
      text: "…!!",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 24, type: 'monologue',
      text: "순식간에 수많은 기억들이 잊혀집니다. 아니, 사라집니다.\n이 시설을 부르는 이름, 익히 알고 지내왔던 이들의 이름, 당신의 이름, 그리고-당신이 지닌 사명까지도.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 25, type: 'monologue',
      text: "이러한 상황에서, 당신은 어떻게 하겠습니까?",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 26,
      type: 'choice',
      choices: [
        {
          id: 'resist',
          text: "부상을 감수하고,\n저항한다.",
          nextSceneId: 27,
        },
        {
          id: 'conform',
          text: "순응하여,\n부상을 피한다.",
          nextSceneId: 30,
        }
      ]
    },
    {
      id: 27, type: 'monologue',
      text: "이런 상황에서 합리적인 선택은, 기억보단 목숨을 우선시하는 것일 겁니다.\n그러나 당신은 알 수 없는-아니, 알 수 없게된 이유로 그를 거부합니다.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 28, type: 'monologue',
      text: "소리를 지르고, 붙잡힌 팔과 다리를 있는 힘껏 휘젓고, 고개를 젓습니다.\n당신의 거친 저항에, 그것이 언뜻 주춤하는 것을 느낄 수 있습니다.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 29, type: 'monologue',
      text: "───.\n그것이 소리를 냅니다. 말이었던 것 같기도 하고, 울음소리였던 것 같기도 하며, 비명이었던 것 같기도 합니다.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 30, type: 'monologue',
      text: "그러나 그것은 잠시간이었을 뿐.\n다시금 머리를 옥죈 관으로부터, 기억이 뽑혀나가는 것을 느끼며 당신이 비명을 지르려던 순간─.",
      speaker: "{name}", bg: "/images/cutsceen/cutsceen_01_기억상실.png",
    },
    {
      id: 31, type: 'monologue',
      text: "뚜벅, 하고. 발소리가 들려옵니다.",
      speaker: "{name}",
      bg: "/images/cutsceen/cutsceen_02_임시구조.png",
    },
    {
      id: 32, type: 'script',
      text: "───.\n이건 상정 외의 상황이군요."
      speaker: "누군가",
      bg: "/images/cutsceen/cutsceen_03_사과나무의용.png",
    },

  ],
};
