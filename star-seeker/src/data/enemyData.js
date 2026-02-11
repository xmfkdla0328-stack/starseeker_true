// --- 적군 데이터베이스 (Enemy Data) ---

export const ENEMIES = {
    // [기본 보스]
    'guardian': {
      id: 'guardian',
      name: '공허의 감시자',
      level: 1,
      hp: 50000,
      maxHp: 50000,
      baseAtk: 120,
      baseSpd: 40,
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
      level: 99, 
      
      // [핵심] 약화된 상태 설정: 최대 체력은 높지만 시작 체력은 낮음
      maxHp: 50000,
      initialHp: 5000, 
  
      baseAtk: 100, 
      baseSpd: 15,  
  
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
    }
  };
  
  // 기본 템플릿 (Fallback)
  export const ENEMY_TEMPLATE = ENEMIES['guardian'];