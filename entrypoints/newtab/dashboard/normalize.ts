import { clampRect } from './grid';
import { createDefaultDashboard } from './defaults';
import type {
    DashboardData,
    DashboardPage,
    IconName,
    IconSource,
    Tile,
    TileType,
} from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const ICON_NAMES: IconName[] = ['clock', 'layout-grid', 'link', 'sparkles'];
const TILE_TYPES: TileType[] = ['clock', 'link', 'note'];

function normalizeIcon(value: unknown): IconSource | undefined {
    if (!isRecord(value)) return undefined;

    if (value.kind === 'lucide' && typeof value.name === 'string') {
        const name = ICON_NAMES.find((candidate) => candidate === value.name);
        return name ? { kind: 'lucide', name } : undefined;
    }

    if (value.kind === 'emoji' && typeof value.value === 'string') {
        return { kind: 'emoji', value: value.value };
    }

    if (value.kind === 'image' && typeof value.src === 'string') {
        return { kind: 'image', src: value.src };
    }

    return undefined;
}

function normalizeTile(value: unknown): Tile | null {
    if (!isRecord(value)) return null;
    if (typeof value.id !== 'string' || typeof value.title !== 'string') return null;
    if (!TILE_TYPES.includes(value.type as TileType)) return null;
    if (!isRecord(value.grid)) return null;

    const grid = {
        x: isNumber(value.grid.x) ? value.grid.x : 0,
        y: isNumber(value.grid.y) ? value.grid.y : 0,
        w: isNumber(value.grid.w) ? value.grid.w : 1,
        h: isNumber(value.grid.h) ? value.grid.h : 1,
    };

    const base = {
        id: value.id,
        title: value.title,
        icon: normalizeIcon(value.icon),
        grid: clampRect(grid),
        template:
            typeof value.template === 'string' && value.template.length > 0
                ? value.template
                : undefined,
    };

    if (value.type === 'link') {
        if (typeof value.url !== 'string') return null;
        // Link tiles are always one 120×120 cell; drop legacy multi-cell sizes
        // and the old card/bar/icon templates.
        return {
            ...base,
            type: 'link',
            url: value.url,
            template: undefined,
            grid: { ...base.grid, w: 1, h: 1 },
        };
    }

    if (value.type === 'note') {
        if (typeof value.text !== 'string') return null;
        return { ...base, type: 'note', text: value.text };
    }

    return { ...base, type: 'clock' };
}

function normalizePage(value: unknown): DashboardPage | null {
    if (!isRecord(value)) return null;
    if (typeof value.id !== 'string' || typeof value.title !== 'string') return null;

    const tiles = Array.isArray(value.tiles)
        ? value.tiles.map(normalizeTile).filter((tile): tile is Tile => tile !== null)
        : [];

    return {
        id: value.id,
        title: value.title,
        icon: normalizeIcon(value.icon),
        tiles,
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
        schemaVersion: 1,
        activePageId,
        pages,
    };
}

