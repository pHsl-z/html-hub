import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Subject } from '@/types/project';
import { SUBJECT_META } from '@/types/project';
import { useFilterStore } from '@/store/useFilterStore';

const ICONS: Record<Subject, string> = {
  math: '∑', physics: 'ψ', chemistry: '⚗', biology: '♻',
  chinese: '文', english: 'EN', it: '</>', psychology: 'Ψ', other: '◇',
};

interface Props {
  counts: Record<Subject | 'all', number>;
}

export function SubjectNav({ counts }: Props) {
  const { subject, setSubject } = useFilterStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const currentLabel = subject === 'all'
    ? '全部学科'
    : `${ICONS[subject]} ${SUBJECT_META[subject].label}`;

  return (
    <div ref={ref} className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
      >
        <span>{currentLabel}</span>
        <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] text-gray-500">
          {counts[subject] ?? counts.all}
        </span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-2xl py-1.5"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 0 1px rgba(0,0,0,0.1)',
          }}
        >
          <SubjectItem
            icon="✦" label="全部" count={counts.all}
            active={subject === 'all'}
            onClick={() => { setSubject('all'); setOpen(false); }}
          />
          <div className="my-1 mx-3 h-px bg-gray-100" />
          {(Object.keys(ICONS) as Subject[]).map((s) => (
            <SubjectItem
              key={s}
              icon={ICONS[s]}
              label={SUBJECT_META[s].label}
              color={SUBJECT_META[s].color}
              count={counts[s] || 0}
              active={subject === s}
              onClick={() => { setSubject(s); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectItem({ icon, label, color, count, active, onClick }: {
  icon: string; label: string; color?: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-gray-50"
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold"
        style={{
          color: active ? '#FFFFFF' : (color || '#6B7280'),
          background: active ? (color || '#007AFF') : (color ? `${color}14` : '#F2F2F7'),
        }}
      >
        {icon}
      </span>
      <span className={`flex-1 text-xs ${active ? 'font-semibold text-primary' : 'text-gray-700'}`}>{label}</span>
      <span className="text-[10px] text-gray-400">{count}</span>
      {active && <Check size={12} className="text-primary" />}
    </button>
  );
}
