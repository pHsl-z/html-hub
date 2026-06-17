import { useEffect, useState, useCallback } from 'react';
import projectsData from '@/data/projects.json';
import type { Project } from '@/types/project';
import { loadCustomApps, type CustomApp } from '@/components/AddAppModal';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const SUBJECT_COLORS: Record<string, string> = {
  math: '#2563EB', physics: '#0EA5E9', chemistry: '#10B981', biology: '#84CC16',
  chinese: '#EF4444', english: '#F59E0B', it: '#8B5CF6', psychology: '#EC4899', other: '#6B7280',
};

function customAppToProject(app: CustomApp): Project {
  const color = SUBJECT_COLORS[app.subject] || SUBJECT_COLORS.other;
  const initial = app.title.trim().charAt(0).toUpperCase() || '?';
  const svgPreview = `data:image/svg+xml,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0.04"/>
  </linearGradient></defs>
  <rect width="480" height="300" fill="url(#g)"/>
  <rect x="48" y="80" width="84" height="84" rx="14" fill="${color}" fill-opacity="0.85"/>
  <text x="90" y="142" text-anchor="middle" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#FFF">${initial}</text>
  <text x="48" y="220" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#E0E0E0">${app.title.slice(0, 20)}</text>
  <text x="48" y="248" font-family="monospace" font-size="11" fill="#888" letter-spacing="1">CUSTOM · ${app.subject.toUpperCase()}</text>
</svg>`)}`;

  return {
    slug: app.slug,
    title: app.title,
    subject: app.subject,
    tags: app.tags,
    description: app.description,
    preview: svgPreview,
    entry: `custom://${app.slug}`,
    updatedAt: app.createdAt,
    featured: false,
  };
}

export function useProjects() {
  const [builtInProjects] = useState<Project[]>(() =>
    (projectsData as Project[]).map((p) => ({
      ...p,
      preview: p.preview.startsWith('/') ? `${BASE}${p.preview}` : p.preview,
      entry: p.entry.startsWith('/') ? `${BASE}${p.entry}` : p.entry,
    }))
  );
  const [customApps, setCustomApps] = useState<CustomApp[]>(loadCustomApps());
  const [loading, setLoading] = useState(true);

  const refreshCustom = useCallback(() => {
    setCustomApps(loadCustomApps());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 80);
    return () => clearTimeout(t);
  }, []);

  const projects: Project[] = [
    ...customApps.map(customAppToProject),
    ...builtInProjects,
  ];

  return { projects, loading, refreshCustom };
}
