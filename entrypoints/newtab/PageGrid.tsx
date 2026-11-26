import { Minus } from '@lucide/solid';
import {
    closestCenter,
    createDragContext,
    createSortable,
    type DragContextReturn,
} from '@solid-primitives/drag-drop';
import { For, Show, createEffect, createSignal } from 'solid-js';
import { browser } from 'wxt/browser';

import { Button } from '@/components/ui/button';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { GRID_CELL_SIZE, type DashboardPage, type Tile } from '@/types/dashboard';

import TileView from './tiles/TileView';

const CELL_STYLE = `width: ${GRID_CELL_SIZE}px; height: ${GRID_CELL_SIZE}px`;
/** 指针位移小于这个值就当作点击，而不是拖拽。 */
const CLICK_SLOP = 6;

interface PageGridProps {
    page: DashboardPage;
    editing: boolean;
    onReorderTile: (tileId: string, toIndex: number) => void;
    onRemoveTile: (tileId: string) => void;
    onExitEditing: () => void;
}

export default function PageGrid(props: PageGridProps) {
    let ctx!: DragContextReturn;
    const [dragActive, setDragActive] = createSignal(false);
    ctx = createDragContext({
        collisionDetection: closestCenter,
        onDragStart: () => {
            setDragActive(false);
        },
        onDragMove: (_item, transform) => {
            if (Math.hypot(transform.x, transform.y) > CLICK_SLOP) setDragActive(true);
        },
        onDragEnd: (item, over) => {
            setDragActive(false);
            if (!over) return;

            const transform = ctx.transform();
            const moved = !!transform && Math.hypot(transform.x, transform.y) > CLICK_SLOP;
            if (!moved) return;

            const toIndex = props.page.tiles.findIndex((tile) => tile.id === over.id);
            if (toIndex < 0) return;

            props.onReorderTile(String(item.id), toIndex);
        },
        onDragCancel: () => {
            setDragActive(false);
        },
    });

    const [drawerTile, setDrawerTile] = createSignal<Tile | null>(null);

    createEffect(
        () => props.page.id,
        () => {
            setDrawerTile(null);
        },
    );

    const openInCurrentTab = (tile: Tile) => {
        if (tile.type === 'link') window.location.assign(tile.url);
    };

    const openInNewTab = (tile: Tile) => {
        if (tile.type === 'link') void browser.tabs.create({ url: tile.url });
    };

    return (
        <ctx.Provider>
            <div
                class="flex min-h-full w-full flex-col items-center justify-center px-[100px]"
                onClick={() => {
                    if (props.editing) props.onExitEditing();
                }}
            >
                <div class="relative flex w-full select-none flex-wrap items-center justify-center gap-3">
                    <Show when={dragActive()}>
                        <div
                            class="pointer-events-none absolute inset-0 z-0 flex flex-wrap items-center justify-center gap-3"
                            aria-hidden="true"
                        >
                            <For each={props.page.tiles}>
                                {() => (
                                    <div
                                        class="flex-none rounded-3xl border border-foreground/10 bg-foreground/5"
                                        style={CELL_STYLE}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>

                    <For each={props.page.tiles}>
                        {(tile) => (
                            <SortableTile
                                tile={tile}
                                editing={props.editing}
                                dragActive={dragActive}
                                onRemove={() => props.onRemoveTile(tile.id)}
                                onEditIcon={() => setDrawerTile(tile)}
                                onOpenCurrent={() => openInCurrentTab(tile)}
                                onOpenNew={() => openInNewTab(tile)}
                            />
                        )}
                    </For>
                </div>

                <Drawer
                    side="right"
                    open={drawerTile() !== null}
                    onOpenChange={(open) => {
                        if (!open) setDrawerTile(null);
                    }}
                >
                    <DrawerContent class="h-dvh max-h-dvh">
                        <DrawerHeader>
                            <DrawerTitle>编辑图标</DrawerTitle>
                            <DrawerDescription>
                                {drawerTile()?.title ?? '选择一个图标'}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div class="flex-1 p-4 text-sm text-muted-foreground">
                            图标编辑功能待实现。
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
        </ctx.Provider>
    );
}

interface SortableTileProps {
    tile: Tile;
    editing: boolean;
    dragActive: () => boolean;
    onRemove: () => void;
    onEditIcon: () => void;
    onOpenCurrent: () => void;
    onOpenNew: () => void;
}

function SortableTile(props: SortableTileProps) {
    const sortable = createSortable(props.tile.id, props.tile);
    let swallowClick = false;

    const dragging = () => props.dragActive() && sortable.isDragging();

    const style = () => {
        const transform = sortable.transform();
        const parts = [CELL_STYLE, 'position: relative'];

        if (transform && dragging()) {
            parts.push(
                `transform: translate3d(${transform.x}px, ${transform.y}px, 0)`,
                'z-index: 30',
            );
        }

        return parts.join(';');
    };

    const startPoint = { x: 0, y: 0 };

    const handlePointerDown = (event: PointerEvent) => {
        swallowClick = false;
        startPoint.x = event.clientX;
        startPoint.y = event.clientY;
    };

    const handlePointerUp = (event: PointerEvent) => {
        if (!sortable.isDragging()) return;

        const transform = sortable.transform();
        const moved =
            (!!transform && Math.hypot(transform.x, transform.y) > CLICK_SLOP) ||
            Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) > CLICK_SLOP;

        // 拖拽结束后的 click 要吞掉，避免打开链接。
        swallowClick = true;
        if (moved || props.editing) return;

        // 库在 pointerdown 上调了 preventDefault，链接的点开由这里补回来。
        if (props.tile.type !== 'link') return;

        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
            void browser.tabs.create({ url: props.tile.url });
        } else {
            window.location.assign(props.tile.url);
        }
    };

    const handleClick = (event: MouseEvent) => {
        event.stopPropagation();
        if (props.editing || swallowClick) {
            event.preventDefault();
            swallowClick = false;
        }
    };

    return (
        <div
            ref={sortable.ref}
            class={`relative flex-none cursor-grab touch-none ${
                dragging() ? 'z-30 cursor-grabbing' : ''
            }`}
            style={style()}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <Show when={props.dragActive() && sortable.isActiveDropzone()}>
                <div
                    class="pointer-events-none absolute inset-0 z-20 rounded-3xl border-2 border-dashed border-primary/60 bg-primary/10"
                    aria-hidden="true"
                />
            </Show>

            <ContextMenu>
                <ContextMenuTrigger
                    data-cell-menu
                    class="block h-full w-full"
                    onContextMenu={(event) => event.stopPropagation()}
                >
                    <div class="h-full w-full" style="container-type: size;">
                        <TileView tile={props.tile} />
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem
                        disabled={props.tile.type !== 'link'}
                        onSelect={props.onOpenCurrent}
                    >
                        当前页打开
                    </ContextMenuItem>
                    <ContextMenuItem disabled={props.tile.type !== 'link'} onSelect={props.onOpenNew}>
                        新标签打开
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={props.onEditIcon}>编辑图标</ContextMenuItem>
                    <ContextMenuItem variant="destructive" onSelect={props.onRemove}>
                        删除
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <Show when={props.editing}>
                <Button
                    data-cell-delete
                    variant="destructive"
                    size="icon-xs"
                    class="absolute left-[18px] top-[18px] z-40 rounded-full"
                    aria-label="删除 cell"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                        event.stopPropagation();
                        props.onRemove();
                    }}
                >
                    <Minus size={14} />
                </Button>
            </Show>
        </div>
    );
}
