import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types/project';
import { SUBJECT_META } from '@/types/project';
import { SubjectBadge } from './SubjectBadge';

interface Props { project: Project; index: number; editing?: boolean; onDelete?: (slug: string) => void }

function formatDate(iso: string) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - +d) / 86_400_000);
  if (diffDays < 1) return '今天';
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

/** Apple 风格列表行：类似 iOS 设置 */
export function ProjectRow({ project, index, editing, onDelete }: Props) {
  const color = SUBJECT_META[project.subject].color;
  const isCustom = project.entry.startsWith('custom://');
  const canDelete = editing && isCustom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.18) }}
      className="relative"
    >
      {/* 编辑模式删除按钮 */}
      {editing && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.(project.slug);
          }}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            canDelete
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!canDelete}
        >
          −
        </button>
      )}

      <Link
        to={editing ? '#' : `/run?path=${encodeURIComponent(project.entry)}`}
        className={`group flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-colors hover:bg-gray-50 ${
          editing ? 'animate-wiggle' : ''
        }`}
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
        onClick={editing ? (e) => e.preventDefault() : undefined}
      >
        {/* 缩略图 */}
        <div className="hidden h-10 w-14 shrink-0 overflow-hidden rounded-lg sm:block">
          <img src={project.preview} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>

        {/* 色点 + 标题 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
            <h3 className="truncate text-sm font-semibold text-gray-900">{project.title}</h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-400">
            <SubjectBadge subject={project.subject} withDot={false} />
            {project.tags.slice(0, 3).map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        </div>

        {/* 右侧元信息 */}
        <div className="hidden shrink-0 items-center gap-3 text-[10px] text-gray-400 md:flex">
          <span className="inline-flex items-center gap-1">
            <Clock size={10} /> {formatDate(project.updatedAt)}
          </span>
        </div>

        <ChevronRight size={14} className="shrink-0 text-gray-300" />
      </Link>
    </motion.div>
  );
}
