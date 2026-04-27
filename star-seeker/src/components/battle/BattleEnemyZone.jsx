import React from 'react';
import BossEnemyDisplay from './BossEnemyDisplay';
import MinionEnemyDisplay from './MinionEnemyDisplay';

/**
 * 적 영역의 라우터 컴포넌트.
 * enemies 배열을 받아 라인업 구성에 따라 적절한 레이아웃을 선택해 렌더링.
 *
 * [Step 3a] BattleEnemyZone를 라우터화하고 단일 보스 디스플레이를 분리.
 * [Step 3b] 다중 적 (보스 1 + 잡몹 1~4) 레이아웃 추가.
 *           잡몹은 보스 발치(하단)에 좌우 분배 배치.
 *
 * DOM ID 시스템:
 *   - 각 적 슬롯이 enemy-slot-{enemiesArrayIdx} ID를 가짐
 *   - actionManager는 targetEnemyIdx 기반으로 'enemy-slot-{idx}'로 팝업 타겟팅
 *
 * 잡몹 좌우 분배 규칙 (사용자 명세):
 *   N=1: (보스)(잡)            -> left:0, right:1
 *   N=2: (잡)(보스)(잡)        -> left:1, right:1
 *   N=3: (잡)(보스)(잡)(잡)    -> left:1, right:2
 *   N=4: (잡)(잡)(보스)(잡)(잡) -> left:2, right:2
 *   알고리즘: leftCount = floor(N/2), rightCount = ceil(N/2) → 우측 우선
 */
export default function BattleEnemyZone({ enemies, enemyWarning, showStatus = true }) {
  if (!enemies || enemies.length === 0) return null;

  // 보스 인덱스 찾기 (없으면 0번 적을 보스 자리에)
  const explicitBossIdx = enemies.findIndex(e => e && e.isBoss);
  const bossIdx = explicitBossIdx >= 0 ? explicitBossIdx : 0;
  const primary = enemies[bossIdx];

  // 잡몹 = 보스가 아닌 모든 적 (각자의 실제 인덱스 보존)
  const minionsWithIdx = [];
  enemies.forEach((e, idx) => {
    if (e && !e.isBoss && idx !== bossIdx) {
      minionsWithIdx.push({ enemy: e, idx });
    }
  });

  const N = minionsWithIdx.length;
  const leftCount = Math.floor(N / 2);
  const leftMinions = minionsWithIdx.slice(0, leftCount);
  const rightMinions = minionsWithIdx.slice(leftCount);

  // 잡몹이 없으면 step 3a와 동일하게 BossEnemyDisplay 단독 렌더 (기존 콘텐츠 100% 보존)
  if (N === 0) {
    return (
      <BossEnemyDisplay
        enemy={primary}
        enemyWarning={enemyWarning}
        showStatus={showStatus}
        slotId={`enemy-slot-${bossIdx}`}
      />
    );
  }

  // 다중 적: 보스 + 잡몹 행 오버레이
  return (
    <div className="relative w-full h-full flex flex-col">
      <BossEnemyDisplay
        enemy={primary}
        enemyWarning={enemyWarning}
        showStatus={showStatus}
        slotId={`enemy-slot-${bossIdx}`}
      />

      {/* 잡몹 행: 보스 발치 (보스 게이지 위쪽)에 좌우 분배 배치 */}
      <div
        className={`absolute left-0 right-0 z-[15] flex justify-center items-end gap-3 px-4 pointer-events-none transition-opacity duration-1000 ${
          showStatus ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ bottom: '88px' /* 보스 게이지(하단)와 겹치지 않게 */ }}
      >
        {/* 좌측 잡몹: 우측 정렬로 보스 자리에 붙임 */}
        <div className="flex items-end gap-2 justify-end">
          {leftMinions.map(({ enemy, idx }) => (
            <MinionEnemyDisplay
              key={enemy.instanceId || `slot-${idx}`}
              enemy={enemy}
              slotId={`enemy-slot-${idx}`}
            />
          ))}
        </div>

        {/* 보스 자리 시각적 spacer (보스 이미지가 차지하는 가운데 폭) */}
        <div className="w-32 flex-shrink-0" />

        {/* 우측 잡몹: 좌측 정렬로 보스 자리에 붙임 */}
        <div className="flex items-end gap-2 justify-start">
          {rightMinions.map(({ enemy, idx }) => (
            <MinionEnemyDisplay
              key={enemy.instanceId || `slot-${idx}`}
              enemy={enemy}
              slotId={`enemy-slot-${idx}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
