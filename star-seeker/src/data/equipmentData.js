import { nanoid } from 'nanoid';

// --- 상수 정의 ---
export const EQUIP_SLOTS = {
  SLOT_1: 'slot_1', // 신경계 활성화 칩 (공격적)
  SLOT_2: 'slot_2', // 대뇌 피질 칩 (방어/생존) - 이름 임의 지정
  SLOT_3: 'slot_3', // (미정)
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

// --- 설정: 슬롯별 주 옵션 등장 목록 및 범위 ---
const MAIN_OPTION_CONFIG = {
  [EQUIP_SLOTS.SLOT_1]: [
    { type: 'ATK_FLAT', min: 20, max: 50 },
    { type: 'CRIT_RATE', min: 3, max: 10 },
    { type: 'CRIT_DMG', min: 5, max: 25 },
  ],
  [EQUIP_SLOTS.SLOT_2]: [
    { type: 'HP_PERCENT', min: 5, max: 20 }, // % 수치 예시 (기획에 맞게 조정 필요)
    { type: 'DEF_PERCENT', min: 5, max: 20 },
  ],
  [EQUIP_SLOTS.SLOT_3]: [
    // 3번 슬롯 예비 (일단 랜덤)
    { type: 'HP_FLAT', min: 100, max: 300 },
  ],
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
    
    // 중복 체크 (단순 타입명이 아니라, '공격력'이라는 속성 자체를 막을지, 'ATK_FLAT'과 'ATK_PERCENT'를 구분할지 결정 필요)
    // 기획 의도: "주 옵션이 치명타 확률이면 부 옵션에서 치명타 확률 관련 안 뜸" -> label 기준 비교
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
  else if (slotType === EQUIP_SLOTS.SLOT_2) name = "대뇌 피질 칩"; // 가명
  else name = "보조 연산 칩";

  return {
    id: `equip_${nanoid(8)}`, // 고유 ID
    name: name,
    slot: slotType,
    mainStat,
    subStats,
    isEquipped: false, // 장착 여부
    equippedBy: null,  // 누가 꼈는지
  };
};