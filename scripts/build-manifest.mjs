#!/usr/bin/env node
/**
 * build-manifest.mjs
 * 扫描 projects/ 目录，生成 src/data/projects.json，并将项目资源复制到 public/projects/
 *
 * 每个项目文件夹结构：
 *   projects/<slug>/
 *     ├── index.html              (必备)
 *     ├── meta.json               (可选 - 标题/学科/标签/描述/学段/难度/featured)
 *     ├── preview.png|jpg|svg|webp(可选)
 *     └── ...其他资源文件...
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT, 'projects');
const PUBLIC_PROJECTS = path.join(ROOT, 'public', 'projects');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'projects.json');
const FALLBACK_DATA = path.join(ROOT, 'src', 'data', 'projects.example.json');

const SUBJECT_KEYWORDS = {
  math: ['函数', '几何', '代数', '方程', '微积分', '概率', '统计', '三角', '圆', '直线', '抛物线', '正弦', '余弦', '坐标', '矩阵', '向量', '对数', '指数'],
  physics: ['力学', '电路', '电磁', '光学', '热学', '波动', '量子', '速度', '能量', '电流', '电压', '电阻', '功率', '万有引力', '磁场', '电场', '波', '光'],
  chemistry: ['元素', '反应', '分子', '原子', '酸碱', '氧化', '有机', '化学键', '离子', '化合物', '溶液', '催化剂'],
  biology: ['细胞', '基因', '遗传', '生态', '植物', '动物', '微生物', '进化', 'dna', 'rna', '蛋白质', '光合', '呼吸'],
  chinese: ['古诗', '文言', '作文', '字词', '阅读', '拼音', '诗词', '汉字', '成语', '名著'],
  english: ['单词', '语法', '口语', '阅读', '翻译', '听力', 'english', 'vocabulary', 'tense'],
  it: ['编程', '代码', '算法', '数据结构', 'html', 'css', 'js', 'python', 'java', 'react', 'vue', '计算机', 'machine', 'learning', 'neural'],
  psychology: ['认知', '情绪', '行为', '心理', '人格', '记忆', '焦虑', '抑郁', '确认偏误', '禀赋'],
};

const SUBJECT_FALLBACK = 'other';

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeDirSync(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) removeDirSync(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function prettifySlug(slug) {
  return slug
    .replace(/^\d+[\s._-]+/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferSubject(meta, slug, htmlContent) {
  if (meta?.subject) return meta.subject;
  const haystack = [
    prettifySlug(slug),
    meta?.title || '',
    meta?.description || '',
    meta?.tags?.join(' ') || '',
    htmlContent.slice(0, 4000),
  ]
    .join(' ')
    .toLowerCase();
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw.toLowerCase()))) {
      return subject;
    }
  }
  return SUBJECT_FALLBACK;
}

function findPreview(dir) {
  const exts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
  for (const ext of exts) {
    for (const name of [`preview${ext}`, `cover${ext}`, `thumbnail${ext}`]) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) return path.basename(p);
    }
  }
  return null;
}

function generatePlaceholderPreview(slug, title, subject, color) {
  const initial = (title || prettifySlug(slug)).trim().charAt(0).toUpperCase() || '?';
  const safeTitle = (title || prettifySlug(slug)).slice(0, 20);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.04"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${color}" fill-opacity="0.18"/>
    </pattern>
  </defs>
  <rect width="480" height="300" fill="url(#g)"/>
  <rect width="480" height="300" fill="url(#dots)"/>
  <g transform="translate(48, 100)">
    <rect x="0" y="0" width="84" height="84" rx="14" fill="${color}" fill-opacity="0.85"/>
    <text x="42" y="62" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#FFFFFF">${initial}</text>
  </g>
  <text x="48" y="232" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="600" fill="#1B1B1B">${safeTitle}</text>
  <text x="48" y="258" font-family="JetBrains Mono, monospace" font-size="12" fill="#7A7A7A" letter-spacing="1.2">HTML · ${subject.toUpperCase()}</text>
</svg>`;
}

function buildProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.warn(`⚠  未找到 projects/ 目录。创建空目录：${PROJECTS_DIR}`);
    ensureDir(PROJECTS_DIR);
  }

  // 清空 public/projects（避免遗留文件）
  if (fs.existsSync(PUBLIC_PROJECTS)) {
    removeDirSync(PUBLIC_PROJECTS);
  }
  ensureDir(PUBLIC_PROJECTS);

  const projects = [];
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const projectDir = path.join(PROJECTS_DIR, slug);
    const indexHtmlPath = path.join(projectDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.warn(`↷ 跳过 ${slug}：缺少 index.html`);
      continue;
    }

    // 读取 meta.json（如存在）
    const metaPath = path.join(projectDir, 'meta.json');
    let meta = {};
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (err) {
        console.warn(`⚠  ${slug}/meta.json 解析失败：${err.message}`);
      }
    }

    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
    const stat = fs.statSync(indexHtmlPath);
    const subject = inferSubject(meta, slug, htmlContent);

    // 预览图处理
    const previewFile = findPreview(projectDir);
    let previewPath;
    if (previewFile) {
      previewPath = `projects/${slug}/${previewFile}`;
    } else {
      // 生成占位
      const placeholderName = 'preview.svg';
      const placeholderPath = path.join(PUBLIC_PROJECTS, slug, placeholderName);
      ensureDir(path.dirname(placeholderPath));
      const subjectColors = {
        math: '#2563EB', physics: '#0EA5E9', chemistry: '#10B981', biology: '#84CC16',
        chinese: '#EF4444', english: '#F59E0B', it: '#8B5CF6', psychology: '#EC4899', other: '#6B7280',
      };
      const color = subjectColors[subject] || subjectColors.other;
      const title = meta.title || prettifySlug(slug);
      fs.writeFileSync(placeholderPath, generatePlaceholderPreview(slug, title, subject, color));
      previewPath = `projects/${slug}/${placeholderName}`;
    }

    // 复制整个项目目录到 public/projects
    const destDir = path.join(PUBLIC_PROJECTS, slug);
    copyDirSync(projectDir, destDir);
    // 若未提供真实预览图，保留我们刚才生成的占位
    if (!previewFile) {
      const placeholderPath = path.join(destDir, 'preview.svg');
      const subjectColors = {
        math: '#2563EB', physics: '#0EA5E9', chemistry: '#10B981', biology: '#84CC16',
        chinese: '#EF4444', english: '#F59E0B', it: '#8B5CF6', psychology: '#EC4899', other: '#6B7280',
      };
      const color = subjectColors[subject] || subjectColors.other;
      const title = meta.title || prettifySlug(slug);
      fs.writeFileSync(placeholderPath, generatePlaceholderPreview(slug, title, subject, color));
    }

    const project = {
      slug,
      title: meta.title || prettifySlug(slug),
      subject,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      description: meta.description || '',
      grade: meta.grade,
      difficulty: meta.difficulty,
      preview: `/${previewPath}`,
      entry: `/projects/${slug}/index.html`,
      updatedAt: stat.mtime.toISOString(),
      featured: Boolean(meta.featured),
    };
    projects.push(project);
    console.log(`✓ ${slug} → ${project.title} [${subject}]`);
  }

  // 按更新时间降序
  projects.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  ensureDir(path.dirname(DATA_FILE));
  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2) + '\n', 'utf-8');
  console.log(`\n✓ 已生成 ${DATA_FILE}，共 ${projects.length} 个项目。`);

  if (projects.length === 0) {
    console.log('ℹ  当前没有可扫描的项目，复制示例清单作为占位。');
    if (fs.existsSync(FALLBACK_DATA)) {
      fs.copyFileSync(FALLBACK_DATA, DATA_FILE);
      console.log(`  → 已复制 ${FALLBACK_DATA} 到 ${DATA_FILE}`);
    }
  }
}

buildProjects();
