import { LayoutGrid } from '@lucide/solid';
import { For, Show, createEffect, createSignal, onSettled } from 'solid-js';

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
import { SettingsProvider } from '@/lib/use-settings';
import type { Cell } from '@/types/dashboard';

import { createCellId } from './dashboard/ids';
import { DashboardProvider, useDashboard, type CellPatch } from './dashboard/use-dashboard';
import AddCellDrawer from './drawer/AddCellDrawer';
import type { CatalogItem } from './drawer/catalog';
import CustomIconPage, { type CustomIconDraft } from './drawer/CustomIconPage';
import { GLOBAL_MENU, type GlobalMenuCommand } from './global-menu';
import NewTabShell from './layout/NewTabShell';
import PageGrid from './PageGrid';

export default function App() {
    return (
        <SettingsProvider>
            <DashboardProvider>
                <NewTabView />
            </DashboardProvider>
        </SettingsProvider>
    );
}

function NewTabView() {
    const { data, setActivePage, addCell, updateCell, removeCell, reorderCell } = useDashboard();
    const [direction, setDirection] = createSignal(1);
    const [editing, setEditing] = createSignal(false);

    /**
     * 抽屉由这一层持有：
     * - `add`：全局右键「添加图标」进来，还没有 cell；
     * - `custom`：抽屉里点「自定义」进来的二级页面；
     * - `edit`：cell 右键「编辑图标」进来，带着那个 cell。
     */
    const [drawerMode, setDrawerMode] = createSignal<'add' | 'custom' | 'edit' | null>(null);
    const [drawerCell, setDrawerCell] = createSignal<Cell | null>(null);

    const openAdd = () => {
        setDrawerCell(null);
        setDrawerMode('add');
    };

    const openCustom = () => {
        setDrawerCell(null);
        setDrawerMode('custom');
    };

    /** 二级页面的「返回」：一律回到一级页面，并清掉编辑目标。 */
    const backToCatalog = () => {
        setDrawerCell(null);
        setDrawerMode('add');
    };

    const openEdit = (cell: Cell) => {
        setDrawerCell(cell);
        setDrawerMode('edit');
    };

    const closeDrawer = () => {
        setDrawerMode(null);
        setDrawerCell(null);
    };

    /**
     * 换页时关掉抽屉，避免停在上一个页面的 cell 上。
     *
     * 必须自己判断"页号真的变了"：这个 effect 的 compute 依赖 `data()`，
     * 而添加 / 删除 cell 同样会改 `data()`，回调也会跟着重跑。少了这个判断，
     * 从抽屉里加一个图标就会把抽屉自己关掉。
     */
    let lastPageId = data().activePageId;
    createEffect(
        () => data().activePageId,
        () => {
            const pageId = data().activePageId;
            if (pageId === lastPageId) return;

            lastPageId = pageId;
            closeDrawer();
        },
    );

    /**
     * 左键点抽屉外面关掉抽屉。
     *
     * 不能用 Drawer 的 `closeOnOutsidePress`：SDK 那套是靠在遮罩元素上判定的，
     * 而我们已经把遮罩去掉了（它挡住整页、连右键都被吃掉），所以这里自己判。
     * 只认主键：右键要看菜单，不能顺手把抽屉关掉。
     */
    onSettled(() => {
        const onPointerDown = (event: PointerEvent) => {
            if (drawerMode() === null || event.button !== 0) return;

            const target = event.target;
            if (target instanceof Element && target.closest('[data-cell-drawer]')) return;

            closeDrawer();
        };

        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
    });

    const pages = () => data().pages;
    const index = () => Math.max(0, pages().findIndex((page) => page.id === data().activePageId));
    const page = () => pages()[index()];

    const changePage = (next: number) => {
        const target = pages()[next];
        if (!target || target.id === data().activePageId) return;
        setDirection(next > index() ? 1 : -1);
        setActivePage(target.id);
    };

    /** 删 cell：如果抽屉正开着这个 cell，一起关掉，别留一个已经不存在的对象。 */
    const removeCellAndDrawer = (cellId: string) => {
        if (drawerCell()?.id === cellId) closeDrawer();
        removeCell(page()!.id, cellId);
    };

    /** 从抽屉里点一个图标：作为 link cell 加到当前页。 */
    const addLinkCell = (item: CatalogItem) => {
        const target = page();
        if (!target) return;

        addCell(target.id, {
            id: createCellId(),
            kind: 'link',
            title: item.title,
            url: item.url,
            grid: { x: 0, y: 0, w: 1, h: 1 },
        });
    };

    /** 「自定义添加」完成：新建一个带图标 / 纯色的 link cell。 */
    const addCustomCell = (draft: CustomIconDraft) => {
        const target = page();
        if (!target || !draft.url) return;

        addCell(target.id, {
            id: createCellId(),
            kind: 'link',
            title: draft.title,
            url: draft.url,
            grid: { x: 0, y: 0, w: 1, h: 1 },
            ...(draft.icon ? { icon: draft.icon } : {}),
        });
        closeDrawer();
    };

    /** 「编辑图标」完成：改标题 / 图标；链接 cell 顺带改地址。 */
    const saveCellIcon = (draft: CustomIconDraft) => {
        const cell = drawerCell();
        const target = page();
        if (!cell || !target) return;

        const patch: CellPatch = { title: draft.title };
        if (draft.icon) patch.icon = draft.icon;
        if (cell.kind === 'link' && draft.url) patch.url = draft.url;

        updateCell(target.id, cell.id, patch);
        closeDrawer();
    };

    const runCommand = (command: GlobalMenuCommand) => {
        switch (command) {
            case 'add-icon':
                openAdd();
                return;
            case 'edit-home':
                setEditing(true);
                return;
            // 还没实现，菜单里是灰的。
            case 'add-widget':
            case 'random-wallpaper':
            case 'download-wallpaper':
            case 'search-icon':
                return;
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger class="block">
                    <NewTabShell
                        pages={pages()}
                        index={index()}
                        direction={direction()}
                        editing={editing()}
                        onIndexChange={changePage}
                        onExitEditing={() => setEditing(false)}
                    >
                        <PageGrid
                            page={page()!}
                            editing={editing()}
                            onReorderCell={(cellId, index) => reorderCell(page()!.id, cellId, index)}
                            onRemoveCell={removeCellAndDrawer}
                            onEditIcon={openEdit}
                        />
                    </NewTabShell>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <For each={GLOBAL_MENU}>
                        {(entry) => (
                            <ContextMenuItem
                                disabled={entry.pending}
                                onSelect={() => runCommand(entry.command)}
                            >
                                {entry.label}
                            </ContextMenuItem>
                        )}
                    </For>
                </ContextMenuContent>
            </ContextMenu>

            <Drawer
                side="right"
                /*
                 * 非模态：页面照常可用——可以滚动、右键菜单（全局和 cell）都还在。
                 * "左键点外面关闭"由上面的 document pointerdown 自己做（SDK 的
                 * closeOnOutsidePress 依赖遮罩，这里没有遮罩）。
                 */
                modal={false}
                open={drawerMode() !== null}
                onOpenChange={(open) => {
                    if (!open) closeDrawer();
                }}
            >
                <DrawerContent data-cell-drawer="true" class="h-dvh max-h-dvh w-96 bg-background">
                    <DrawerHeader class={drawerMode() === 'add' ? 'pb-2' : 'sr-only'}>
                        <DrawerTitle class="flex items-center gap-2">
                            {/* 28px 的占位和二级页面的返回键同宽，两个页面的标题才能对齐。 */}
                            <span class="grid size-7 place-items-center">
                                <LayoutGrid size={16} class="text-muted-foreground" />
                            </span>
                            <span>{drawerMode() === 'edit' ? '编辑图标' : '添加图标'}</span>
                        </DrawerTitle>
                        <Show when={drawerMode() === 'add' && drawerCell()?.title}>
                            <DrawerDescription>{drawerCell()!.title}</DrawerDescription>
                        </Show>
                    </DrawerHeader>

                    <Show when={drawerMode() === 'add'}>
                        <AddCellDrawer onAddLink={addLinkCell} onCustom={openCustom} />
                    </Show>

                    <Show when={drawerMode() === 'custom'}>
                        <CustomIconPage mode="add" onBack={backToCatalog} onSubmit={addCustomCell} />
                    </Show>

                    <Show when={drawerMode() === 'edit'}>
                        <Show
                            when={drawerCell()}
                            fallback={
                                <div class="min-h-0 flex-1 p-4 text-sm text-muted-foreground">
                                    这个 cell 已经不在了。
                                </div>
                            }
                        >
                            {(cell) => (
                                <CustomIconPage
                                    mode="edit"
                                    cell={cell()}
                                    onBack={backToCatalog}
                                    onSubmit={saveCellIcon}
                                />
                            )}
                        </Show>
                    </Show>
                </DrawerContent>
            </Drawer>
        </>
    );
}
