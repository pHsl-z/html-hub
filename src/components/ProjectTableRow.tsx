import { motion } from 'framer-motion';
import { Clock, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types/project';
import { GRADE_META, DIFFICULTY_META, SUBJECT_META } from '@/types/project';

interface Props { project: Project; index: number; editing?: boolean; onDelete?: (slug: string) => void }

function formatDate(iso: string) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - +d) / 86_400_000);
  if (diffDays < 1) return '今天';
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

/** Apple 风格表格行 */
export function ProjectTableRow({ project, index, editing, onDelete }: Props) {
  const color = SUBJECT_META[project.subject].color;
  const isCustom = project.entry.startsWith('custom://');
  const canDelete = editing && isCustom;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.015, 0.15) }}
      className={`group border-b border-gray-100 transition-colors hover:bg-gray-50 ${
        editing ? 'animate-wiggle' : ''
      }`}
    >
      {/* 编辑模式删除按钮列 */}
      {editing && (
        <td className="py-2.5 pl-3 pr-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canDelete) onDelete?.(project.slug);
            }}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              canDelete
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!canDelete}
          >
            <Minus size={12} />
          </button>
        </td>
      )}

      <td className="py-2.5 pl-2 pr-2 sm:pl-4">
        <Link
          to={editing ? '#' : `/run?path=${encodeURIComponent(project.entry)}`}
          onClick={editing ? (e) => e.preventDefault() : undefined}
          className="flex items-center gap-2.5"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-base font-bold"
            style={{ background: `${color}14`, color }}
          >
            {project.title.trim().charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">{project.title}</div>
            {project.description && (
              <div className="truncate text-[10px] text-gray-400">{project.description}</div>
            )}
          </div>
        </Link>
      </td>

      <td className="hidden py-2.5 pr-2 md:table-cell">
        <span
          className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-medium"
          style={{ color, background: `${color}14` }}
        >
          {SUBJECT_META[project.subject].label}
        </span>
      </td>

      <td className="hidden py-2.5 pr-2 lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
              #{t}
            </span>
          ))}
        </div>
      </td>

      <td className="hidden py-2.5 pr-2 sm:table-cell">
        <div className="flex flex-col gap-0.5 text-[10px] text-gray-400">
          {project.grade && <span>{GRADE_META[project.grade]}</span>}
          {project.difficulty && <span className="text-gray-300">{DIFFICULTY_META[project.difficulty]}</span>}
        </div>
      </td>

      <td className="py-2.5 pr-2 text-[10px] text-gray-400 sm:pr-4">
        <span className="inline-flex items-center gap-1">
          <Clock size={10} />
          {formatDate(project.updatedAt)}
        </span>
      </td>

      <td className="py-2.5 pr-2 sm:pr-4">
        <Link
          to={editing ? '#' : `/run?path=${encodeURIComponent(project.entry)}`}
          onClick={editing ? (e) => e.preventDefault() : undefined}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </Link>
      </td>
    </motion.tr>
  );
}
