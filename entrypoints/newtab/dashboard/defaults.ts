import type { DashboardData } from '@/types/dashboard';

import { EXAMPLE_LINK_CELLS, EXAMPLE_WIDGET_CELLS } from '../widgets/examples';

/** 首屏只由示例内容组成，示例本身在 `widgets/examples.ts`。 */
export const DEFAULT_DASHBOARD: DashboardData = {
    schemaVersion: 2,
    activePageId: 'home',
    pages: [
        {
            id: 'home',
            title: '第一页',
            cells: [...EXAMPLE_WIDGET_CELLS],
        },
        {
            id: 'second',
            title: '第二页',
            cells: [...EXAMPLE_LINK_CELLS],
        },
    ],
};

export function createDefaultDashboard(): DashboardData {
    return structuredClone(DEFAULT_DASHBOARD);
}
