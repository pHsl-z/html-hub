export type Subject =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'chinese'
  | 'english'
  | 'it'
  | 'psychology'
  | 'other';

export type Grade = 'primary' | 'middle' | 'high' | 'college';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Project {
  slug: string;
  title: string;
  subject: Subject;
  tags: string[];
  description?: string;
  grade?: Grade;
  difficulty?: Difficulty;
  preview: string;
  entry: string;
  updatedAt: string;
  featured?: boolean;
}

export const SUBJECT_META: Record<
  Subject,
  { label: string; color: string; bg: string; keywords: string[] }
> = {
  math: { label: '数学', color: '#2563EB', bg: 'rgba(37,99,235,0.10)', keywords: ['函数', '几何', '代数', '方程', '微积分', '概率', '统计', '三角', '圆', '直线'] },
  physics: { label: '物理', color: '#0EA5E9', bg: 'rgba(14,165,233,0.10)', keywords: ['力学', '电路', '电磁', '光学', '热学', '波动', '量子', '速度', '能量'] },
  chemistry: { label: '化学', color: '#10B981', bg: 'rgba(16,185,129,0.10)', keywords: ['元素', '反应', '分子', '原子', '酸碱', '氧化', '有机', '化学键'] },
  biology: { label: '生物', color: '#84CC16', bg: 'rgba(132,204,22,0.10)', keywords: ['细胞', '基因', '遗传', '生态', '植物', '动物', '微生物', '进化'] },
  chinese: { label: '语文', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', keywords: ['古诗', '文言', '作文', '字词', '阅读', '拼音'] },
  english: { label: '英语', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', keywords: ['单词', '语法', '口语', '阅读', '翻译', '听力'] },
  it: { label: '信息技术', color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', keywords: ['编程', '代码', '算法', '数据结构', 'html', 'css', 'js', 'python', '计算'] },
  psychology: { label: '心理', color: '#EC4899', bg: 'rgba(236,72,153,0.10)', keywords: ['认知', '情绪', '行为', '心理', '人格', '记忆'] },
  other: { label: '其他', color: '#6B7280', bg: 'rgba(107,114,128,0.10)', keywords: [] },
};

export const GRADE_META: Record<Grade, string> = {
  primary: '小学',
  middle: '初中',
  high: '高中',
  college: '大学',
};

export const DIFFICULTY_META: Record<Difficulty, string> = {
  easy: '入门',
  medium: '进阶',
  hard: '挑战',
};
