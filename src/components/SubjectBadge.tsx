import type { Subject } from '@/types/project';
import { SUBJECT_META } from '@/types/project';

const ICONS: Record<Subject, string> = {
  math: '∑',
  physics: 'ψ',
  chemistry: '⚗',
  biology: '♻',
  chinese: '文',
  english: 'EN',
  it: '</>',
  psychology: 'Ψ',
  other: '◇',
};

export function SubjectBadge({ subject, size = 'sm', withDot = true }: { subject: Subject; size?: 'sm' | 'md'; withDot?: boolean }) {
  const meta = SUBJECT_META[subject];
  const color = meta.color;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 font-semibold ${
        size === 'sm' ? 'text-[10px]' : 'text-[11px]'
      }`}
      style={{
        color: color,
        background: `${color}14`,
      }}
    >
      {withDot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      <span>{ICONS[subject]} {meta.label}</span>
    </span>
  );
}
