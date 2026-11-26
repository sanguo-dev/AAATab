import { storage } from 'wxt/utils/storage';

import type { DashboardData } from '@/types/dashboard';

import { createDefaultDashboard } from './defaults';

export const dashboardItem = storage.defineItem<DashboardData>('local:dashboard', {
    fallback: createDefaultDashboard(),
    version: 1,
});
