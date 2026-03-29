export const prologue_event = {
  id: 'evt_prologue_start',
  title: '서장: 불시착',
  type: 'story', 
  scenes: [
    { 
      // [1] 암전 화면 (2초 자동 대기) - 무거운 침묵으로 시작
      id: 1, 
      type: 'script', 
      bg: "black",
      hideUI: true, 
      text: "",     
      duration: 2000, 
    },
    { 
      // [2] 심리 묘사
      id: 2, 
      type: 'script', 
      text: "…또 다시…", 
      speaker: "???", 
      bg: "black",
      bgm: "/audio/bgm/The_maze_of_aqua.mp3" 
    },
    { 
      // [3] 심리 묘사
      id: 3, 
      type: 'script', 
      text: "…무의미한 시도일지라도….", 
      speaker: "???", 
      bg: "black", // [연출 강화] 아직 눈을 뜨지 못함. 붉은 경고등은 다음 씬에서 번쩍이게 변경
    },
    { 
      // [4] [연출 강화] 플래시 효과와 화면 흔들림으로 눈을 떴을 때의 충격과 고통 표현
      id: 4, 
      type: 'monologue',
      text: "사지가 불타는 것만 같은, 강렬한 작열감이 당신을 장악한다.", 
      speaker: "???", 
      bg: "red_alert",
      effect: "flash_red_and_shake" // [NEW] 붉은 화면 번쩍임 + 흔들림
    },
    { 
      // [5] 독백
      id: 5, 
      type: 'monologue',
      text: `당신은 연신 눈 앞이 번쩍거리는 것을 무시하고, 몸의 상태를 확인한다.
일단 생명 유지에 필수적인 장기들은 대다수 건재하다.`, 
      speaker: "???", 
      bg: "red_alert",
      effect: "heartbeat" // [연출 강화] 심장 박동을 여기서 주어 생존 확인을 강조
    },
    { 
      // [6] 독백
      id: 6, 
      type: 'monologue',
      text: `비록 신체 말단 부위에서는 감각이 느껴지지 않지만.
신체를 지탱하고 일으켜 세우는 데에는 문제가 없다.`, 
      speaker: "???", 
      bg: "red_alert",
    },
    { 
      // [7] 일반 대사
      id: 7, 
      type: 'script', 
      text: "관측자!", 
      keywordUnlock: 'kw_observer',
      speaker: "누군가",
      characterImage: "/images/characters/mainImage/list/ekidnaList.png",
      bg: "ruin_entrance",
      highlight: ["관측자"] 
    },
    { 
      id: 8, 
      type: 'script', 
      text: "에키드나.", 
      speaker: "관측자",
      characterImage: "/images/characters/mainImage/list/noeloriginList.png",
      bg: "ruin_entrance"
    },
    { 
      id: 9, 
      type: 'script', 
      text: `너…상태가…! 잠시만 기다려.
내가 곧바로 신체 복구용 키트를─.`, 
      speaker: "에키드나",
      characterImage: "/images/characters/mainImage/list/ekidnaList.png",
      bg: "ruin_entrance",
      effect: "shake" // [연출 강화] 다급한 에키드나의 목소리에 맞춰 가벼운 흔들림
    },
    { 
      id: 10, 
      type: 'monologue',
      text: "당신은 의도적으로 그의 말을 끊고 끼어든다.", 
      speaker: "???", 
      bg: "ruin_entrance",
    },
    { 
      id: 11, 
      type: 'script', 
      text: "에키드나, 지금은 그보다 급한 일이 있어.", 
      speaker: "관측자",
      characterImage: "/images/characters/mainImage/list/noeloriginList.png",
      bg: "red_alert",
      effect: "heartbeat" 
    },
    { 
      id: 12, // [Fix] 기존 13번이었던 id 넘버링 오류 수정
      type: 'script', 
      text: "그게 무슨.", 
      speaker: "에키드나",
      characterImage: "/images/characters/mainImage/list/ekidnaList.png",
      bg: "ruin_entrance"
    },
    {
      id: 13, 
      type: 'script', 
      text: "그것이 여전히 살아 있어.", 
      speaker: "관측자",
      characterImage: "/images/characters/mainImage/list/noeloriginList.png",
      bg: "ruin_entrance",
    },
    { 
      id: 14, 
      type: 'monologue',
      text: "당신은 말과 함께 앞을 바라본다.", 
      speaker: "???", 
      bg: "ruin_entrance",
    },
    {
      id: 15, 
      type: 'monologue',
      text: "'앞을 바라본다.' 라고 말했지만, 사실 딱히 눈 앞이 보이진 않는다.", 
      speaker: "???", 
      bg: "black", // [연출 강화] 이 대사와 함께 배경화면이 암전되면서 시각 상실을 유저가 직접 체감
      effect: "glitch" // [NEW] 지지직거리는 노이즈 이펙트로 신경계 손상 표현
    },
    {
      id: 16, 
      type: 'monologue',
      text: "어렴풋한 감일 뿐이지만, 아마 앞으로도 앞을 볼 가능성은 없을 것이다.", 
      speaker: "???", 
      bg: "black", 
    },
    {
      id: 17,
      type: 'script',
      text: `인과력을 감지하고, 다루는 데에는 아무런 문제도 없어.`,
      keywordUnlock: 'kw_causality',
      speaker: "관측자",
      characterImage: "/images/characters/mainImage/list/noeloriginList.png",
      bg: "black", // 계속 어두운 상태 유지
      highlight: ["인과력"] 
    },
    {
      id: 18,
      type: 'script',
      text: `지금 그게 문제가…`,
      speaker: "에키드나",
      characterImage: "/images/characters/mainImage/list/ekidnaList.png",
      bg: "black",
    },
    {
      id: 19,
      type: 'script',
      text: `에키드나, 내 몸은 내가 제일 잘 알아.`,
      speaker: "관측자",
      characterImage: "/images/characters/mainImage/list/noeloriginList.png",
      bg: "black",
    },
    {
      id: 20,
      type: 'script',
      text: `….`,
      speaker: "에키드나",
      characterImage: "/images/characters/mainImage/list/ekidnaList.png",
      bg: "black",
    },
    {
      id: 21, 
      type: 'monologue',
      text: `화를 눌러 삼키는 기색으로, 에키드나는 당신의 앞에 선다.`, 
      speaker: "???", 
      bg: "red_alert", // [연출 강화] 보이지 않지만 분위기와 감각으로 인지함. 다시 붉은 경고등이 희미하게 들어오는 느낌.
    },
    {
      id: 22, 
      type: 'monologue',
      text: `보이진 않지만, 알 수 있다.
당신은 감사를 전하는 대신, 인과력의 파도 너머를 향해 고개를 든다.`, 
      speaker: "???", 
      bg: "red_alert",
    },
    {
      id: 23, 
      type: 'monologue',
      text: `그곳에, 지금까지 무의미한 것을 알면서도 싸워온 이유가 있다.`, 
      speaker: "???", 
      bg: "red_alert",
      effect: "heartbeat_fast" // [NEW] 전투 임박, 심박수 증가
    },
    {
      id: 24, 
      type: 'script',
      text: `가자.`, 
      speaker: "관측자", 
      characterImage: "/images/characters/mainImage/list/noeloriginList.png",
      bg: "red_alert",
    },
    {
      id: 25,
      type: 'choice',
      choices: [
        {
          id: 'use_power',
          text: `인과력을 모은다.`,
          type: 'risk',
          riskText: '<인과력> 키워드 필요',
          nextSceneId: 26, // [Fix] 27로 되어있던 것을 다음 씬인 26으로 수정 (버그 픽스!)
          condition: { type: 'keyword', id: 'kw_causality', name: '인과력' }
        }
      ]
    },
    {
      // [26] 전투 돌입 전 특수 연출 화면 (Warp White 적용)
      id: 26,
      type: 'script',
      text: "", 
      bg: "ruin_entrance",
      hideUI: true, 
      effect: "warp_white", 
      duration: 2000, 
      isEnd: true, 
      nextAction: 'battle:tutorial_boss:evt_prologue_2'
    }
  ]
};