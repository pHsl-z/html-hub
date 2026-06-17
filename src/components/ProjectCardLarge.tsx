import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types/project';
import { GRADE_META, DIFFICULTY_META, SUBJECT_META } from '@/types/project';
import { SubjectBadge } from './SubjectBadge';

interface Props { project: Project; index: number; editing?: boolean; onDelete?: (slug: string) => void }

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diffDays = Math.floor((now - +d) / 86_400_000);
  if (diffDays < 1) return '今天';
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  return d.toLocaleDateString('zh-CN', { year: '2-digit', month: '2-digit', day: '2-digit' });
}

/** Apple 风格大卡片：白色背景、圆角、柔和阴影 */
export function ProjectCardLarge({ project, index, editing, onDelete }: Props) {
  const isCustom = project.entry.startsWith('custom://');
  const canDelete = editing && isCustom;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.24) }}
      className={`group relative overflow-hidden rounded-card bg-white transition-shadow duration-200 ${
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
          className={`absolute left-3 top-3 z-20 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
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
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-card">
          <img
            src={project.preview}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* 角标 */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <SubjectBadge subject={project.subject} />
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                <Sparkles size={9} /> 精选
              </span>
            )}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="p-4">
          <div className="font-display text-lg font-semibold text-gray-900">{project.title}</div>
          {project.description && (
            <div className="mt-1 line-clamp-2 text-xs text-gray-500">{project.description}</div>
          )}

          {/* 标签 */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {project.tags.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
              >
                #{t}
              </span>
            ))}
            <div className="ml-auto flex items-center gap-2 text-[10px] text-gray-400">
              {project.grade && (
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5">{GRADE_META[project.grade]}</span>
              )}
              {project.difficulty && (
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5">{DIFFICULTY_META[project.difficulty]}</span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock size={9} /> {formatDate(project.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
