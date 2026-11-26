import { GRID_COLUMNS, type Cell, type GridRect } from '@/types/dashboard';

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
 * Places `cellId` at `rect`, pushing every overlapping cell downward until it
 * finds free space. Pushing cascades, so a moved cell can ripple through a
 * column without ever covering another cell.
 */
export function applyCellRect(cells: readonly Cell[], cellId: string, rect: GridRect): readonly Cell[] {
    const target = cells.find((cell) => cell.id === cellId);
    if (!target) return cells;

    const next = clampRect(rect);
    if (sameRect(target.grid, next)) return cells;

    const others = cells
        .filter((cell) => cell.id !== cellId)
        .sort((a, b) => a.grid.y - b.grid.y || a.grid.x - b.grid.x);

    const placed: Cell[] = [{ ...target, grid: next } as Cell];
    const moved = new Map<string, Cell>([[target.id, placed[0]!]]);

    for (const cell of others) {
        let y = cell.grid.y;

        for (;;) {
            const conflict = placed.find((candidate) => rectsOverlap({ ...cell.grid, y }, candidate.grid));
            if (!conflict) break;
            y = conflict.grid.y + conflict.grid.h;
        }

        placed.push({ ...cell, grid: { ...cell.grid, y } } as Cell);
        if (y !== cell.grid.y) {
            moved.set(cell.id, placed[placed.length - 1]!);
        }
    }

    return cells.map((cell) => moved.get(cell.id) ?? cell);
}

export const moveCell = applyCellRect;
export const resizeCell = applyCellRect;
