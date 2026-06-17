import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // GitHub Pages 部署时使用相对路径；本地开发直接 / 即可
  const isBuild = command === 'build';
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
  const base = isBuild && repoName ? `/${repoName}/` : '/';

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: false,
    },
  };
});
