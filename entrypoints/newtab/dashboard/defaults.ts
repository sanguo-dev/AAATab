import type { DashboardData } from './types';

const DEFAULT_NOTE =
    '这是一个可编辑的便签。进入编辑模式后，可以拖动 tile 换位置，拖动右下角调整大小。';

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
                    grid: { x: 1, y: 0, w: 10, h: 6 },
                },
            ],
        },
        {
            id: 'second',
            title: '第二页',
            tiles: [
                {
                    id: 'tile-note-example',
                    type: 'note',
                    title: '拖动 / 编辑示例',
                    text: DEFAULT_NOTE,
                    icon: { kind: 'lucide', name: 'sparkles' },
                    grid: { x: 1, y: 1, w: 6, h: 4 },
                },
                {
                    id: 'tile-link-github',
                    type: 'link',
                    title: 'GitHub',
                    url: 'https://github.com',
                    icon: { kind: 'lucide', name: 'link' },
                    grid: { x: 7, y: 1, w: 2, h: 2 },
                },
                {
                    id: 'tile-link-bilibili',
                    type: 'link',
                    title: '哔哩哔哩',
                    url: 'https://www.bilibili.com',
                    icon: { kind: 'lucide', name: 'sparkles' },
                    grid: { x: 9, y: 1, w: 2, h: 2 },
                },
                {
                    id: 'tile-link-figma',
                    type: 'link',
                    title: 'Figma',
                    url: 'https://www.figma.com',
                    icon: { kind: 'lucide', name: 'layout-grid' },
                    grid: { x: 7, y: 3, w: 2, h: 2 },
                },
            ],
        },
    ],
};

export function createDefaultDashboard(): DashboardData {
    return structuredClone(DEFAULT_DASHBOARD);
}
