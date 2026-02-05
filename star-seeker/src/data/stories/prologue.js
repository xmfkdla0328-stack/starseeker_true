export const prologue_event = {
  id: 'evt_prologue_start',
  title: '서장: 불시착',
  type: 'story',
  scenes: [
    { 
      id: 1, 
      type: 'script', 
      text: "......지직... ...들리나?", 
      speaker: "???", 
      bg: "black",
      // 이미지가 없는 씬 (검은 화면)
    },
    { 
      id: 2, 
      type: 'script', 
      text: "전송 시스템에 오류가 발생했습니다. 좌표가 어긋났습니다.", 
      speaker: "시스템", 
      bg: "red_alert"
    },
    { 
      id: 3, 
      type: 'script', 
      text: "젠장, 하필이면 이런 변방 행성에 떨어지다니. 인과율 수치가 불안정해.", 
      speaker: "플레이어",
      // 플레이어의 이미지가 있다면 여기에 경로 지정
      // characterImage: "/images/characters/player_base.png" 
    },
    // [예시] 서주목 등장 씬 추가
    { 
      id: 3.5, 
      type: 'script', 
      text: "거기 누구냐! 신원 미상의 접근자, 당장 멈춰라!", 
      speaker: "서주목", 
      // [핵심] 여기에 이미지 경로를 입력합니다. (실제 파일이 있어야 보입니다)
      characterImage: "/images/characters/sujumok_normal.png" 
    },
    { 
      id: 4, 
      type: 'question', 
      text: "눈앞에 거대한 유적의 입구가 보입니다. 어떻게 하시겠습니까?", 
      bg: "ruin_entrance" 
    },
    {
      id: 5,
      type: 'choice',
      choices: [
        { 
          id: 'enter', 
          text: '유적 내부로 진입한다.', 
          type: 'risk', 
          riskText: '위험도가 높지만 보상을 얻을 수 있습니다.', 
          nextSceneId: 6,
          effect: { type: 'causality', value: 5 }
        },
        { 
          id: 'scan', 
          text: '주변을 먼저 스캔한다.', 
          type: 'safe', 
          safeText: '안전하게 정보를 확보합니다.', 
          nextSceneId: 7,
          effect: { type: 'item', id: 'chip_basic', value: 1 }
        }
      ]
    },
    { 
      id: 6, 
      type: 'script', 
      text: "당신은 과감하게 어둠 속으로 발을 내디뎠습니다. 차가운 공기가 폐를 찌릅니다.", 
      speaker: "나레이션",
      isEnd: true 
    },
    { 
      id: 7, 
      type: 'script', 
      text: "스캔 결과, 다수의 생명 반응이 감지됩니다. 조심스럽게 우회합니다.", 
      speaker: "나레이션",
      isEnd: true
    }
  ]
};