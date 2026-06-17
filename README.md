# HTML 教案中枢

> 一份"放进文件夹即可用"的 HTML 教学应用门户。零后端、零数据库，托管在 GitHub Pages 即可全球访问。

把 HTML 小程序（互动课件、动图演示、可视化工具、教案 demo）丢进 `projects/<名称>/`，执行 `npm run build`，GitHub Actions 自动发布到 `gh-pages`。学生/同事通过链接进入即可筛选、预览、运行。

## ✨ 特性

- **零配置部署**：HTML 文件放入 `projects/<slug>/index.html` 即可出现在网站
- **自动生成清单**：构建脚本扫描 `projects/` 生成 `projects.json`、复制资源、自动生成占位预览图
- **多维分类**：按学科（数学/物理/化学/生物/语文/英语/信息技术/心理/其他）、学段、难度、标签筛选
- **智能推断学科**：根据标题/标签/HTML 内容自动识别学科归属
- **检索 & 排序**：标题/描述/标签模糊搜索；按时间、名称 A-Z/Z-A 排序
- **站内 iframe 运行**：可一键复制链接、新窗口打开、全屏、刷新
- **Grid / List 视图切换**：偏好持久化到 localStorage
- **响应式设计**：桌面 4 列、平板 2 列、手机 1 列
- **URL 状态同步**：筛选条件写入 URL，可分享特定视图

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆 & 安装依赖
git clone <your-repo-url>
cd html-teaching-hub
pnpm install   # 或 npm install

# 2. 启动 dev server
pnpm dev       # → http://127.0.0.1:5173

# 3. 新增/修改 HTML 应用后，重新生成清单
pnpm build:manifest
```

### 添加一个新的 HTML 教案

在 `projects/` 下新建一个文件夹，例如 `quadratic-explorer`：

```
projects/
└── quadratic-explorer/
    ├── index.html      ← 你的 HTML 应用（必备）
    ├── meta.json       ← 标题/学科/标签/描述（可选，但强烈推荐）
    ├── preview.png     ← 封面预览图（可选，缺失则自动生成占位）
    └── assets/         ← 其他静态资源（可选）
```

`meta.json` 示例：

```json
{
  "title": "二次函数图像探索",
  "subject": "math",
  "tags": ["函数", "图像", "高中"],
  "description": "可拖动滑块观察 a、b、c 对抛物线的影响",
  "grade": "high",
  "difficulty": "medium",
  "featured": true
}
```

- `subject` 可选值：`math | physics | chemistry | biology | chinese | english | it | psychology | other`
- `grade` 可选值：`primary | middle | high | college`
- `difficulty` 可选值：`easy | medium | hard`
- `featured`：是否在首页标记为精选

如果省略 `subject`，脚本会通过 `tags + 标题 + HTML 内容` 关键词自动推断。

### 部署到 GitHub Pages

1. 把代码 push 到 GitHub 仓库的 `main` 分支
2. 在 **Settings → Pages** 中选择 **GitHub Actions** 作为 Source
3. 之后的每次 push 都会自动触发 `.github/workflows/deploy.yml`，构建并发布
4. 访问 `https://<username>.github.io/<repo-name>/`（或用户主页 `https://<username>.github.io/`）即可

## 🗂 项目结构

```
.
├── projects/                # 你的 HTML 应用
│   ├── interactive-clock/
│   ├── quadratic-explorer/
│   └── ...
├── public/
│   └── projects/            # 构建期自动生成（勿手动编辑）
├── scripts/
│   └── build-manifest.mjs   # 扫描 projects/，生成清单
├── src/
│   ├── components/          # UI 组件
│   ├── pages/               # 路由页面
│   ├── store/               # Zustand 状态
│   ├── hooks/               # 自定义 hooks
│   ├── data/projects.json   # 由 build:manifest 生成
│   ├── types/               # TypeScript 类型
│   └── styles/index.css     # Tailwind + 主题变量
├── .github/workflows/deploy.yml
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 🧠 设计哲学

- **教研工作台调性**：暖白底（#FAF7F2）+ 深墨绿主色（#1F3A2E）+ 赭石辅色（#B5651D）+ 粉笔黄点缀（#F4C95D），克制而有手作感。
- **Fraunces 衬线 + Inter 无衬线** 的字体配对，让"教学"二字有编辑感而不古板。
- **纸质噪点 + 微动效**：背景 0.35 透明度的 SVG 噪声 + 卡片 240ms 浮起，呼应"翻动教案"的小动作。
- **响应式优先**：桌面 4 列、平板 2 列、手机 1 列；分类导航可横滑。

## 🛠 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动本地 dev server |
| `pnpm build:manifest` | 重新扫描 `projects/` 并生成 `projects.json` |
| `pnpm build` | 完整构建（含 manifest） |
| `pnpm preview` | 预览构建产物 |

## 🔒 安全说明

iframe 使用 `sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"`，禁止顶层跳转与跨域存储访问。由于所有 HTML 均来自作者自有仓库，可信度较高，但仍建议：

- 不要将包含敏感 API key、用户隐私的应用放入此仓库
- 在 `meta.json` 中对含外部脚本的应用标注 `externalScripts: true`（计划中）

## 📝 License

MIT — 详见 [LICENSE](LICENSE)
