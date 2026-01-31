import React, { useState } from 'react';
import { ChevronLeft, BookOpen, User, GitBranch, Hash } from 'lucide-react';
import KeywordTab from './guidebook/KeywordTab';
import CharacterTab from './guidebook/CharacterTab';
import CausalityTreeTab from './guidebook/CausalityTreeTab';

export default function GuideBookScreen({ onBack, visitedNodes = [], collectedKeywords = [] }) {
  const [activeTab, setActiveTab] = useState('keyword'); // 'keyword', 'character', 'tree'

  return (
    <div className="flex-1 flex flex-col relative z-10 animate-fade-in h-full bg-[#0f172a] text-slate-100">
      
      {/* 1. 헤더 & 탭 네비게이션 */}
      <div className="flex flex-col border-b border-white/10 bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center p-4">
            <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors mr-4">
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-emerald-300 tracking-widest flex items-center gap-2">
                <BookOpen size={20} /> ARCHIVES
            </h2>
        </div>
        
        {/* 탭 버튼 */}
        <div className="flex px-2">
            <TabButton label="키워드 도감" icon={Hash} id="keyword" active={activeTab} onClick={setActiveTab} />
            <TabButton label="캐릭터 도감" icon={User} id="character" active={activeTab} onClick={setActiveTab} />
            <TabButton label="인과의 나무" icon={GitBranch} id="tree" active={activeTab} onClick={setActiveTab} />
        </div>
      </div>

      {/* 2. 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'keyword' && <KeywordTab collectedKeywords={collectedKeywords} />}
        {activeTab === 'character' && <CharacterTab />}
        {activeTab === 'tree' && <CausalityTreeTab visitedNodes={visitedNodes} />}
      </div>
    </div>
  );
}

// --- 탭 버튼 컴포넌트 ---
function TabButton({ label, icon: Icon, id, active, onClick }) {
    return (
        <button 
            onClick={() => onClick(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all border-b-2
                ${active === id 
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-900/10' 
                    : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
            <Icon size={14} /> {label}
        </button>
    );
}