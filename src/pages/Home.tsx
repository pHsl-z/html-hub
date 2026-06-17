import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Check, FolderSearch, X, CheckCircle2, FileSearch } from 'lucide-react';
import { SubjectNav } from '@/components/SubjectNav';
import { FilterBar } from '@/components/FilterBar';
import { ViewSwitcher, VIEW_SHORTCUTS } from '@/components/ViewSwitcher';
import { AddAppModal, deleteCustomApp } from '@/components/AddAppModal';
import { ProjectCardLarge } from '@/components/ProjectCardLarge';
import { ProjectCardMedium } from '@/components/ProjectCardMedium';
import { ProjectIcon } from '@/components/ProjectIcon';
import { ProjectRow } from '@/components/ProjectRow';
import { ProjectTableRow } from '@/components/ProjectTableRow';
import { EmptyState } from '@/components/EmptyState';
import { useProjects } from '@/hooks/useProjects';
import { useFilteredProjects } from '@/hooks/useFilteredProjects';
import { useFilterStore } from '@/store/useFilterStore';
import type { Project, Subject } from '@/types/project';
import { SUBJECT_META } from '@/types/project';
import projectsData from '@/data/projects.json';

const SCAN_HISTORY_KEY = 'html-hub-scan-history';

function loadScanHistory(): string[] {
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveScanHistory(slugs: string[]) {
  try {
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(slugs));
  } catch {
    /* ignore */
  }
}

interface ScanState {
  open: boolean;
  phase: 'scanning' | 'done';
  total: number;
  current: number;
  currentName: string;
  newProjects: Project[];
  isFirstScan: boolean;
}

