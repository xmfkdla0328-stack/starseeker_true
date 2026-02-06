export const prologue_event = {
  id: 'evt_prologue_start',
  title: '서장: 불시착',
  type: 'story', 
  scenes: [
    { 
      // [1] 암전 화면 (3초 자동 대기)
      id: 1, 
      type: 'script', 
      bg: "black",
      hideUI: true, // 대사창 숨김
      text: "",     // 내용 없음
      duration: 3000, // 3초 후 자동 넘어감
    },
    { 
      // [2] 심리 묘사 (Monologue)
      id: 2, 
      type: 'script', // 스타일 변경: 이탤릭, 회색, 명조체
      text: "…또 다시…", 
      speaker: "???", 
      bg: "black",
      bgm: "/audio/bgm/The_maze_of_aqua.mp3" // 여기서 음악 시작
    },
    { 
      // [3] 심리 묘사 (Monologue)
      id: 3, 
      type: 'script', 
      text: "…무의미한 시도일지라도….", 
      speaker: "???", 
      bg: "red_alert"
    },
    { 
      // [4] 심리 묘사 (Monologue)
      id: 4, 
      type: 'monologue',
      text: "사지가 불타는 것 같다.", 
      speaker: "???", 
      bg: "red_alert",
      effect: "heartbeat" // 심장 박동 연출
    },
    { 
      // [5] 독백 (줄바꿈 포함)
      id: 5, 
      type: 'monologue',
      text: `연신 눈 앞이 번쩍거리는 것을 무시하고, 몸의 상태를 관조한다.
일단 생명 유지에 필수적인 장기들은 대다수 건재하다.`, 
      speaker: "???", 
      bg: "red_alert",
    },
    { 
      // [6] 독백 (줄바꿈 포함)
      id: 6, 
      type: 'monologue',
      text: `비록 신체 말단 부위는 감각이 소실되었지만.
그래도 신체를 지탱하고, 일으켜 세우는 것은 가능하다.
이 정도면 충분하다. 한차례 크게 숨을 마시고, 몸을 일으켜 세운다.`, 
      speaker: "???", 
      bg: "red_alert",
    },
    { 
      // [7] 일반 대사 (Script) - 여기서부터 UI 스타일 복귀
      id: 7, 
      type: 'script', 
      text: "관측자!", 
      speaker: "누군가",
      characterImage: "/images/characters/ekidna_normal.png",
      bg: "ruin_entrance"
    },
    { 
      // [8] 일반 대사 (Script) - 여기서부터 UI 스타일 복귀
      id: 8, 
      type: 'script', 
      text: "에키드나.", 
      speaker: "???",
      characterImage: "/images/characters/noel_normal.png",
      bg: "ruin_entrance"
    },
    { 
      // [9] 일반 대사 (Script) - 여기서부터 UI 스타일 복귀
      id: 9, 
      type: 'script', 
      text: `잠시만, 잠시만 기다려.
내가 곧바로 신체 복구용 키트를─.`, 
      speaker: "에키드나",
      characterImage: "/images/characters/ekidna_normal.png",
      bg: "ruin_entrance"
    },
    { 
      // [10] 심리 묘사 (Monologue)
      id: 10, 
      type: 'monologue',
      text: "의도적으로 그의 말을 끊고 끼어들었다.", 
      speaker: "???", 
      bg: "ruin_entrance",
    },
    { 
      // [11] 일반 대사 (Script) - 여기서부터 UI 스타일 복귀
      id: 11, 
      type: 'script', 
      text: "에키드나, 지금은 그런 것에 신경을 쓸 때가 아니야.", 
      speaker: "???",
      characterImage: "/images/characters/noel_normal.png",
      bg: "red_alert",
      effect: "heartbeat" // 심장 박동 연출
    },
    { 
      // [12] 심리 묘사 (Monologue)
      id: 12, 
      type: 'monologue',
      text: "에키드나의 얼굴이 단번에 굳었다.", 
      speaker: "???", 
      bg: "ruin_entrance",
    },
    { 
      // [13] 일반 대사 (Script) - 여기서부터 UI 스타일 복귀
      id: 13, 
      type: 'script', 
      text: "그게 무슨.", 
      speaker: "에키드나",
      characterImage: "/images/characters/ekidna_normal.png",
      bg: "ruin_entrance"
    },
    {
      id: 14, 
      type: 'script', 
      text: "지금은 그보다 급한 일이 있잖아.", 
      speaker: "???",
      characterImage: "/images/characters/noel_normal.png",
      bg: "ruin_entrance",
    },
    { 
      id: 15, 
      type: 'monologue',
      text: "말과 함께 앞을 바라본다.", 
      speaker: "???", 
      bg: "ruin_entrance",
    },
    {
      id: 16, 
      type: 'monologue',
      text: "'앞을 바라본다.' 라고 말했지만, 사실 딱히 눈 앞이 보이진 않는다.", 
      speaker: "???", 
      bg: "red_alert",
    },
    {
    id: 17, 
      type: 'monologue',
      text: "어렴풋한 감일 뿐이지만, 아마 앞으로도 앞을 볼 가능성은 없을 것이다.", 
      speaker: "???", 
      bg: "red_alert",
    },
    {
      id: 18, 
      type: 'monologue',
      text: `그렇다 해도 상관 없다.
당장 필요로 하는 기관들은 정상적으로 작동하고 있다.
그 외의 것들은 지금 시점에서는 모두 소모재일 뿐이다.`, 
      speaker: "???", 
      bg: "red_alert",
    },
    {
      id: 19,
      type: 'script',
      text: `인과력을 감지하고, 다루는 데에는 아무런 문제도 없어.`,
      keywordUnlock: 'kw_causality',
      speaker: "???",
      characterImage: "/images/characters/noel_normal.png",
      bg: "ruin_entrance",
      highlight: ["인과력"] // [핵심] 이 속성을 추가하여 해당 단어만 색상을 변경합니다.
    },
    {
      id: 20,
      type: 'choice',
      choices: [
        {
          id: 'use_power',
          text: `인과력을 사용한다.`,
          type: 'risk',
          riskText: '<인과력> 키워드 필요',
          nextSceneId: 21,
          // [핵심] 조건: 인과력 키워드 보유 필수
          condition: { type: 'keyword', id: 'kw_causality', name: '인과력' }
        }
      ]
    },
    {
      // [21] 전투 돌입 전 특수 연출 화면 (Warp White 적용)
      id: 21,
      type: 'script',
      text: "", 
      bg: "ruin_entrance",
      hideUI: true, 
      effect: "warp_white", // [핵심] 하얀 빛으로 빨려들어가는 효과 적용
      duration: 2000, 
      isEnd: true 
    }
  ]
};