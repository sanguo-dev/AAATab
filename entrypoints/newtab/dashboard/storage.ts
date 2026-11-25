import { storage } from 'wxt/utils/storage';

import { createDefaultDashboard } from './defaults';
import type { DashboardData } from './types';

export const dashboardItem = storage.defineItem<DashboardData>('local:dashboard', {
    fallback: createDefaultDashboard(),
    version: 1,
});
