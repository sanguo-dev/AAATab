import { GRID_COLUMNS, GRID_ROWS, type GridRect, type Tile } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function clampRect(rect: GridRect): GridRect {
    const w = clamp(Math.round(rect.w), 1, GRID_COLUMNS);
    const h = clamp(Math.round(rect.h), 1, GRID_ROWS);

    return {
        x: clamp(Math.round(rect.x), 0, GRID_COLUMNS - w),
        y: clamp(Math.round(rect.y), 0, GRID_ROWS - h),
        w,
        h,
    };
}

export function rectsOverlap(a: GridRect, b: GridRect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function canPlace(tiles: readonly Tile[], rect: GridRect, excludeId?: string): boolean {
    return !tiles.some((tile) => tile.id !== excludeId && rectsOverlap(tile.grid, rect));
}

/**
 * Moves a tile to `rect` only when the target cell is free. Collision and
 * compaction rules can evolve here without touching the UI layer.
 */
export function moveTile(tiles: readonly Tile[], tileId: string, rect: GridRect): Tile[] {
    const tile = tiles.find((candidate) => candidate.id === tileId);
    if (!tile) return tiles as Tile[];

    const next = clampRect(rect);
    if (!canPlace(tiles, next, tileId)) return tiles as Tile[];

    return tiles.map((candidate) =>
        candidate.id === tileId ? ({ ...candidate, grid: next } as Tile) : candidate,
    );
}

/**
 * Packs tiles upwards as far as possible without overlapping. Useful after a
 * delete or resize operation.
 */
export function compactTiles(tiles: readonly Tile[]): Tile[] {
    const placed: Tile[] = [];

    for (const tile of [...tiles].sort((a, b) => a.grid.y - b.grid.y || a.grid.x - b.grid.x)) {
        let y = tile.grid.y;

        while (y > 0) {
            const candidate = { ...tile.grid, y: y - 1 };
            if (!canPlace(placed, candidate)) break;
            y--;
        }

        placed.push({ ...tile, grid: { ...tile.grid, y } } as Tile);
    }

    return placed;
}

export function pixelToCell(x: number, y: number, cellWidth: number, cellHeight: number): { x: number; y: number } {
    return {
        x: Math.floor(x / cellWidth),
        y: Math.floor(y / cellHeight),
    };
}
