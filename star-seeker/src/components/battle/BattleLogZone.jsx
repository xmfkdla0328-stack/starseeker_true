import React, { useEffect, useRef } from 'react';

export default function BattleLogZone({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type) => {
    switch(type) {
      case 'enemy_ult': return 'text-rose-400 font-bold drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]';
      case 'ally_ult': return 'text-amber-300 font-bold drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]';
      case 'warning': return 'text-fuchsia-400 font-bold italic animate-pulse';
      case 'skill': return 'text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]';
      case 'system': return 'text-slate-400 text-xs italic';
      default: return 'text-slate-200';
    }
  };

  // [수정] h-full 추가, mx-2 my-2 및 flex-[3] 제거
  return (
    <div className="relative overflow-hidden z-10 rounded-lg bg-black/20 border border-white/5 backdrop-blur-sm flex flex-col h-full">
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none flex items-center px-3">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest">System Log // Realtime Analysis</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 pt-8 pb-4 space-y-1.5 text-xs font-mono scrollbar-hide mask-image-linear-gradient">
        {logs.map((log) => (
          <div key={log.id} className={`${getLogStyle(log.type)} animate-fade-in pl-2 border-l-2 border-transparent hover:border-white/20 hover:bg-white/5 transition-colors py-0.5 rounded-r`}>
            <span className="opacity-40 text-[9px] mr-2 tracking-tighter">
              {new Date(log.id).toLocaleTimeString('en-US', {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}
            </span>
            {log.text}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}
