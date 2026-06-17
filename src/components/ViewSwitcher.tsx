import { LayoutGrid, Image, Terminal, List, Table } from 'lucide-react';
import type { ViewMode } from '@/store/useFilterStore';
import { useFilterStore } from '@/store/useFilterStore';

const VIEWS: { value: ViewMode; label: string; icon: typeof LayoutGrid; key: string }[] = [
  { value: 'large', label: '大卡', icon: Image, key: '1' },
  { value: 'card', label: '卡片', icon: LayoutGrid, key: '2' },
  { value: 'icon', label: '图标', icon: Terminal, key: '3' },
  { value: 'list', label: '列表', icon: List, key: '4' },
  { value: 'table', label: '表格', icon: Table, key: '5' },
];

export const VIEW_SHORTCUTS: Record<string, ViewMode> = VIEWS.reduce(
  (acc, v) => ({ ...acc, [v.key]: v.value }),
  {} as Record<string, ViewMode>
);

/** iOS 风格分段控件 */
export function ViewSwitcher() {
  const { view, setView } = useFilterStore();

  return (
    <div
      className="relative inline-flex items-center rounded-lg p-0.5"
      style={{
        background: '#F2F2F7',
      }}
    >
      {/* 滑块背景 */}
      <div
        className="absolute top-0.5 bottom-0.5 rounded-md transition-all duration-200 ease-out"
        style={{
          left: `${VIEWS.findIndex((v) => v.value === view) * (100 / VIEWS.length)}%`,
          width: `${100 / VIEWS.length}%`,
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)',
        }}
      />

      {VIEWS.map((v, i) => {
        const Icon = v.icon;
        const active = view === v.value;
        return (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            title={`${v.label}视图  [${i + 1}]`}
            aria-label={`${v.label}视图`}
            className={`relative z-10 flex h-7 items-center justify-center gap-1 transition-colors duration-150 ${
              active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
            style={{ width: `${100 / VIEWS.length}%`, minWidth: 32 }}
          >
            <Icon size={13} />
          </button>
        );
      })}
    </div>
  );
}
