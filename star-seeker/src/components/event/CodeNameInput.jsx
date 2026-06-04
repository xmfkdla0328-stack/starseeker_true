import React, { useState } from 'react';
import { Terminal, Check, X } from 'lucide-react';

export default function CodeNameInput({ script, onSubmit }) {
  const [value, setValue] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'confirm'

  const trimmed = value.trim();

  const handleProceed = () => {
    if (!trimmed) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleReject = () => {
    setStep('input');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProceed();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in bg-[#0f172a] h-full p-6 rounded-xl border border-white/10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2 text-cyan-400">
          <Terminal size={18} />
          <span className="text-xs font-mono tracking-[0.3em] uppercase">Code Name</span>
        </div>

        {script?.prompt && (
          <p className="text-slate-300 text-sm leading-relaxed font-serif whitespace-pre-wrap">
            {script.prompt}
          </p>
        )}

        {step === 'input' && (
          <div className="space-y-4 animate-fade-in">
            <input
              type="text"
              value={value}
              autoFocus
              maxLength={12}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={script?.placeholder || '코드 네임 입력...'}
              className="w-full bg-black/40 border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none text-center text-lg font-mono tracking-widest text-cyan-100 py-3 px-4 rounded-lg transition-all placeholder:text-slate-600"
            />
            <button
              onClick={handleProceed}
              disabled={!trimmed}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all"
            >
              확인
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-5 animate-fade-in">
            <p className="text-slate-200 text-sm leading-relaxed">
              {script?.confirmText || '이 코드 네임이 맞습니까?'}
            </p>
            <p className="text-2xl font-mono tracking-widest text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
              「{trimmed}」
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg transition-all"
              >
                <Check size={16} /> 네
              </button>
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg shadow-lg transition-all"
              >
                <X size={16} /> 아니오
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
