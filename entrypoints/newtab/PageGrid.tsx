import { Pencil } from '@lucide/solid';
import { For, Show, createEffect, createSignal } from 'solid-js';

import TileView from '@/components/tiles/TileView';
import { GRID_COLUMNS, GRID_ROWS, type DashboardPage, type GridRect, type Tile } from '@/utils/dashboard/types';

interface PageGridProps {
    page: DashboardPage;
    editing: boolean;
    onMoveTile: (tileId: string, rect: GridRect) => void;
    onEditTile: (tile: Tile) => void;
}

interface DragState {
    tile: Tile;
    pointerId: number;
    startX: number;
    startY: number;
    cellW: number;
    cellH: number;
}

export default function PageGrid(props: PageGridProps) {
    let gridRef: HTMLDivElement | undefined;
    let dragState: DragState | undefined;
    const [drag, setDrag] = createSignal<{ tileId: string; dx: number; dy: number } | null>(null);

    createEffect(
        () => props.page.id,
        () => {
            dragState = undefined;
            setDrag(null);
        },
    );

    const beginDrag = (event: PointerEvent, tile: Tile) => {
        if (!props.editing || event.button !== 0) return;
        if ((event.target as HTMLElement).closest('[data-tile-edit]')) return;
        if (!gridRef) return;

        event.preventDefault();
        const rect = gridRef.getBoundingClientRect();
        const style = getComputedStyle(gridRef);
        const gapX = parseFloat(style.columnGap) || 0;
        const gapY = parseFloat(style.rowGap) || 0;
        const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
        const padY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
        const cellW = (rect.width - padX - gapX * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
        const cellH = (rect.height - padY - gapY * (GRID_ROWS - 1)) / GRID_ROWS;

        if (cellW <= 0 || cellH <= 0) return;

        dragState = {
            tile,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            cellW,
            cellH,
        };
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        setDrag({ tileId: tile.id, dx: 0, dy: 0 });
    };

    const moveDrag = (event: PointerEvent) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        setDrag({
            tileId: dragState.tile.id,
            dx: event.clientX - dragState.startX,
            dy: event.clientY - dragState.startY,
        });
    };

    const endDrag = (event: PointerEvent) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;

        const { tile, cellW, cellH } = dragState;
        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        dragState = undefined;
        setDrag(null);

        const next: GridRect = {
            x: tile.grid.x + Math.round(dx / cellW),
            y: tile.grid.y + Math.round(dy / cellH),
            w: tile.grid.w,
            h: tile.grid.h,
        };

        if (next.x !== tile.grid.x || next.y !== tile.grid.y) props.onMoveTile(tile.id, next);
    };

    const cancelDrag = () => {
        dragState = undefined;
        setDrag(null);
    };

    const isDragging = (tileId: string) => drag()?.tileId === tileId;

    return (
        <div
            ref={(element) => {
                gridRef = element;
            }}
            class="grid min-h-screen w-full grid-cols-12 grid-rows-[repeat(8,minmax(0,1fr))] gap-3 p-6 pb-24"
        >
            <For each={props.page.tiles}>
                {(tile) => (
                    <div
                        class={`relative min-h-0 min-w-0 ${props.editing ? 'cursor-grab rounded-3xl ring-1 ring-primary/30 ring-offset-2 ring-offset-base-100' : ''} ${
                            isDragging(tile.id) ? '' : 'transition-transform duration-200'
                        }`}
                        style={`grid-column: ${tile.grid.x + 1} / span ${tile.grid.w}; grid-row: ${tile.grid.y + 1} / span ${tile.grid.h};${
                            isDragging(tile.id)
                                ? ` transform: translate(${drag()!.dx}px, ${drag()!.dy}px); z-index: 30;`
                                : ''
                        }`}
                        onClick={(event) => {
                            if (
                                props.editing &&
                                !(event.target as HTMLElement).closest('[data-tile-edit]')
                            ) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }}
                        onPointerDown={(event) => beginDrag(event, tile)}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={cancelDrag}
                        onLostPointerCapture={cancelDrag}
                    >
                        <TileView tile={tile} />

                        <Show when={props.editing}>
                            <button
                                data-tile-edit
                                class="btn btn-circle btn-primary btn-xs absolute left-2 top-2 z-40"
                                type="button"
                                aria-label="编辑 tile"
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    props.onEditTile(tile);
                                }}
                            >
                                <Pencil size={14} />
                            </button>
                        </Show>
                    </div>
                )}
            </For>
        </div>
    );
}
