import { Link } from 'react-router-dom';
import { Folder, FileCode2, ArrowUpRight } from 'lucide-react';

const STEPS = [
  {
    icon: <Folder size={14} />,
    title: '1. 放入项目目录',
    desc: '在仓库根目录下的 projects/ 文件夹中，新建一个子目录（用作 slug），将 HTML 文件命名为 index.html 放进去，可附带 CSS/JS/图片。',
  },
  {
    icon: <FileCode2 size={14} />,
    title: '2. 添加 meta.json',
    desc: '可选但建议：在同一目录下创建 meta.json，填写 title / subject / tags / description / grade / difficulty / featured 等字段，构建脚本会自动解析。',
  },
  {
    icon: <ArrowUpRight size={14} />,
    title: '3. 构建 & 部署',
    desc: '本地运行 pnpm build，或将代码推送至 main 分支，由 GitHub Actions 自动构建并发布到 GitHub Pages。',
  },
];

const META_EXAMPLE = `{
  "title": "二次函数图像探索",
  "subject": "math",
  "tags": ["函数", "图像", "高中"],
  "description": "滑块控制 a,b,c，实时观察抛物线形态。",
  "grade": "high",
  "difficulty": "medium",
  "featured": true
}`;

const SUBJECTS = [
  { key: 'math', label: '数学' },
  { key: 'physics', label: '物理' },
  { key: 'chemistry', label: '化学' },
  { key: 'biology', label: '生物' },
  { key: 'chinese', label: '语文' },
  { key: 'english', label: '英语' },
  { key: 'it', label: '信息技术' },
  { key: 'psychology', label: '心理' },
  { key: 'other', label: '其他' },
];

export function About() {
  return (
    <div className="container-page max-w-5xl py-6">
      <header className="mb-6">
        <div className="text-[10px] font-medium uppercase tracking-widest text-primary">about · 项目说明</div>
        <h1 className="mt-1 font-display text-3xl font-bold text-gray-900">把零散的 HTML，汇成可分享的中心</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
          纯静态前端应用。将 HTML 课件放入 <code className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-primary">projects/</code> 下，运行
          <code className="mx-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-primary">pnpm build</code>
          即可自动生成清单与预览。托管于 GitHub Pages，无需服务器。
        </p>
      </header>

      {/* 使用指南 */}
      <section className="grid gap-3 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl bg-white p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {s.icon}
            </div>
            <div className="font-display text-base font-semibold text-gray-900">{s.title}</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">{s.desc}</p>
          </div>
        ))}
      </section>

      {/* meta.json 示例 */}
      <section className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-amber-500">示例</span>
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] text-gray-400">meta.json</span>
        </div>
        <pre
          className="overflow-auto rounded-2xl bg-gray-900 p-4 font-mono text-[12px] leading-relaxed text-gray-200"
        >
{META_EXAMPLE}
        </pre>
      </section>

      {/* 学科可选值 */}
      <section className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-pink-500">学科</span>
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] text-gray-400">共 {SUBJECTS.length} 种</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => (
            <span key={s.key} className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] text-gray-700">
              {s.label} · <span className="text-primary">{s.key}</span>
            </span>
          ))}
        </div>
      </section>

      {/* 技术栈 */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Info title="前端栈" content="React 18 + TypeScript + Vite 5 · Tailwind CSS · Zustand + Framer Motion" />
        <Info title="部署" content="GitHub Actions 构建 → GitHub Pages 静态托管 · 支持自定义 base path" />
        <Info title="项目扫描" content="Node.js 脚本扫描 projects/，自动识别学科、生成 SVG 预览占位、拷贝资源" />
        <Info title="安全" content="iframe 使用 sandbox，禁止顶层跳转；所有内容均来自仓库，无第三方脚本注入" />
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          回到首页
        </Link>
      </div>
    </div>
  );
}

function Info({ title, content }: { title: string; content: string }) {
  return (
    <div
      className="rounded-2xl bg-white p-3"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">{title}</div>
      <div className="text-[12px] leading-relaxed text-gray-500">{content}</div>
    </div>
  );
}
