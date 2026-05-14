/**
 * 단일 유닛(아군/적)에게 현재 적용 중인 모든 상태 효과를 단일 배열로 집계한다.
 * 인스펙터 UI는 이 함수 한 번 호출로 카드에 표시할 효과 리스트를 얻는다.
 *
 * 데이터 출처(분산되어 있던 것들):
 *  - ally.selfBuffs.{atkUp, critDmgUp, buffTime, hot}     — actionManager / skillExecutor
 *  - ally.memoryEffects[] (passive: DMG_UP / HEAL_UP 등)  — 영구 패시브
 *  - ally.shield                                         — 실드 잔량
 *  - globalBuffs.{atk, shield, speed, damageReduction, regen} — 인과력 스킬 전역 버프
 *  - enemy.isCharging                                    — 적 차징 표시
 *
 * Returns: Array<{
 *   id: string,           // 효과 식별자
 *   kind: 'buff'|'debuff'|'passive'|'shield'|'charging'|'heal',
 *   label: string,        // UI 표시명
 *   detail?: string,      // 보조 설명(수치 등)
 *   timeLeftMs?: number,  // 시간제 효과의 남은 시간 (없으면 영구/턴제)
 *   turnsLeft?: number,   // 턴제 효과의 남은 턴 수
 *   source?: 'self'|'global'|'passive', // 출처 구분
 * }>
 */
export function getUnitStatusEffects(unit, globalBuffs, side = 'ally') {
  const out = [];
  if (!unit) return out;
  // 명시적 null 호출자도 안전하게 받도록 정규화
  const gb = globalBuffs || {};

  if (side === 'ally') {
    const sb = unit.selfBuffs || {};

    // 자기 자신 일시 버프 (atkUp / critDmgUp 는 buffTime / buffSourceName을 공유)
    // 표기 규칙: label = 효과를 부여한 스킬(필살기) 이름, detail = 효과 상세.
    if (sb.atkUp && sb.atkUp > 0 && sb.buffTime > 0) {
      out.push({
        id: 'self-atk',
        kind: 'buff',
        label: sb.buffSourceName || '공격력 강화',
        detail: `공격력 +${Math.round(sb.atkUp * 100)}%`,
        timeLeftMs: sb.buffTime,
        source: 'self',
      });
    }
    if (sb.critDmgUp && sb.critDmgUp > 0 && sb.buffTime > 0) {
      out.push({
        id: 'self-critdmg',
        kind: 'buff',
        label: sb.buffSourceName || '치명타 피해 강화',
        detail: `치명타 피해 +${Math.round(sb.critDmgUp * 100)}%`,
        timeLeftMs: sb.buffTime,
        source: 'self',
      });
    }

    // 지속 회복(HoT) — 'heal' kind로 분리되어 인스펙터에서 + 아이콘으로 표시됨.
    if (sb.hot && sb.hot.turns > 0) {
      out.push({
        id: 'self-hot',
        kind: 'heal',
        label: sb.hot.sourceName || '지속 회복',
        detail: `턴당 지속회복 +${Math.round(sb.hot.amount)}`,
        turnsLeft: sb.hot.turns,
        source: 'self',
      });
    }

    // 영구 패시브 (Memory Effects)
    if (Array.isArray(unit.memoryEffects)) {
      unit.memoryEffects.forEach((eff) => {
        const meta = MEMORY_EFFECT_META[eff.id] || { label: eff.id, kind: 'passive' };
        out.push({
          id: `mem-${eff.id}`,
          kind: meta.kind,
          label: meta.label,
          detail: meta.detail,
          source: 'passive',
        });
      });
    }

    // 실드 (수치 자체가 효과 — 카드에도 표시되지만 인스펙터에선 출처/잔량 강조)
    if (unit.shield > 0) {
      out.push({
        id: 'shield',
        kind: 'shield',
        label: '방어막',
        detail: `${Math.floor(unit.shield)} 잔여`,
        source: 'self',
      });
    }

    // 전역 인과력 버프 (모든 아군에 적용)
    if (gb.atk?.active) {
      out.push({
        id: 'global-atk',
        kind: 'buff',
        label: '전역 공격력 ↑',
        detail: `+${Math.round((gb.atk.val || 0) * 100)}%`,
        timeLeftMs: gb.atk.timeLeft,
        source: 'global',
      });
    }
    if (gb.speed?.active) {
      out.push({
        id: 'global-speed',
        kind: 'buff',
        label: '전역 속도 ↑',
        detail: `x${(gb.speed.val || 1).toFixed(2)}`,
        timeLeftMs: gb.speed.timeLeft,
        source: 'global',
      });
    }
    if (gb.shield?.active) {
      out.push({
        id: 'global-shield',
        kind: 'buff',
        label: '전역 방어막',
        detail: gb.shield.val ? `${Math.floor(gb.shield.val)}` : undefined,
        timeLeftMs: gb.shield.timeLeft,
        source: 'global',
      });
    }
    if (gb.damageReduction?.active) {
      out.push({
        id: 'global-dmgreduce',
        kind: 'buff',
        label: '피해 감소',
        detail: `-${Math.round((gb.damageReduction.val || 0) * 100)}%`,
        timeLeftMs: gb.damageReduction.timeLeft,
        source: 'global',
      });
    }
    if (gb.regen?.active) {
      out.push({
        id: 'global-regen',
        kind: 'buff',
        label: '재생',
        detail: gb.regen.val ? `+${Math.round(gb.regen.val)}/턴` : undefined,
        timeLeftMs: gb.regen.timeLeft,
        source: 'global',
      });
    }
  } else if (side === 'enemy') {
    if (unit.isCharging) {
      out.push({
        id: 'charging',
        kind: 'charging',
        label: '강력한 공격 준비',
        source: 'self',
      });
    }
    // 향후 enemy debuff 시스템 도입 시 여기에 추가
  }

  return out;
}

const MEMORY_EFFECT_META = {
  DMG_UP: { label: '피해량 증가', kind: 'passive', detail: '공격력 ↑' },
  HEAL_UP: { label: '회복량 증가', kind: 'passive', detail: '치유 ↑' },
  DMG_REDUCE: { label: '피해 감소', kind: 'passive', detail: '피격 -' },
};
