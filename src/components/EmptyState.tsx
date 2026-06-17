import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState({ query }: { query?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-full flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
        <Search size={22} className="text-gray-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-900">
        {query ? `没有匹配 "${query}" 的项目` : '没有找到项目'}
      </h3>
      <p className="mt-2 max-w-sm text-xs text-gray-400">
        试试更换关键词、切换学科分类，或清除已选标签。
      </p>
    </motion.div>
  );
}
