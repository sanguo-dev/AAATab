import type { Cell } from '@/types/dashboard';

/**
 * 首次安装时的示例内容。
 *
 * 放在 widgets 里是有意的：这些是系统提供的演示 cell，不属于 dashboard 的
 * 持久化/迁移逻辑。要调整首屏示例，只改这里。
 */

/** 第一页：唯一的系统小组件（时间）。 */
export const EXAMPLE_WIDGET_CELLS: Cell[] = [
    {
        id: 'cell-clock-home',
        kind: 'widget',
        widget: 'clock',
        title: '时间',
        grid: { x: 0, y: 0, w: 1, h: 1 },
    },
];

/** 第二页：三个 link 类示例，顺便展示"图标 + 标题、不显示链接"的样子。 */
export const EXAMPLE_LINK_CELLS: Cell[] = [
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
