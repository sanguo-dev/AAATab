import type { DashboardData } from '@/types/dashboard';

/**
 * 正式环境的首屏：一页，没有 cell。
 * 开发期要的示例数据在 `dev-seed.ts`，它不会进正式产物。
 */
export const DEFAULT_DASHBOARD: DashboardData = {
    schemaVersion: 2,
    activePageId: 'home',
    pages: [{ id: 'home', title: '第一页', cells: [] }],
};

export function createDefaultDashboard(): DashboardData {
    return structuredClone(DEFAULT_DASHBOARD);
}
