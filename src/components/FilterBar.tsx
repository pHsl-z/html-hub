import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useFilterStore, type SortKey } from '@/store/useFilterStore';
import { GRADE_META, DIFFICULTY_META } from '@/types/project';
import type { Grade, Difficulty } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: '最新优先' },
  { value: 'oldest', label: '最早优先' },
  { value: 'name-asc', label: '名称 A→Z' },
  { value: 'name-desc', label: '名称 Z→A' },
];

const GRADES: { value: Grade | 'all'; label: string }[] = [
  { value: 'all', label: '全部学段' },
  { value: 'primary', label: GRADE_META.primary },
  { value: 'middle', label: GRADE_META.middle },
  { value: 'high', label: GRADE_META.high },
  { value: 'college', label: GRADE_META.college },
];

const DIFFICULTIES: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: '全部难度' },
  { value: 'easy', label: DIFFICULTY_META.easy },
  { value: 'medium', label: DIFFICULTY_META.medium },
  { value: 'hard', label: DIFFICULTY_META.hard },
];

export function FilterBar() {
  const { query, setQuery, sort, setSort, grade, setGrade, difficulty, setDifficulty, tags, toggleTag, clearTags, resetAll, hasActiveFilters } = useFilterStore();
  const { projects } = useProjects();
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // 收集所有可用标签
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  // 点击外部关闭筛选面板
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
    };
    if (showFilters) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showFilters]);

  const active = hasActiveFilters();

  return (
    <div className="flex items-center gap-2">
      {/* 搜索框 */}
      <div className="relative min-w-0 flex-1">
        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索应用、标签…"
          className="apple-input w-full pl-8 pr-8 py-1.5 text-xs"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* 排序 */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        className="h-[30px] appearance-none rounded-lg bg-gray-100 px-3 text-[11px] text-gray-600 outline-none transition-colors hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* 筛选按钮 */}
      <div ref={filterRef} className="relative">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex h-[30px] items-center gap-1 rounded-lg px-2.5 text-[11px] font-medium transition-colors ${
            active
              ? 'bg-primary/10 text-primary'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <SlidersHorizontal size={12} />
          <span className="hidden sm:inline">筛选</span>
          {active && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {[grade !== 'all', difficulty !== 'all', tags.length > 0].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* 筛选面板 */}
        {showFilters && (
          <div
            className="absolute right-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl bg-white p-4"
            style={{
              boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)',
            }}
          >
            {/* 学段 */}
            <div className="mb-3">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">学段</div>
              <div className="flex flex-wrap gap-1.5">
                {GRADES.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGrade(g.value)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      grade === g.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 难度 */}
            <div className="mb-3">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">难度</div>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      difficulty === d.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 标签 */}
            {allTags.length > 0 && (
              <div className="mb-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">标签</span>
                  {tags.length > 0 && (
                    <button onClick={clearTags} className="text-[10px] text-primary hover:underline">清除</button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={`rounded-lg px-2 py-0.5 text-[11px] transition-colors ${
                        tags.includes(t)
                          ? 'bg-primary/15 text-primary font-medium'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 底部操作 */}
            {active && (
              <button
                onClick={() => { resetAll(); setShowFilters(false); }}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-[11px] text-gray-500 transition-colors hover:bg-gray-50"
              >
                <RotateCcw size={10} /> 重置所有筛选
              </button>
            )}
          </div>
        )}
      </div>

      {/* 快捷重置 */}
      {active && !showFilters && (
        <button
          onClick={resetAll}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1.5 text-[11px] text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        >
          <RotateCcw size={10} /> 重置
        </button>
      )}
    </div>
  );
}
