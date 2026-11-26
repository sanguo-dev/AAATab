import { For, createEffect, createSignal } from 'solid-js';

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

import { DashboardProvider, useDashboard } from './dashboard/use-dashboard';
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
    const { data, setActivePage, removeCell, reorderCell } = useDashboard();
    const [direction, setDirection] = createSignal(1);
    const [editing, setEditing] = createSignal(false);

    /**
     * 抽屉由这一层持有：
     * - `add`：全局右键「添加图标」进来，还没有 cell；
     * - `edit`：cell 右键「编辑图标」进来，带着那个 cell。
     */
    const [drawerMode, setDrawerMode] = createSignal<'add' | 'edit' | null>(null);
    const [drawerCell, setDrawerCell] = createSignal<Cell | null>(null);

    const openAdd = () => {
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

    // 换页时关掉抽屉，避免停在上一个页面的 cell 上。
    createEffect(
        () => data().activePageId,
        () => {
            closeDrawer();
        },
    );

    const pages = () => data().pages;
    const index = () => Math.max(0, pages().findIndex((page) => page.id === data().activePageId));
    const page = () => pages()[index()];

    const changePage = (next: number) => {
        const target = pages()[next];
        if (!target || target.id === data().activePageId) return;
        setDirection(next > index() ? 1 : -1);
        setActivePage(target.id);
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
                    >
                        <PageGrid
                            page={page()!}
                            editing={editing()}
                            onReorderCell={(cellId, index) => reorderCell(page()!.id, cellId, index)}
                            onRemoveCell={(cellId) => removeCell(page()!.id, cellId)}
                            onEditIcon={openEdit}
                            onExitEditing={() => setEditing(false)}
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
                open={drawerMode() !== null}
                onOpenChange={(open) => {
                    if (!open) closeDrawer();
                }}
            >
                <DrawerContent class="h-dvh max-h-dvh">
                    <DrawerHeader>
                        <DrawerTitle>{drawerMode() === 'add' ? '添加图标' : '编辑图标'}</DrawerTitle>
                        <DrawerDescription>{drawerCell()?.title ?? ''}</DrawerDescription>
                    </DrawerHeader>
                    <div class="flex-1 p-4 text-sm text-muted-foreground">图标编辑功能待实现。</div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
