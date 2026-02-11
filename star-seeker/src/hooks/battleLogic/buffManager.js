import { TICK_RATE } from '../../data/gameData';

/**
 * 전역 버프의 지속시간을 관리하고, 만료 여부를 반환합니다.
 * @param {object} buffs - 현재 버프 상태 객체
 * @param {function} addLog - 로그 추가 함수
 * @returns {{updatedBuffs: object, shieldJustExpired: boolean}} - 갱신된 버프 객체와 방어막 만료 여부
 */
export function manageBuffs(buffs, addLog) {
  let shieldJustExpired = false;
  const updatedBuffs = { ...buffs };
  let hasChanged = false;

  ['atk', 'shield', 'speed', 'damageReduction', 'regen'].forEach(key => {
    if (updatedBuffs[key].active) {
      updatedBuffs[key].timeLeft -= TICK_RATE;
      if (updatedBuffs[key].timeLeft <= 0) {
        updatedBuffs[key] = { ...updatedBuffs[key], active: false };
        hasChanged = true;
        
        // [수정] type을 'system'에서 'buff'로 변경하여 전투 탭에 노출
        if (key === 'shield') {
          shieldJustExpired = true;
          addLog(`[알림] 방어막이 소멸합니다.`, 'buff'); 
        } else if (key === 'damageReduction') {
          addLog(`[알림] 피해 감소 효과 종료.`, 'buff');
        } else if (key === 'atk') {
          addLog(`[알림] 공격력 강화 종료.`, 'buff');
        } else if (key === 'speed') {
          addLog(`[알림] 속도 증가 종료.`, 'buff');
        }
      }
    }
  });

  return { updatedBuffs, shieldJustExpired, hasChanged };
}