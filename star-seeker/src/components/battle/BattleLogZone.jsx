import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AlignLeft, Sword, MessageSquare, ArrowDown } from 'lucide-react';

export default function BattleLogZone({ logs }) {
  const scrollRef = useRef(null);
  const [filter, setFilter] = useState('all'); // all, combat, dialogue
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasNewLogs, setHasNewLogs] = useState(false);

  // 필터링 로직
  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs;
    if (filter === 'combat') return logs.filter(l => l.type === 'damage' || l.type === 'skill' || l.type === 'kill' || l.type === 'buff');
    if (filter === 'dialogue') return logs.filter(l => l.type === 'dialogue' || l.type === 'story');
    return logs;
  }, [logs, filter]);

  // 로그 추가 시 스크롤 처리
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
      setHasNewLogs(false);
    } else {
      // 스크롤이 고정된 상태에서 새 로그가 오면 알림 표시
      setHasNewLogs(true);
    }
  }, [filteredLogs, autoScroll]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // 사용자가 스크롤을 조작했는지 감지
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // 바닥에 거의 도달했는지 확인 (여유값 10px)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

    if (isAtBottom) {
      setAutoScroll(true);
      setHasNewLogs(false);
    } else {
      setAutoScroll(false);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (newFilter) => {
    setFilter(newFilter);
    setAutoScroll(true); // 탭 바꾸면 최신 내용으로 이동
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/80 backdrop-blur-md border-t border-white/10 font-mono text-xs relative group">
      
      {/* 1. 상단 탭 헤더 */}
      <div className="flex items-center border-b border-white/10 bg-black/20">
        <TabButton 
            active={filter === 'all'} 
            onClick={() => handleTabChange('all')} 
            icon={<AlignLeft size={10} />} 
            label="ALL" 
        />
        <TabButton 
            active={filter === 'combat'} 
            onClick={() => handleTabChange('combat')} 
            icon={<Sword size={10} />} 
            label="CMBT" 
        />
        <TabButton 
            active={filter === 'dialogue'} 
            onClick={() => handleTabChange('dialogue')} 
            icon={<MessageSquare size={10} />} 
            label="TALK" 
        />
      </div>

      {/* 2. 로그 영역 */}
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {filteredLogs.length === 0 ? (
            <div className="text-slate-600 italic text-center mt-4">No logs recorded.</div>
        ) : (
            filteredLogs.map((log, i) => (
                <LogItem key={i} log={log} />
            ))
        )}
      </div>

      {/* 3. 새 메시지 알림 버튼 (플로팅) */}
      {!autoScroll && hasNewLogs && (
        <button 
            onClick={() => { setAutoScroll(true); scrollToBottom(); }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cyan-600/90 text-white px-3 py-1 rounded-full text-[10px] flex items-center gap-1 shadow-lg hover:bg-cyan-500 transition-all animate-bounce"
        >
            <ArrowDown size={10} /> New Logs
        </button>
      )}
    </div>
  );
}

// 서브 컴포넌트: 탭 버튼
const TabButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 transition-colors
            ${active ? 'bg-white/10 text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
    >
        {icon} <span className="text-[9px] tracking-wider">{label}</span>
    </button>
);

// 서브 컴포넌트: 로그 아이템 (타입별 스타일링)
const LogItem = ({ log }) => {
    const time = new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    // 타입별 스타일 정의
    let styleClass = "text-slate-300"; // 기본
    if (log.type === 'system') styleClass = "text-cyan-400 font-bold border-l-2 border-cyan-500 pl-2";
    else if (log.type === 'skill') styleClass = "text-amber-400 font-bold";
    else if (log.type === 'damage') styleClass = "text-slate-400";
    else if (log.type === 'kill') styleClass = "text-rose-500 font-bold bg-rose-950/30 px-1 rounded";
    else if (log.type === 'dialogue') styleClass = "text-white italic bg-white/5 p-1 rounded border border-white/10";

    return (
        <div className={`break-words leading-relaxed text-[11px] ${styleClass}`}>
            <span className="text-[9px] text-slate-600 mr-2 opacity-70 select-none">[{time}]</span>
            {log.text}
        </div>
    );
};