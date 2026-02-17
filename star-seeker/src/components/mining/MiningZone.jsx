import React from 'react';
import { Plus, X } from 'lucide-react';

export default function MiningZone({ title, icon: Icon, iconColor, zoneData, roster, onSlotClick, onRemove, onCollect }) {
    const activeMinersCount = zoneData.miners.filter(id => id !== null).length;
    const isMining = activeMinersCount > 0;
    
    // 보여주기용 누적량 (소수점 버림)
    const displayAmount = Math.floor(zoneData.accrued);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-white/20">
            {/* 활성화 시 배경 효과 */}
            {isMining && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${iconColor}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-100">{title}</h3>
                        <p className="text-xs text-slate-400 font-mono">
                            {isMining ? 'MINING IN PROGRESS...' : 'STATUS: IDLE'}
                        </p>
                    </div>
                </div>
                
                {/* 수령 버튼 */}
                <button 
                    onClick={onCollect}
                    disabled={displayAmount < 1}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all
                        ${displayAmount >= 1 
                            ? 'bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-bounce' 
                            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                    수령: {displayAmount}
                </button>
            </div>

            {/* 슬롯 영역 */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                {zoneData.miners.map((minerId, idx) => {
                    const miner = minerId ? roster.find(c => c.id === minerId) : null;
                    return (
                        <div key={idx} className="aspect-[3/4] rounded-xl border border-dashed border-slate-600 bg-black/20 flex flex-col items-center justify-center relative group">
                            {miner ? (
                                <>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${miner.color} opacity-30 rounded-xl`}></div>
                                    <span className="relative z-10 text-2xl font-bold text-white drop-shadow-md mb-1">{miner.role.charAt(0)}</span>
                                    <span className="relative z-10 text-[9px] text-slate-300 truncate w-full text-center px-1">{miner.name}</span>
                                    
                                    {/* 해제 버튼 (Hover시 표시) */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                                        className="absolute top-1 right-1 z-20 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                                    >
                                        <X size={10} />
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => onSlotClick(idx)}
                                    className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors rounded-xl"
                                >
                                    <Plus size={24} className="mb-1" />
                                    <span className="text-[9px]">배치</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 효율 정보 */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono relative z-10">
                <span>효율: {isMining ? '1개 / 1시간' : '0개 / 1시간'}</span>
                <span>배치됨: {activeMinersCount}/3</span>
            </div>
        </div>
    );
}