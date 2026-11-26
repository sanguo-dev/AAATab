import type { DashboardData } from './types';

export const DEFAULT_DASHBOARD: DashboardData = {
    schemaVersion: 1,
    activePageId: 'home',
    pages: [
        {
            id: 'home',
            title: '第一页',
            tiles: [
                {
                    id: 'tile-clock-home',
                    type: 'clock',
                    title: '时钟',
                    icon: { kind: 'lucide', name: 'clock' },
                    grid: { x: 0, y: 0, w: 1, h: 1 },
                },
            ],
        },
        {
            id: 'second',
            title: '第二页',
            tiles: [
                {
                    id: 'tile-link-github',
                    type: 'link',
                    title: 'GitHub',
                    url: 'https://github.com',
                    icon: { kind: 'lucide', name: 'link' },
                    grid: { x: 7, y: 1, w: 1, h: 1 },
                },
                {
                    id: 'tile-link-bilibili',
                    type: 'link',
                    title: '哔哩哔哩',
                    url: 'https://www.bilibili.com',
                    icon: { kind: 'lucide', name: 'sparkles' },
                    grid: { x: 8, y: 1, w: 1, h: 1 },
                },
                {
                    id: 'tile-link-figma',
                    type: 'link',
                    title: 'Figma',
                    url: 'https://www.figma.com',
                    icon: { kind: 'lucide', name: 'layout-grid' },
                    grid: { x: 9, y: 1, w: 1, h: 1 },
                },
            ],
        },
    ],
};

export function createDefaultDashboard(): DashboardData {
    return structuredClone(DEFAULT_DASHBOARD);
}
