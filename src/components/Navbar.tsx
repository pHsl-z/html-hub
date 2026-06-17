import { NavLink } from 'react-router-dom';
import { Info, Sparkles } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

export function Navbar() {
  const { projects } = useProjects();
  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="container-page flex items-center gap-4 py-2.5">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: '#007AFF',
            }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold tracking-tight text-gray-900 leading-none">HTML Hub</span>
            <span className="mt-0.5 text-[9px] tracking-wide text-gray-400">交互式课件中心</span>
          </div>
        </NavLink>

        {/* 状态 */}
        <div className="hidden items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-500 md:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          {projects.length} 个应用在线
        </div>

        {/* 右侧导航 */}
        <div className="ml-auto flex items-center gap-1">
          <NavItem to="/">首页</NavItem>
          <NavItem to="/about">
            <Info size={12} />
            <span>关于</span>
          </NavItem>
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
          isActive
            ? 'text-primary bg-primary/8'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}
