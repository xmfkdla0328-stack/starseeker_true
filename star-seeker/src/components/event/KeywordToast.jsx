import React from 'react';
import { Key } from 'lucide-react';
import { ALL_KEYWORDS } from '../../data/keywordData';

export default function KeywordToast({ keywordId, onClose }) {
  const keyword = ALL_KEYWORDS.find(k => k.id === keywordId);
  if (!keyword) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-[90%] max-w-sm">
      <div 
        className="bg-slate-900/95 border border-emerald-500/50 rounded-lg p-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md cursor-pointer transition-all hover:bg-slate-800"
        onClick={onClose}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 flex-shrink-0">
            <Key size={16} />
          </div>
          <div className="flex-1 min-w-0"> 
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">New Keyword Unlocked</p>
            <p className="text-sm text-white font-bold truncate">{keyword.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}