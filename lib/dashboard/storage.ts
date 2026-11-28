import { storage } from 'wxt/utils/storage';

import type { DashboardData } from '@/types/dashboard';

import { createDefaultDashboard } from './defaults';

/**
 * 看板数据的持久化条目：`browser.storage.local` 的 `dashboard` 键。
 *
 * 新标签页、设置页（导出/导入）都读写这一条，所以定义放在 lib 里。
 *
 * - 正式环境：`fallback` 给一页空白，`init` 不传 —— 首次打开不往存储里写任何东西。
 * - 开发环境：`init` 在存储为空时写入 `dev-seed.ts` 的种子数据。`import.meta.env.DEV`
 *   在正式构建里是字面量 `false`，这个动态 import 和整个 `dev-seed` 模块会被摇掉。
 */
export const dashboardItem = storage.defineItem<DashboardData>('local:dashboard', {
    init: import.meta.env.DEV
        ? async () => (await import('./dev-seed')).createDevSeedDashboard()
        : undefined,
    fallback: createDefaultDashboard(),
    version: 1,
});
