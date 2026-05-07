// --- 적군 데이터베이스 (Enemy Data) ---
// isBoss: true → 보스급 (전투 시 보스 슬롯/경고 등 특별 표시)
// isBoss: false → 잡몹 (다수 출현 가능, 슬림한 표시)

export const ENEMIES = {
  // [기본 보스]
  'guardian': {
    id: 'guardian',
    name: '공허의 감시자',
    isBoss: true,
    level: 1,
    hp: 3000,
    maxHp: 3000,
    baseAtk: 50,
    baseSpd: 20,

    // [Fix] 누락된 게이지/상태 초기값 보강.
    // 없으면 maxUltGauge=undefined → 궁극기 트리거 조건이 영원히 false가 되어
    // 차징/컷인 모두 발동하지 않고, UI 게이지가 NaN으로 풀처럼 표시되는 버그가 있었음.
    actionGauge: 0,
    ultGauge: 0,
    maxUltGauge: 100,
    causality: 0,

    skills: {
      normal: { name: "공허의 손톱", desc: "일반 공격", mult: 1.0, gaugeGain: 20, causalityGain: 1 },
      ultimate: { name: "심연의 포효", desc: "필살기", mult: 2.5, isAoe: true, chargeTime: 2000, causalityGain: 5 },
      causality: { name: "인과율 붕괴", desc: "인과력 스킬", mult: 4.0, isAoe: true, chargeTime: 3000 }
    }
  },

  // [튜토리얼 보스] 재앙 (약화됨)
  'tutorial_boss': {
    id: 'tutorial_boss',
    name: '재앙',
    isBoss: true,
    level: 99, 
    
    // [NEW] 전투 화면과 스토리에 띄울 보스의 실제 이미지 경로 추가!
    image: '/images/enemy/disaster_normal.png',
    
    maxHp: 99999,
    initialHp: 3000, 

    baseAtk: 70, 
    baseSpd: 10,  

    // 상태 초기값
    actionGauge: 0,
    ultGauge: 0,
    maxUltGauge: 100,
    causality: 0,
    
    skills: {
      normal: { 
          name: "나를 부르라", 
          desc: "일반 공격", 
          mult: 1.0, 
          gaugeGain: 25, 
          causalityGain: 2 
      },
      ultimate: { 
          name: "나의 이름은", 
          desc: "필살기 (게이지 소모)", 
          mult: 3.0, 
          isAoe: true, 
          chargeTime: 2500, 
          causalityGain: 10 
      },
      causality: { 
          name: "멈추지 않는 파도", 
          desc: "인과력 스킬 (인과력 소모)", 
          mult: 5.0, 
          isAoe: true,
          chargeTime: 4000 
      }
    }
  },

  // [데이터 응집체 추출 - 잡몹] 기록자의 낱장
  // 폐허를 모독하는 기록자의 페이지 단편. 무리지어 출현.
  // 컨셉: HP 낮음 / 공격력 낮음 / 속도 빠름 — 다수가 모여 위협이 됨.
  // ※ 스탯 수치는 임시 (밸런싱은 step 6에서 본격 조정)
  'recorder_page': {
    id: 'recorder_page',
    name: '기록자의 낱장',
    isBoss: false,
    level: 5,

    maxHp: 800,
    baseAtk: 35,
    baseSpd: 25,

    actionGauge: 0,
    ultGauge: 0,
    maxUltGauge: 100,
    causality: 0,

    skills: {
      normal: {
        name: "글자 새김",
        desc: "흩날리는 활자가 표적을 베어낸다.",
        mult: 1.0,
        gaugeGain: 30,
        causalityGain: 1
      },
      ultimate: {
        name: "단편적 기록",
        desc: "낱장에 새겨진 기록이 솟구쳐 단일 표적을 강타.",
        mult: 1.8,
        isAoe: false,
        chargeTime: 1500,
        causalityGain: 3
      }
      // 잡몹은 인과력 스킬 없음
    }
  },

  // [데이터 응집체 추출 - 보스] 기록자의 책갈피
  // 페이지를 묶어두는 표식. 책의 어느 부분을 봉인하느냐에 따라 다른 형태로 발현.
  // 컨셉: HP 높음 / 공격력 중상 / 속도 평범 / 강력한 광역기·인과력 스킬 보유
  // ※ 스탯 수치는 임시 (밸런싱은 step 6에서 본격 조정)
  'recorder_bookmark': {
    id: 'recorder_bookmark',
    name: '기록자의 책갈피',
    isBoss: true,
    level: 10,

    maxHp: 8000,
    baseAtk: 65,
    baseSpd: 15,

    actionGauge: 0,
    ultGauge: 0,
    maxUltGauge: 100,
    causality: 0,

    skills: {
      normal: {
        name: "장(章) 끼우기",
        desc: "책갈피의 표지가 한 페이지를 끼워넣어 표적을 짓누른다.",
        mult: 1.2,
        gaugeGain: 20,
        causalityGain: 2
      },
      ultimate: {
        name: "페이지 봉인",
        desc: "현재의 페이지를 봉인하여 모든 적을 묵살한다.",
        mult: 2.8,
        isAoe: true,
        chargeTime: 2500,
        causalityGain: 8
      },
      causality: {
        name: "기록의 말소",
        desc: "표적의 기록 자체를 지워낸다.",
        mult: 5.5,
        isAoe: true,
        chargeTime: 4000
      }
    }
  }
};

// 기본 템플릿 (Fallback)
export const ENEMY_TEMPLATE = ENEMIES['guardian'];

// [NEW] 라인업 프리셋 — 콘텐츠에서 enemyId로 참조해 다중 적 전투 구성
// 사용 예: useBattleState(... , ENEMY_LINEUPS.data_aggregate_extraction)
// 각 항목은 useBattleState가 받는 enemyId 파라미터(배열 형식)와 동일한 형태.
export const ENEMY_LINEUPS = {
  // 데이터 응집체 추출: 낱장 4 + 책갈피 1 = 총 5마리 (시스템 최대치)
  'data_aggregate_extraction': [
    { id: 'recorder_page', count: 4 },
    { id: 'recorder_bookmark', count: 1 }
  ]
};

// 시스템 한계: 한 전투당 적은 최소 1, 최대 5마리
export const MAX_ENEMIES_PER_BATTLE = 5;