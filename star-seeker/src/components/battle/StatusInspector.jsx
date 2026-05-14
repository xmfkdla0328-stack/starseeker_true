// 길게 누름으로 열리는 버프/디버프 인스펙터.
// 아군: 화면 아래에서 슬라이드 업 / 적: 화면 위에서 슬라이드 다운.
// 최대 높이 50dvh. 백드롭/외부 클릭/X 버튼/길게 누름 해제 시 닫힘.
// 부모(BattleScreen)는 열림/닫힘에 맞춰 togglePause로 전투를 일시정지/재개한다.
import React, { useEffect } from 'react';
import { X, Sparkles, Shield, Zap, Heart, AlertTriangle, Plus } from 'lucide-react';
import { getUnitStatusEffects } from '../../hooks/battleLogic/statusEffects';

const KIND_META = {
  buff:     { color: 'text-emerald-300',  bg: 'bg-emerald-900/40', border: 'border-emerald-500/40', icon: Sparkles },
  // 회복 효과는 + 기호로 표시 — 의료/회복 표상.
  heal:     { color: 'text-emerald-300',  bg: 'bg-emerald-900/40', border: 'border-emerald-500/40', icon: Plus },
  passive:  { color: 'text-sky-300',      bg: 'bg-sky-900/40',     border: 'border-sky-500/40',     icon: Zap },
  shield:   { color: 'text-cyan-200',     bg: 'bg-cyan-900/40',    border: 'border-cyan-500/40',    icon: Shield },
  charging: { color: 'text-rose-300',     bg: 'bg-rose-900/40',    border: 'border-rose-500/40',    icon: AlertTriangle },
  debuff:   { color: 'text-rose-300',     bg: 'bg-rose-900/40',    border: 'border-rose-500/40',    icon: AlertTriangle },
};

const SOURCE_LABEL = {
  self:    '자체',
  global:  '전역',
  passive: '패시브',
};

function formatTimeLeft(ms) {
  if (ms == null) return null;
  if (ms <= 0) return '곧 만료';
  return `${(ms / 1000).toFixed(1)}초`;
}

export default function StatusInspector({ unit, side = 'ally', globalBuffs, onClose }) {
  // ESC 키로 닫기 — 데스크탑 사용성.
  useEffect(() => {
    if (!unit) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unit, onClose]);

  if (!unit) return null;

  const effects = getUnitStatusEffects(unit, globalBuffs, side);
  const isAlly = side === 'ally';
  const sheetPos = isAlly ? 'bottom-0 rounded-t-2xl border-t' : 'top-0 rounded-b-2xl border-b';
  const slideDir = isAlly ? 'translate-y-0' : 'translate-y-0';
  const enterFrom = isAlly ? 'translate-y-full' : '-translate-y-full';

  // absolute(부모 BattleScreenContainer 기준) — 모바일 max-w-md 컨테이너 안쪽으로만 슬라이드되어
  // 데스크톱 미리보기에서도 좌우 검은 띠를 침범하지 않는다.
  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-[fadeIn_120ms_ease-out]"
        onClick={onClose}
      />

      {/* 시트 */}
      <div
        className={`absolute inset-x-0 ${sheetPos} max-h-[50dvh] flex flex-col pointer-events-auto bg-slate-900/95 border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.7)] transform ${slideDir}`}
        style={{
          animation: `${isAlly ? 'slideUpSheet' : 'slideDownSheet'} 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/10 flex-shrink-0">
          <div className={`w-9 h-9 rounded-full overflow-hidden border-2 ${isAlly ? 'border-cyan-400/60' : 'border-rose-400/60'} bg-slate-800 flex-shrink-0 relative`}>
            {unit.image ? (
              <img src={unit.image} alt={unit.name} className="w-full h-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white/90">
                {unit.name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.18em] uppercase text-slate-400">
              {isAlly ? 'Ally Status' : 'Enemy Status'}
            </div>
            <div className="text-base font-bold text-white truncate">{unit.name || '미상'}</div>
          </div>
          {unit.hp != null && unit.maxHp != null && (
            <div className="flex items-center gap-1 text-xs font-mono text-rose-200">
              <Heart size={12} className="fill-rose-500/70 text-rose-400" />
              {Math.max(0, Math.floor(unit.hp))}<span className="text-slate-500">/{unit.maxHp}</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-1 p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        {/* 이펙트 리스트 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
          {effects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              현재 적용 중인 효과가 없습니다.
            </div>
          ) : (
            effects.map((eff) => {
              const meta = KIND_META[eff.kind] || KIND_META.buff;
              const Icon = meta.icon;
              const time = formatTimeLeft(eff.timeLeftMs);
              const turns = eff.turnsLeft != null ? `${eff.turnsLeft}턴 남음` : null;
              return (
                <div
                  key={eff.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${meta.border} ${meta.bg}`}
                >
                  <div className={`flex-shrink-0 ${meta.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${meta.color}`}>{eff.label}</span>
                      {eff.source && SOURCE_LABEL[eff.source] && (
                        <span className="text-[9px] tracking-wider uppercase text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {SOURCE_LABEL[eff.source]}
                        </span>
                      )}
                    </div>
                    {eff.detail && (
                      <div className="text-xs text-slate-300 mt-0.5">{eff.detail}</div>
                    )}
                  </div>
                  {(time || turns) && (
                    <div className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                      {time || turns}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 푸터 힌트 */}
        <div className="flex-shrink-0 text-center text-[10px] text-slate-500 pb-2">
          전투 일시정지 중 · 바깥 영역을 탭하면 닫힙니다
        </div>
      </div>

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes slideDownSheet {
          from { transform: translateY(-100%); }
          to   { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
