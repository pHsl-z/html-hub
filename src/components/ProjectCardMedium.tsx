import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types/project';
import { SUBJECT_META } from '@/types/project';
import { SubjectBadge } from './SubjectBadge';

interface Props { project: Project; index: number; editing?: boolean; onDelete?: (slug: string) => void }

/** Apple 风格标准卡片：白色背景、12px 圆角 */
export function ProjectCardMedium({ project, index, editing, onDelete }: Props) {
  const color = SUBJECT_META[project.subject].color;
  const initial = project.title.trim().charAt(0);
  const isCustom = project.entry.startsWith('custom://');
  const canDelete = editing && isCustom;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
      className={`group relative overflow-hidden rounded-xl bg-white transition-shadow duration-200 ${
        editing ? 'animate-wiggle' : ''
      }`}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        if (!editing) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)';
      }}
    >
      {/* 编辑模式删除按钮 */}
      {editing && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.(project.slug);
          }}
          className={`absolute left-2 top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
            canDelete
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!canDelete}
        >
          −
        </button>
      )}

      <Link to={editing ? '#' : `/run?path=${encodeURIComponent(project.entry)}`} className="block" onClick={editing ? (e) => e.preventDefault() : undefined}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <img
            src={project.preview}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* 字符叠加 */}
          <div
            className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold opacity-20"
            style={{ color }}
          >
            {initial}
          </div>

          {/* 角标 */}
          <div className="absolute left-2 top-2">
            <SubjectBadge subject={project.subject} />
          </div>
          {project.featured && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-pill bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
              <Sparkles size={8} /> 精选
            </span>
          )}

          {/* 底部标题 */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8">
            <div className="line-clamp-1 font-display text-[14px] font-semibold text-white">
              {project.title}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[9px] text-white/70">#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
