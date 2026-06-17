import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Upload, Plus } from 'lucide-react';
import type { Subject } from '@/types/project';
import { SUBJECT_META } from '@/types/project';

const STORAGE_KEY = 'html-hub-custom-apps';

export interface CustomApp {
  slug: string;
  title: string;
  subject: Subject;
  tags: string[];
  description: string;
  html: string;
  createdAt: string;
}

export function loadCustomApps(): CustomApp[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomApps(apps: CustomApp[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch { /* quota exceeded */ }
}

export function deleteCustomApp(slug: string) {
  const apps = loadCustomApps().filter((a) => a.slug !== slug);
  saveCustomApps(apps);
}

export function getCustomAppBlobUrl(slug: string): string | null {
  const app = loadCustomApps().find((a) => a.slug === slug);
  if (!app) return null;
  const blob = new Blob([app.html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  prefillCode?: string;
}

type Tab = 'paste' | 'drop';

export function AddAppModal({ open, onClose, onCreated, prefillCode }: Props) {
  const [tab, setTab] = useState<Tab>('paste');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('other');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillCode) {
      setHtmlCode(prefillCode);
      setTab('paste');
    }
  }, [prefillCode]);

  const reset = () => {
    setTitle('');
    setSubject('other');
    setTags('');
    setDescription('');
    setHtmlCode('');
    setError('');
  };

  const handleSubmit = useCallback(() => {
    if (!htmlCode.trim()) {
      setError('请输入或上传 HTML 代码');
      return;
    }
    if (!/<html[\s>]/i.test(htmlCode) && !/<body[\s>]/i.test(htmlCode) && !/<div/i.test(htmlCode)) {
      setError('内容似乎不是有效的 HTML');
      return;
    }

    const slug = 'custom-' + Date.now().toString(36);
    const app: CustomApp = {
      slug,
      title: title.trim() || `自定义应用 ${new Date().toLocaleDateString('zh-CN')}`,
      subject,
      tags: tags.split(/[,，\s]+/).filter(Boolean),
      description: description.trim(),
      html: htmlCode,
      createdAt: new Date().toISOString(),
    };

    const apps = loadCustomApps();
    apps.unshift(app);
    saveCustomApps(apps);
    reset();
    onCreated();
    onClose();
  }, [htmlCode, title, subject, tags, description, onCreated, onClose]);

  const handleFileDrop = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('请拖入 .html 文件');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setHtmlCode(content);
      if (!title) {
        setTitle(file.name.replace(/\.html?$/i, ''));
      }
      setError('');
    };
    reader.readAsText(file);
  }, [title]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileDrop(e.dataTransfer.files);
  }, [handleFileDrop]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileDrop(e.target.files);
  }, [handleFileDrop]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* 弹窗 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-popup bg-white"
            style={{
              boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 8px 40px rgba(0,0,0,0.06)',
            }}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Plus size={14} className="text-primary" />
                </div>
                <span className="font-display text-sm font-semibold text-gray-900">添加新应用</span>
              </div>
              <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
              {/* Tab 切换 - iOS Segmented Control */}
              <div className="flex rounded-lg p-0.5" style={{ background: '#F2F2F7' }}>
                <TabBtn active={tab === 'paste'} onClick={() => setTab('paste')} icon={<Code2 size={13} />} label="粘贴代码" />
                <TabBtn active={tab === 'drop'} onClick={() => setTab('drop')} icon={<Upload size={13} />} label="拖入文件" />
              </div>

              {/* 粘贴代码 */}
              {tab === 'paste' && (
                <div>
                  <textarea
                    value={htmlCode}
                    onChange={(e) => { setHtmlCode(e.target.value); setError(''); }}
                    placeholder="在此粘贴完整的 HTML 代码..."
                    className="w-full rounded-xl border border-transparent bg-gray-100 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-gray-900 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    style={{ minHeight: 180, resize: 'vertical' }}
                    spellCheck={false}
                  />
                  <div className="mt-1 text-right text-[10px] text-gray-400">{htmlCode.length} 字符</div>
                </div>
              )}

              {/* 拖入文件 */}
              {tab === 'drop' && (
                <div
                  ref={dropRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all"
                  style={{
                    borderColor: dragOver ? '#007AFF' : '#D1D1D6',
                    background: dragOver ? 'rgba(0,122,255,0.04)' : '#FAFAFA',
                  }}
                >
                  <Upload size={28} className={dragOver ? 'text-primary' : 'text-gray-400'} />
                  <div className="mt-3 text-sm text-gray-600">
                    {htmlCode ? '已加载文件，可重新拖入替换' : '将 .html 文件拖到此处'}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-400">或</div>
                  <label className="mt-2 cursor-pointer rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                    选择文件
                    <input type="file" accept=".html,.htm" className="hidden" onChange={handleFileInput} />
                  </label>
                  {htmlCode && (
                    <div className="mt-2 text-[10px] text-green-600">已加载 {htmlCode.length} 字符</div>
                  )}
                </div>
              )}

              {/* 元信息 */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-gray-500">名称</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="应用名称"
                      className="apple-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-gray-500">学科</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as Subject)}
                      className="apple-input w-full text-xs"
                    >
                      {Object.entries(SUBJECT_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-gray-500">标签 <span className="text-gray-400">（逗号分隔）</span></label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="函数, 图像, 交互"
                    className="apple-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-gray-500">描述</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简短描述这个应用..."
                    className="apple-input w-full text-xs"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">{error}</div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                创建应用
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}
