import React from 'react';
import { Crosshair } from 'lucide-react';
import useLongPress from '../../hooks/useLongPress';

/**
 * 잡몹용 컴팩트 디스플레이.
 * 보스 발치(EnemyArea 하단부)에 가로로 작게 배치되는 카드.
 *
 * - 이미지: 있으면 표시, 없으면 👾 이모지 fallback
 * - 이름: 작게 (잡몹 다수일 때 가독성)
 * - HP 숫자 + 가는 HP 바를 이미지 바로 아래
 * - 죽으면 fade + grayscale
 *
 * id={slotId} → BattleEffectLayer가 이 DOM 위에 데미지 팝업 띄움 (per-enemy)
 */
export default function MinionEnemyDisplay({
  enemy,
  slotId,
  // [Step 7-c] 우선 타겟 마킹 props
  isManualMode = false,
  isPriorityTarget = false,
  onSelect,
  // [Step 8 Phase 2] 적 인스펙터: 길게 누름 → onInspect 호출. 모드 무관.
  onInspect,
}) {
  if (!enemy) return null;

  const isDead = enemy.hp <= 0;
  const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const shortTapEnabled = isManualMode && !isDead && !!onSelect;
  const longPressEnabled = !isDead && !!onInspect;
  const isInteractive = shortTapEnabled || longPressEnabled;

  // AllyCard/BossSlot과 동일 정책: 같은 핸들러 셋이 짧은 탭/긴 누름을 분기.
  const longPressHandlers = useLongPress(
    longPressEnabled ? () => onInspect() : undefined,
    {
      delay: 500,
      onShortTap: shortTapEnabled ? () => onSelect() : undefined,
    },
  );

  return (
    <div
      className={`relative flex flex-col items-center w-16 transition-all duration-500 pointer-events-auto ${
        isDead ? 'opacity-30 grayscale scale-90' : 'opacity-100'
      }`}
    >
      {/* 이미지 슬롯 (팝업 타겟). [Step 7-c] 수동 모드 짧은 탭 = 우선 타겟 토글, 길게 누름 = 인스펙터. */}
      <div
        id={slotId}
        {...(isInteractive ? longPressHandlers : {})}
        role={isInteractive ? 'button' : undefined}
        style={isInteractive ? { touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
        className={`relative w-14 h-14 rounded-md border bg-slate-900/70 backdrop-blur-sm flex items-center justify-center overflow-hidden transition-all
          ${isPriorityTarget
            ? 'border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.85)] scale-105'
            : 'border-slate-300/50 shadow-[0_0_8px_rgba(255,255,255,0.2)]'}
          ${isInteractive ? 'cursor-pointer hover:border-sky-300/70 active:scale-95' : ''}
        `}
      >
        {enemy.image ? (
          <img
            src={enemy.image}
            alt={enemy.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl select-none opacity-80">👾</span>
        )}
        {/* [Step 7-c] 우선 타겟 십자선 오버레이 */}
        {isPriorityTarget && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <Crosshair className="text-sky-300 drop-shadow-[0_0_4px_rgba(56,189,248,0.9)]" size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* 이름 */}
      <span className="mt-1 text-[9px] text-slate-200 font-light tracking-tight truncate max-w-[64px] text-center">
        {enemy.name}
      </span>

      {/* HP 숫자 */}
      <span className="text-[9px] text-rose-300 tabular-nums leading-none">
        {Math.floor(enemy.hp)}<span className="text-slate-500">/{enemy.maxHp}</span>
      </span>

      {/* HP 바 */}
      <div className="w-full h-[3px] bg-slate-800/80 rounded-full overflow-hidden mt-0.5">
        <div
          className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
          style={{ width: `${hpPercent}%` }}
        />
      </div>
    </div>
  );
}
