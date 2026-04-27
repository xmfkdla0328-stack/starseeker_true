import React from 'react';

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
export default function MinionEnemyDisplay({ enemy, slotId }) {
  if (!enemy) return null;

  const isDead = enemy.hp <= 0;
  const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

  return (
    <div
      className={`relative flex flex-col items-center w-16 transition-all duration-500 pointer-events-auto ${
        isDead ? 'opacity-30 grayscale scale-90' : 'opacity-100'
      }`}
    >
      {/* 이미지 슬롯 (팝업 타겟) */}
      <div
        id={slotId}
        className="relative w-14 h-14 rounded-md border border-rose-700/60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-[0_0_8px_rgba(244,63,94,0.3)]"
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
