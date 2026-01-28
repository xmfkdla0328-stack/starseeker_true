import React, { useState } from 'react';
import { ChevronLeft, Archive, HardDrive, Database, FileText, XCircle, Sparkles } from 'lucide-react';
import { ALL_ITEMS } from '../data/gameData';

export default function StorageScreen({ inventory, onBack }) {
  const [selectedItemId, setSelectedItemId] = useState(null);

  // 인벤토리에 있는 아이템 ID를 통해 전체 데이터 가져오기
  const userItems = inventory.map(slot => {
    const itemData = ALL_ITEMS[slot.id];
    return { ...itemData, count: slot.count };
  });

  const selectedItem = selectedItemId ? userItems.find(i => i.id === selectedItemId) : null;

  // 아이콘 렌더링 헬퍼
  const renderIcon = (type, colorClass) => {
    switch (type) {
      case 'chip': return <HardDrive size={24} className={colorClass} />;
      case 'core': return <Sparkles size={24} className={colorClass} />;
      case 'file': return <FileText size={24} className={colorClass} />;
      default: return <Database size={24} className={colorClass} />;
    }
  };

  // 등급별 색상
  const getRarityColor = (rarity) => {
    switch(rarity) {
        case 'epic': return 'text-violet-400 border-violet-500/50 bg-violet-500/10';
        case 'rare': return 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10';
        default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] text-slate-100">
      
      {/* 1. 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 text-amber-400 font-bold tracking-widest">
            <Archive size={18} />
            <span>STORAGE</span>
        </div>
        <div className="w-6" /> {/* 균형용 빈공간 */}
      </div>

      {/* 2. 아이템 그리드 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-3">
            {userItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                const rarityStyle = getRarityColor(item.rarity);

                return (
                    <button 
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all
                            ${isSelected 
                                ? 'border-amber-400 bg-amber-900/20 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105' 
                                : `border-white/5 bg-white/5 hover:bg-white/10 ${rarityStyle.split(' ')[1]}` // border color only
                            }`}
                    >
                        {renderIcon(item.iconType, isSelected ? 'text-amber-200' : rarityStyle.split(' ')[0])}
                        
                        {/* 수량 배지 */}
                        <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                            {item.count}
                        </div>
                    </button>
                );
            })}
            
            {/* 빈 슬롯들 (채워넣기용) */}
            {[...Array(12)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-xl border border-white/5 bg-black/20" />
            ))}
        </div>
      </div>

      {/* 3. 상세 정보 패널 (아이템 선택 시 표시) */}
      <div className={`border-t border-white/10 bg-slate-900/90 backdrop-blur-md transition-all duration-300 overflow-hidden
          ${selectedItem ? 'h-40 p-4' : 'h-0 p-0'}`}>
          
          {selectedItem && (
            <div className="flex gap-4 h-full">
                {/* 아이콘 크게 */}
                <div className={`w-24 h-full rounded-lg border flex items-center justify-center bg-black/40 flex-shrink-0 ${getRarityColor(selectedItem.rarity)}`}>
                    {renderIcon(selectedItem.iconType, "w-12 h-12")}
                </div>

                {/* 텍스트 정보 */}
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-white text-lg">{selectedItem.name}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${getRarityColor(selectedItem.rarity)}`}>
                                {selectedItem.rarity}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            {selectedItem.desc}
                        </p>
                    </div>
                    
                    <div className="text-right">
                        <span className="text-xs text-slate-500 font-mono">보유 수량: <span className="text-white">{selectedItem.count}</span></span>
                    </div>
                </div>
            </div>
          )}
      </div>

    </div>
  );
}