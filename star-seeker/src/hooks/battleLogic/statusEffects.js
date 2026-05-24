import { MEMORY_EFFECT_META } from '../../data/memoryEffectMeta';
import { ENEMY_EFFECTS } from '../../data/enemyEffects';

// unit.statusEffects(적 스킬이 부여하는 디버프/자버프)를 인스펙터 항목으로 변환.
// 아군: kind='debuff'(빨강+경고 아이콘), 적: kind='buff'(초록+반짝 아이콘) — KIND_META의 폴백 사용.
function pushUnitStatusEffects(out, unit, side) {
  if (!unit || !Array.isArray(unit.statusEffects)) return;
  for (const eff of unit.statusEffects) {
    const meta = ENEMY_EFFECTS[eff.effectId];
    if (!meta) continue;
    // 표시 상세: 스탯 보정량을 사람이 읽기 쉬운 % 형태로.
    const sign = meta.mult >= 0 ? '+' : '';
    const statLabel = meta.stat === 'spd' ? '행동 속도' : meta.stat;
    out.push({
      id: `status-${eff.effectId}`,
      // side 기준이 아니라 효과 본연의 kind로 분류 (디버프=빨강, 버프=초록)
      kind: meta.kind === 'debuff' ? 'debuff' : 'buff',
      label: meta.name,
      detail: `${statLabel} ${sign}${Math.round(meta.mult * 100)}%`,
      timeLeftMs: eff.timeLeft,
      source: 'self',
    });
  }
}

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
 *   kind: 'attack'|'heal'|'shield'|'damageReduction'|'causality'|'passive'|'charging'|'debuff',
 *                         // 시각 분류 — 캐릭터 효과는 역할별, 인과력 스킬은 모두 'causality'(노란/별)
 *   label: string,        // UI 표시명 (캐릭터 출처: 스킬/필살기 이름, 인과력 출처: 인과율 명칭)
 *   detail?: string,      // 보조 설명(수치 등)
 *   timeLeftMs?: number,  // 시간제 효과의 남은 시간 (없으면 영구/턴제)
 *   turnsLeft?: number,   // 턴제 효과의 남은 턴 수
 *   source?: 'self'|'global'|'passive', // 출처 구분
 * }>
 */
// 전역 버프 한 항목을 인스펙터 효과 목록에 추가하는 헬퍼.
// 캐릭터 출처(sourceName 보유) vs 인과력 출처를 한 자리에서 분기 처리한다.
function pushGlobalBuff(out, id, buff, { causalityLabel, detailFn }) {
  if (!buff || !buff.active) return;
  const isCharacterOrigin = !!buff.sourceName;
  // 개발 안전장치: 캐릭터 출처 전역버프는 반드시 originKind를 함께 기록해야 한다.
  // (역할별 색/아이콘이 인과력 노랑/별로 잘못 표기되는 회귀를 조기 탐지)
  if (isCharacterOrigin && !buff.originKind && typeof console !== 'undefined') {
    console.warn(`[statusEffects] global buff "${id}" has sourceName but no originKind — defaulting to 'attack'. 새 캐릭터 출처 전역버프 추가 시 originKind를 함께 기록하세요.`);
  }
  out.push({
    id,
    kind: isCharacterOrigin ? (buff.originKind || 'attack') : 'causality',
    label: isCharacterOrigin ? buff.sourceName : causalityLabel,
    detail: detailFn(buff.val),
    timeLeftMs: buff.timeLeft,
    source: 'global',
  });
}

export function getUnitStatusEffects(unit, globalBuffs, side = 'ally') {
  const out = [];
  if (!unit) return out;
  // 명시적 null 호출자도 안전하게 받도록 정규화
  const gb = globalBuffs || {};

  if (side === 'ally') {
    const sb = unit.selfBuffs || {};

    // 자기 자신 일시 버프 (atkUp / critDmgUp 는 buffTime / buffSourceName을 공유)
    // 표기 규칙: label = 효과를 부여한 캐릭터 스킬/필살기 이름, detail = 효과 상세.
    if (sb.atkUp && sb.atkUp > 0 && sb.buffTime > 0) {
      out.push({
        id: 'self-atk',
        kind: 'attack',
        label: sb.buffSourceName || '공격력 강화',
        detail: `공격력 +${Math.round(sb.atkUp * 100)}%`,
        timeLeftMs: sb.buffTime,
        source: 'self',
      });
    }
    if (sb.critDmgUp && sb.critDmgUp > 0 && sb.buffTime > 0) {
      out.push({
        id: 'self-critdmg',
        kind: 'attack',
        label: sb.buffSourceName || '치명타 피해 강화',
        detail: `치명타 피해 +${Math.round(sb.critDmgUp * 100)}%`,
        timeLeftMs: sb.buffTime,
        source: 'self',
      });
    }

    // 지속 회복(HoT) — heal kind, 초록 + 아이콘.
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

    // 전역 buffs는 두 가지 출처가 섞여 들어옴:
    //  - 인과력 스킬(시스템): sourceName 없음 → kind='causality' (노란색 + 별 아이콘)
    //  - 캐릭터 스킬/필살기 (예: 서주목 ult의 damageReduction): sourceName + originKind 있음
    //    → label = 스킬 이름, kind = originKind (역할 기반 색/아이콘)
    pushGlobalBuff(out, 'global-atk',         gb.atk,
      { causalityLabel: '인과율 개입: 무력 강화', detailFn: (v) => `공격력 +${Math.round((v || 0) * 100)}%` });
    pushGlobalBuff(out, 'global-speed',       gb.speed,
      { causalityLabel: '인과율 개입: 시간 가속', detailFn: (v) => `속도 ×${(v || 1).toFixed(2)}` });
    pushGlobalBuff(out, 'global-shield',      gb.shield,
      { causalityLabel: '인과율 개입: 절대 방어', detailFn: (v) => v ? `방어막 +${Math.floor(v)}` : undefined });
    pushGlobalBuff(out, 'global-dmgreduce',   gb.damageReduction,
      { causalityLabel: '피해 감소', detailFn: (v) => `피해 감소 -${Math.round((v || 0) * 100)}%` });
    pushGlobalBuff(out, 'global-regen',       gb.regen,
      { causalityLabel: '재생', detailFn: (v) => v ? `재생 +${Math.round(v)}/턴` : undefined });

    // [enemyEffects] 적 스킬로 받은 디버프(예: 완결 거부).
    pushUnitStatusEffects(out, unit, side);
  } else if (side === 'enemy') {
    if (unit.isCharging) {
      out.push({
        id: 'charging',
        kind: 'charging',
        label: '강력한 공격 준비',
        source: 'self',
      });
    }
    // [enemyEffects] 적 자버프(예: 결말 확인). 보스/잡몹 공통.
    pushUnitStatusEffects(out, unit, side);
  }

  return out;
}
