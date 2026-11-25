import { Pencil } from '@lucide/solid';
import { For, Show, createEffect, createSignal } from 'solid-js';

import { Button } from '@/components/ui/button';

import { clampRect, sameRect } from './dashboard/grid';
import {
    GRID_CELL_SIZE,
    GRID_COLUMNS,
    GRID_GAP,
    type DashboardPage,
    type GridRect,
    type Tile,
} from './dashboard/types';
import TileView from './tiles/TileView';

interface PageGridProps {
    page: DashboardPage;
    editing: boolean;
    onMoveTile: (tileId: string, rect: GridRect) => void;
    onResizeTile: (tileId: string, rect: GridRect) => void;
    onEditTile: (tile: Tile) => void;
}

interface DragState {
    tile: Tile;
    pointerId: number;
    startX: number;
    startY: number;
    step: number;
}

interface ResizeState {
    tile: Tile;
    pointerId: number;
    startX: number;
    startY: number;
    step: number;
    startW: number;
    startH: number;
}

interface DragPreview {
    tileId: string;
    dx: number;
    dy: number;
    target: GridRect;
}

interface ResizePreview {
    tileId: string;
    rect: GridRect;
}

export default function PageGrid(props: PageGridProps) {
    let dragState: DragState | undefined;
    let resizeState: ResizeState | undefined;

    const [drag, setDrag] = createSignal<DragPreview | null>(null);
    const [resize, setResize] = createSignal<ResizePreview | null>(null);

    const resetGestures = () => {
        dragState = undefined;
        resizeState = undefined;
        setDrag(null);
        setResize(null);
    };

    createEffect(
        () => props.page.id,
        () => resetGestures(),
    );
    createEffect(
        () => props.editing,
        () => resetGestures(),
    );

    const rows = () => {
        let bottom = 1;

        for (const tile of props.page.tiles) {
            bottom = Math.max(bottom, tile.grid.y + tile.grid.h);
        }

        const target = drag()?.target;
        if (target) bottom = Math.max(bottom, target.y + target.h);

        const preview = resize();
        if (preview) bottom = Math.max(bottom, preview.rect.y + preview.rect.h);

        return bottom;
    };

    const gridStyle = () => {
        const size = GRID_CELL_SIZE;
        const width = GRID_COLUMNS * size + GRID_GAP * (GRID_COLUMNS - 1);

        return [
            `grid-template-columns: repeat(${GRID_COLUMNS}, ${size}px)`,
            `grid-template-rows: repeat(${rows()}, ${size}px)`,
            `gap: ${GRID_GAP}px`,
            `width: ${width}px`,
        ].join(';');
    };

    const rectFor = (tile: Tile): GridRect => {
        const preview = resize();
        return preview?.tileId === tile.id ? preview.rect : tile.grid;
    };

    const isDragging = (tileId: string) => drag()?.tileId === tileId;
    const isResizing = (tileId: string) => resize()?.tileId === tileId;

    const tileStyle = (tile: Tile) => {
        const rect = rectFor(tile);
        const preview = drag();

        const parts = [
            `grid-column: ${rect.x + 1} / span ${rect.w}`,
            `grid-row: ${rect.y + 1} / span ${rect.h}`,
            'container-type: size',
        ];

        if (preview?.tileId === tile.id) {
            parts.push(`transform: translate(${preview.dx}px, ${preview.dy}px)`, 'z-index: 30');
        }

        return parts.join(';');
    };

    const beginDrag = (event: PointerEvent, tile: Tile) => {
        if (!props.editing || event.button !== 0) return;

        const target = event.target as HTMLElement;
        if (target.closest('[data-tile-edit]') || target.closest('[data-tile-resize]')) return;

        event.preventDefault();

        dragState = {
            tile,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            step: GRID_CELL_SIZE + GRID_GAP,
        };
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        setDrag({ tileId: tile.id, dx: 0, dy: 0, target: tile.grid });
    };

    const moveDrag = (event: PointerEvent) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;

        const { tile, step } = dragState;
        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        const target = clampRect({
            x: tile.grid.x + Math.round(dx / step),
            y: tile.grid.y + Math.round(dy / step),
            w: tile.grid.w,
            h: tile.grid.h,
        });

        setDrag({ tileId: tile.id, dx, dy, target });
    };

    const endDrag = (event: PointerEvent) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;

        const { tile } = dragState;
        const preview = drag();
        dragState = undefined;
        setDrag(null);

        if (preview && !sameRect(preview.target, tile.grid)) {
            props.onMoveTile(tile.id, preview.target);
        }
    };

    const cancelDrag = () => {
        dragState = undefined;
        setDrag(null);
    };

    const beginResize = (event: PointerEvent, tile: Tile) => {
        if (!props.editing || event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        resizeState = {
            tile,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            step: GRID_CELL_SIZE + GRID_GAP,
            startW: tile.grid.w,
            startH: tile.grid.h,
        };
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        setResize({ tileId: tile.id, rect: tile.grid });
    };

    const moveResize = (event: PointerEvent) => {
        if (!resizeState || resizeState.pointerId !== event.pointerId) return;

        const { tile, step, startX, startY, startW, startH } = resizeState;
        const w = Math.min(
            GRID_COLUMNS - tile.grid.x,
            Math.max(1, startW + Math.round((event.clientX - startX) / step)),
        );
        const h = Math.max(1, startH + Math.round((event.clientY - startY) / step));

        setResize({ tileId: tile.id, rect: { ...tile.grid, w, h } });
    };

    const endResize = (event: PointerEvent) => {
        if (!resizeState || resizeState.pointerId !== event.pointerId) return;

        const { tile } = resizeState;
        const preview = resize();
        resizeState = undefined;
        setResize(null);

        if (preview && !sameRect(preview.rect, tile.grid)) {
            props.onResizeTile(tile.id, preview.rect);
        }
    };

    const cancelResize = () => {
        resizeState = undefined;
        setResize(null);
    };

    return (
        <div class="min-h-full w-full overflow-x-auto px-6 pb-10 pt-10">
            <div class="relative mx-auto grid h-fit" style={gridStyle()}>
                <Show when={drag()}>
                    {(preview) => (
                        <div
                            class="pointer-events-none z-0 rounded-3xl border-2 border-dashed border-primary/70 bg-primary/10"
                            style={`grid-column: ${preview().target.x + 1} / span ${preview().target.w}; grid-row: ${
                                preview().target.y + 1
                            } / span ${preview().target.h};`}
                        />
                    )}
                </Show>

                <For each={props.page.tiles}>
                    {(tile) => (
                        <div
                            class={`relative min-h-0 min-w-0 ${
                                props.editing
                                    ? 'cursor-grab touch-none select-none rounded-3xl ring-1 ring-primary/30 ring-offset-2 ring-offset-background'
                                    : ''
                            } ${
                                isDragging(tile.id) || isResizing(tile.id)
                                    ? ''
                                    : 'transition-transform duration-200'
                            }`}
                            style={tileStyle(tile)}
                            onClick={(event) => {
                                if (!props.editing) return;
                                const target = event.target as HTMLElement;
                                if (
                                    target.closest('[data-tile-edit]') ||
                                    target.closest('[data-tile-resize]')
                                ) {
                                    return;
                                }
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                            onPointerDown={(event) => beginDrag(event, tile)}
                            onPointerMove={moveDrag}
                            onPointerUp={endDrag}
                            onPointerCancel={cancelDrag}
                            onLostPointerCapture={cancelDrag}
                        >
                            <TileView tile={tile} grid={rectFor(tile)} />

                            <Show when={props.editing}>
                                <span data-tile-edit class="absolute -left-1.5 -top-1.5 z-40">
                                    <Button
                                        variant="default"
                                        size="icon-xs"
                                        class="rounded-full"
                                        aria-label="编辑 tile"
                                        onPointerDown={(event) => event.stopPropagation()}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            props.onEditTile(tile);
                                        }}
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                </span>

                                <button
                                    data-tile-resize
                                    class="absolute -bottom-1.5 -right-1.5 z-40 size-4 cursor-se-resize rounded-full border-2 border-background bg-primary shadow"
                                    type="button"
                                    aria-label="调整 tile 大小"
                                    title="拖动调整大小"
                                    onPointerDown={(event) => beginResize(event, tile)}
                                    onPointerMove={moveResize}
                                    onPointerUp={endResize}
                                    onPointerCancel={cancelResize}
                                    onLostPointerCapture={cancelResize}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }}
                                />
                            </Show>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
}
