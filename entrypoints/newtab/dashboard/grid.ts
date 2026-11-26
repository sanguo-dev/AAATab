import { GRID_COLUMNS, type GridRect, type Tile } from '@/types/dashboard';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function clampRect(rect: GridRect): GridRect {
    const w = clamp(Math.round(rect.w), 1, GRID_COLUMNS);

    return {
        x: clamp(Math.round(rect.x), 0, GRID_COLUMNS - w),
        // 行不设上限：向下拖动或推挤时页面继续生长。
        y: Math.max(0, Math.round(rect.y)),
        w,
        h: Math.max(1, Math.round(rect.h)),
    };
}

export function rectsOverlap(a: GridRect, b: GridRect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function sameRect(a: GridRect, b: GridRect): boolean {
    return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

/**
 * Places `tileId` at `rect`, pushing every overlapping tile downward until it
 * finds free space. Pushing cascades, so a moved tile can ripple through a
 * column without ever covering another tile.
 */
export function applyTileRect(tiles: readonly Tile[], tileId: string, rect: GridRect): readonly Tile[] {
    const target = tiles.find((tile) => tile.id === tileId);
    if (!target) return tiles;

    const next = clampRect(rect);
    if (sameRect(target.grid, next)) return tiles;

    const others = tiles
        .filter((tile) => tile.id !== tileId)
        .sort((a, b) => a.grid.y - b.grid.y || a.grid.x - b.grid.x);

    const placed: Tile[] = [{ ...target, grid: next } as Tile];
    const moved = new Map<string, Tile>([[target.id, placed[0]!]]);

    for (const tile of others) {
        let y = tile.grid.y;

        for (;;) {
            const conflict = placed.find((candidate) => rectsOverlap({ ...tile.grid, y }, candidate.grid));
            if (!conflict) break;
            y = conflict.grid.y + conflict.grid.h;
        }

        placed.push({ ...tile, grid: { ...tile.grid, y } } as Tile);
        if (y !== tile.grid.y) {
            moved.set(tile.id, placed[placed.length - 1]!);
        }
    }

    return tiles.map((tile) => moved.get(tile.id) ?? tile);
}

export const moveTile = applyTileRect;
export const resizeTile = applyTileRect;
