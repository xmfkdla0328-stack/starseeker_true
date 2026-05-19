/**
 * memoryEffects(영구 패시브) ID → 인스펙터 표시용 메타데이터.
 * 정적 데이터이므로 로직 파일이 아닌 data/ 하위에 둔다.
 * 소비처: hooks/battleLogic/statusEffects.js (collectStatusEffects)
 */
export const MEMORY_EFFECT_META = {
  DMG_UP: { label: '피해량 증가', kind: 'passive', detail: '공격력 ↑' },
  HEAL_UP: { label: '회복량 증가', kind: 'passive', detail: '치유 ↑' },
  DMG_REDUCE: { label: '피해 감소', kind: 'passive', detail: '피격 -' },
};
