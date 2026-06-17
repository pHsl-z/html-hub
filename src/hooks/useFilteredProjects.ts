import { useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import type { Project } from '@/types/project';

export function useFilteredProjects(projects: Project[]) {
  const { query, subject, grade, difficulty, tags, sort } = useFilterStore();

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (subject !== 'all' && p.subject !== subject) return false;
      if (grade !== 'all' && p.grade !== grade) return false;
      if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
      if (tags.length > 0 && !tags.every((t) => p.tags.includes(t))) return false;
      if (q) {
        const hay = [p.title, p.description ?? '', p.tags.join(' '), p.slug].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return +new Date(a.updatedAt) - +new Date(b.updatedAt);
        case 'name-asc':
          return a.title.localeCompare(b.title, 'zh-CN');
        case 'name-desc':
          return b.title.localeCompare(a.title, 'zh-CN');
        case 'newest':
        default:
          return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      }
    });

    return list;
  }, [projects, query, subject, grade, difficulty, tags, sort]);
}
