// --- 게임 설정 상수 ---
export const TICK_RATE = 50;
export const ACTION_THRESHOLD = 1000;
export const CAUSALITY_MAX = 100;
export const ENEMY_CAUSALITY_TRIGGER = 10;
export const WARNING_DURATION_MS = 3000;

export const INITIAL_USER_STATS = {
  str: 10, agi: 10, int: 10, wil: 10, chr: 10,
};

// --- 전체 캐릭터 데이터베이스 (도감) ---
export const ALL_CHARACTERS = [
  { 
    id: 1, name: "기사", role: "Tank", 
    baseHp: 1200, baseAtk: 55, baseDef: 25, baseSpd: 25, 
    color: "from-blue-600 to-blue-800", desc: "단단한 방패로 아군을 수호합니다.",
    efficiency: 1.1, star: 5 
  },
  { 
    id: 2, name: "전사", role: "Dealer", 
    baseHp: 850, baseAtk: 95, baseDef: 12, baseSpd: 30, 
    color: "from-rose-600 to-rose-800", desc: "강력한 근접 공격을 가합니다.",
    efficiency: 0.95, star: 4 
  },
  { 
    id: 3, name: "마법사", role: "Mage", 
    baseHp: 700, baseAtk: 140, baseDef: 8, baseSpd: 20, 
    color: "from-violet-600 to-violet-800", desc: "광역 마법으로 적을 섬멸합니다.",
    efficiency: 1.5, star: 5 
  },
  { 
    id: 4, name: "사제", role: "Healer", 
    baseHp: 650, baseAtk: 35, baseDef: 8, baseSpd: 28, 
    color: "from-emerald-600 to-emerald-800", desc: "신성한 힘으로 아군을 치유합니다.",
    efficiency: 1.0, star: 3 
  },
  { 
    id: 5, name: "저격수", role: "Dealer", 
    baseHp: 600, baseAtk: 130, baseDef: 5, baseSpd: 35, 
    color: "from-amber-600 to-amber-800", desc: "먼 거리에서 치명적인 일격을 날립니다.",
    efficiency: 0.8, star: 4 
  },
  { 
    id: 6, name: "무투가", role: "Tank", 
    baseHp: 1100, baseAtk: 55, baseDef: 10, baseSpd: 40, 
    color: "from-orange-600 to-red-700", desc: "빠른 속도와 체력으로 전장을 누빕니다.",
    efficiency: 1.2, star: 3 
  },
];

// --- 전체 아이템 데이터베이스 ---
export const ALL_ITEMS = {
  'chip_basic': {
    id: 'chip_basic',
    name: '데이터 보강칩',
    type: 'material',
    rarity: 'common',
    desc: '캐릭터의 신경 회로를 강화하는 데 사용되는 기초적인 데이터 칩입니다.',
    iconType: 'chip'
  },
  'core_essence': {
    id: 'core_essence',
    name: '비물질 데이터 보강칩', // [수정됨] 이름 변경
    type: 'material',
    rarity: 'epic',
    desc: '중복된 인과율 속에서 추출한 고농도 에너지. 특수 능력을 개방합니다.',
    iconType: 'core'
  }
  // exp_report (레벨업 아이템) 삭제됨
};

export const ENEMY_TEMPLATE = {
  name: "공허의 감시자",
  maxHp: 20000,
  baseAtk: 150,
  baseDef: 15,
  baseSpd: 55,
};