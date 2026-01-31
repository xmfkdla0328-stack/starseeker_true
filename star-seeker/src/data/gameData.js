// 캐릭터 데이터는 별도 파일에서 관리
export { ALL_CHARACTERS } from './characterData';

// --- 게임 설정 상수 ---
export const TICK_RATE = 50;
export const ACTION_THRESHOLD = 1000;
export const CAUSALITY_MAX = 100;
export const ENEMY_CAUSALITY_TRIGGER = 10;
export const WARNING_DURATION_MS = 3000;

export const INITIAL_USER_STATS = {
  str: 10, agi: 10, int: 10, wil: 10, chr: 10,
};

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
    name: '비물질 데이터 보강칩',
    type: 'material',
    rarity: 'epic',
    desc: '중복된 인과율 속에서 추출한 고농도 에너지. 특수 능력을 개방합니다.',
    iconType: 'core'
  },
  'causality_stone': {
    id: 'causality_stone',
    name: '인과석',
    type: 'currency',
    rarity: 'legendary',
    desc: '인과율의 흐름을 고정하여 새로운 가능성을 불러오는 신비한 돌입니다.',
    iconType: 'stone'
  }
};

export const ENEMY_TEMPLATE = {
  name: "공허의 감시자",
  maxHp: 20000,
  baseAtk: 150,
  baseDef: 15,
  baseSpd: 55,
};