// 데미지 계산 및 상태 변화를 예측하여 반환하는 순수 함수
export const calculateDamage = (attacker, defender, rawDamage, buffs) => {
    // 1. 방어력 적용 (최소 데미지 1)
    let finalDamage = Math.max(1, rawDamage - (defender.def || 0));

    // 2. 데미지 감소 버프 확인 (active 상태일 때만)
    if (buffs && buffs.damageReduction && buffs.damageReduction.active) {
        const reductionRate = buffs.damageReduction.val || 0;
        finalDamage = Math.floor(finalDamage * (1 - reductionRate));
    }

    // 3. 쉴드 계산
    let remainingShield = defender.shield || 0;
    let damageToShield = 0; // 쉴드가 흡수한 데미지
    let damageToHp = 0;     // 실제 HP로 들어가는 데미지

    if (remainingShield > 0) {
        if (remainingShield >= finalDamage) {
            // 쉴드가 데미지를 모두 막음
            damageToShield = finalDamage;
            remainingShield -= finalDamage;
            damageToHp = 0;
        } else {
            // 쉴드가 깨지고 남은 데미지가 HP로
            damageToShield = remainingShield;
            damageToHp = finalDamage - remainingShield;
            remainingShield = 0;
        }
    } else {
        // 쉴드 없음
        damageToHp = finalDamage;
    }

    // 계산 결과 반환 (상태를 직접 수정하지 않고 값만 리턴)
    return {
        finalDamage: damageToHp,       // HP 감소량
        blockedByShield: damageToShield, // 쉴드 감소량
        remainingShield: remainingShield, // 남은 쉴드량
        isCrit: false,                 // (추후 구현)
        type: 'normal'                 // (추후 속성 등 확장 가능)
    };
};