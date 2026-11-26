import { Minus } from '@lucide/solid';
import {
    closestCenter,
    createDragContext,
    createSortable,
    type DragContextReturn,
} from '@solid-primitives/drag-drop';
import { For, Show, createSignal } from 'solid-js';
import { browser } from 'wxt/browser';

import { Button } from '@/components/ui/button';
import { isLinkCell } from './dashboard/cell-kinds';
import { GRID_CELL_SIZE, type Cell, type DashboardPage } from '@/types/dashboard';

import CellContextMenu, { type CellMenuCommand } from './cells/CellContextMenu';
import CellView from './cells/CellView';

const CELL_STYLE = `width: ${GRID_CELL_SIZE}px; height: ${GRID_CELL_SIZE}px`;
/** 指针位移小于这个值就当作点击，而不是拖拽。 */
const CLICK_SLOP = 6;

interface PageGridProps {
    page: DashboardPage;
    editing: boolean;
    onReorderCell: (cellId: string, toIndex: number) => void;
    onRemoveCell: (cellId: string) => void;
    onEditIcon: (cell: Cell) => void;
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

            const toIndex = props.page.cells.findIndex((cell) => cell.id === over.id);
            if (toIndex < 0) return;

            props.onReorderCell(String(item.id), toIndex);
        },
        onDragCancel: () => {
            setDragActive(false);
        },
    });

    const openInCurrentTab = (cell: Cell) => {
        if (!isLinkCell(cell)) return;
        window.location.assign(cell.url);
    };

    const openInNewTab = (cell: Cell) => {
        if (!isLinkCell(cell)) return;
        void browser.tabs.create({ url: cell.url });
    };

    /** 通用右键菜单的唯一出口：菜单项只发命令，做什么由这里决定。 */
    const runCommand = (cell: Cell, command: CellMenuCommand) => {
        switch (command) {
            case 'open-current':
                openInCurrentTab(cell);
                return;
            case 'open-new':
                openInNewTab(cell);
                return;
            case 'edit-icon':
                props.onEditIcon(cell);
                return;
            case 'delete':
                props.onRemoveCell(cell.id);
                return;
        }
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
                            <For each={props.page.cells}>
                                {() => (
                                    <div
                                        class="flex-none rounded-3xl border border-foreground/10 bg-foreground/5"
                                        style={CELL_STYLE}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>

                    <For each={props.page.cells}>
                        {(cell) => (
                            <SortableCell
                                cell={cell}
                                editing={props.editing}
                                dragActive={dragActive}
                                onRemove={() => props.onRemoveCell(cell.id)}
                                onCommand={(command) => runCommand(cell, command)}
                            />
                        )}
                    </For>
                </div>
            </div>
        </ctx.Provider>
    );
}

interface SortableCellProps {
    cell: Cell;
    editing: boolean;
    dragActive: () => boolean;
    onRemove: () => void;
    onCommand: (command: CellMenuCommand) => void;
}

function SortableCell(props: SortableCellProps) {
    const sortable = createSortable(props.cell.id, props.cell);
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
        const cell = props.cell;
        if (!isLinkCell(cell)) return;

        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
            void browser.tabs.create({ url: cell.url });
        } else {
            window.location.assign(cell.url);
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

            <CellContextMenu cell={props.cell} onCommand={props.onCommand}>
                <div class="h-full w-full" style="container-type: size;">
                    <CellView cell={props.cell} iconOnly={props.dragActive()} />
                </div>
            </CellContextMenu>

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
