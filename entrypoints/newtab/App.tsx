import { createSignal } from 'solid-js';

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DashboardProvider, useDashboard } from '@/lib/dashboard/use-dashboard';
import { SettingsProvider } from '@/lib/use-settings';

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
    const { data, setActivePage, removeTile, reorderTile } = useDashboard();
    const [direction, setDirection] = createSignal(1);
    const [editing, setEditing] = createSignal(false);

    const pages = () => data().pages;
    const index = () => Math.max(0, pages().findIndex((page) => page.id === data().activePageId));
    const page = () => pages()[index()];

    const changePage = (next: number) => {
        const target = pages()[next];
        if (!target || target.id === data().activePageId) return;
        setDirection(next > index() ? 1 : -1);
        setActivePage(target.id);
    };

    return (
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
                        onReorderTile={(tileId, index) => reorderTile(page()!.id, tileId, index)}
                        onRemoveTile={(tileId) => removeTile(page()!.id, tileId)}
                        onExitEditing={() => setEditing(false)}
                    />
                </NewTabShell>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onSelect={() => setEditing(true)}>编辑主页</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
