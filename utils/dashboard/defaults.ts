import type { DashboardData } from './types';

const DEFAULT_NOTE =
    '这是一个全新的全屏页面。鼠标滚轮可以在页面之间切换，之后可以在这里放置快捷链接、待办等内容。';

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
                    grid: { x: 0, y: 0, w: 12, h: 8 },
                },
            ],
        },
        {
            id: 'second',
            title: '第二页',
            tiles: [
                {
                    id: 'tile-note-second',
                    type: 'note',
                    title: '第二页',
                    text: DEFAULT_NOTE,
                    icon: { kind: 'lucide', name: 'layout-grid' },
                    grid: { x: 2, y: 2, w: 8, h: 4 },
                },
            ],
        },
    ],
};

export function createDefaultDashboard(): DashboardData {
    return structuredClone(DEFAULT_DASHBOARD);
}
