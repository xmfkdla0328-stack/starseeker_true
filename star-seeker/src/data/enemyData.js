// --- 적군 데이터베이스 (Enemy Data) ---

// 기본 보스 몬스터 템플릿
export const ENEMY_TEMPLATE = {
    id: 'enemy_guardian',
    name: '공허의 감시자',
    level: 1,
    hp: 50000,
    maxHp: 50000,
    baseAtk: 120,
    baseSpd: 40,
    
    // 상태 게이지 초기값
    actionGauge: 0,
    ultGauge: 0,        
    maxUltGauge: 100,   
    causality: 0,       
    
    // 상태 플래그 초기값
    isCharging: false,
    chargeTimer: 0,
    chargingSkill: null, 
  
    // 스킬 데이터
    skills: {
      normal: { 
          name: "공허의 손톱", 
          desc: "일반 공격", 
          mult: 1.0, 
          gaugeGain: 20, // 타격 시 필살기 게이지 충전
          causalityGain: 1 // 타격 시 인과력 충전
      },
      ultimate: { 
          name: "심연의 포효", 
          desc: "필살기 (게이지 소모)", 
          mult: 2.5, 
          isAoe: true, // 광역 공격
          chargeTime: 2000, // 2초 예고
          causalityGain: 5 // 사용 시 인과력 대폭 충전
      },
      causality: { 
          name: "인과율 붕괴", 
          desc: "인과력 스킬 (인과력 소모)", 
          mult: 4.0, 
          isAoe: true,
          chargeTime: 3000 // 3초 예고
      }
    }
  };