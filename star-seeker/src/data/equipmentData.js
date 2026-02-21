import { nanoid } from 'nanoid';

// --- 상수 정의 ---
export const EQUIP_SLOTS = {
  SLOT_1: 'slot_1', // 신경계 활성화 칩 (공격적)
  SLOT_2: 'slot_2', // 대뇌 피질 칩 (방어/생존)
  SLOT_3: 'slot_3', // 기억 세공 (보조/스토리 스킬)
};

export const STAT_TYPES = {
  ATK_FLAT: { label: '공격력', isPercent: false },
  ATK_PERCENT: { label: '공격력', isPercent: true },
  DEF_FLAT: { label: '방어력', isPercent: false },
  DEF_PERCENT: { label: '방어력', isPercent: true },
  HP_FLAT: { label: 'HP', isPercent: false },
  HP_PERCENT: { label: 'HP', isPercent: true },
  CRIT_RATE: { label: '치명타 확률', isPercent: true },
  CRIT_DMG: { label: '치명타 피해', isPercent: true },
  SPEED: { label: '속도', isPercent: false },
};

// --- [NEW] 기억 세공(3번 슬롯) 전용 데이터 풀 ---
export const MEMORY_SKILL_POOL = [
  '요리', '채집', '관찰', '카리스마', '직감', '계산', 
  '화술', '리더쉽', '유혹', '괴력', '만능', '제조', '수호'
];

export const MEMORY_EFFECT_POOL = [
  { 
    id: 'DMG_UP', 
    label: '공격 출력 증폭', 
    desc: '가하는 공격 대미지 10% 증가', 
    value: 0.1 
  },
  { 
    id: 'DMG_REDUCE', 
    label: '피격 저항 활성화', 
    desc: '받는 대미지 10% 감소', 
    value: 0.1 
  },
  { 
    id: 'HEAL_UP', 
    label: '치료 효율 개선', 
    desc: '아군에의 치료 스킬 효과 10% 증가', 
    value: 0.1 
  }
];

// --- 설정: 슬롯별 주 옵션 등장 목록 및 범위 ---
const MAIN_OPTION_CONFIG = {
  [EQUIP_SLOTS.SLOT_1]: [
    { type: 'ATK_FLAT', min: 20, max: 50 },
    { type: 'CRIT_RATE', min: 3, max: 10 },
    { type: 'CRIT_DMG', min: 5, max: 25 },
  ],
  [EQUIP_SLOTS.SLOT_2]: [
    { type: 'HP_PERCENT', min: 5, max: 20 }, 
    { type: 'DEF_PERCENT', min: 5, max: 20 },
  ],
  // 3번 슬롯은 전용 로직을 타므로 설정 불필요
};

// --- 설정: 부 옵션 등장 목록 및 범위 (주 옵션보다 낮음) ---
const SUB_OPTION_POOL = [
  { type: 'HP_FLAT', min: 50, max: 200 },
  { type: 'HP_PERCENT', min: 1, max: 10 },
  { type: 'DEF_FLAT', min: 10, max: 30 },
  { type: 'DEF_PERCENT', min: 1, max: 10 },
  { type: 'ATK_FLAT', min: 10, max: 30 },
  { type: 'ATK_PERCENT', min: 1, max: 10 },
  { type: 'CRIT_RATE', min: 1, max: 5 },
  { type: 'CRIT_DMG', min: 3, max: 15 },
  { type: 'SPEED', min: 1, max: 5 },
];

// --- 헬퍼: 랜덤 정수/소수점 ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

// --- 핵심: 장비 생성 함수 ---
export const generateEquipment = (slotType) => {
  
  // [NEW] 3번 슬롯 (기억 세공) 전용 예외 처리 로직
  if (slotType === EQUIP_SLOTS.SLOT_3) {
    const randomSkill = MEMORY_SKILL_POOL[getRandomInt(0, MEMORY_SKILL_POOL.length - 1)];
    const randomEffect = MEMORY_EFFECT_POOL[getRandomInt(0, MEMORY_EFFECT_POOL.length - 1)];

    return {
      id: `equip_${nanoid(8)}`,
      name: "기억 세공",
      slot: slotType,
      memorySkill: randomSkill,    // 부여된 스토리 스킬
      memoryEffect: randomEffect,  // 부여된 전투 버프 객체
      isEquipped: false,
      equippedBy: null,
    };
  }

  // ==========================================
  // 아래는 기존의 1, 2번 칩 전용 로직
  // ==========================================
  
  // 1. 주 옵션 결정
  const mainConfigs = MAIN_OPTION_CONFIG[slotType];
  const mainConfig = mainConfigs[getRandomInt(0, mainConfigs.length - 1)];
  
  const mainStat = {
    type: mainConfig.type,
    value: STAT_TYPES[mainConfig.type].isPercent 
      ? getRandomFloat(mainConfig.min, mainConfig.max) 
      : getRandomInt(mainConfig.min, mainConfig.max),
  };

  // 2. 부 옵션 결정 (1~2개)
  const subStats = [];
  const subCount = getRandomInt(1, 2);
  const usedTypes = new Set([mainConfig.type]); // 주 옵션과 중복 방지

  while (subStats.length < subCount) {
    const subConfig = SUB_OPTION_POOL[getRandomInt(0, SUB_OPTION_POOL.length - 1)];
    
    const mainLabel = STAT_TYPES[mainStat.type].label;
    const subLabel = STAT_TYPES[subConfig.type].label;

    if (mainLabel === subLabel) continue; // 같은 계열(예: 공격력)이면 스킵
    if (usedTypes.has(subConfig.type)) continue; // 이미 뽑은 부 옵션이면 스킵

    subStats.push({
      type: subConfig.type,
      value: STAT_TYPES[subConfig.type].isPercent 
        ? getRandomFloat(subConfig.min, subConfig.max)
        : getRandomInt(subConfig.min, subConfig.max),
    });
    usedTypes.add(subConfig.type);
  }

  // 3. 아이템 객체 반환
  let name = "Unknown Chip";
  if (slotType === EQUIP_SLOTS.SLOT_1) name = "신경계 활성화 칩";
  else if (slotType === EQUIP_SLOTS.SLOT_2) name = "대뇌 피질 칩"; 

  return {
    id: `equip_${nanoid(8)}`, 
    name: name,
    slot: slotType,
    mainStat,
    subStats,
    isEquipped: false, 
    equippedBy: null,  
  };
};