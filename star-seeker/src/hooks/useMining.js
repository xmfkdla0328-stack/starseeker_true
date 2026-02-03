
import { useState, useEffect } from 'react';

export default function useMining(setInventory) {
  const [miningState, setMiningState] = useState({
    chips: { miners: [null, null, null], accrued: 0 },
    stones: { miners: [null, null, null], accrued: 0 }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMiningState(prev => {
        const newState = { ...prev };
        const chipMiners = prev.chips.miners.filter(id => id !== null).length;
        if (chipMiners > 0) {
            newState.chips.accrued += (1 / 36); // [TEST SPEED]
        }
        const stoneMiners = prev.stones.miners.filter(id => id !== null).length;
        if (stoneMiners > 0) {
            newState.stones.accrued += (1 / 36); // [TEST SPEED]
        }
        return newState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAssignMiner = (type, slotIndex, charId) => {
    setMiningState(prev => {
      const newMiners = [...prev[type].miners];
      if (newMiners.includes(charId)) return prev;
      newMiners[slotIndex] = charId;
      return {
        ...prev,
        [type]: { ...prev[type], miners: newMiners }
      };
    });
  };

  const handleRemoveMiner = (type, slotIndex) => {
    setMiningState(prev => {
      const newMiners = [...prev[type].miners];
      newMiners[slotIndex] = null;
      return {
        ...prev,
        [type]: { ...prev[type], miners: newMiners }
      };
    });
  };

  const handleCollectReward = (type) => {
    setMiningState(prev => {
      const amount = Math.floor(prev[type].accrued);
      if (amount <= 0) return prev;

      const itemId = type === 'chips' ? 'chip_basic' : 'causality_stone';
      setInventory(currInv => {
        const exists = currInv.find(i => i.id === itemId);
        if (exists) {
            return currInv.map(i => i.id === itemId ? { ...i, count: i.count + amount } : i);
        } else {
            return [...currInv, { id: itemId, count: amount }];
        }
      });

      return {
        ...prev,
        [type]: { ...prev[type], accrued: prev[type].accrued - amount }
      };
    });
  };

  return { miningState, handleAssignMiner, handleRemoveMiner, handleCollectReward };
}
