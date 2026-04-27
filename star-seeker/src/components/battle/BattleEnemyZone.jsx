import React from 'react';
import BossEnemyDisplay from './BossEnemyDisplay';

/**
 * 적 영역의 라우터 컴포넌트.
 * enemies 배열을 받아 라인업 구성에 따라 적절한 레이아웃을 선택해 렌더링.
 *
 * [Step 3a] 현재는 단일 보스 케이스만 지원 (잡몹은 무시).
 *           기존 콘텐츠가 100% 동일하게 동작하는 안전 리팩터.
 *
 * [Step 3b 예정] 보스 + 잡몹 좌우 분배 레이아웃, MinionEnemyDisplay 추가.
 */
export default function BattleEnemyZone({ enemies, enemyWarning, showStatus = true }) {
  if (!enemies || enemies.length === 0) return null;

  // 보스/잡몹 분류 (isBoss 플래그 기반, 기본값 false 취급)
  // [Step 3b 예정] minions 배열을 별도 렌더링 (MinionEnemyDisplay 행)
  const bosses = enemies.filter(e => e && e.isBoss);

  // [Step 3a] 보스가 있으면 첫 번째 보스, 없으면 첫 번째 적을 단일 표시.
  // 잡몹들은 step 3b에서 별도 렌더링 추가 예정 (이 단계에서는 무시).
  const primary = bosses[0] || enemies[0];

  return (
    <BossEnemyDisplay 
      enemy={primary} 
      enemyWarning={enemyWarning} 
      showStatus={showStatus} 
    />
  );
}