export function Home() {
  const { projects, loading, refreshCustom } = useProjects();
  const filtered = useFilteredProjects(projects);
  const { view, setView } = useFilterStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefillCode, setPrefillCode] = useState('');
  const [globalDragOver, setGlobalDragOver] = useState(false);
  const [editing, setEditing] = useState(false);
  const [scanState, setScanState] = useState<ScanState>({
    open: false,
    phase: 'scanning',
    total: 0,
    current: 0,
    currentName: '',
    newProjects: [],
    isFirstScan: false,
  });

  const subjectCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.subject] = (acc[p.subject] || 0) + 1;
    return acc;
  }, {});
  const allCounts: Record<Subject | 'all', number> = {
    all: projects.length,
    math: 0, physics: 0, chemistry: 0, biology: 0,
    chinese: 0, english: 0, it: 0, psychology: 0, other: 0,
    ...subjectCounts,
  };

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const v = VIEW_SHORTCUTS[e.key];
      if (v) {
        e.preventDefault();
        setView(v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setView]);

  // 全局粘贴
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      const text = e.clipboardData?.getData('text/plain') || '';
      if (!text.trim()) return;
      if (/<html[\s>]/i.test(text) || /<body[\s>]/i.test(text) || /<head[\s>]/i.test(text) || (/<div/i.test(text) && /<\/div>/i.test(text))) {
        e.preventDefault();
        setPrefillCode(text);
        setShowAddModal(true);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  // 全局拖拽文件
  const handleGlobalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setGlobalDragOver(true);
  }, []);

  const handleGlobalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setGlobalDragOver(false);
  }, []);

  const handleGlobalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setGlobalDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          setPrefillCode(content);
          setShowAddModal(true);
        };
        reader.readAsText(file);
      }
    }
  }, []);

  const handleDelete = useCallback((slug: string) => {
    deleteCustomApp(slug);
    refreshCustom();
  }, [refreshCustom]);

  const toggleEditing = useCallback(() => {
    setEditing((v) => !v);
  }, []);

  // 扫描 projects 文件夹：自动读取构建期生成的 manifest，按项目逐个推进进度
  const scanFolder = useCallback(async () => {
    const allProjects = projectsData as Project[];
    const history = loadScanHistory();
    const isFirstScan = history.length === 0;
    const knownSlugs = new Set(history);

    // 初始化扫描状态
    setScanState({
      open: true,
      phase: 'scanning',
      total: allProjects.length,
      current: 0,
      currentName: '',
      newProjects: [],
      isFirstScan,
    });

    const newOnes: Project[] = [];
    // 模拟逐项扫描，提供视觉反馈
    for (let i = 0; i < allProjects.length; i++) {
      const p = allProjects[i];
      setScanState((s) => ({
        ...s,
        current: i + 1,
        currentName: p.title,
      }));
      if (!knownSlugs.has(p.slug)) {
        newOnes.push(p);
      }
      // 每项最少显示一段时间，让进度条平滑推进
      await new Promise((r) => setTimeout(r, 180));
    }

    // 把所有当前 slug 写回历史
    saveScanHistory(allProjects.map((p) => p.slug));

    setScanState((s) => ({
      ...s,
      phase: 'done',
      newProjects: newOnes,
    }));
  }, []);

  const closeScanModal = useCallback(() => {
    setScanState((s) => ({ ...s, open: false }));
  }, []);

  if (loading) {
    return (
      <div className="container-page py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-page space-y-4 py-5"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* 全局拖拽遮罩 */}
      {globalDragOver && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div
            className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 px-16 py-12"
            style={{ background: 'rgba(0,122,255,0.04)' }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Plus size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-semibold text-gray-900">释放文件以添加应用</div>
              <div className="mt-1 text-sm text-gray-400">支持 .html / .htm 文件</div>
            </div>
          </div>
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center gap-2">
        <SubjectNav counts={allCounts} />
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex-1">
          <FilterBar />
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <ViewSwitcher />
        <div className="h-4 w-px bg-gray-200" />
        <button
          onClick={toggleEditing}
          className={`flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors ${
            editing
              ? 'bg-primary text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          {editing ? <Check size={14} /> : <Pencil size={14} />}
          <span className="hidden sm:inline">{editing ? '完成' : '编辑'}</span>
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <button
          onClick={() => { setPrefillCode(''); setShowAddModal(true); }}
          className="flex h-7 items-center gap-1 rounded-lg px-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary"
          title="添加新应用 (Ctrl+V 粘贴 / 拖入文件)"
        >
          <Plus size={14} />
          <span className="hidden text-[11px] sm:inline">添加</span>
        </button>
        <button
          onClick={scanFolder}
          className="flex h-7 items-center gap-1 rounded-lg px-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary"
          title="扫描文件夹中的 HTML 文件"
        >
          <FolderSearch size={14} />
          <span className="hidden text-[11px] sm:inline">扫描</span>
        </button>
      </div>

      {/* 简洁状态行 */}
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <div>
          <span className="text-primary">{projects.length}</span> 应用 · 显示 <span className="text-gray-600">{filtered.length}</span>
        </div>
        <div className="hidden md:block">
          拖入 .html 文件 或 <kbd className="rounded-md bg-gray-100 px-1 py-0.5 text-gray-500">Ctrl+V</kbd> 粘贴代码添加 · <kbd className="rounded-md bg-gray-100 px-1 py-0.5 text-gray-500">1-5</kbd> 切换视图
        </div>
      </div>

      {/* 网格 / 列表渲染 */}
      {filtered.length === 0 ? (
        <EmptyState query={useFilterStore.getState().query} />
      ) : view === 'large' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => <ProjectCardLarge key={p.slug} project={p} index={i} editing={editing} onDelete={handleDelete} />)}
        </div>
      ) : view === 'card' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((p, i) => <ProjectCardMedium key={p.slug} project={p} index={i} editing={editing} onDelete={handleDelete} />)}
        </div>
      ) : view === 'icon' ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 sm:gap-4 md:grid-cols-8 lg:grid-cols-10">
          {filtered.map((p, i) => <ProjectIcon key={p.slug} project={p} index={i} editing={editing} onDelete={handleDelete} />)}
        </div>
      ) : view === 'list' ? (
        <div className="space-y-1.5">
          {filtered.map((p, i) => <ProjectRow key={p.slug} project={p} index={i} editing={editing} onDelete={handleDelete} />)}
        </div>
      ) : (
        <ProjectTable projects={filtered} editing={editing} onDelete={handleDelete} />
      )}

      {/* 添加应用弹窗 */}
      <AddAppModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setPrefillCode(''); }}
        onCreated={refreshCustom}
        prefillCode={prefillCode}
      />

      {/* 扫描进度 / 结果弹窗 */}
      <ScanModal state={scanState} onClose={closeScanModal} />
    </div>
  );
}

function ScanModal({ state, onClose }: { state: ScanState; onClose: () => void }) {
  if (!state.open) return null;
  const percent = state.total === 0 ? 0 : Math.round((state.current / state.total) * 100);
  const isDone = state.phase === 'done';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            {isDone ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <FileSearch size={18} className="text-primary" />
            )}
            <div className="font-display text-[15px] font-semibold text-gray-900">
              {isDone ? '扫描完成' : '正在扫描 projects 文件夹'}
            </div>
          </div>
          {isDone && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 内容 */}
        <div className="px-5 py-4">
          {!isDone ? (
            <>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="truncate text-sm text-gray-700">{state.currentName || '准备中...'}</span>
                <span className="ml-3 shrink-0 text-xs font-medium text-gray-500">
                  {state.current} / {state.total}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] text-gray-400">
                共 {state.total} 个项目，已扫描 {percent}%
              </div>
            </>
          ) : (
            <>
              {state.newProjects.length === 0 ? (
                <div className="py-2 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <CheckCircle2 size={20} className="text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-700">暂无新增项目</div>
                  <div className="mt-1 text-xs text-gray-400">
                    已扫描 {state.total} 个项目，全部为已知项目
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 text-sm text-gray-700">
                    {state.isFirstScan ? (
                      <>本次扫描共发现 <span className="font-semibold text-primary">{state.newProjects.length}</span> 个项目：</>
                    ) : (
                      <>新增 <span className="font-semibold text-primary">{state.newProjects.length}</span> 个项目：</>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50">
                    {state.newProjects.map((p) => {
                      const meta = SUBJECT_META[p.subject];
                      return (
                        <div
                          key={p.slug}
                          className="flex items-center gap-3 border-b border-gray-100 px-3 py-2 last:border-b-0"
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {p.title.trim().charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">{p.title}</div>
                            <div className="mt-0.5 truncate text-[11px] text-gray-400">
                              <span style={{ color: meta.color }}>{meta.label}</span>
                              {p.tags.length > 0 && <span> · {p.tags.slice(0, 3).join(' · ')}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* 底部按钮 */}
        {isDone && (
          <div className="flex justify-end border-t border-gray-100 px-5 py-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectTable({ projects, editing, onDelete }: { projects: import('@/types/project').Project[]; editing?: boolean; onDelete?: (slug: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {editing && <th className="py-2.5 pl-3 pr-0" />}
              <th className="py-2.5 pl-4 pr-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">应用</th>
              <th className="hidden py-2.5 pr-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 md:table-cell">学科</th>
              <th className="hidden py-2.5 pr-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">标签</th>
              <th className="hidden py-2.5 pr-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">学段 / 难度</th>
              <th className="py-2.5 pr-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">更新</th>
              <th className="py-2.5 pr-4" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => <ProjectTableRow key={p.slug} project={p} index={i} editing={editing} onDelete={onDelete} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
