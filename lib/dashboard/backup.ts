import type { DashboardData } from '@/types/dashboard';

import { normalizeDashboard } from './normalize';
import { dashboardItem } from './storage';

const APP_ID = 'AAATab';
const BACKUP_KIND = 'dashboard';
/** 备份文件自己的格式版本，和 `DashboardData.schemaVersion` 各管一层。 */
const BACKUP_VERSION = 1;

export interface BackupSummary {
    pages: number;
    cells: number;
}

export interface ParsedBackup {
    data: DashboardData;
    summary: BackupSummary;
    /** 备份文件的导出时间；喂一个裸 `DashboardData` 时没有。 */
    exportedAt?: string;
}

interface BackupFile {
    app: string;
    kind: string;
    version: number;
    exportedAt: string;
    dashboard: DashboardData;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export function summarize(data: DashboardData): BackupSummary {
    return {
        pages: data.pages.length,
        cells: data.pages.reduce((total, page) => total + page.cells.length, 0),
    };
}

const pad = (value: number) => String(value).padStart(2, '0');

/** `aaatab-dashboard-20261128-2315.json`，按本地时间，一眼能看出是什么时候导的。 */
export function backupFileName(at = new Date()): string {
    const date = `${at.getFullYear()}${pad(at.getMonth() + 1)}${pad(at.getDate())}`;
    const time = `${pad(at.getHours())}${pad(at.getMinutes())}`;
    return `aaatab-dashboard-${date}-${time}.json`;
}

/** 读存储、下载备份文件；返回的内容摘要用来给页面提示。 */
export async function exportDashboard(): Promise<BackupSummary> {
    // 先过一遍归一化：导出的永远是可以被当前版本读回来的形状。
    const data = normalizeDashboard(await dashboardItem.getValue());
    const file: BackupFile = {
        app: APP_ID,
        kind: BACKUP_KIND,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        dashboard: data,
    };

    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = backupFileName();
    // 挂在 document 上再点：Firefox 对游离节点的下载行为不保证。
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);

    return summarize(data);
}

/**
 * 解析备份文本。兼容两种形状：本扩展导出的包装对象，以及一个裸的
 * `DashboardData`（方便手工编辑或从别处拼出来）。只校验到"能归一化"为止，
 * 具体字段的容错交给 `normalizeDashboard`。
 */
export function parseBackup(text: string): ParsedBackup {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('文件不是合法的 JSON');
    }

    const wrapper = isRecord(parsed) && parsed.kind === BACKUP_KIND ? parsed : null;
    const raw = wrapper ? wrapper.dashboard : parsed;

    if (!isRecord(raw) || !Array.isArray(raw.pages)) throw new Error('文件里没有看板数据');

    const data = normalizeDashboard(raw);
    const exportedAt = typeof wrapper?.exportedAt === 'string' ? wrapper.exportedAt : undefined;

    return { data, summary: summarize(data), ...(exportedAt ? { exportedAt } : {}) };
}

/** 整份覆盖写入。失败（比如超配额）由调用方提示。 */
export function writeBackup(data: DashboardData): Promise<void> {
    return dashboardItem.setValue(data);
}
