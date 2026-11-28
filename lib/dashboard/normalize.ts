import type {
    Cell,
    CustomCell,
    DashboardData,
    DashboardPage,
    IconSource,
    LinkCell,
    WidgetCell,
} from '@/types/dashboard';

import { DEFAULT_CUSTOM_TEMPLATE, isCellKind } from './cell-kinds';
import { createDefaultDashboard } from './defaults';
import { clampRect } from './grid';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

/** 旧结构里的 `type` 字段。 */
const LEGACY_TYPES = ['clock', 'link', 'note'] as const;

type LegacyType = (typeof LEGACY_TYPES)[number];

function normalizeIcon(value: unknown): IconSource | undefined {
    if (!isRecord(value)) return undefined;

    if (value.kind === 'favicon') {
        const url = typeof value.url === 'string' ? value.url.trim() : '';
        return url ? { kind: 'favicon', url } : { kind: 'favicon' };
    }

    if (value.kind === 'solid' && typeof value.color === 'string') {
        const text = typeof value.text === 'string' ? value.text.trim() : '';
        return text
            ? { kind: 'solid', color: value.color, text }
            : { kind: 'solid', color: value.color };
    }

    // 用户上传还没做，先只保留"是上传"这个事实。
    if (value.kind === 'upload') return { kind: 'upload' };

    return undefined;
}

type CellBaseFields = Pick<Cell, 'id' | 'title' | 'icon' | 'grid'>;

function normalizeBase(value: Record<string, unknown>): CellBaseFields | null {
    if (typeof value.id !== 'string' || typeof value.title !== 'string') return null;
    if (!isRecord(value.grid)) return null;

    return {
        id: value.id,
        title: value.title,
        icon: normalizeIcon(value.icon),
        grid: clampRect({
            x: isNumber(value.grid.x) ? value.grid.x : 0,
            y: isNumber(value.grid.y) ? value.grid.y : 0,
            w: isNumber(value.grid.w) ? value.grid.w : 1,
            h: isNumber(value.grid.h) ? value.grid.h : 1,
        }),
    };
}

function linkCell(base: CellBaseFields, url: unknown): LinkCell | null {
    if (typeof url !== 'string') return null;

    // 链接 cell 固定一格：丢掉旧的多格尺寸。
    return { ...base, kind: 'link', url, grid: { ...base.grid, w: 1, h: 1 } };
}

function widgetCell(base: CellBaseFields, widget: unknown): WidgetCell {
    // 未知 id 不丢：渲染层会退回占位，等对应小组件实现后再出现。
    return { ...base, kind: 'widget', widget: typeof widget === 'string' && widget ? widget : 'clock' };
}

function customCell(base: CellBaseFields, template: unknown): CustomCell {
    return {
        ...base,
        kind: 'custom',
        template:
            typeof template === 'string' && template.length > 0 ? template : DEFAULT_CUSTOM_TEMPLATE,
    };
}

function normalizeCell(value: unknown): Cell | null {
    if (!isRecord(value)) return null;

    const base = normalizeBase(value);
    if (!base) return null;

    // 当前结构：kind 决定分支。
    if (isCellKind(value.kind)) {
        if (value.kind === 'link') return linkCell(base, value.url);
        if (value.kind === 'widget') return widgetCell(base, value.widget);
        return customCell(base, value.template);
    }

    // 旧结构：type 迁移到 kind。
    const legacy = LEGACY_TYPES.find((type) => type === value.type) as LegacyType | undefined;
    switch (legacy) {
        case 'link':
            return linkCell(base, value.url);
        case 'clock':
            return widgetCell(base, 'clock');
        case 'note':
            return customCell(base, DEFAULT_CUSTOM_TEMPLATE);
        default:
            return null;
    }
}

function normalizePage(value: unknown): DashboardPage | null {
    if (!isRecord(value)) return null;
    if (typeof value.id !== 'string' || typeof value.title !== 'string') return null;

    // 旧数据把数组存在 `tiles` 里。
    const raw = Array.isArray(value.cells) ? value.cells : Array.isArray(value.tiles) ? value.tiles : [];

    return {
        id: value.id,
        title: value.title,
        icon: normalizeIcon(value.icon),
        cells: raw.map(normalizeCell).filter((cell): cell is Cell => cell !== null),
    };
}

/**
 * Keeps persisted data usable after code changes. Add schema migrations here
 * before changing the shape of DashboardData.
 */
export function normalizeDashboard(value: unknown): DashboardData {
    if (!isRecord(value) || !Array.isArray(value.pages)) return createDefaultDashboard();

    const pages = value.pages.map(normalizePage).filter((page): page is DashboardPage => page !== null);
    if (pages.length === 0) return createDefaultDashboard();

    const requestedActive = typeof value.activePageId === 'string' ? value.activePageId : '';
    const activePageId = pages.some((page) => page.id === requestedActive) ? requestedActive : pages[0]!.id;

    return {
        schemaVersion: 2,
        activePageId,
        pages,
    };
}
