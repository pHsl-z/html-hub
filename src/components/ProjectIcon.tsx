import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Project } from '@/types/project';
import { SUBJECT_META } from '@/types/project';

interface Props { project: Project; index: number; editing?: boolean; onDelete?: (slug: string) => void }

/** Apple 风格图标视图：圆角方形图标 + 下方标题，类似 iOS 主屏幕 */
export function ProjectIcon({ project, index, editing, onDelete }: Props) {
  const color = SUBJECT_META[project.subject].color;
  const initial = project.title.trim().charAt(0);
  const isCustom = project.entry.startsWith('custom://');
  const canDelete = editing && isCustom;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.012, 0.15) }}
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
          className={`absolute -left-1 -top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
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
        className="group flex flex-col items-center gap-2"
        onClick={editing ? (e) => e.preventDefault() : undefined}
      >
        <div
          className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-[22%] transition-transform duration-200 group-hover:scale-105 ${
            editing ? 'animate-wiggle' : ''
          }`}
          style={{
            background: color,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {/* 大号字符 */}
          <span
            className="font-display text-4xl font-bold text-white sm:text-5xl"
          >
            {initial}
          </span>
        </div>

        <div className="w-full text-center">
          <div className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-gray-900 sm:text-xs">
            {project.title}
          </div>
          {project.featured && (
            <div className="mt-1 text-[9px] text-amber-500">★ 精选</div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
