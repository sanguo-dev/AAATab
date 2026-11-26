import { Minus } from '@lucide/solid';
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
import type { DashboardPage, Tile } from '@/types/dashboard';

import TileView from './tiles/TileView';

interface PageGridProps {
    page: DashboardPage;
    editing: boolean;
    onRemoveTile: (tileId: string) => void;
    onExitEditing: () => void;
}

export default function PageGrid(props: PageGridProps) {
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
        <div
            class="flex min-h-full w-full flex-col items-center justify-center px-[100px]"
            onClick={() => {
                if (props.editing) props.onExitEditing();
            }}
        >
            <div class="flex w-full flex-wrap items-center justify-center gap-3">
                <For each={props.page.tiles}>
                    {(tile) => (
                        <div
                            class="relative h-[120px] w-[120px]"
                            onClick={(event) => {
                                event.stopPropagation();
                                if (props.editing) event.preventDefault();
                            }}
                        >
                            <ContextMenu>
                                <ContextMenuTrigger
                                    data-cell-menu
                                    class="block h-full w-full"
                                    onContextMenu={(event) => event.stopPropagation()}
                                >
                                    <TileView tile={tile} />
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem
                                        disabled={tile.type !== 'link'}
                                        onSelect={() => openInCurrentTab(tile)}
                                    >
                                        当前页打开
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                        disabled={tile.type !== 'link'}
                                        onSelect={() => openInNewTab(tile)}
                                    >
                                        新标签打开
                                    </ContextMenuItem>
                                    <ContextMenuItem onSelect={() => setDrawerTile(tile)}>
                                        编辑图标
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                        variant="destructive"
                                        onSelect={() => props.onRemoveTile(tile.id)}
                                    >
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
                                        props.onRemoveTile(tile.id);
                                    }}
                                >
                                    <Minus size={14} />
                                </Button>
                            </Show>
                        </div>
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
    );
}
