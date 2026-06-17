import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { Run } from '@/pages/Run';
import { About } from '@/pages/About';

export default function App() {
  const location = useLocation();
  const isRunPage = location.pathname === '/run';

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {!isRunPage && <Navbar />}
      <main className={isRunPage ? 'fixed inset-0 z-50' : 'flex-1'}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/run" element={<Run />} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isRunPage && <Footer />}
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-3 text-[10px] text-gray-400 sm:flex-row">
        <div className="font-mono">
          © 2026 <span className="text-primary">html-hub</span> · hosted on GitHub Pages
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>分类 · 学科 / 学段 / 难度</span>
          <span className="text-gray-300">|</span>
          <span>排序 · 时间 / 名称</span>
        </div>
      </div>
    </footer>
  );
}
