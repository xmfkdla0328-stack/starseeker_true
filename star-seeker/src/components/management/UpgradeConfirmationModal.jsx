import React from 'react';
import { Hammer, HardDrive, Sparkles } from 'lucide-react';

export default function UpgradeConfirmationModal({ nodeInfo, onConfirm, onCancel }) {
  if (!nodeInfo) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-6">
      <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Hammer size={18} className="text-amber-400" />
          노드 활성화
        </h3>

        <div className="space-y-4 mb-6">
          <div className="bg-black/40 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 block mb-1">소모 재료</span>
            <div className="flex items-center gap-2 text-sm text-slate-200">
              {nodeInfo.isMajor
                ? <><Sparkles size={14} className="text-amber-400" /> 비물질 데이터 보강칩 <span className="text-amber-400 font-bold">x1</span></>
                : <><HardDrive size={14} className="text-cyan-400" /> 데이터 보강칩 <span className="text-cyan-400 font-bold">x5</span></>
              }
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 block mb-1">강화 효과</span>
            <div className="text-sm font-bold text-white">
              {nodeInfo.label} <span className="text-emerald-400 ml-1">{nodeInfo.subLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-900/50 transition-colors"
          >
            활성화
          </button>
        </div>
      </div>
    </div>
  );
}