import type { Cell, DashboardData } from '@/types/dashboard';

/**
 * 只在开发期存在的种子数据。
 *
 * 它只通过 `import.meta.env.DEV` 被引用（见 `use-dashboard.tsx` 里 storage 的
 * `init`），所以正式构建会把这段代码和这个模块一起摇掉，产物里没有这些数据。
 */

const DEV_WIDGET_CELLS: Cell[] = [
    {
        id: 'cell-clock-home',
        kind: 'widget',
        widget: 'clock',
        title: '时间',
        grid: { x: 0, y: 0, w: 1, h: 1 },
    },
];

const DEV_LINK_CELLS: Cell[] = [
    {
        id: 'cell-link-github',
        kind: 'link',
        title: 'GitHub',
        url: 'https://github.com',
        grid: { x: 0, y: 0, w: 1, h: 1 },
    },
    {
        id: 'cell-link-bilibili',
        kind: 'link',
        title: '哔哩哔哩',
        url: 'https://www.bilibili.com',
        grid: { x: 1, y: 0, w: 1, h: 1 },
    },
    {
        id: 'cell-link-figma',
        kind: 'link',
        title: 'Figma',
        url: 'https://www.figma.com',
        grid: { x: 2, y: 0, w: 1, h: 1 },
    },
];

/** 开发期首屏：第一页时间小组件，第二页三个链接。 */
export function createDevSeedDashboard(): DashboardData {
    return structuredClone({
        schemaVersion: 2,
        activePageId: 'home',
        pages: [
            { id: 'home', title: '第一页', cells: DEV_WIDGET_CELLS },
            { id: 'second', title: '第二页', cells: DEV_LINK_CELLS },
        ],
    } satisfies DashboardData);
}
