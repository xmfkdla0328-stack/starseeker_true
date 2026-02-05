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
      // bgm: "/audio/bgm/The_maze_of_aqua.mp3" // 필요하다면 여기서 BGM 시작
    },
    { 
      // [2] 심리 묘사 (Monologue)
      id: 2, 
      type: 'monologue', // 스타일 변경: 이탤릭, 회색
      text: "…또 다시…", 
      speaker: "???", 
      bg: "black",
      effect: "heartbeat", // 심장 박동 연출
      bgm: "/audio/bgm/The_maze_of_aqua.mp3" // 여기서 음악 시작
    },
    { 
      // [3] 심리 묘사 (Monologue)
      id: 3, 
      type: 'monologue', 
      text: "…무의미한 시도일지라도….", 
      speaker: "???", 
      bg: "red_alert"
    },
    { 
      id: 4, 
      type: 'monologue',
      text: "사지가 불타는 것 같다.", 
      speaker: "???", 
      bg: "red_alert",
    },
    { 
      // [4] 일반 대사 (Script) - 여기서부터 UI 스타일 복귀
      id: 5, 
      type: 'script', 
      text: "젠장, 하필이면 이런 변방 행성에 떨어지다니. 인과율 수치가 불안정해.", 
      speaker: "플레이어",
      characterImage: "/images/characters/player_base.png",
      bg: "ruin_entrance"
    },
    { 
      id: 6, 
      type: 'question', // 질문형 강조 텍스트
      text: "눈앞에 거대한 유적의 입구가 보입니다. 어떻게 하시겠습니까?", 
      bg: "ruin_entrance" 
    },
    {
      id: 7,
      type: 'choice',
      choices: [
        { 
          id: 'enter', 
          text: '유적 내부로 진입한다.', 
          type: 'risk', 
          riskText: '위험도가 높지만 보상을 얻을 수 있습니다.', 
          nextSceneId: 8, 
          effect: { type: 'causality', value: 5 } 
        },
        { 
          id: 'scan', 
          text: '주변을 먼저 스캔한다.', 
          type: 'safe', 
          safeText: '안전하게 정보를 확보합니다.', 
          nextSceneId: 9,
          effect: { type: 'item', id: 'chip_basic', value: 1 }
        }
      ]
    },
    { 
      id: 8, 
      type: 'script', 
      text: "당신은 과감하게 어둠 속으로 발을 내디뎠습니다. 차가운 공기가 폐를 찌릅니다.", 
      speaker: "나레이션",
      isEnd: true 
    },
    { 
      id: 9, 
      type: 'script', 
      text: "스캔 결과, 다수의 생명 반응이 감지됩니다. 조심스럽게 우회합니다.", 
      speaker: "나레이션",
      isEnd: true
    }
  ]
};