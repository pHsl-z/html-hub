import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Copy, ExternalLink, Maximize2, Minimize2, RefreshCw, Sidebar } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { SubjectBadge } from '@/components/SubjectBadge';
import { getCustomAppBlobUrl } from '@/components/AddAppModal';
import { GRADE_META, DIFFICULTY_META, SUBJECT_META } from '@/types/project';

export function Run() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const path = params.get('path') || '/';
  const { projects } = useProjects();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [toolbarHover, setToolbarHover] = useState(false);

  const project = useMemo(() => projects.find((p) => p.entry === path) || null, [projects, path]);
  const color = project ? SUBJECT_META[project.subject].color : '#007AFF';

  const isCustom = path.startsWith('custom://');
  const iframeSrc = useMemo(() => {
    if (isCustom) {
      const slug = path.replace('custom://', '');
      return getCustomAppBlobUrl(slug) || 'about:blank';
    }
    return path;
  }, [path, isCustom, tick]);

  useEffect(() => { setLoaded(false); }, [path, tick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          e.preventDefault();
          exitFullscreen();
        } else {
          navigate('/');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen, navigate]);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    const req = el.requestFullscreen || (el as any).webkitRequestFullscreen || (el as any).msRequestFullscreen;
    if (req) {
      req.call(el).catch(() => {
        // 如果全屏失败，尝试用容器
        const container = containerRef.current;
        if (container) {
          const req2 = container.requestFullscreen || (container as any).webkitRequestFullscreen;
          req2?.call(container).catch(() => {});
        }
      });
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    const exit = document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).msExitFullscreen;
    if (exit) exit.call(document).catch(() => {});
  }, []);

  const fullUrl = typeof window !== 'undefined' ? window.location.href : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      {/* ── 顶部工具栏 ── */}
      <div
        className="relative z-10 flex items-center gap-2 px-3 py-2"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
        onMouseEnter={() => setToolbarHover(true)}
        onMouseLeave={() => setToolbarHover(false)}
      >
        {/* 左侧：返回 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/8"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">返回</span>
          </button>
        </div>

        {/* 中间：应用标题 */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span className="truncate font-display text-sm font-semibold text-gray-900">
            {project ? project.title : path}
          </span>
          {project && (
            <span className="hidden sm:inline-flex">
              <SubjectBadge subject={project.subject} size="sm" />
            </span>
          )}
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-1">
          <IconBtn title="复制链接" onClick={copy}>
            {copied ? <span className="text-[9px] font-medium text-primary">OK</span> : <Copy size={13} />}
          </IconBtn>
          <IconBtn title="刷新" onClick={() => setTick((t) => t + 1)}>
            <RefreshCw size={13} />
          </IconBtn>
          <IconBtn title={isFullscreen ? '退出全屏' : '全屏'} onClick={isFullscreen ? exitFullscreen : enterFullscreen}>
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </IconBtn>
          <a href={isCustom ? undefined : path} target="_blank" rel="noreferrer" onClick={isCustom ? (e) => { e.preventDefault(); window.open(iframeSrc, '_blank'); } : undefined}>
            <IconBtn title="新窗口打开" onClick={() => {}}>
              <ExternalLink size={13} />
            </IconBtn>
          </a>
          <div className="mx-1 h-4 w-px bg-gray-200" />
          <IconBtn title={showSidebar ? '隐藏侧栏' : '显示侧栏'} onClick={() => setShowSidebar((v) => !v)}>
            <Sidebar size={13} />
          </IconBtn>
        </div>
      </div>

      {/* ── 主内容区 ── */}
      <div className="flex min-h-0 flex-1">
        <div className="relative flex-1">
          <iframe
            key={`${path}-${tick}`}
            ref={iframeRef}
            src={iframeSrc}
            title={project?.title || path}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
            onLoad={() => setLoaded(true)}
            referrerPolicy="no-referrer"
          />

          {/* 加载指示器 */}
          <AnimatePresence>
            {!loaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
              >
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
                <div className="text-[11px] text-gray-400">正在加载 {project?.title || path}...</div>
              </motion.div>
            )}
          </AnimatePresence>

          {isFullscreen && !toolbarHover && (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/10 to-transparent" />
          )}
        </div>

        {/* ── 右侧信息面板 ── */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="hidden flex-shrink-0 overflow-hidden border-l border-gray-100 md:block"
              style={{ background: '#FAFAFA' }}
            >
              <div className="h-full overflow-y-auto p-4" style={{ width: 280 }}>
                {project ? (
                  <div className="space-y-4">
                    <div>
                      <div className="font-display text-lg font-bold text-gray-900">{project.title}</div>
                      {project.description && (
                        <div className="mt-1.5 text-[12px] leading-relaxed text-gray-500">{project.description}</div>
                      )}
                    </div>

                    <div>
                      <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400">学科</div>
                      <SubjectBadge subject={project.subject} size="md" />
                    </div>

                    {project.tags.length > 0 && (
                      <div>
                        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400">标签</div>
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((t) => (
                            <span key={t} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">#{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                      {project.grade && (
                        <div className="flex justify-between">
                          <span>学段</span>
                          <span className="text-gray-700">{GRADE_META[project.grade]}</span>
                        </div>
                      )}
                      {project.difficulty && (
                        <div className="flex justify-between">
                          <span>难度</span>
                          <span className="text-gray-700">{DIFFICULTY_META[project.difficulty]}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>更新</span>
                        <span className="text-gray-700">{new Date(project.updatedAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                      <a
                        href={isCustom ? undefined : path}
                        target="_blank"
                        rel="noreferrer"
                        onClick={isCustom ? (e) => { e.preventDefault(); window.open(iframeSrc, '_blank'); } : undefined}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
                      >
                        <ExternalLink size={12} /> 在新窗口打开
                      </a>
                      <button
                        onClick={copy}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Copy size={12} /> {copied ? '已复制' : '复制链接'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400">未匹配到清单项目。仍可在左侧查看嵌入的 HTML。</div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── 底部状态栏 ── */}
      <div
        className="flex items-center justify-between px-3 py-1 text-[9px] text-gray-400"
        style={{ background: '#FAFAFA', borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1 w-1 rounded-full bg-green-500" />
            {loaded ? '就绪' : '加载中'}
          </span>
          {project && <span>{SUBJECT_META[project.subject].label}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>Esc 返回</span>
          <span>{isFullscreen ? '退出全屏' : '全屏'}</span>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary"
    >
      {children}
    </button>
  );
}
