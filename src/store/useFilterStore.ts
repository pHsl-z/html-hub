import { create } from 'zustand';
import type { Subject, Grade, Difficulty } from '@/types/project';

export type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc';
export type ViewMode = 'large' | 'card' | 'icon' | 'list' | 'table';

interface FilterState {
  query: string;
  setQuery: (q: string) => void;
  subject: Subject | 'all';
  setSubject: (s: Subject | 'all') => void;
  grade: Grade | 'all';
  setGrade: (g: Grade | 'all') => void;
  difficulty: Difficulty | 'all';
  setDifficulty: (d: Difficulty | 'all') => void;
  tags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  resetAll: () => void;
  hasActiveFilters: () => boolean;
}

const STORAGE_KEY = 'html-hub-prefs';

interface Persisted {
  view: ViewMode;
  sort: SortKey;
  subject: Subject | 'all';
}

function loadPersisted(): Partial<Persisted> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Persisted>;
  } catch {
    return {};
  }
}

function savePersisted(p: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

const initial = loadPersisted();

export const useFilterStore = create<FilterState>((set, get) => ({
  query: '',
  setQuery: (q) => set({ query: q }),
  subject: initial.subject ?? 'all',
  setSubject: (s) => {
    set({ subject: s });
    const cur = get();
    savePersisted({ view: cur.view, sort: cur.sort, subject: s });
  },
  grade: 'all',
  setGrade: (g) => set({ grade: g }),
  difficulty: 'all',
  setDifficulty: (d) => set({ difficulty: d }),
  tags: [],
  toggleTag: (tag) =>
    set((s) => ({
      tags: s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag],
    })),
  clearTags: () => set({ tags: [] }),
  sort: initial.sort ?? 'newest',
  setSort: (s) => {
    set({ sort: s });
    const cur = get();
    savePersisted({ view: cur.view, sort: s, subject: cur.subject });
  },
  view: initial.view ?? 'card',
  setView: (v) => {
    try {
      const cur = get();
      savePersisted({ view: v, sort: cur.sort, subject: cur.subject });
    } catch { /* ignore */ }
    set({ view: v });
  },
  resetAll: () => set({ query: '', tags: [], subject: 'all', grade: 'all', difficulty: 'all' }),
  hasActiveFilters: () => {
    const s = get();
    return s.query !== '' || s.subject !== 'all' || s.grade !== 'all' || s.difficulty !== 'all' || s.tags.length > 0;
  },
}));
